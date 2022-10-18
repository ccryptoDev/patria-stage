const ClarityService = require("../ClarityService");
const { systemError } = require("./returnContext");
const ClarityResponseModel = require("../../models/ClarityResponse");
const {
  UNDERWRITING_RULES,
  setScreenTrackingContext,
  initContext,
} = require("./helpers");
const communicationService = require("../../services/CommunicationService");

const RULE = UNDERWRITING_RULES.$19_CLARITY_CLEAR_FRAUD;

const clarityClearFraud = async ({ user, screenTracking: screentracking }) => {
    const { context, FAILED, RETRY, QUEUED, PASSED } = initContext(RULE);
    try {
    const userDetails = { ...user };
    if (process.env.NODE_ENV !== "production") {
      const testSsn = sails.config.getTestData(RULE.ruleId, user.ssnNumber);

      Object.assign(userDetails, { ssnNumber: testSsn, ssn_number: testSsn });
    }

    userDetails.control_file_name = "FraudInsight";
    let response = await ClarityService.makeInquiry(
      userDetails,
      screentracking.clarityTrackingNumber
    );
    if (!response.ok) {
      Object.assign(context.underwritingDecision, {
        status: RETRY,
        reason: "System Error!",
      });
      return setScreenTrackingContext(screentracking, context);
    }
    const { xml_response } = response.data;
    if (!xml_response) {
      Object.assign(context.underwritingDecision, {
        status: RETRY,
        reason: "Didn't get clarity clear response",
      });
      return setScreenTrackingContext(screentracking, context);
    }
    ClarityResponseModel.saveClarityResponse(
      screentracking,
      xml_response,
      RULE.title,
      RULE.ruleNumber
    );
    const { clear_fraud_insight } = xml_response;

    const validationsEnum = {
      CONSUMER_DECEASED: "Non-Scorable-Reason-Code Consumer Deceased",
      FRAUD_SIGNATURE: "Fraud Signature Matched",
      IS_MINOR: "Consumer is minor",
      MEDIUM_HIGH_RISK: "Medium/High Risk Detected By Clarity Fraud Test",
    };

    const validateConsumerDeceased = () => {
      const isConsumerDeceased =
        clear_fraud_insight.non_scorable_reason_code === "01" ||
        clear_fraud_insight.non_scorable_reason_code === "05";

      if (isConsumerDeceased) {
        Object.assign(context.underwritingDecision, {
          status: FAILED,
          reason: validationsEnum.CONSUMER_DECEASED,
          value: clear_fraud_insight.non_scorable_reason_code,
        });

        communicationService.sendApplicationCommunication({
          communicationCode: "NSD",
          user: userDetails,
          screenTracking: screentracking,
        });
      }
    };

    const validateFraudSignature = () => {
      const isFraudSignature =
        clear_fraud_insight.fraud_signature_match === true;

      if (isFraudSignature) {
        Object.assign(context.underwritingDecision, {
          status: FAILED,
          reason: validationsEnum.FRAUD_SIGNATURE,
          value: clear_fraud_insight.fraud_signature_match,
        });

        communicationService.sendApplicationCommunication({
          communicationCode: "NSF",
          user: userDetails,
          screenTracking: screentracking,
        });
      }
    };

    const validateAge = () => {
      // confirm correct prop for validating age
      const isMinor = clear_fraud_insight.is_minor === true;

      if (isMinor) {
        Object.assign(context.underwritingDecision, {
          status: FAILED,
          reason: validationsEnum.IS_MINOR,
          value: clear_fraud_insight.is_minor,
        });

        communicationService.sendApplicationCommunication({
          communicationCode: "NSM",
          user: userDetails,
          screenTracking: screentracking,
        });
      }
    };

    const validateMediumHighRisk = async () => {
      const isMediumHighRisk =
        clear_fraud_insight.score < 650 ||
        clear_fraud_insight.stability_score < 771;

      if (isMediumHighRisk) {
        Object.assign(context.underwritingDecision, {
          status: QUEUED,
          reason: validationsEnum.MEDIUM_HIGH_RISK,
          value: {
            score: clear_fraud_insight.score,
            stability: clear_fraud_insight.stability_score,
          },
        });

        communicationService.sendApplicationCommunication({
          communicationCode: "QRC",
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
        }).save();
      }
    };

    const validations = {
      [validationsEnum.CONSUMER_DECEASED]: validateConsumerDeceased,
      [validationsEnum.IS_MINOR]: validateAge,
      [validationsEnum.FRAUD_SIGNATURE]: validateFraudSignature,
      [validationsEnum.MEDIUM_HIGH_RISK]: validateMediumHighRisk,
    };

    for (const key in validations) {
      await validations[key]();

      if (context.underwritingDecision.status !== PASSED) {
        break;
      }
    }

    return setScreenTrackingContext(screentracking, context);
  } catch (error) {
    sails.log.error("19thStep#clarityClearFraud::Err ::", error);
    return setScreenTrackingContext(screentracking, context);
  }
};

module.exports = clarityClearFraud;
