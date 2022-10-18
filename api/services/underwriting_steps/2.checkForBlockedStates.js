const { failureResponse } = require("./returnContext");
const { UNDERWRITING_RULES, initContext, getResponse } = require("./helpers");
const communicationService = require("../../services/CommunicationService");

/**
 *
 * @param user
 * @returns True if user status is in blocked list
 */

const RULE = UNDERWRITING_RULES.$2_BLOCKED_STATES;

async function checkForBlockedStates({ user: userData, isLead = false }) {
  try {
    const { context, FAILED } = initContext(RULE);

    const blockedStates = sails.config.blockedStates;

    if (blockedStates && blockedStates.includes(userData.state)) {
      Object.assign(context.underwritingDecision, {
        status: FAILED,
        reason: `State ${userData.state} is in blocklist`,
      });

      if (!isLead) {
        communicationService.sendApplicationCommunication({
          communicationCode: "BSA",
          user: userData,
        });
      }
    }
    return getResponse(context);
  } catch (error) {
    sails.log.error("SecondStep#checkForBlockedStates::Err ::", error);
    return failureResponse(RULE.title, "State not found");
  }
}

module.exports = checkForBlockedStates;
