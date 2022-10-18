/**
 * ScreenTrackingHistory.js
*/

const RULE_STATUS = {
  FAILED: 'failed',
  PASSED: 'passed'
}
const attributes = {
  applicationId: {
    model: 'Screentracking'
  },
  userId: {
    model: 'User'
  },
  history: {
    type: 'array',
    defaultsTo: []
  }
};

const DataAccessLayer = {
  createApplicationHistory: async function (appId, userId, stepContext) {
    try {
      const values = Object.values(stepContext);
      const failedContext = values.filter((item) => item.status === RULE_STATUS.FAILED);
      const { ruleName, status, reason, actualValue, expectedValue } = failedContext[0];
      
      const historyContext = {
        createdAt: new Date(),
        ruleName: ruleName,
        status: status === "failed" ? RULE_STATUS.FAILED : RULE_STATUS.PASSED,
        reason: reason,
        actualValue,
        expectedValue,
      };

      const screenHistory = await ScreenTrackingHistory.findOne(
        { applicationId: appId, userId: userId },
      );

      if (screenHistory) {
        screenHistory.history.push(historyContext);
        screenHistory.save();
      } else {
        await ScreenTrackingHistory.create(
          { applicationId: appId, userId: userId, history: [historyContext] }
        );
      }
    } catch (error) {
      sails.log(`ERR::ScreenTrackingHistory.js: ${error}`);
    }
  }
}



module.exports = {
  attributes: attributes,
  RULE_STATUS,
  ...DataAccessLayer
}