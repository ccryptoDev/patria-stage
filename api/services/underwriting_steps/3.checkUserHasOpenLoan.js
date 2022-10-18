const moment = require("moment");
const {
  UNDERWRITING_RULES,
  setScreenTrackingContext,
  initContext,
} = require("./helpers");
const { systemError } = require("./returnContext");
const Screentracking = require("../../models/Screentracking");
const communicationService = require("../../services/CommunicationService");

/**
 *
 * @param user
 * @returns True if active load found for client
 */

const RULE = UNDERWRITING_RULES.$3_CURRENT_CUSTOMER_SCREEN;

async function checkUserHasOpenLoan({
  screenTracking: screentracking,
  user: userInfo,
}) {
  //TODO how to check if active payment
  try {
    const { context, FAILED, QUEUED } = initContext(RULE);

    const {
      isExistent: existApp,
    } = await Screentracking.isUserApplicationExist(userInfo, true);

    if (existApp) {
      const processLeadCurrentCustomer = () => {
        Object.assign(context.underwritingDecision, {
          status: FAILED,
          reason: "Lead current customer",
        });

        communicationService.sendApplicationCommunication({
          communicationCode: "DA",
          user: userInfo,
          screenTracking: screentracking,
        });
      };

      const processOrganicCurrentCustomer = () => {
        const isEligibleForNewLoan = isCurrentCustomerEligibleForLoan(userInfo);

        if (isEligibleForNewLoan) {
          Object.assign(context.underwritingDecision, {
            status: QUEUED,
            reason: "Current customer eligible for a new loan needs review",
          });

          communicationService.sendApplicationCommunication({
            communicationCode: "CCB",
            user: userInfo,
            screenTracking: screentracking,
          });
        } else {
          Object.assign(context.underwritingDecision, {
            status: FAILED,
            reason: "Current customer not eligible for a new loan",
          });

          communicationService.sendApplicationCommunication({
            communicationCode: "CCA",
            user: userInfo,
            screenTracking: screentracking,
          });
        }
      };

      const processCurrentCustomer = (applicationOrigin) => {
        const config = {
          [Screentracking.origins.LEADS_PROVIDER]: processLeadCurrentCustomer,
          [Screentracking.origins.WEBSITE]: processOrganicCurrentCustomer,
        };

        return config[applicationOrigin]();
      };

      await processCurrentCustomer(screentracking.origin);
    }
    return setScreenTrackingContext(screentracking, context);
  } catch (error) {
    sails.log.error("Rule3#checkUserHasOpenLoan::Err ::", error);
    systemError(RULE, "Internal Server Error");
  }
}

function isCurrentCustomerEligibleForLoan(userInfo) {
  // implement validation
  return false;
}

module.exports = checkUserHasOpenLoan;
