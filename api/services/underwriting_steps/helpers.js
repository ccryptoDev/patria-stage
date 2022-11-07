// const UnderwritingConfig = require(".");
const PaymentManagementModel = require("../../models/PaymentManagement");
const LogActivityService = require("../LogActivityService");
const {
  successResponse,
  failureResponse,
  systemError,
  queuedResponse,
  pendingResponse,
} = require("./returnContext");

const { PASSED, FAILED, RETRY, QUEUED, PENDING } = sails.config.RULE_STATUS;

const UNDERWRITING_RULES = {
  $1_DUPLICATE_APPLICATION: {
    title: "Duplicate Application",
    ruleId: "s1_app_1",
    ruleNumber: 1,
    executionGroup: 1,
    ruleFileName: "1.isDuplicated",
  },
  $2_BLOCKED_STATES: {
    title: "Blocked States",
    ruleId: "s1_app_2",
    ruleNumber: 2,
    executionGroup: 1,
    ruleFileName: "2.checkForBlockedStates",
  },
  $3_CURRENT_CUSTOMER_SCREEN: {
    title: "Current Customer Screen",
    ruleId: "s1_app_3",
    ruleNumber: 3,
    executionGroup: 2,
    ruleFileName: "3.checkUserHasOpenLoan",
  },
  $4_CHECK_DNL_LIST: {
    title: "Check DNL List",
    ruleId: "s1_app_4",
    ruleNumber: 4,
    executionGroup: 2,
    ruleFileName: "4.checkInDnlList",
  },
  $5_CLARITY_CLEAR_INQUIRE: {
    title: "Clarity Clear Inquiry",
    ruleId: "s2_bu_1",
    ruleNumber: 5,
    executionGroup: 2,
    ruleFileName: "5.clarityClearInquiry",
  },
  $6_TRANSUNION_FRAUD_VALIDATION: {
    title: "TransUnion TrueValidate Fraud Risk",
    ruleId: "s3_bu_1",
    ruleNumber: 6,
    executionGroup: 2,
    ruleFileName: "6.TrueValidateFraudRisk",
  },
  $7_MINIMUM_INCOME: {
    title: "Minimum Income",
    ruleId: "s1_app_5",
    ruleNumber: 7,
    executionGroup: 3,
    ruleFileName: "7.minimumIncome",
  },
  $8_CLARITY_CLEAR_CREDIT: {
    title: "Clarity Clear Credit",
    ruleId: "s2_bu_2",
    ruleNumber: 8,
    executionGroup: 3,
    ruleFileName: "8.clarityClearCredit",
  },
  $9_FACTOR_TRUST_CALL: {
    title: "Factor Trust Delinquency Risk Check",
    ruleId: "s3_bu_2",
    ruleNumber: 9,
    executionGroup: 3,
    ruleFileName: "9.factorTrustDelinquencyRiskCheck",
  },
  $10_DUAL_SCORE: {
    title: "Dual Score",
    ruleId: "s1_app_6",
    ruleNumber: 10,
    executionGroup: 3,
    ruleFileName: "10.DualScore",
  },
  $11_ASSIGN_APR: {
    title: "Calculate APR",
    ruleId: "s1_app_7",
    ruleNumber: 11,
    executionGroup: 3,
    ruleFileName: "11.AssignAPR",
  },
  $12_MINIMUM_PAYMENT: {
    title: "Calculate Maximum Payment",
    ruleId: "s1_app_8",
    ruleNumber: 12,
    executionGroup: 3,
    ruleFileName: "12.calculateMaximumPayment",
  },
  $13_MAXIMUM_LOAN_AMOUNT: {
    title: "Calculate Maximum Loan Amount",
    ruleId: "s1_app_9",
    ruleNumber: 13,
    executionGroup: 3,
    ruleFileName: "13.calculateMaximumLoanAmount",
  },
  $14_LOAN_AMOUNT_ASSIGNMENT: {
    title: "Loan Amount Assignment",
    ruleId: "s1_app_10",
    ruleNumber: 14,
    executionGroup: 3,
    ruleFileName: "14.loanAmountAssignment",
  },
  $15_LOAN_TERM_OPTION: {
    title: "Loan Term Options",
    ruleId: "s1_app_11",
    ruleNumber: 15,
    executionGroup: 3,
    ruleFileName: "15.loanTermOptions",
  },
  $17_REQUEST_BANK_DETAILS: {
    title: "Request Bank Details",
    ruleId: "s3_bu_3",
    ruleNumber: 17,
    executionGroup: 4,
    ruleFileName: "17.requestBankDetails",
  },
  $18_CLARITY_CLEAR_INQUIRY: {
    title: "Clarity Clear Fraud Insight",
    ruleId: "s2_bu_3",
    ruleNumber: 18,
    executionGroup: 4,
    ruleFileName: "18.clarityClearInquiry",
  },
  $19_CLARITY_CLEAR_FRAUD: {
    title: "Clarity Clear Fraud",
    ruleId: "s2_bu_4",
    ruleNumber: 19,
    executionGroup: 4,
    ruleFileName: "19.clarityClearFraud",
  },
  $20_CLEAR_BANK_CALL: {
    title: "Clear Bank Call",
    ruleId: "s2_bu_5",
    ruleNumber: 20,
    executionGroup: 4,
    ruleFileName: "20.clearBankCall",
  },
};

