/**
 * @return {string}
 **/

const ScreentrackingModel = require("../../models/Screentracking");
const {
  UNDERWRITING_RULES,
  setScreenTrackingContext,
  initContext,
} = require("./helpers");
const { failureResponse, systemError } = require("./returnContext");

const RULE_NAME = UNDERWRITING_RULES.$13_MAXIMUM_LOAN_AMOUNT.title;

// MAX_PAYMENT/((((APR%/52)*(((APR%/52)+1)^26))/((((APR%/52)+1)^26)-1)))
async function CalculateMaximumLoanAmount({ screenTracking: screentracking }) {
  try {
    const APR = _.get(screentracking, "offerData[0].apr");
    const maxPayment = _.get(screentracking, "offerData[0].maxPayment");

    if (!APR || !maxPayment) {
      throw new Error("Insufficient data");
    }

    const { context } = initContext(UNDERWRITING_RULES.$13_MAXIMUM_LOAN_AMOUNT);

    const weeklyInterestRate = APR / 100 / 52;
    const numberOfPayments = 26;
    const firstExpression = Math.pow(1 + weeklyInterestRate, numberOfPayments);

    let calculation =
      maxPayment /
      ((weeklyInterestRate * firstExpression) / (firstExpression - 1));

    const DEFAULT_MAX_PAYMENT_AMOUNT = 2500;
    const APR_599_MAX_PAYMENT_AMOUNT = 1500;
    const APR_699_MAX_PAYMENT_AMOUNT = 1200;

    const getMaxLoanPerAPR = (apr) => {
      if (!apr) return 0;
      if (apr === 599) return APR_599_MAX_PAYMENT_AMOUNT;
      if (apr === 699) return APR_699_MAX_PAYMENT_AMOUNT;
      return DEFAULT_MAX_PAYMENT_AMOUNT;
    };

    const maxLoanAmountForApr = getMaxLoanPerAPR(APR);

    calculation =
      calculation > maxLoanAmountForApr ? maxLoanAmountForApr : calculation;

    if (calculation % 10 !== 0) {
      calculation = Math.floor(calculation / 10) * 10;
    }
    await ScreentrackingModel.updateOfferData(
      screentracking,
      "maxLoanAmount",
      calculation
    );

    return setScreenTrackingContext(screentracking, context);
  } catch (error) {
    sails.log.error("ThirteenthStep#CalculateMaximumLoanAmount::Err ::", error);
    return systemError(RULE_NAME, "Error in finding the Minimum cutoff score");
  }
}

module.exports = CalculateMaximumLoanAmount;
