const { makeInquiry } = require("../ClarityService");
const { systemError, failureResponse } = require("./returnContext");
const {
  initContext,
  setScreenTrackingContext,
  UNDERWRITING_RULES,
  getCommunicationCode,
} = require("./helpers");
const ClarityResponseModel = require("../../models/ClarityResponse");
const Screentracking = require("../../models/Screentracking");
const communicationService = require("../../services/CommunicationService");

/**
 *
 * @param user
 * @returns True if user in block list
 */

const RULE = UNDERWRITING_RULES.$8_CLARITY_CLEAR_CREDIT;
async function clarityClearCredit({ user: userData, screenTracking = {} }) {
  try {
    const user = { ...userData };
    if (process.env.NODE_ENV !== "production") {
      const testSsn = sails.config.getTestData(RULE.ruleId, user.ssnNumber);

      Object.assign(user, { ssnNumber: testSsn, ssn_number: testSsn });
    }
    const { context, FAILED, RETRY, QUEUED } = initContext(RULE);
    user.control_file_name = "CreditRisk";
    const response = await makeInquiry(user);

    if (!response.ok || !response.data?.xml_response) {
      let reason = "System Error!";
      if (response?.data.test_inquiry?.errors)
        reason = response?.data.test_inquiry?.errors[0];
      Object.assign(context, {
        underwritingDecision: {
          ...context.underwritingDecision,
          status: RETRY,
          reason: reason,
        },
      });
      return setScreenTrackingContext(screenTracking, context);
    }

    ClarityResponseModel.saveClarityResponse(
      screenTracking,
      response?.data?.xml_response,
      RULE.title,
      RULE.ruleNumber
    );

    const isOrganicApplication =
      screenTracking.origin === Screentracking.origins.WEBSITE;

    const { clear_credit_risk } = response?.data?.xml_response || {};
    if (Number(clear_credit_risk?.active_duty_status) === 1) {
      Object.assign(context, {
        underwritingDecision: {
          ...context.underwritingDecision,
          status: FAILED,
          reason: "MLA rejected",
          value: clear_credit_risk?.active_duty_status,
        },
      });

      const communicationCode = getCommunicationCode(screenTracking.origin, {
        [Screentracking.origins.LEADS_PROVIDER]: "CRAL",
        [Screentracking.origins.WEBSITE]: "CRA",
      });

      communicationService.sendApplicationCommunication({
        communicationCode,
        user,
        screenTracking,
      });

      return setScreenTrackingContext(screenTracking, context);
    }

    // add this condition below , removed for testing
    // || Number(clear_credit_risk?.active_duty_status) === 0
    if (Number(clear_credit_risk?.active_duty_status) === 9) {
      Object.assign(context, {
        underwritingDecision: {
          ...context.underwritingDecision,
          status: QUEUED,
          reason: "MLA queued",
          value: clear_credit_risk?.active_duty_status,
        },
      });

      communicationService.sendApplicationCommunication({
        communicationCode: "QRA",
        user,
        screenTracking,
      });

      return setScreenTrackingContext(screenTracking, context);
    }

    if (clear_credit_risk?.number_of_loans_past_due > 1) {
      Object.assign(context, {
        underwritingDecision: {
          ...context.underwritingDecision,
          status: FAILED,
          reason: "Number of loan past due found",
          value: clear_credit_risk?.number_of_loans_past_due,
        },
      });

      const communicationCode = getCommunicationCode(screenTracking.origin, {
        [Screentracking.origins.LEADS_PROVIDER]: "CRBL",
        [Screentracking.origins.WEBSITE]: "CRB",
      });
      communicationService.sendApplicationCommunication({
        communicationCode,
        user,
        screenTracking,
      });

      return setScreenTrackingContext(screenTracking, context);
    }

    const clarityScore = clear_credit_risk?.score || 0;
    if (clarityScore > 0 && clarityScore < 400) {
      Object.assign(context, {
        underwritingDecision: {
          ...context.underwritingDecision,
          status: FAILED,
          reason: "Clarity Risk Score below 400",
          value: clarityScore,
        },
      });

      const communicationCode = getCommunicationCode(screenTracking.origin, {
        [Screentracking.origins.LEADS_PROVIDER]: "CRCL",
        [Screentracking.origins.WEBSITE]: "CRC",
      });
      communicationService.sendApplicationCommunication({
        communicationCode,
        user,
        screenTracking,
        data: {
          clarityRiskScore: String(clarityScore),
        },
      });
      return setScreenTrackingContext(screenTracking, context);
    }

    if (screenTracking) {
      await Screentracking.updateOfferData(
        screenTracking,
        "clarityScore",
        clarityScore
      );
    }
    return setScreenTrackingContext(screenTracking, context);
  } catch (error) {
    sails.log.error("8#step#clarityClearCredit::Err ::", error);
    return failureResponse(RULE.title, "System Error");
  }
}

module.exports = clarityClearCredit;