function getResponse(context) {
  const {
    status,
    ruleName,
    reason,
    value,
    expectedValue,
  } = context.underwritingDecision;

  const selector = {
    [PASSED]: successResponse,
    [FAILED]: failureResponse,
    [RETRY]: systemError,
    [QUEUED]: queuedResponse,
    [PENDING]: pendingResponse,
  };

  return selector[status](ruleName, reason, value, expectedValue);
}

function initContext(ruleObject = {}) {
  const { title: ruleName, ruleId, ruleNumber, executionGroup } = ruleObject;
  // const ruleId = ruleObject?.ruleId;

  if (ruleName) {
    const context = {
      underwritingDecision: {
        status: PASSED,
        ruleName,
        reason: null,
        ruleId,
        ruleNumber,
        executionGroup,
      },
    };
    return { context, ...sails.config.RULE_STATUS };
  }

  throw new Error("'ruleName' is required");
}

async function setScreenTrackingContext(screenTracking, context = {}) {
  // const payload = {
  //   underwritingDecision: context.underwritingDecision,
  //   underwritingStepsHistory: [
  //     ...screenTracking?.underwritingStepsHistory,
  //     context.underwritingDecision,
  //   ],
  // };
  // LogActivityService.createUnderwritingLog(context.underwritingDecision, screenTracking);
  await createRuleHistory(screenTracking, context);
  PaymentManagementModel.handleUnderwritingStatus(screenTracking, context);
  await Object.assign(screenTracking, {
    underwritingDecision: context.underwritingDecision,
  }).save();


  return getResponse(context);
}

async function createRuleHistory(screenTracking, context) {
  const ruleData = screenTracking?.rulesDetails?.ruleData || {};
  const {
    ruleId,
    reason,
    ruleName,
    status,
    actualValue,
    expectedValue,
    ruleNumber,
    executionGroup,
  } = context.underwritingDecision;
  ruleData[ruleId] = {
    description: reason,
    ruleName,
    ruleId,
    ruleNumber,
    executionGroup,
    message: `${ruleId} ${reason || ""}`,
    userValue: actualValue,
    status,
    passed: status === PASSED ? true : false,
    expectedValue: expectedValue,
  };
  const rulesDetails = { rulesDetails: { ...screenTracking?.rulesDetails } };
  rulesDetails["rulesDetails"]["ruleData"] = ruleData;
  await Object.assign(screenTracking, rulesDetails).save();
}

async function processRules(rulesPromises = [], handler = handleRuleResponse) {
  while (rulesPromises.length > 0) {
    const rule = rulesPromises.shift();
    await rule().then(handler);
  }
}

function getRulesByRulesNumber(underwritingData = {}, ruleNumbers = []) {
  const rulesNumbersSet = new Set(ruleNumbers);
  const filteredRules = Object.values(UNDERWRITING_RULES)
    .filter((config) => rulesNumbersSet.has(config.ruleNumber))
    .map((config) => {
      const rule = require(`./${config.ruleFileName}`);
      return () => rule(underwritingData);
    });

  return filteredRules;
}

function getPendingRulesByGroupNumber(
  underwritingData = {},
  rulesDetails = {}
) {

  const { executionGroup: lastRuleGroup, ruleNumber: lastRuleNumber } =
    Object.values(rulesDetails?.ruleData || {}).pop() || {};

  const filteredRules = Object.values(UNDERWRITING_RULES)
    .filter(
      ({ executionGroup, ruleNumber }) =>
        executionGroup === lastRuleGroup && ruleNumber >= lastRuleNumber
    )
    .map((config) => {
      const rule = require(`./${config.ruleFileName}`);
      return () => rule(underwritingData);
    });

  return filteredRules;
}

function handleRuleResponse(underWritingStepResponse = {}) {
  if (underWritingStepResponse.status !== PASSED) {
    throw {
      message: underWritingStepResponse.reason,
      status: underWritingStepResponse.status,
      statusCode: 400,
    };
  }
}

function getCommunicationCode(value = "", config = {}) {
  return config[value];
}

module.exports = {
  UNDERWRITING_RULES,
  getResponse,
  initContext,
  setScreenTrackingContext,
  processRules,
  getPendingRulesByGroupNumber,
  getRulesByRulesNumber,
  handleRuleResponse,
  getCommunicationCode,
};
