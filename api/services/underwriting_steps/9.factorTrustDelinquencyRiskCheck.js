const Transunions = require("../../models/Transunions");
const {
  setScreenTrackingContext,
  initContext,
  UNDERWRITING_RULES,
  getCommunicationCode,
} = require("./helpers");
const { failureResponse } = require("./returnContext");
const communicationService = require("../../services/CommunicationService");
const Screentracking = require("../../models/Screentracking");

const RULE = UNDERWRITING_RULES.$9_FACTOR_TRUST_CALL;
/**
 *
 * @param screenTracking
 * @returns true if user has no bankruptcy in the last 24 months, and have no active due
 */
async function factorTrustDelinquencyRiskCheck({ screenTracking, user }) {
  try {
    const userData = { ...user };

    if (process.env.NODE_ENV !== "production") {
      const {
        testSsn,
        testFirstName,
        testLastName,
        testDob,
        testStreet,
        testCity,
        testState,
        testZipCode,
        testPhoneNumber,
      } = sails.config.getTestData(RULE.ruleId, user.ssnNumber);

      Object.assign(userData, {
        ssnNumber: testSsn,
        firstName: testFirstName,
        lastName: testLastName,
        dateOfBirth: testDob,
        street: testStreet,
        city: testCity,
        state: testState,
        zipCode: testZipCode,
        phoneNumber: testPhoneNumber,
      });
    }
    const { context, FAILED } = initContext(RULE);
    const factorTrustReport = await FactorTrustLendProtectService.getOrRunCreditReport(
      userData,
      screenTracking,
      true
    );

    if (factorTrustReport) {
      const { raw: report } = factorTrustReport;
      const transUnion = await Transunions.storeTransunion(
        factorTrustReport,
        "factorTrust"
      );

      screenTracking.transUnion.push(transUnion.id);
      await screenTracking.save();

      const hasCurrentDue = factorTrustReport.checkForCurrentDue(report);

      // const factorTrustScore =
      //   repsort?.TransactionInfo?.Scores?.ScoreDetail?.Score;
      const factorTrustScore = factorTrustReport.getScorecard(report);

      Object.assign(context.underwritingDecision, {
        value: factorTrustScore,
      });

      const isOrganicApplication =
        screenTracking.origin === Screentracking.origins.WEBSITE;

      if (hasCurrentDue) {
        Object.assign(context.underwritingDecision, {
          status: FAILED,
          reason: "Current delinquency",
        });

        const communicationCode = getCommunicationCode(screenTracking.origin, {
          [Screentracking.origins.LEADS_PROVIDER]: "FTAL",
          [Screentracking.origins.WEBSITE]: "FTA",
        });

        communicationService.sendApplicationCommunication({
          communicationCode,
          user: userData,
          screenTracking,
        });
      }

      const recentBankruptcy = factorTrustReport.checkForBankruptcy(report);

      if (recentBankruptcy) {
        Object.assign(context.underwritingDecision, {
          status: FAILED,
          reason: "Bankruptcy last 24 months",
        });

        const communicationCode = getCommunicationCode(screenTracking.origin, {
          [Screentracking.origins.LEADS_PROVIDER]: "FTBL",
          [Screentracking.origins.WEBSITE]: "FTB",
        });

        communicationService.sendApplicationCommunication({
          communicationCode,
          user: userData,
          screenTracking,
        });
      }

      await Screentracking.updateOfferData(
        screenTracking,
        "factorTrustScore",
        factorTrustScore
      );
      return setScreenTrackingContext(screenTracking, context);
    }
  } catch (error) {
    sails.log.error(
      "NinthStep#factorTrust::Err ::",
      error.stack || error.message || error
    );
    return failureResponse(RULE.title, "Unexpected error");
  }
}

module.exports = factorTrustDelinquencyRiskCheck;
