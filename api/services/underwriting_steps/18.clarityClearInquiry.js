const ClarityService = require("../ClarityService");
const { systemError } = require("./returnContext");
const {
  UNDERWRITING_RULES,
  setScreenTrackingContext,
  initContext,
} = require("./helpers");
const ClarityResponseModel = require("../../models/ClarityResponse");
const communicationService = require("../../services/CommunicationService");

const RULE = UNDERWRITING_RULES.$18_CLARITY_CLEAR_INQUIRY;

const clarityClearInquiry18 = async ({
  user,
  screenTracking: screentracking,
}) => {
    const { context, FAILED, RETRY, QUEUED } = initContext(RULE);
    try {
    const userDetails = { ...user };
    if (process.env.NODE_ENV !== "production") {
      const testSsn = sails.config.getTestData(RULE.ruleId, user.ssnNumber);

      Object.assign(userDetails, { ssnNumber: testSsn, ssn_number: testSsn });
    }

    userDetails.control_file_name = "Inquiry";
    let response = await ClarityService.makeInquiry(userDetails, screentracking.clarityTrackingNumber);

    if (!response.ok) {
      Object.assign(context.underwritingDecision, {
        status: RETRY,
        reason: "System Error!",
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

    if (!xml_response) {
      Object.assign(context.underwritingDecision, {
        status: RETRY,
        reason: "Didn't get clarity clear response",
      });
      return setScreenTrackingContext(screentracking, context);
    }

    const { inquiry } = xml_response;
    if (inquiry && inquiry?.number_of_ssns_with_bank_account >= 4) {
      Object.assign(context.underwritingDecision, {
        status: FAILED,
        reason:
          "Number of SSNs associated with bank account is greater or equal 4",
      });

      communicationService.sendApplicationCommunication({
        communicationCode: "CL",
        user: userDetails,
        screenTracking: screentracking,
      });
    }

    return setScreenTrackingContext(screentracking, context);
  } catch (error) {
    sails.log.error("FifthStep#clarityClearInquiry::Err ::", error);
    return setScreenTrackingContext(screentracking, context);
  }
};

module.exports = clarityClearInquiry18;
