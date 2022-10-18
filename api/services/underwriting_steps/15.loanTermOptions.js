const ScreentrackingModel = require("../../models/Screentracking");
const { UNDERWRITING_RULES, getCommunicationCode } = require("./helpers");
const communicationService = require("../../services/CommunicationService");
const {
  successResponse,
  failureResponse,
  systemError,
} = require("./returnContext");

/**
 *
 * @param user
 * @returns True if user in block list
 */

const RULE = UNDERWRITING_RULES.$15_LOAN_TERM_OPTION;

async function loanTermOptions({ screenTracking: screentracking, user }) {
  //TODO get max loan amount from db
  try {
    const assignedLoan = _.get(screentracking, "offerData[0].assignedLoan");
    let terms = [];
    if (assignedLoan <= 700) {
      terms = [6, 9, 12];
    } else if (assignedLoan > 700 && assignedLoan <= 1200) {
      terms = [9, 12];
    } else if (assignedLoan > 1200) {
      terms = [12];
    }

    await ScreentrackingModel.updateOfferData(screentracking, "terms", terms);

    const applicationUrl = sails.config.getMagicLoginLink(screentracking, user);

    const communicationCode = getCommunicationCode(screentracking.origin, {
      [ScreentrackingModel.origins.WEBSITE]: "COA",
      [ScreentrackingModel.origins.LEADS_PROVIDER]: "COAL",
    });

    communicationService.sendApplicationCommunication({
      communicationCode,
      user,
      screenTracking: screentracking,
      data: {
        completeApplicationLink: applicationUrl,
        smsLink: applicationUrl,
      },
    });

    return successResponse(RULE.title, "terms data", terms);
  } catch (error) {
    sails.log.error("Fiftheen#loanTermOptions::Err ::", error);
    return systemError(RULE.title, "Unable to calculate loanTermOptions");
  }
}

module.exports = loanTermOptions;
