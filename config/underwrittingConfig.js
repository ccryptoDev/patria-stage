const RULE_STATUS = {
  FAILED: 'failed',
  PASSED: 'passed',
  BY_PASS: 'bypass',
  RETRY: 'retry',
  QUEUED: 'queued',
  PENDING: 'pending',
}

const RULES_STEPS = {
  duplicated: {},
  blockedState: {},
  minIncome: {},
  openLoan: {},
  DNL_list: {}
}

module.exports = {
  RULE_STATUS,
  RULES_STEPS
};

