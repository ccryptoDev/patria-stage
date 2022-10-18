const ScreenTrackingHistory = require("../../models/ScreenTrackingHistory");
const AssignAPR = require("./11.AssignAPR");
const loanTermOptions = require("./15.loanTermOptions");
const isDuplicated = require("./1.isDuplicated");
const loanAmountAssignment = require("./14.loanAmountAssignment");
const checkInDnlList = require("./4.checkInDnlList");
const checkForBlockedStates = require("./2.checkForBlockedStates");
const MinimumIncome = require("./7.minimumIncome");
const DualScore = require("./10.DualScore");
const checkUserHasOpenLoan = require("./3.checkUserHasOpenLoan");
const CalculateMaximumLoanAmount = require("./13.calculateMaximumLoanAmount");
const CalculateMaximumPayment = require("./12.calculateMaximumPayment");

const result = {
  status: null,  // passed or failed
  reason: null   // reason of respective status
}
const offerContext = { ...sails.config.RULES_STEPS }

async function waterfallDecision(screenTracking, sendDecision) {
  const { FAILED } = sails.config.RULE_STATUS;
  const { id: appId, user } = screenTracking;

  async.waterfall([
    // **************** step 1 **************************
    // async function (next) {
    //   offerContext.duplicated = await isDuplicated(screenTracking);
    //   if (offerContext.duplicated.status === FAILED) return next(offerContext);
    //   next();
    // },

    // **************** step 2 **************************
    // async function (next) {
    //   offerContext.blockedState = await checkForBlockedStates(screenTracking);
    //   if (offerContext.blockedState.status === FAILED) return next(offerContext);
    //   next();
    // },

    // **************** step 3 ERROR **************************
    // async function (next) {
    //   offerContext.openLoan = await checkUserHasOpenLoan(screenTracking);
    //   if (offerContext?.openLoan?.status === FAILED) return next(offerContext);
    //   next();
    // }

    // **************** step 4 **************************
    // async function (next) {
    //   offerContext.DNL_list = await checkInDnlList(screenTracking);
    //   if (offerContext?.DNL_list?.status === FAILED) return next(offerContext);
    //   next();
    // }

    // **************** step 7 **************************
    // async function (next) {
    //   offerContext.minIncome = await MinimumIncome(screenTracking);
    //   console.log("====", offerContext.minIncome )
    //   if (offerContext?.minIncome?.status === FAILED) return next(offerContext);
    //   next();
    // },

    // **************** step 10 **************************
    // async function (next) {
    //   offerContext.dualScore = await DualScore(appId);
    //   if (offerContext?.dualScore?.status === FAILED) return next(offerContext);
    //   next();
    // },

    // **************** step 11 **************************
    // async function (next) {
    //   offerContext.apr = await AssignAPR(appId);
    //   if (offerContext?.apr?.status === FAILED) return next(offerContext);
    //   next();
    // },

    // **************** step 12 **************************
    // async function (next) {
    //   offerContext.maxPayment = await CalculateMaximumPayment(appId);
    //   if (offerContext?.maxPayment?.status === FAILED) return next(offerContext);
    //   next();
    // },

    // **************** step 13 **************************
    // async function (next) {
    //   offerContext.maxLoanAmount = await CalculateMaximumLoanAmount(appId, offerContext?.apr?.actualValue);
    //   if (offerContext?.maxLoanAmount?.status === FAILED) return next(offerContext);
    //   next();
    // },

    // **************** step 14 **************************
    async function (next) {
      offerContext.loanAssign = await loanAmountAssignment(screenTracking, offerContext?.maxLoanAmount?.actualValue);
      if (offerContext?.loanAssign?.status === FAILED) return next(offerContext);
      next();
    },

    // **************** step 15 **************************
    async function (next) {
      offerContext.terms = await loanTermOptions(appId, offerContext?.loanAssign?.actualValue);
      if (offerContext?.terms?.status === FAILED) return next(offerContext);
      next();
    }

  ], (err) => {
    if (err) {
      ScreenTrackingHistory.createApplicationHistory(appId, user.id, err);
      return sendDecision(err)
    };
    sendDecision(offerContext);
  });
}

module.exports = waterfallDecision;