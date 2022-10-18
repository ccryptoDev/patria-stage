/* global module, sails */

const Screentracking = require("../../models/Screentracking");
const {
  UNDERWRITING_RULES,
  initContext,
  setScreenTrackingContext,
} = require("./helpers");
const { successResponse, failureResponse } = require("./returnContext");
const PaymentManagementModel = require('../../models/PaymentManagement');

/**
 * @return {object}
 **/

const RULE_NAME = UNDERWRITING_RULES.$11_ASSIGN_APR.title;
// for Ex Val or Blank use null values
async function AssignAPR({ screenTracking }) {
  try {
    const { context, FAILED } = initContext(UNDERWRITING_RULES.$11_ASSIGN_APR);

    const offerData = screenTracking.offerData;
    const { clarityScore, factorTrustScore } = offerData[0];
    // const { clarityScore, factorTrustScore } = dualScorePayload;

    const DUAL_SCORE_CLARITY = sails.config.DUAL_SCORE_CLARITY;
    const DUAL_SCORE_FT = sails.config.DUAL_SCORE_FT;
    const DUAL_SCORE_VALUES = sails.config.DUAL_SCORE_VALUES;

    // getting clarity score row index
    const clarityIndex = Number(
      DUAL_SCORE_CLARITY.findIndex((item, index) => {
        if (!clarityScore) return "0";
        if (
          item.minValue === clarityScore ||
          (clarityScore >= item.minValue && clarityScore <= item.maxValue)
        ) {
          return String(index);
        }
        if (item.operator === ">" && clarityScore > item.minValue) {
          return index;
        }
      })
    );

    // getting factor trust score row index
    const factorIndex = Number(
      DUAL_SCORE_FT.findIndex((item, index) => {
        switch (item.operator) {
          case "null":
            if (factorTrustScore === "0") return String(index);
            break;
          case "-":
            if (
              factorTrustScore >= item.minValue &&
              factorTrustScore <= item.maxValue
            )
              return index;
            break;
          case "<":
            if (factorTrustScore < item.minValue) return index;
            break;
          default:
            return null;
        }
      })
    );

    // on behalf of above indexes finding the intermingle APR score
    let score = null;
    if (clarityIndex !== -1 && factorIndex !== -1) {
      score = DUAL_SCORE_VALUES[clarityIndex][factorIndex];
    }

    // if APR not found
    if (!score) {
      Object.assign(context.underwritingDecision, {
        status: FAILED,
        reason: "Not eligible to have APR",
        value: score,
      });
    }

    // if APR found
    await Screentracking.updateOfferData(screenTracking, "apr", score);
    const query = { screenTracking: screenTracking.id };
    const pmContext = { apr: Number(score) };
    PaymentManagementModel.updatePaymentManagement(query, pmContext);
    return setScreenTrackingContext(screenTracking, context);
  } catch (error) {
    error = error.stack || error.message || error;
    sails.log.error("11.AssignAPR::Err ::", error);
    return failureResponse(RULE_NAME, "Error in APR");
  }
}

module.exports = AssignAPR;
