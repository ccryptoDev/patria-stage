const ClarityService = require("../ClarityService");
const { systemError } = require("./returnContext");
const {
  UNDERWRITING_RULES,
  setScreenTrackingContext,
  initContext,
  getCommunicationCode,
} = require("./helpers");
const communicationService = require("../../services/CommunicationService");
const { generateKbaUrl } = require("../TrueValidate");
const TransUnionTrueValidate = require("../../models/TransUnionTrueValidate");
const ClarityResponseModel = require("../../models/ClarityResponse");
const PaymentAccountToken = require("../../models/PaymentAccountToken");

const RULE = UNDERWRITING_RULES.$20_CLEAR_BANK_CALL;

const clearBankCall = async ({ user, screenTracking: screentracking }) => {
  const { context, FAILED, RETRY, PASSED, QUEUED } = initContext(RULE);
  try {
    const userDetails = { ...user };
    if (process.env.NODE_ENV !== "production") {
      const testSsn = sails.config.getTestData(RULE.ruleId, user.ssnNumber);

      Object.assign(userDetails, { ssnNumber: testSsn, ssn_number: testSsn });
    }

    const checkingAccount = await PaymentAccountToken.getOne({
      user: userDetails.id,
      paymentType: "ACH",
    });

    userDetails.control_file_name = "BankBehavior";
    let response = await ClarityService.makeInquiry(
      userDetails,
      screentracking.clarityTrackingNumber,
      checkingAccount
    );
    if (!response.ok) {
      Object.assign(context, {
        underwritingDecision: {
          ...context.underwritingDecision,
          status: RETRY,
          reason: "System Error!",
        },
      });
      return setScreenTrackingContext(screentracking, context);
    }
    const { xml_response } = response.data;
    ClarityResponseModel.saveClarityResponse(
      screentracking,
      xml_response,
      RULE.title,
      RULE.ruleNumber
    );

    // return xml_response;
    if (!xml_response) {
      Object.assign(context, {
        underwritingDecision: {
          ...context.underwritingDecision,
          status: RETRY,
          reason: "Didn't get clarity clear response",
        },
      });
      return setScreenTrackingContext(screentracking, context);
    }
    const { clear_bank_behavior, inquiry } = xml_response;
    const cb_account = clear_bank_behavior.accounts[0];

    const validationsEnum = {
      CBB_SCORE_RISK: "High Risk! CBB Score is less than 600",
      DEFAULT_RATE:
        "High Risk! Default Rate 64-365 days ago is greater than 40",
      DAYS_SINCE_DEFAULT_HISTORY:
        "High Risk! Days since default history is less than 90",
      DAYS_FIRST_SEEN:
        "High Risk! SSN never seen but bank account seen in the last 90 days",
      ACC_OPEN_INQUIRY:
        "High Risk! DDA opening inquiry in the last 30 days ago",
      SSN_FIRST_SEEN: "SSN first Appearance",
    };

    const validateClearScore = async () => {
      if (Number(clear_bank_behavior.cbb_score) < 600) {
        Object.assign(context.underwritingDecision, {
          status: QUEUED,
          reason: validationsEnum.CBB_SCORE_RISK,
          value: clear_bank_behavior.cbb_score,
          expectedValue: 600,
        });

        communicationService.sendApplicationCommunication({
          communicationCode: "CBA",
          user: userDetails,
          screenTracking: screentracking,
          data: {
            smsLink: sails.config.getMagicLoginLink(
              screentracking,
              userDetails
            ),
          },
        });

        await Object.assign(screentracking, {
          driverLicenseRequested: true,
          driverLicenseRequestDate: new Date(),
          payStubRequested: true,
          payStubRequestDate: new Date(),
        }).save();
      }
    };
    const validateDefaultRate = async () => {
      if (cb_account.default_rate_61_365_days_ago > 40) {
        const {
          activity_days_per_month: activityDaysPerMonth = 30, // mock for testing - prop in unknown at this point
          account_age: accountAge,
          paycheck_direct_deposit: hasDirectDeposit,
        } = inquiry;

        const SIX_MONTHS_IN_DAYS = 180;
        const MINIMUM_ACTIVITY = 15;

        const hasMinimumActivity =
          accountAge > SIX_MONTHS_IN_DAYS &&
          activityDaysPerMonth > MINIMUM_ACTIVITY &&
          hasDirectDeposit;

        const status = hasMinimumActivity ? QUEUED : FAILED;

        Object.assign(context.underwritingDecision, {
          status,
          reason: validationsEnum.DEFAULT_RATE,
          value: cb_account.default_rate_61_365_days_ago,
        });

        const communicationCode = getCommunicationCode(status, {
          [QUEUED]: "TLB",
          [FAILED]: "TLA",
        });

        communicationService.sendApplicationCommunication({
          communicationCode,
          user: userDetails,
          screenTracking: screentracking,
          data: {
            smsLink: sails.config.getMagicLoginLink(
              screentracking,
              userDetails
            ),
          },
        });

        if (status === QUEUED) {
          await Object.assign(screentracking, {
            driverLicenseRequested: true,
            driverLicenseRequestDate: new Date(),
            payStubRequested: true,
            payStubRequestDate: new Date(),
          }).save();
        }
      }
    };

    const validateDaysSinceDefaultHistory = () => {
      if (cb_account.days_since_default_history <= 90) {
        Object.assign(context.underwritingDecision, {
          status: FAILED,
          reason: validationsEnum.DAYS_SINCE_DEFAULT_HISTORY,
          value: cb_account.days_since_default_history,
        });

        communicationService.sendApplicationCommunication({
          communicationCode: "PA",
          user: userDetails,
          screenTracking: screentracking,
        });
      }
    };
    const validateDaysSinceFirstSeen = () => {
      if (cb_account.days_since_first_seen_by_clarity <= 90) {
      }
    };
    const validateInquiryLast30Days = () => {
      if (
        clear_bank_behavior?.fis_chex_advisor?.number_of_inquiries
          ?.thirty_days_ago >= 1
      ) {
        // MISSING ACTIVITY VALIDATIONS
        Object.assign(context.underwritingDecision, {
          status: QUEUED,
          reason: validationsEnum.ACC_OPEN_INQUIRY,
          value:
            clear_bank_behavior?.fis_chex_advisor?.number_of_inquiries
              ?.thirty_days_ago,
        });

        communicationService.sendApplicationCommunication({
          communicationCode: "DDB",
          user: userDetails,
          screenTracking: screentracking,
        });
      }
    };
    const isSsnFirstSeen = () => {
      if (inquiry.ssn_first_appearance === true) {
      }
    };

    const validations = {
      [validationsEnum.CBB_SCORE_RISK]: validateClearScore,
      [validationsEnum.DEFAULT_RATE]: validateDefaultRate,
      // [validationsEnum.DAYS_SINCE_DEFAULT_HISTORY]: validateDaysSinceDefaultHistory,
      // [validationsEnum.DAYS_FIRST_SEEN]: validateDaysSinceFirstSeen,
      [validationsEnum.ACC_OPEN_INQUIRY]: validateInquiryLast30Days,
      // [validationsEnum.SSN_FIRST_SEEN]: isSsnFirstSeen,
    };

    for (const key in validations) {
      await validations[key]();

      if (context.underwritingDecision.status !== PASSED) {
        break;
      }
    }

    if (context.underwritingDecision.status === PASSED) {
      const magicLoginLink = sails.config.getMagicLoginLink(
        screentracking,
        userDetails
      );

      communicationService.sendApplicationCommunication({
        communicationCode: "LDA",
        user: userDetails,
        screenTracking: screentracking,
        data: {
          completeApplicationLink: magicLoginLink,
          smsLink: magicLoginLink,
        },
      });
    }

    return setScreenTrackingContext(screentracking, context);
  } catch (error) {
    sails.log.error("20thStep#clarityBankCall::Err ::", error);
    return setScreenTrackingContext(screentracking, context);
  }
};

module.exports = clearBankCall;
