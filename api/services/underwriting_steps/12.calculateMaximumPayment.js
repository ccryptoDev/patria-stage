const _ = require("lodash");
const Screentracking = require("../../models/Screentracking");
const {
  UNDERWRITING_RULES,
  setScreenTrackingContext,
  initContext,
} = require("./helpers");
const { failureResponse } = require("./returnContext");

const RULE_NAME = UNDERWRITING_RULES.$12_MINIMUM_PAYMENT.title;

async function CalculateMaximumPayment({ screenTracking }) {
  try {
    const APR = _.get(screenTracking, "offerData[0].apr");

    if (!APR) {
      throw new Error("APR is not set");
    }

    const { context } = initContext(UNDERWRITING_RULES.$12_MINIMUM_PAYMENT);

    const income = screenTracking?.annualIncome;
    let maxPayment = 0;

    if (APR === 399 && income > 60000) maxPayment = (income / 52) * 0.3;
    if (APR === 399 && income <= 60000) maxPayment = (income / 52) * 0.25;
    if (APR === 499) maxPayment = (income / 52) * 0.2;
    if (APR === 599 || APR === 699) maxPayment = (income / 52) * 0.15;

    maxPayment = parseFloat(maxPayment.toFixed(2));
    console.log("max payment", maxPayment);
    await Screentracking.updateOfferData(
      screenTracking,
      "maxPayment",
      maxPayment
    );

    Object.assign(context.underwritingDecision, { value: maxPayment });

    return setScreenTrackingContext(screenTracking, context);
  } catch (error) {
    sails.log.error("TwelfthStep#MaximumPayment:Err::", error);
    return failureResponse(
      RULE_NAME,
      "Error while calculating the maximum payment"
    );
  }
}

module.exports = CalculateMaximumPayment;
