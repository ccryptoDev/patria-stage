const Screentracking = require("../../models/Screentracking");
const ClarityService = require("../ClarityService");
const { failureResponse } = require("./returnContext");
const {
  UNDERWRITING_RULES,
  setScreenTrackingContext,
  initContext,
} = require("./helpers");
const ClarityResponseModel = require("../../models/ClarityResponse");
const communicationService = require("../../services/CommunicationService");

const RULE = UNDERWRITING_RULES.$5_CLARITY_CLEAR_INQUIRE;

async function clarityClearInquiry({ user, screenTracking: screentracking }) {
  try {
    const userDetails = { ...user };

    if (process.env.NODE_ENV !== "production") {
      const testSsn = sails.config.getTestData(RULE.ruleId, user.ssnNumber);

      Object.assign(userDetails, { ssnNumber: testSsn, ssn_number: testSsn });
    }

    const { context, FAILED, QUEUED, RETRY } = initContext(RULE);
    userDetails.control_file_name = "Inquiry";
    const { data: clarityResponse } = await ClarityService.makeInquiry(
      userDetails
    );

    await ClarityResponseModel.saveClarityResponse(
      screentracking,
      clarityResponse,
      RULE.title,
      RULE.ruleNumber
    );

    const isOrganicApplication =
      screentracking.origin === Screentracking.origins.WEBSITE;
    // console.log("clarityResponse", clarityResponse);
    const { inquiry, tracking_number } = clarityResponse?.xml_response;

    Object.assign(screentracking, {
      clarityTrackingNumber: tracking_number,
    }).save();

    //checking SSN is Deceased
    if (inquiry?.social_security_deceased) {
      Object.assign(context.underwritingDecision, {
        status: FAILED,
        reason: "SSN is deceased",
      });

      if (isOrganicApplication) {
        communicationService.sendApplicationCommunication({
          communicationCode: "CLB",
          user: userDetails,
          screenTracking: screentracking,
        });
      }

      return setScreenTrackingContext(screentracking, context);
    }

    // checking Social Security Exception
    if (!inquiry?.social_security_valid) {
      const { status: previousStatus, ruleName: previousRuleName } =
        screentracking?.underwritingDecision || {};
      const isRetry =
        previousStatus === RETRY && previousRuleName === RULE.title;

      Object.assign(context.underwritingDecision, {
        status: isRetry ? FAILED : RETRY,
        reason: "Invalid SSN",
      });

      if (
        isOrganicApplication &&
        context.underwritingDecision.status === FAILED
      ) {
        communicationService.sendApplicationCommunication({
          communicationCode: "CLA",
          user: userDetails,
          screenTracking: screentracking,
        });
      }

      return setScreenTrackingContext(screentracking, context);
    }

    // OFAC check
    if (inquiry?.ofac_score >= 80) {
      // queue for review
      Object.assign(context.underwritingDecision, {
        status: QUEUED,
        reason: "Application is in Review due to ofac score",
      });

      // EMAIL IS NOT LISTED IN THE EMAILS COMMUNICATION SHEET - ADDING FOR SANITY
      if (isOrganicApplication) {
        communicationService.sendApplicationCommunication({
          communicationCode: "QRA",
          user: userDetails,
          screenTracking: screentracking,
        });
      }
      return setScreenTrackingContext(screentracking, context);
    }

    return setScreenTrackingContext(screentracking, context);
  } catch (error) {
    sails.log.error("FifthStep#clarityClearInquiry::Err ::", error);
    return failureResponse(RULE.title, error.message);
  }
}

module.exports = clarityClearInquiry;
