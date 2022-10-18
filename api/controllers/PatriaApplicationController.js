"use strict";

const moment = require("moment");
const _ = require("lodash");
const Joi = require("joi");
module.exports = {
    createApplication: createApplication,
    createEmploymentHistory: createEmploymentHistory
};

async function createApplication( req, res ) {
    let application = req.body;
    const userInfo = {
        practicemanagement: application.practiceId || null,
        firstname: application.firstname,
        middlename: application.middlename,
        lastname: application.lastname,
        generationCode: "",
        email: application.email,
        phoneNumber: application.phone,
        mobileNumber: application.phone,
        street: application.street,
        unitapt: application.unitapt,
        city: application.city,
        state: application.state,
        _state: null,
        zipCode: application.zipcode,
        ssn_number:  application.ssn_number,
        dateofBirth: moment( application.dob ).format( "YYYY-MM-DD" ),
        stateIdNumber: application.stateidnumber,
        idState: application.idstate,
        consentChecked: ( application.creditpullconfirm == "on" ),
        role: "59f9a0db01fa346245e219cf",
        password: application.password,
        confirmPassword: application.confirmpassword,
        salt: ""
    }
    if(!userInfo.ssn_number) {
        userInfo.ssn_number = application.ssn.replace(/[^0-9]/g, "" ).substr( 0, 9 )
    }

    const financialInfo = {
        bank: application.bankname,
        routingNumber: application.routingno,
        accountNumber: application.bankaccno,
        requestedLoanAmount: application.requestedLoanAmount,
        monthlyIncome: application.monthlyIncome,
        paymentmethod: application.paymentmethod,
        paymentFrequency: application.paymentFrequency
    };

    const finInput = {
        user: "",
        accountName: financialInfo.bank,
        routingNumber: financialInfo.routingNumber,
        accountNumber: financialInfo.accountNumber,
        accountNumberLastFour: financialInfo.accountNumber.substring(financialInfo.accountNumber.length - 4),
        accountType: (financialInfo.paymentmethod === "Direct Deposit") ? 'depository' : "",
        incomeamount: financialInfo.monthlyIncome
    };

    let user = null;
    let screenTracking = null;

    const practiceId = userInfo.practicemanagement;

    try {
    // Step 1: Create User
        const createdNewUser = await User.createNewUser( req.session.deniedStatus, userInfo ); // denied status? hasn't hit waterfall yet
        if( createdNewUser.code == 500 ) {
            return res.status(500).json({message: "There was a server issue creating the new User."})
        } else if( createdNewUser.code == 400 ) { // error creating user check for dupusererror or reapply error
            sails.log.info( "ApplicationController.createApplication createdNewUSer: ", createdNewUser );
            req.session.errormessage = createdNewUser.dupusererror;
            return res.status(400).json({message: "Unable to create user."});
        }
        finInput.user = createdNewUser.userdetails.id;
        sails.log.info(finInput);
        try {
            await Account.create(finInput);
        } catch (err) {
            sails.log.error(err);
        }
        user = createdNewUser.userdetails;
        req.session.userId = user.id;
        req.session.loginType = "frontend";

    // Step 2: DON'T login the user. You should try smiling more.

    // Step 3: Create Screentracking
        const applicationReferenceData = await User.getNextSequenceValue( "application" );
        const screentrackingDocInitial = {
            user: user.id,
            applicationReference: `APL_${applicationReferenceData.sequence_value}`,
            lastlevel: 2,
            lastScreenName: "Application",
            practicemanagement: user.practicemanagement,
            iscompleted: 0,
            incomeamount: 0,
            requestedLoanAmount: 0,
            origin: "Website"
        };
        const screentrackingDoc = Object.assign(screentrackingDocInitial, financialInfo);
        const practiceManagement = await PracticeManagement.find({});
        screentrackingDoc.practicemanagement = practiceManagement[0].id;	// Static collection, only 1 entry
        sails.log.info( "screentrackingDoc", screentrackingDoc );
        const screenTracking  = await Screentracking.create( screentrackingDoc );

    // Step 4: Create UserBankAccount and PlaidUser
        const accountsData = [];
        const balanceData = {
            available: 0,
            current: 0,
            limit: ''
        };
        const metaData = {
            limit: null,
            name: "Checking",
            number: finInput.accountNumberLastFour,
            official_name: ''
        };
        const filteredAccountsDetailsJson = {
            account: finInput.accountNumber,
            account_id: '',
            routing: finInput.routingNumber,
            wire_routing: finInput.routingNumber
        };
        const objdata = {
            balance: balanceData,
            institution_type: finInput.accountType,
            meta: metaData,
            numbers: filteredAccountsDetailsJson,
            subtype: 'checking',
            type: 'depository'
        }
        accountsData.push(objdata);
        const transactionGenerated = {};
        const userBankData = {
            accounts: accountsData,
            accessToken: '',
            institutionName: finInput.accountName,
            institutionType: finInput.accountType,
            transactions: transactionGenerated,
            user: user.id,
            item_id: '',
            access_token: '',
            transavail: 0,
            Screentracking: screenTracking.id,
            bankfilloutmanually: 1
        };

        req.session["screenTrackingId"] = screenTracking.id;
        sails.log.info(userBankData);
        var userBankAccount = await UserBankAccount.create(userBankData);
        await Account.update({ user: user.id }, { userBankAccount: userBankAccount.id });
        const plaidNames = [];
        const plaidEmails = [];
        const plaidphoneNumbers = [];
        const plaidAddress = [];
        const fullname = user.firstname + ' ' + user.lastname;
        plaidNames.push(fullname);
        const emailData = {
            primary: true,
            type: 'e-mail',
            data: user.email
        };
        plaidEmails.push(emailData);
        const phoneData = {
            primary: true,
            type: 'mobile',
            data: user.phoneNumber
        };
        plaidphoneNumbers.push(phoneData);
        const addressData = {
            primary: true,
            data: {
                street: user.street,
                city: user.city,
                state: user.state,
                zip: user.zipCode
            }
        };
        plaidAddress.push(addressData);
        const newPlaidUser = {
            names: plaidNames,
            emails: plaidEmails,
            phoneNumbers: plaidphoneNumbers,
            addresses: plaidAddress,
            user: user.id,
            userBankAccount: userBankAccount.id,
            ifuserInput: 1,
            plaidfilloutmanually: 1
        };
        await PlaidUser.create(newPlaidUser);

    // Step 5: Underwriting
        const underwritingResult = await UnderwritingService.underwritingWaterfall(user, screenTracking);

        if (underwritingResult.error) {
            sails.log.error( "ApplicationController#createApplication :: Underwriting err:", underwritingResult.error );
            req.session.errormessage = "'Sorry, there is an error trying to submit this application. Please try again or contact our staff.";
            return res.status(500).json({message: "There was an error in Underwriting."});
        } else if (!underwritingResult.passed) {
            const deniedUPdate = {iscompleted:1, isDenied: true, deniedReason:underwritingResult.reason};
            await Screentracking.update({id: screenTracking.id},deniedUPdate)
            _.assign(screenTracking, deniedUPdate);
            await createDeniedPaymentManagement(user,screenTracking);

            return res.status(200).json({success: false});
            //browser should redirect to /loadDenied
        }
    // Step 6: User has passed Account creation and underwriting

        //EmailService.senduserRegisterEmail( user );
        return res.status(200).json({status: true})
        // browser should redirect to "/employmentandreferenceinfo"
    } catch (err) {
        sails.log.error("PatriaApplicationController#createApplication -- Error: ", err);
        req.session.errormessage = "An error occured while trying to create this application.";
        return res.status(500).json({message: "An error occured while trying to create this application."});
    }
}

