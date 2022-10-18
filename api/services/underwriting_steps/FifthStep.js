const Screentracking = require('../../models/Screentracking');
const User = require('../../models/User');
const ClarityService = require('../ClarityService');
const { successResponse, failureResponse, systemError, queuedResponse } = require('./returnContext');


const RULE_NAME = "Clarity Clear Inquiry";

async function clarityClearInquiry(userDetails, screentrackingId) {
  try {
    let response = await ClarityService.makeInquiry(userDetails);

    const { PASSED, IN_REVIEW, FAILED } = Screentracking.underwritingStatus;
    const query = { id: screentrackingId };
    const context = {
      underwritingDecision: {
        status: PASSED,
        ruleName: RULE_NAME,
        reason: null
      }
    }

    if (!response.ok) {
      context.underwritingDecision.status = FAILED;
      await Screentracking.updateContext(query, context);
      return systemError(RULE_NAME, `Something Went Wrong`);
    }

    const { xml_response } = response.data;
    if (!xml_response) {
      const REASON = `Didn't get clarity clear response`
      context.underwritingDecision.status = FAILED;
      context.underwritingDecision.reason = REASON;
      await Screentracking.updateContext(query, context);
      return systemError(RULE_NAME, REASON);
    }

    const { action, exception_descriptions, inquiry } = xml_response;

    // checking Social Securoity Exception
    if (action === "Exception") {
      context.underwritingDecision.status = FAILED;
      context.underwritingDecision.reason = exception_descriptions;
      await Screentracking.updateContext(query, context);
      return failureResponse(RULE_NAME, exception_descriptions);
    }

    //checking SSN is Deceased
    if (inquiry?.social_security_deceased) {
      const REASON = "SSN is deceased";
      context.underwritingDecision.status = FAILED;
      context.underwritingDecision.reason = REASON;
      await Screentracking.updateContext(query, context);
      return failureResponse(RULE_NAME, REASON);
    }

    // OFAC check
    if (inquiry?.ofac_score >= 80) {
      // queue for review
      const REASON = "Application is in Review due to ofac score"
      context.underwritingDecision.status = IN_REVIEW;
      context.underwritingDecision.reason = REASON;
      await Screentracking.updateContext(query, context);
      return queuedResponse(RULE_NAME, "Application is in Review due to ofac score", inquiry?.ofac_score, "greater then 80")
    }

    // continue to get ofac score
    // if(inquiry)
    await Screentracking.updateContext(query, context);
    return response;

  } catch (error) {
    sails.log.error("FifthStep#clarityClearInquiry::Err ::", error);
    return failureResponse(RULE_NAME, error.message);
  }
}


module.exports = clarityClearInquiry;