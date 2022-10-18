const { PASSED, FAILED, BY_PASS, RETRY, QUEUED, PENDING } = sails.config.RULE_STATUS;

function successResponse(ruleName, msg = null, value, expectedValue = null) {
  return { ruleName, status: PASSED, reason: msg, actualValue: value, expectedValue }
}

function failureResponse(ruleName, msg, value, expectedValue) {
  return { ruleName, status: FAILED, reason: msg, actualValue: value, expectedValue }
}

function systemError(ruleName, msg, value, expectedValue) {
  return { ruleName, status: RETRY, reason: msg, actualValue: value, expectedValue }
}

function queuedResponse(ruleName, msg, value, expectedValue) {
  return { ruleName, status: QUEUED, reason: msg, actualValue: value, expectedValue }
}

function byPassResponse(ruleName, msg, value, expectedValue) {
  return { ruleName, status: BY_PASS, reason: msg, actualValue: value, expectedValue, ruleName }
}

function pendingResponse(ruleName, msg, value, expectedValue) {
  return { ruleName, status: PENDING, reason: msg, actualValue: value, expectedValue }
}

module.exports = { successResponse, failureResponse, byPassResponse, systemError, queuedResponse, pendingResponse }