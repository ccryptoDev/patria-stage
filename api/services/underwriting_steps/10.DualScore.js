/* global module, sails */

const Screentracking = require("../../models/Screentracking");
const ClarityService = require("../ClarityService");
const { ErrorHandler } = require("../ErrorHandling");
const factorTrustLendProtectService = require("../FactorTrustLendProtectService");
const {
  UNDERWRITING_RULES,
  initContext,
  setScreenTrackingContext,
  getCommunicationCode,
} = require("./helpers");
const { failureResponse } = require("./returnContext");
const communicationService = require("../../services/CommunicationService");

// true = passed , false = not-passed

const RULE_NAME = UNDERWRITING_RULES.$10_DUAL_SCORE.title;

/**
 * @param {Screentracking} screenTracking
 * @return {object}
 **/
async function DualScore({ screenTracking, user }) {
  try {
    const { context, FAILED } = initContext(UNDERWRITING_RULES.$10_DUAL_SCORE);

    if (!_.get(screenTracking, "offerData").length) {
      screenTracking.offerData = [{}];
    }

    let { clarityScore, factorTrustScore } = screenTracking.offerData[0];
    // let { clarityScore, factorTrustScore } = dualScorePayload;
    if (!factorTrustScore) {
      factorTrustScore = await factorTrustLendProtectService.getRiskScore(
        screenTracking
      );
      Object.assign(screenTracking.offerData[0], { factorTrustScore });
      await screenTracking.save();
    }

    if (!clarityScore) {
      clarityScore = await ClarityService.getClarityScore(user.id);
      Object.assign(screenTracking.offerData[0], { clarityScore });
      await screenTracking.save();
    }

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
            if (factorTrustScore === '0') return String(index);
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
        reason: "Didn't meet the Minimum cutoff score",
        value: score,
      });

      const isOrganicApplication =
        screenTracking.origin === Screentracking.origins.WEBSITE;

      const communicationCode = getCommunicationCode(screenTracking.origin, {
        [Screentracking.origins.LEADS_PROVIDER]: "DSL",
        [Screentracking.origins.WEBSITE]: "DSO",
      });

      communicationService.sendApplicationCommunication({
        communicationCode,
        user,
        screenTracking,
        data: {
          factorTrustRiskScore: factorTrustScore,
          clarityRiskScore: clarityScore,
        },
      });
    }

    // if APR found
    await Screentracking.updateOfferData(screenTracking, "dualScore", !!score);
    return setScreenTrackingContext(screenTracking, context);
  } catch (error) {
    sails.log.error("TenthStep#DualScore::Err ::", error);
    return failureResponse(
      RULE_NAME,
      "Error in finding the Minimum cutoff score"
    );
  }
}

module.exports = DualScore;
