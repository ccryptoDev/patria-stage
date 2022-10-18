const moment = require("moment");
const ScreentrackingModel = require("../../models/Screentracking");
const User = require("../../models/User");
const { UNDERWRITING_RULES } = require("./helpers");
const {
  successResponse,
  failureResponse,
  systemError,
} = require("./returnContext");

/**
 *
 * @param
 * @returns
 */

const RULE_NAME = UNDERWRITING_RULES.$14_LOAN_AMOUNT_ASSIGNMENT.title;

async function loanAmountAssignment({ screenTracking }) {
  try {
    const { requestedLoanAmount, id: applicationId } = screenTracking;
    const maxLoanAmount = _.get(screenTracking, "offerData[0].maxLoanAmount");

    const loanAmount =
      requestedLoanAmount > maxLoanAmount ? maxLoanAmount : requestedLoanAmount;
    await ScreentrackingModel.updateOfferData(
      screenTracking,
      "assignedLoan",
      loanAmount
    );

    return successResponse(RULE_NAME, "Loan Amount", loanAmount);
  } catch (error) {
    sails.log.error("DesigionSteps#loanAmountAssignment::Err ::", error);
    return systemError(RULE_NAME, "Unable to calculate requested loadn amount");
  }
}

module.exports = loanAmountAssignment;
