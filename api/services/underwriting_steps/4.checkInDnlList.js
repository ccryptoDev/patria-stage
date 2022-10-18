const Blocklist = require("../../models/Blocklist");
const { failureResponse } = require("./returnContext");
const {
  UNDERWRITING_RULES,
  setScreenTrackingContext,
  initContext,
} = require("./helpers");
const communicationService = require("../../services/CommunicationService");

/**
 *
 * @param user
 * @returns True if user in block list
 */

const RULE = UNDERWRITING_RULES.$4_CHECK_DNL_LIST;

async function checkInDnlList({ screenTracking, user }) {
  try {
    const isTestingSsn = sails.config.getTestData(RULE.ruleId, user.ssnNumber);

    const { context, FAILED } = initContext(RULE);
    const query = {
      ssn: user.ssn_number,
      firstname: user.firstName,
      lastname: user.lastName,
    };
    const blockList = await Blocklist.isBorrowerBlocked(query);

    if (isTestingSsn || blockList) {
      Object.assign(context.underwritingDecision, {
        status: FAILED,
        reason: "User is in DNL list",
      });

      communicationService.sendApplicationCommunication({
        communicationCode: "FB",
        user,
        screenTracking,
      });
    }

    return setScreenTrackingContext(screenTracking, context);
  } catch (error) {
    sails.log.error("Rule4#checkInDnlList::Err ::", error);
    return failureResponse(RULE.title, "Unable to check for blocklist");
  }
}

module.exports = checkInDnlList;
