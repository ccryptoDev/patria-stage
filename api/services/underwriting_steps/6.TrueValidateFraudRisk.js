const Screentracking = require("../../models/Screentracking");
const TransUnionTrueValidate = require("../../models/TransUnionTrueValidate");
const {
  validateIdentity,
  requestOtp,
  validateUserPhoneEmail,
  RISK_FLAG,
  generateKbaUrl,
} = require("../TrueValidate");
const {
  UNDERWRITING_RULES,
  setScreenTrackingContext,
  initContext,
  getCommunicationCode,
} = require("./helpers");
const communicationService = require("../../services/CommunicationService");

const { FAILED, PENDING, PASSED } = sails.config.RULE_STATUS;

const RULE = UNDERWRITING_RULES.$6_TRANSUNION_FRAUD_VALIDATION;

async function TrueValidateFraudRisk({ screenTracking, user }) {
  const userData = { ...user };

  if (process.env.NODE_ENV !== "production") {
    const { testSsn, testEmail } = sails.config.getTestData(
      RULE.ruleId,
      userData.ssnNumber
    );

    Object.assign(userData, { ssnNumber: testSsn, email: testEmail });
  }
  const { context } = initContext(RULE);
  try {
    const steps = [];
    const isApprovedOpt =
      screenTracking.otpRequested && screenTracking.otpApproved;

    if (!isApprovedOpt) {
      const phoneEmailDetailedResponse = await validateUserPhoneEmail(
        screenTracking,
        userData
      );

      await TransUnionTrueValidate.saveTrueValidateResponse(
        userData.id,
        TransUnionTrueValidate.caseTypes.PHONE_EMAIL,
        phoneEmailDetailedResponse
      );

      steps.push(
        await handleResponse(
          TransUnionTrueValidate.caseTypes.PHONE_EMAIL,
          phoneEmailDetailedResponse,
          screenTracking,
          user,
          context
        )
      );
    }

    const identityDetailedResponse = await validateIdentity(
      screenTracking,
      userData
    );

    await TransUnionTrueValidate.saveTrueValidateResponse(
      userData.id,
      TransUnionTrueValidate.caseTypes.IDENTITY,
      identityDetailedResponse
    );

    steps.push(
      await handleResponse(
        TransUnionTrueValidate.caseTypes.IDENTITY,
        identityDetailedResponse,
        screenTracking,
        user,
        context
      )
    );

    context.underwritingDecision.value = steps;
  } catch (error) {
    Object.assign(context.underwritingDecision, {
      status:
        context.underwritingDecision.status !== PASSED
          ? context.underwritingDecision.status
          : FAILED,
      reason: context.underwritingDecision.reason || error.message,
    });
    sails.log.error("SixtyStep#TrueValidateFraudRisk::Err ::", error);
  } finally {
    sails.log.info("SixtyStep#TrueValidateFraudRisk::Done ::", context);
    return setScreenTrackingContext(screenTracking, context);
  }
}

async function handleFailing(screenTracking, context, message) {
  Object.assign(context.underwritingDecision, {
    status: FAILED,
    reason: message,
  });

  await setScreenTrackingContext(screenTracking, context);
  throw new Error(message);
}

async function handlePending(screenTracking, context, message) {
  Object.assign(context.underwritingDecision, {
    status: PENDING,
    reason: message,
  });

  await setScreenTrackingContext(screenTracking, context);
  throw new Error(message);
}

async function handleResponse(
  caseType = "",
  detailedResponse = {},
  screenTracking,
  user,
  context
) {
  const applicationUrl = sails.config.getMagicLoginLink(screenTracking, user);

  const isOrganicApplication =
    screenTracking.origin === Screentracking.origins.WEBSITE;

  const handlePhoneEmailCase = async (detailedResponse) => {
    const { Result: flag } = detailedResponse;

    if (flag === RISK_FLAG.MEDIUM) {
      const otpCaseResponse = await requestOtp(screenTracking, user);

      await TransUnionTrueValidate.saveTrueValidateResponse(
        user?.id,
        TransUnionTrueValidate.caseTypes.OTP_REQUEST,
        otpCaseResponse
      );

      await Object.assign(screenTracking, {
        otpRequested: true,
        otpApproved: false,
        otpRequestDate: new Date(),
      }).save();

      const communicationCode = getCommunicationCode(screenTracking.origin, {
        [Screentracking.origins.WEBSITE]: "TUA",
        [Screentracking.origins.LEADS_PROVIDER]: "TUAL",
      });

      communicationService.sendApplicationCommunication({
        communicationCode,
        user,
        screenTracking,
        data: {
          completeApplicationLink: applicationUrl,
          smsLink: applicationUrl,
        },
      });

      await handlePending(screenTracking, context, "Phone/email flag!");
    }

    if (flag === RISK_FLAG.HIGH) {
      if (isOrganicApplication || screenTracking.hasPriorCommunication) {
        communicationService.sendApplicationCommunication({
          communicationCode: "TUD",
          user,
          screenTracking,
        });
      }
      await handleFailing(screenTracking, context, "Phone/email high risk!");
    }

    return { caseType, flag };
  };

  const handleIdentityCase = async (detailedResponse) => {
    const { Result: flag } = detailedResponse;

    if (flag === RISK_FLAG.MEDIUM) {
      const kbaCaseResponse = await generateKbaUrl(screenTracking, user);

      await TransUnionTrueValidate.saveTrueValidateResponse(
        user?.id,
        TransUnionTrueValidate.caseTypes.KBA_REQUEST,
        kbaCaseResponse
      );

      await Object.assign(screenTracking, {
        kbaRequested: true,
        kbaApproved: false,
        kbaRequestDate: new Date(),
      }).save();

      const communicationCode = getCommunicationCode(screenTracking.origin, {
        [Screentracking.origins.WEBSITE]: "TUB",
        [Screentracking.origins.LEADS_PROVIDER]: "TUBL",
      });

      communicationService.sendApplicationCommunication({
        communicationCode,
        user,
        screenTracking,
        data: {
          completeApplicationLink: applicationUrl,
          smsLink: applicationUrl,
        },
      });

      await handlePending(screenTracking, context, "Identity flag!");
    }

    if (flag === RISK_FLAG.HIGH) {
      if (isOrganicApplication || screenTracking.hasPriorCommunication) {
        communicationService.sendApplicationCommunication({
          communicationCode: "TUE",
          user,
          screenTracking,
        });
      }

      await handleFailing(screenTracking, context, "Identity high risk!");
    }

    return { caseType, flag };
  };

  const getHandlerFor = (caseType) => {
    const config = {
      [TransUnionTrueValidate.caseTypes.IDENTITY]: handleIdentityCase,
      [TransUnionTrueValidate.caseTypes.PHONE_EMAIL]: handlePhoneEmailCase,
    };

    const handler = config[caseType];

    if (handler) {
      return { handle: handler };
    }

    throw new Error(`No handler for caseType: ${caseType}`);
  };

  return getHandlerFor(caseType).handle(detailedResponse);
}

module.exports = TrueValidateFraudRisk;
