const LogactivityModel = require("../models/Logactivity");

const LogActivityService = {
  createUnderwritingLog: async function (underwritingDecision, screenTracking) {
    try {
      const { status, ruleName, reason, value, expectedValue } = underwritingDecision;
      const { applicationReference, user, id, paymentManagement } = screenTracking;

      const logCount = await LogactivityModel.countLogs({});

      const logContext = {
        userId: user,
        moduleName: ruleName,
        message: `${reason || ''}`,
        loanReference: applicationReference,
        logReference: `LOG_${logCount}`,
        screenTrackingId: id,
        paymentManagementId: paymentManagement,
        status: status,
        actualValue: value || 'N/A',
        expectedValue: expectedValue || 'N/A'
      }
      await LogactivityModel.createLogActivity(logContext);
    } catch (error) {
      sails.log.error("ERROR::createUnderwritingLog: Error while creating the Log Activity", error);
    }
  },

  createApplicationLog: async function (screenTracking, logMessage) {
    try {
      const { applicationReference, user, id, paymentManagement } = screenTracking;

      const logCount = await LogactivityModel.countLogs({});

      const logContext = {
        userId: user,
        moduleName: ruleName,
        message: `${logMessage}`,
        loanReference: applicationReference,
        logReference: `LOG_${logCount}`,
        screenTrackingId: id,
        paymentManagementId: paymentManagement,
        jsonData: status
      }

    } catch (error) {
      sails.log.error("ERROR::createApplicationLog: ", error);
    }
  }
}

module.exports = LogActivityService;