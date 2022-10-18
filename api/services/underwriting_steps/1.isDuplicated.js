const moment = require("moment");
const Screentracking = require("../../models/Screentracking");
const User = require("../../models/User");
const {
  UNDERWRITING_RULES,
  setScreenTrackingContext,
  initContext,
  getResponse,
} = require("./helpers");
const { failureResponse } = require("./returnContext");
const communicationService = require("../../services/CommunicationService");

/**
 * @param {User} userData
 * @return {object} response
 **/

const RULE = UNDERWRITING_RULES.$1_DUPLICATE_APPLICATION;

async function isDuplicated({ user: userData, isLead = false }) {
  try {
    const { context, FAILED, RETRY } = initContext(RULE);

    const {
      isExistent: existApp,
      data: screenTracking,
    } = await Screentracking.isUserApplicationExist(userData);

    const isRetry = screenTracking?.underwritingDecision?.status === RETRY;

    if (existApp && !isRetry) {
      const { duplicateApplicationEmailSent } = screenTracking;

      Object.assign(context.underwritingDecision, {
        status: FAILED,
        reason: "Rule#1 Duplicate Application Found",
      });

      if (!isLead && !duplicateApplicationEmailSent) {
        communicationService.sendApplicationCommunication({
          communicationCode: "DA",
          user: userData,
        });

        await Object.assign(screenTracking, {
          duplicateApplicationEmailSent: true,
        }).save();
      }
    }

    return getResponse(context);
  } catch (error) {
    sails.log.error("FirstStep#isDuplicated::Err ::", error);
    return failureResponse(RULE.title, error.message);
  }
}

module.exports = isDuplicated;
