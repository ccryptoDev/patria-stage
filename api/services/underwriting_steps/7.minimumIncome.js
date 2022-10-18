const {
  initContext,
  setScreenTrackingContext,
  UNDERWRITING_RULES,
} = require("./helpers");
const { failureResponse } = require("./returnContext");
const Screentracking = require("../../models/Screentracking");
const communicationService = require("../../services/CommunicationService");

/**
 * @param {Object} screenTracking
 * @return {object} response
 **/

const RULE = UNDERWRITING_RULES.$7_MINIMUM_INCOME;
const MINIMUM_AMOUNT = 20000;

async function MinimumIncome({ screenTracking, user: userData }) {
  try {
    const { context, FAILED, PASSED, RETRY } = initContext(RULE);
    const { annualIncome } = screenTracking;
    const { status: previousStatus, ruleName: previousRuleName } =
      screenTracking?.underwritingDecision || {};

    const isFirstTry = !(
      previousStatus === RETRY && previousRuleName === RULE.title
    );
    const isOrganicApplication =
      screenTracking.origin === Screentracking.origins.WEBSITE;

    if (annualIncome < MINIMUM_AMOUNT) {
      if (isFirstTry || screenTracking.hasPriorCommunication) {
        communicationService.sendApplicationCommunication({
          communicationCode: "MI",
          user: userData,
          screenTracking,
        });
      }
      Object.assign(context.underwritingDecision, {
        status: isFirstTry && isOrganicApplication ? RETRY : FAILED,
        reason: "Yearly income does not meet the required amount",
        actualValue: annualIncome,
        expectedValue: MINIMUM_AMOUNT,
      });
    } else if (!isFirstTry) {
      Object.assign(context.underwritingDecision, {
        status: PASSED,
        needsReview: true,
        reason: "Applicant re-entered a greater annual income",
      });
    }

    return setScreenTrackingContext(screenTracking, context);
  } catch (error) {
    error = error.stack || error.message || error;
    sails.log.error(`SeventhStep#${RULE.title}::Err ::`, error);
    return failureResponse(
      RULE.title,
      "Error while calculating the Minimum income"
    );
  }
}

module.exports = MinimumIncome;