async function createEmploymentHistory( req, res ) {
    sails.log.info('Calling createEmploymentAndReference()... ');
    let application = req.body;
    let userId = application.userId;
    const employmentHistoryData = {
        practicemanagement: application.practicemanagement,
        typeOfIncome: application.incometype,
        employerName: application.employername,
        employerPhone: application.workphone,
        employerStatus: application.employerstatus, // Does not exist in model
        lastPayDate: moment.utc(application.lastPayDate).format( "YYYY-MM-DD" ),
        nextPayDate: moment.utc(application.nextPayDate).format( "YYYY-MM-DD" ),
        secondPayDate: moment.utc(application.secondPayDate).format( "YYYY-MM-DD" ),
        payFrequency: application.paymentFrequency,
        isAfterHoliday: application.paymentBeforeAfterHolidayWeekend === "1"?EmploymentHistory.decisionCloudIsAfterHoliday.AFTER_HOLIDAY:EmploymentHistory.decisionCloudIsAfterHoliday.BEFORE_HOLIDAY,
        user: userId
    };
    sails.log.info(employmentHistoryData);

    const employmentHistoryValidation = await ApiApplicationService.validateEmploymentHistory(employmentHistoryData);
    // sails.log.info(references);
    try {
        const employmentData = await EmploymentHistory.create(employmentHistory);
        await Screentracking.update({ user: userId }, { lastlevel: 3, paymentFrequency: employmentHistory.payFrequency || SmoothPaymentService.paymentFrequencyEnum.BI_WEEKLY, isAfterHoliday: employmentHistory.isAfterHoliday } );
        return res.status(200).json({status: true, data: employmentData});
    } catch (err) {
        sails.log.error(err);
        return res.status(500).json({message: "An error occurred while trying to create an employment history."});
    }

}

