/** UnderwritingService.js */
const moment = require("moment");
const leadApiConfig = sails.config.leadApiConfig.leadConfig;
module.exports = {
    underwritingWaterfall: waterfall,
    preUnderwriting: preUnderwriting,
    preUnderwritingv2
}

/**
 * Core logic that decides if an application is accepted or denied based on the results of calling
 * the IDology, Clarity, and Factor Trust (aka Lend Protect) API's.
 * Note that all three calls require use of the vpn on localhosts.
 * @param {User} user
 * @param {Screentracking} screenTracking
 * @returns {Object} {passed: Boolean, error: Boolean, reason: String, stageFailed: '' || Number(range: 1-3)}
 */

async function preUnderwritingv2(screenTracking, user) {
    const offerContext = { ...sails.config.RULES_STEPS };
    const { FAILED } = sails.config.RULE_STATUS;

    offerContext.duplicated = await isDuplicated(screenTracking);
    if (offerContext.duplicated.status === FAILED) return offerContext;
}

async function waterfall(user, screenTracking) {
    const result = {
        passed: true,
        error: false,
        reason: '',
        stageFailed: ''
    }
    const idologyTestCase = {
        email: 'johnsmith1975@gmail.com',
        firstname: 'John',
        lastname: 'Smith'
    }

    /* @@@@@@@@@@@@@@@@@@@@ STAGE 1: IDology @@@@@@@@@@@@@@@@@@@@ */
    let emailVerification;
    if (process.env.NODE_ENV === 'staging') {
        emailVerification = await IdologyService.verifyEmail( idologyTestCase.email, idologyTestCase.firstname, idologyTestCase.lastname, user);
        // verifyEmail() saves the result to the database
    } else {
        emailVerification = await IdologyService.verifyEmail( user.email, user.firstname, user.lastname);
        // verifyEmail() saves the result to the database
    }
    if(!emailVerification || (!emailVerification.passed && emailVerification.isServerError)) {
        sails.log.error('@@@@@@@@@@@@@@@@@ IDology Failed: Server Error @@@@@@@@@@@@@@@@@', emailVerification);
        result.passed = false;
        result.error = true;
        result.reason = `IDology Server Error: ${ emailVerification.message || "unknown error"}`;
        result.stageFailed = 1;
        return result;
    }else if(!emailVerification.passed ) {
        sails.log.info('@@@@@@@@@@@@@@@@@ IDology Failed @@@@@@@@@@@@@@@@@', emailVerification);
        result.passed = false;
        result.reason = `IDology Check Failed: ${ emailVerification.message || "unknown error"}`;
        result.stageFailed = 1;
        sails.log.info(result.reason);
        return result;
    } else if ( emailVerification === 'pass' ) {
        sails.log.info('@@@@@@@@@@@@@@@@@ IDology Passed @@@@@@@@@@@@@@@@@', emailVerification);
    }
    /* @@@@@@@@@@@@@@@@@@@@ END OF STAGE 1 @@@@@@@@@@@@@@@ */

    /* @@@@@@@@@@@@@@@@@@@@ STAGE 2: Clarity @@@@@@@@@@@@@@@@@@@@ */
    const inquiryObj = {
        inquiry: {
            group_id: sails.config.clarityConfig.group_id,
            account_id: sails.config.clarityConfig.account_id,
            location_id: sails.config.clarityConfig.location_id,
            username: sails.config.clarityConfig.username,
            password: sails.config.clarityConfig.password,
            control_file_name: sails.config.clarityConfig.control_file_name,
            inquiry_purpose_type: 'AR',
            inquiry_tradeline_type: 'C3',
            /* Client's Information */
            bank_account_number: screenTracking.accountNumber,
            //bank_account_type: 'CHECKING',
            bank_routing_number: screenTracking.routingNumber,
            cell_phone: user.phoneNumber,
            city: user.city,
            date_of_birth: user.dateofBirth,
            //date_of_next_payday: '2016-10-01',
            drivers_license_number: user.stateIdNumber,
            drivers_license_state: user.idState,
            email_address: user.email,
            //employer_address: '123 Anywhere St',
            //employer_city: 'Clearwater',
            //employer_state: 'FL',
            first_name: user.firstname,
            last_name: user.lastname,
            generational_code: user.generationCode,
            //home_phone: '2223334444',
            //housing_status: 'RENT',
            net_monthly_income: screenTracking.monthlyIncome,
            pay_frequency: screenTracking.paymentFrequency,
            paycheck_direct_deposit: (
                screenTracking.paymentmethod === 'Direct Deposit' ? 'true' : 'false' ),
            //reference_first_name: 'Sam',
            //reference_last_name: 'Plereference',
            //reference_phone: '3334445555',
            //reference_relationship: 'EMPLOYER',
            social_security_number: user.ssn_number,
            state: user.state,
            street_address_1: user.street,
            street_address_2: user.unitapp,
            //months_at_address: '12',
            //months_at_current_employer: '48',
            //work_fax_number: '5556667777',
            //work_phone: '6667778888',
            zip_code: user.zipCode
        }
    };
    if (process.env.NODE_ENV === 'staging') {
        inquiryObj.inquiry.social_security_number = '301001238';
    }
    //sails.log.info('Clarity inquiry parameter: ', inquiryObj);		// for debugging purposes only
    const clarityResponse = await ClarityService.verifyCredit(inquiryObj);
    ClarityResponse.saveClarityResponse(user.id, clarityResponse);
    /* clarityResponse.action will return one of the following: approve, deny, exception, positive approve or review */
    if (clarityResponse.action === 'Approve') {
        sails.log.info('@@@@@@@@@@@@@@@@@ Clarity Passed @@@@@@@@@@@@@@@@@');
    } else if (clarityResponse.action === 'Exception') {
        sails.log.error('@@@@@@@@@@@@@@@@@ Clarity Failed @@@@@@@@@@@@@@@@@');
        result.passed = false;
        result.error = true;
        result.reason = 'Clarity check failed: ' + clarityResponse.exception_descriptions;
        result.stageFailed = 2;
        sails.log.error(result.reason);
        return result;
    } else {
        sails.log.info('@@@@@@@@@@@@@@@@@ Clarity Failed @@@@@@@@@@@@@@@@@');
        result.passed = false;
        result.reason = 'Clarity check failed: ' + clarityResponse.filter_descriptions;
        result.stageFailed = 2;
        sails.log.info(result.reason);
        return result;
    }
    /* @@@@@@@@@@@@@@@@@@@@ END OF STAGE 2 @@@@@@@@@@@@@@@ */

    /* @@@@@@@@@@@@@@@@@@@@ STAGE 3: Factor Trust @@@@@@@@@@@@@@@ */
    if(sails.config.factorTrust.lendProtect.enabled) {
        const reqData = {
            Application: {
                LoginInfo: {
                    Username: sails.config.factorTrust.lendProtect.username,
                    Password: sails.config.factorTrust.lendProtect.password,
                    ChannelIdentifier:sails.config.factorTrust.lendProtect.channelId,
                    MerchantIdentifier: sails.config.factorTrust.lendProtect.merchantId,
                    StoreIdentifier: sails.config.factorTrust.lendProtect.storeId
                },
                ApplicationInfo: {
                    ApplicationID: screenTracking.applicationReference,
                    MobileNumber: user.phoneNumber,
                    FirstName: user.firstname,
                    LastName: user.lastname,
                    EmailAddress: user.email,
                    IPAddress: '',
                    DLNumber: '',
                    DLNumberIssueState: '',
                    DateOfBirth: user.dateofBirth,
                    Address1: user.street,
                    Address2: user.unitapt,
                    City: user.city,
                    State: user.state,
                    Zip: user.zipCode,
                    Country: 'US',
                    MonthsAtAddress: '',
                    AlternateZip: '',
                    HomePhone: '',
                    SSN: user.ssn_number,
                    SSNIssueState: '',
                    AccountABA: screenTracking.routingNumber,
                    AccountDDA: screenTracking.accountNumber,
                    AccountType: 'C', // C=Checking, D=Debit, S=Savings
                    EmployerName: '',
                    LengthOfEmployment: '',
                    MonthlyIncome: screenTracking.monthlyIncome,
                    PayrollType: (screenTracking.paymentmethod === "Direct Deposit" ? 'D' : 'P'), // D=Direct Deposit; P=Paper Check
                    PayrollFrequency: payrollFrequencyLetter(screenTracking.paymentFrequency), // W=Weekly, B=Bi-Weekly, S=Semi-Monthly, M=Monthly
                    PayrollGarnishment: '',
                    RequestedLoanAmount: '',
                    RequestedEffectiveDate: '',
                    RequestedDueDate: '',
                    HasBankruptcy: '',
                    ProductType: 'PER',
                    LeadType: '', // (Not Used At This Time)
                    LeadSource: '', // (Not Used At This Time)
                    BlackBox: '', // (Provided via the iOvation installation software)
                    ECOACode: 'I',
                    PortfolioType: 'I',
                    PointOfOrigination: 'V', // R=Retail, V=Virtual
                    SecuritizationType: 'U',
                    OtherIncome: '',
                    LoanPaymentAmount: '',
                    OtherPayments: '',
                    LoanFees: '',
                    TermsDuration: '',
                    TermsFrequency: '',
                    HousingExpenses: '',
                    IsHomeOwner: '',
                    LivingExpenses: '',
                    CreditCardNumber: ''
                }
            }
        }
    
        if (process.env.NODE_ENV === 'staging') {
            reqData.Application.ApplicationInfo = sails.config.factorTrust.lendProtect.testData;
        }
        const report = await FactorTrustLendProtectService.getReport(user.id, reqData );
        // Save the response
        const lendReportObj = {
            user: user.id,
            data: report
        }
        await FactorTrustLendProtect.create(lendReportObj);
        report.ApplicationResponse.TransactionInfo.TransactionStatus = 'A';
        if (report.ApplicationResponse.TransactionInfo.TransactionStatus === 'D') {
            sails.log.info('@@@@@@@@@@@@@@@@@ Lend Protect: Failed @@@@@@@@@@@@@@@@@');
            result.passed = false;
            result.reason = 'Lend Protect check failed: Check FactorTrustLendProtect collection for reasons';
            result.stageFailed = 3;
            sails.log.info(result.reason);
            return result;
        } else if (report.ApplicationResponse.TransactionInfo.TransactionStatus === 'A') {
            sails.log.info('@@@@@@@@@@@@@@@@@ Lend Protect: Passed @@@@@@@@@@@@@@@@@');
        }
    }
    /* @@@@@@@@@@@@@@@@@@@@ END OF STAGE 3 @@@@@@@@@@@@@@@ */

    // If this point is reached, all API checks passed
    return result;
}
function preUnderwriting(user, screenTracking, employment) {
    let rulesPassed = true;
    const ruleDetails = { };
    
    if(leadApiConfig && leadApiConfig.enabled) {
        if(!user || !screenTracking || !employment) {
            ruleDetails["s1_preunderwriting_0"] = {
                rule: "Missing user or employment data",
                params: [{
                    key: "Missing user or employment data",
                    value:"failed"
                }],
                result: true
            }
            rulesPassed = false;
        } else {
            const ageRule = checkAgeRule(user.dateofBirth);
            const monthlyIncomeRule = checkMonthlyIncomeRule($ize(employment.monthlyIncome));
            const addressPoBoxRule = checkAddressForPOBoxRule(user.street);
            const matchPhoneRule = checkMatchingPhoneNumbersRule(user.mobileNumber || user.phoneNumber, employment.employerPhone);
            const notAllowedStatesRule = checkAllowedStatesRule(user.state);
            
            rulesPassed = !(ageRule.result || monthlyIncomeRule.result  || addressPoBoxRule.result  || matchPhoneRule.result  || notAllowedStatesRule.result );
            _.assign(ruleDetails,
              {s1_preunderwriting_1: ageRule},
              {s1_preunderwriting_2: monthlyIncomeRule},
              {s1_preunderwriting_3: addressPoBoxRule},
              {s1_preunderwriting_4: matchPhoneRule},
              {s1_preunderwriting_5: notAllowedStatesRule}
              );
        }
        
    }
    return {rulesPassed: rulesPassed, rules: ruleDetails};
}
function checkAgeRule(dateOfBirth) {
    const rulesDetail = {
            rule: `Age < ${leadApiConfig.minimumAge} or age > ${leadApiConfig.maximumAge}`,
            params: [
                {
                    key: "age",
                    value: "passed"
                }
            ],
            result: false
    }
    if(leadApiConfig.minimumAge > 0 && leadApiConfig.maximumAge >= leadApiConfig.minimumAge ) {
        if(dateOfBirth) {
            const dob = moment(dateOfBirth,"YYYY-MM-DD");
            if(dob.isValid()){
                const today = moment().startOf("day");
                const minimumDate = moment(today).add( leadApiConfig.minimumAge * -1, "years");
                const maximumDate = moment(today).add( leadApiConfig.maximumAge * -1, "years");
                if(!dob.startOf("day").isBefore(minimumDate) || !dob.startOf("day").isAfter(maximumDate)) {
                    rulesDetail.params = [{
                            key: "age",
                            value: parseInt(today.diff(dob.startOf("day"), "years").toString())
                    }]
                    rulesDetail.result = true;
                }
                return  rulesDetail
            }
        }
        rulesDetail.params = [{
            key: "age",
            value: "INVALID DATE OF BIRTH"
        }];
        rulesDetail.result = true;
    }
    return rulesDetail
}
function checkMonthlyIncomeRule(monthlyIncome) {
    const rulesDetail = {
        rule: `Monthly Income < ${leadApiConfig.minimumIncome}`,
        params: [
            {
                key: "monthlyIncome",
                value: "passed"
            }
        ],
        result: false
    }
    if(leadApiConfig.minimumIncome > 0) {
        if(monthlyIncome > 0) {
            if( monthlyIncome < leadApiConfig.minimumIncome) {
                rulesDetail.params = [{
                    key: "monthlyIncome", value: monthlyIncome
                }]
                rulesDetail.result = true;
            }
        }else {
            rulesDetail.params = [{
                key: "monthlyIncome",
                value: "INVALID MONTHLY INCOME"
            }]
            rulesDetail.result = true;
        }
    }
    return rulesDetail;
}
function checkAddressForPOBoxRule(address) {
    const rulesDetail = {
        rule: `Address contains P.O Box`,
        params: [
            {
                key: "address",
                value: "passed"
            }
        ],
        result: false
    }
    if(!!leadApiConfig.addressRegex) {
        if(!!address) {
            if(!address.match(leadApiConfig.addressRegex)) {
                rulesDetail.params = [{
                    key: "address", value: address
                }]
                rulesDetail.result = true;
            }
            return rulesDetail;
        }
            rulesDetail.params = [{
                key: "address", value: "INVALID ADDRESS"
            }];
            rulesDetail.result = true;
    }
    return rulesDetail;
}
function checkMatchingPhoneNumbersRule(phoneNumber, workPhone) {
    const rulesDetail = {
        rule: `Work and phone numbers are the same`,
        params: [
            {
                key: "phoneNumber",
                value: "passed"
            },
            {
                key: "employerPhone",
                value: "passed"
            }
        ],
        result: false
    }
    if(leadApiConfig.validatePhoneNumberMatching) {
        if(!!phoneNumber && !!workPhone) {
            if(phoneNumber.replace(/[^0-9]/g, "") === workPhone.replace(/[^0-9]/g, "")) {
                rulesDetail.params = [{
                    key: "phoneNumber", value: phoneNumber
                }, {
                    key: "employerPhone", value: workPhone
                }];
                rulesDetail.result = true;
            }
            return rulesDetail;
        }
        rulesDetail.params = [{
            key: "phoneNumber", value: phoneNumber
        }, {
            key: "employerPhone", value: workPhone
        }];
        rulesDetail.result = true;
    }
    return rulesDetail;
}
function checkAllowedStatesRule(state) {
    const rulesDetail = {
        rule: `State is an allowed state`,
        params: [
            {
                key: "state",
                value: "passed"
            }
        ],
        result: false
    }
    if(leadApiConfig.statesNotAllowed && leadApiConfig.statesNotAllowed.length > 0) {
        if(!!state && state.length === 2) {
            if(leadApiConfig.statesNotAllowed.indexOf(state.toUpperCase()) >=0) {
                rulesDetail.params = [ {
                    key: "allowedStates",
                    value: leadApiConfig.statesNotAllowed
                },
                    {
                        key: "state",
                        value: state
                    }];
                rulesDetail.result = true;
            }
            return rulesDetail;
        }
        rulesDetail.params = [{
            key: "allowedStates",
            value: leadApiConfig.statesNotAllowed
        },
            {
                key: "state",
                value: "INVALID STATE"
            }];
        rulesDetail.result = true;
    }
    return rulesDetail;
}

function payrollFrequencyLetter( payrollFrequency ) {
  let returnLetter = '';
  switch (payrollFrequency) {
      case 'Weekly':
          returnLetter = 'W';
          break;
      case 'Bi-weekly':
          returnLetter = 'B';
          break;
      case 'Semi-monthly':
          returnLetter = 'S';
          break;
      case 'Monthly' :
          returnLetter = 'M'
          break;
      default:
          returnLetter = 'Error'
          break;
  }
  return returnLetter;
}
