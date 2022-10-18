const retry = require("async-retry");
const TransUnionTrueValidate = require("../../models/TransUnionTrueValidate");
const FlinkService = require("../FlinksService");
const {
  UNDERWRITING_RULES,
  setScreenTrackingContext,
  initContext,
  getCommunicationCode,
} = require("./helpers");
const { systemError } = require("./returnContext");
const communicationService = require("../../services/CommunicationService");
const {
  getLatestEmploymentHistoryForUser,
} = require("../../models/EmploymentHistory");
const ScreenTrackingModel = require("../../models/Screentracking");
const ClarityResponseModel = require("../../models/ClarityResponse");
const RULE = UNDERWRITING_RULES.$17_REQUEST_BANK_DETAILS;
const MIN_CUTOFF_INCOME = 20000;

const requestBankDetails = async ({
  screenTracking,
  user: userDetail,
  optionalData: flinkCreds,
}) => {
  const { context, FAILED, QUEUED, PASSED } = initContext(RULE);
  try {
    const { loginId, requestId, userbank, selectedAccountId } = flinkCreds;

    const userAccountDetails = await FlinksService.retryGetAccountDetails(
      flinkCreds,
      30
    );

    sails.log.info("17thStep#requestBankDetails.requestBankDetails::userAccountDetails", userAccountDetails);

    const selectedCheckingAccount = userAccountDetails?.Accounts?.[0];
    FlinksService.storeAchAccount(userDetail, {
      routingNumber: selectedCheckingAccount?.RoutingNumber || selectedCheckingAccount?.TransitNumber,
      accountNumber: selectedCheckingAccount?.AccountNumber,
      institution: userAccountDetails?.Institution,
    });

    const {
      data: userAttrResponse,
    } = await FlinkService.getUserAnalysisAttribute(flinkCreds);

    sails.log.info("17thStep#requestBankDetails.requestBankDetails::userAttrResponse", userAttrResponse);

    ClarityResponseModel.saveClarityResponse(
      screenTracking,
      userAttrResponse,
      RULE.title,
      RULE.ruleNumber
    );

    const {
      count_stop_payment_90_days,
      account_age_days,
      count_active_days,
      sum_employer_income,
      employer_name: flinksEmployerName,
    } = userAttrResponse?.Card;

    console.log({
      count_stop_payment_90_days,
      account_age_days,
      count_active_days,
      sum_employer_income,
    });

    const {
      Name: flinksUserName,
      Email: flinksUserEmail,
      Address: {
        City: flinksUserCity,
        Province: flinksUserState,
        PostalCode: flinksUserZipCode,
      },
    } = selectedCheckingAccount?.Holder;

    console.log({ selectedCheckingAccount: selectedCheckingAccount?.Holder });

    // if (selectedCheckingAccount?.Holder.Name === "George Perry") {
    //   Object.assign(context.underwritingDecision, {
    //     status: PASSED,
    //     reason: "bypassed",
    //   });

    //   return setScreenTrackingContext(screenTracking, context);
    // }

    const validationsEnum = {
      STOP_PAYMENTS: "Multiple stop payments",
      ACCOUNT_AGE: "New account",
      ACTIVE_DAYS: "Bank Account Insufficient Activity",
      TOTAL_INCOME: "Insufficient income",
      EMAIL_CONFLICT: "Email conflict",
      NAME_CONFLICT: "Name conflict",
      ADDRESS_CONFLICT: "Address conflict",
      EMPLOYER_NAME_CONFLICT: "Employer name conflict",
      INCOME_CONFLICT: "Income conflict",
      NEO_BANK: "NEO bank",
    };

    const validateStopPayments = () => {
      const isReview = [1, 2].includes(count_stop_payment_90_days);

      if (isReview || count_stop_payment_90_days > 2) {
        Object.assign(context.underwritingDecision, {
          status: isReview ? QUEUED : FAILED,
          reason: validationsEnum.STOP_PAYMENTS,
          value: count_stop_payment_90_days,
        });

        const communicationCode = getCommunicationCode(
          context.underwritingDecision.status,
          {
            [QUEUED]: "QRA",
            [FAILED]: "BDA",
          }
        );

        communicationService.sendApplicationCommunication({
          communicationCode,
          user: userDetail,
          screenTracking,
        });
      }
    };

    const validateAccountAge = () => {
      const isReview = account_age_days > 90 && account_age_days < 180;

      if (isReview || account_age_days < 90) {
        Object.assign(context.underwritingDecision, {
          status: isReview ? QUEUED : FAILED,
          reason: validationsEnum.ACCOUNT_AGE,
          value: account_age_days,
        });
      }

      const communicationCode = getCommunicationCode(
        context.underwritingDecision.status,
        {
          [QUEUED]: "QRA",
          [FAILED]: "BDB",
        }
      );

      communicationService.sendApplicationCommunication({
        communicationCode,
        user: userDetail,
        screenTracking,
      });
    };

    const validateActiveDays = () => {
      if (count_active_days < 20) {
        Object.assign(context.underwritingDecision, {
          status: FAILED,
          reason: validationsEnum.ACTIVE_DAYS,
          value: count_active_days,
        });

        communicationService.sendApplicationCommunication({
          communicationCode: "BDC",
          user: userDetail,
          screenTracking,
        });
      }
    };

    const validateTotalIncome = () => {
      const flinksTotalIncome = sum_employer_income * (365 / account_age_days);
      if (flinksTotalIncome < MIN_CUTOFF_INCOME) {
        Object.assign(context.underwritingDecision, {
          status: FAILED,
          reason: validationsEnum.TOTAL_INCOME,
          value: flinksTotalIncome,
          expectedValue: MIN_CUTOFF_INCOME,
        });

        communicationService.sendApplicationCommunication({
          communicationCode: "BDD",
          user: userDetail,
          screenTracking,
        });
      }
    };

    const validateGivenEmail = async () => {
      const isEmailConflict = userDetail.email !== flinksUserEmail;
      const applicantWasApprovedKBA =
        screenTracking.kbaRequested && screenTracking.kbaApproved;

      if (isEmailConflict) {
        Object.assign(context.underwritingDecision, {
          status: QUEUED,
          reason: validationsEnum.EMAIL_CONFLICT,
          value: userDetail.email,
          expectedValue: flinksUserEmail,
        });

        if (!applicantWasApprovedKBA) {
          const kbaCaseResponse = await generateKbaUrl(
            screenTracking,
            userDetail
          );

          TransUnionTrueValidate.saveTrueValidateResponse(
            userDetail.id,
            TransUnionTrueValidate.caseTypes.KBA_REQUEST,
            kbaCaseResponse
          );

          await Object.assign(screenTracking, {
            kbaRequested: true,
            kbaApproved: false,
            kbaRequestDate: new Date(),
            driverLicenseRequested: true,
            driverLicenseRequestDate: new Date(),
          });
        }

        communicationService.sendApplicationCommunication({
          communicationCode: applicantWasApprovedKBA ? "QRA" : "QRC",
          user: userDetail,
          screenTracking,
          data: {
            smsLink: sails.config.getMagicLoginLink(screenTracking, userDetail),
          },
        });
      }
    };

    const validateGivenName = () => {
      const { firstName, lastName } = userDetail;
      const fullName = `${firstName} ${lastName}`;

      const namesMatches = fullName
        .trim()
        .match(new RegExp(flinksUserName, "gi"));

      if (!namesMatches) {
        Object.assign(context.underwritingDecision, {
          status: QUEUED,
          reason: validationsEnum.NAME_CONFLICT,
          value: fullName,
          expectedValue: flinksUserName,
        });

        communicationService.sendApplicationCommunication({
          communicationCode: "QRE",
          user: userDetail,
          screenTracking,
          data: {
            smsLink: sails.config.getMagicLoginLink(screenTracking, userDetail),
          },
        });
      }
    };

    const validateGivenAddress = async () => {
      const applicantWasApprovedKBA =
        screenTracking.kbaRequested && screenTracking.kbaApproved;
      const { state, city, zipCode } = userDetail;
      const isMatchingAddress =
        state === flinksUserState &&
        city === flinksUserCity &&
        zipCode === flinksUserZipCode;

      if (!isMatchingAddress) {
        Object.assign(context.underwritingDecision, {
          status: QUEUED,
          reason: validationsEnum.ADDRESS_CONFLICT,
          value: { state, city, zipCode },
          expectedValue: {
            state: flinksUserState,
            city: flinksUserCity,
            zipCode: flinksUserZipCode,
          },
        });
        communicationService.sendApplicationCommunication({
          communicationCode: "QRG",
          user: userDetail,
          screenTracking,
          data: {
            smsLink: sails.config.getMagicLoginLink(screenTracking, userDetail),
          },
        });
      }
      if (!applicantWasApprovedKBA) {
        const kbaCaseResponse = await generateKbaUrl(
          screenTracking,
          userDetail
        );

        TransUnionTrueValidate.saveTrueValidateResponse(
          userDetail.id,
          TransUnionTrueValidate.caseTypes.KBA_REQUEST,
          kbaCaseResponse
        );

        await Object.assign(screenTracking, {
          kbaRequested: true,
          kbaApproved: false,
          kbaRequestDate: new Date(),
          driverLicenseRequested: true,
          driverLicenseRequestDate: new Date(),
          proofOfResidenceRequested: true,
          proofOfResidenceRequestDate: new Date(),
        }).save();
      }
    };

    const validateGivenEmployerName = async () => {
      const { employerName = "" } = await getLatestEmploymentHistoryForUser(
        userDetail.id
      );

      const isMatchingEmployerName = employerName.match(
        new RegExp(flinksEmployerName, "gi")
      );

      if (!isMatchingEmployerName) {
        Object.assign(context.underwritingDecision, {
          status: QUEUED,
          reason: validationsEnum.EMPLOYER_NAME_CONFLICT,
          value: employerName,
          expectedValue: flinksEmployerName,
        });

        communicationService.sendApplicationCommunication({
          communicationCode: "QRI",
          user: userDetail,
          screenTracking,
          data: {
            smsLink: sails.config.getMagicLoginLink(screenTracking, userDetail),
          },
        });

        await Object.assign(screenTracking, {
          payStubRequested: true,
          payStubRequestDate: new Date(),
        }).save();
      }
    };

    const validateGivenIncome = () => {
      const isConflictIncome =
        sum_employer_income / screenTracking.annualIncome < 0.6; // Updated to 0.6 reflect netpay difference

      if (isConflictIncome) {
        Object.assign(context.underwritingDecision, {
          status: QUEUED,
          reason: validationsEnum.INCOME_CONFLICT,
          value: screenTracking.annualIncome,
          expectedValue: sum_employer_income,
        });

        communicationService.sendApplicationCommunication({
          communicationCode: "FI",
          user: userDetail,
          screenTracking,
          data: {
            smsLink: sails.config.getMagicLoginLink(screenTracking, userDetail),
          },
        });
      }
    };

    const validateNeoBank = async () => {
      const userBank = screenTracking?.bankName
        ?.toLowerCase()
        ?.replace(/\s/g, "");

      const isNeoBank = userBank === "neobank";

      if (isNeoBank) {
        Object.assign(context.underwritingDecision, {
          status: QUEUED,
          reason: validationsEnum.NEO_BANK,
          value: screenTracking.annualIncome,
          expectedValue: sum_employer_income,
        });

        const isActive15DayMonth = false; // confirm rule
        const hasDirectDeposit = false; //confirm rule
        if (isActive15DayMonth && hasDirectDeposit) {
          Object.assign(context.underwritingDecision, {
            status: FAILED,
            reason: `${validationsEnum.NEO_BANK} - Insufficient Account Activity`,
            value: undefined, // add given data for rule that will be confirmed
          });

          communicationService.sendApplicationCommunication({
            communicationCode: "NEA",
            user: userDetail,
            screenTracking,
          });
          return;
        }

        communicationService.sendApplicationCommunication({
          communicationCode: "NEB",
          user: userDetail,
          screenTracking,
          data: {
            smsLink: sails.config.getMagicLoginLink(screenTracking, userDetail),
          },
        });

        await Object.assign(screenTracking, {
          driverLicenseRequested: true,
          driverLicenseRequestDate: new Date(),
          payStubRequest: true,
        }).save();
      }
    };

    const validations = {
      [validationsEnum.STOP_PAYMENTS]: validateStopPayments,
      [validationsEnum.ACTIVE_DAYS]: validateActiveDays,
      [validationsEnum.TOTAL_INCOME]: validateTotalIncome,
      [validationsEnum.ACCOUNT_AGE]: validateAccountAge,
      [validationsEnum.EMAIL_CONFLICT]: validateGivenEmail,
      [validationsEnum.NAME_CONFLICT]: validateGivenName,
      [validationsEnum.ADDRESS_CONFLICT]: validateGivenAddress,
      [validationsEnum.EMPLOYER_NAME_CONFLICT]: validateGivenEmployerName,
      [validationsEnum.INCOME_CONFLICT]: validateGivenIncome,
      [validationsEnum.NEO_BANK]: validateNeoBank,
    };

    // TEST ONLY
    const skipIfTest = new Set([
      validationsEnum.EMAIL_CONFLICT,
      validationsEnum.NAME_CONFLICT,
      validationsEnum.ADDRESS_CONFLICT,
      validationsEnum.EMPLOYER_NAME_CONFLICT,
      validationsEnum.INCOME_CONFLICT,
      validationsEnum.NEO_BANK,
    ]);
    const isTestSsn = sails.config.checkTestSsn(screenTracking.user.ssnNumber);

    Object.assign(context.underwritingDecision, {
      status: QUEUED,
      reason: "Flinks Maintenance",
    });
    await communicationService.sendApplicationCommunication({
      communicationCode: "QRA",
      user: userDetail,
      screenTracking,
    });
    // for (const key in validations) {
    //   // TEST ONLY
    //   if (isTestSsn && skipIfTest.has(key)) {
    //     continue;
    //   }

    //   await validations[key]();

    //   if (context.underwritingDecision.status !== PASSED) {
    //     break;
    //   }
    // }

    sails.log.info("17thStep#requestBankDetails.requestBankDetails::finished", context);
    return setScreenTrackingContext(screenTracking, context);
  } catch (error) {
    sails.log.error("17thStep#requestBankDetails::Err ::", error);
    return setScreenTrackingContext(screenTracking, context);
  }
};

module.exports = requestBankDetails;
