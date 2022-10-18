"use strict";

const moment = require("moment");

module.exports.cron = {
  checkApplicationsPendingToUploadDocuments: {
    schedule: "0 * * * *",
    timezone: "America/New_York",
    onTick: async () => {
      sails.log.info("checkApplicationsPendingToUploadDocuments#started");
      const twoWeeksPast = moment()
        .subtract(14, "days")
        .startOf("day")
        .format("YYYY-MM-DD HH:mm:ss")
        .concat(".000Z");

      const query = {
        isCompleted: false,
        closedApplication: false,
        $or: [
          {
            driverLicenseRequested: true,
            driverLicenseUploaded: false,
            driverLicenseRequestDate: { $lte: new Date(twoWeeksPast) },
          },
          {
            proofOfResidenceRequested: true,
            proofOfResidenceUploaded: false,
            proofOfResidenceRequestDate: { $lte: new Date(twoWeeksPast) },
          },
          {
            payStubRequested: true,
            payStubUploaded: false,
            payStubRequestDate: { $lte: new Date(twoWeeksPast) },
          },
        ],
      };

      const applicationsToNotify = await Screentracking.find(query).populate(
        "user"
      );

      for (const application of applicationsToNotify) {
        CommunicationService.sendApplicationCommunication({
          communicationCode: "NED",
          user: application.user,
        });

        await closeApplication(application.id);
      }

      sails.log.info(
        "checkApplicationsPendingToUploadDocuments#finished::",
        applicationsToNotify.length,
        "applications were notified!"
      );
    },
  },
  checkApplicationsPendingToPerformOtpKbaValidation: {
    schedule: "0 * * * *",
    timezone: "America/New_York",
    onTick: async () => {
      sails.log.info(
        "checkApplicationsPendingToPerformOtpKbaValidation#started"
      );

      const query = {
        isCompleted: false,
        // closedApplication: false,
        $or: [
          {
            kbaRequested: true,
            kbaApproved: false,
            // kbaRequestDate: { $lte: new Date(twoWeeksPast) },
          },
          {
            otpRequested: true,
            otpApproved: false,
            // otpRequestDate: { $lte: new Date(twoWeeksPast) },
          },
        ],
      };

      const applicationsToNotify = await Screentracking.find(query)
        .populate("user")
        .sort({ createdAt: -1 });
      // .limit(1);

      const promises = applicationsToNotify.map(async (application) => {
        const currentDate = new Date();
        const userData = { ...application.user };

        const getOneHourMark = (dateRequested) => ({
          oneHourMarkSent: moment(dateRequested).add(1, "hour") < currentDate,
        });
        const getSixHoursMark = (dateRequested) => ({
          sixHoursMarkSent: moment(dateRequested).add(6, "hours") < currentDate,
        });
        const getOneDayMark = (dateRequested) => ({
          oneDayMarkSent: moment(dateRequested).add(24, "hours") < currentDate,
        });
        const twoDaysMark = (dateRequested) => ({
          twoDaysMarkSent: moment(dateRequested).add(48, "hours") < currentDate,
        });

        const communicationMarks = [
          getOneHourMark,
          getSixHoursMark,
          getOneDayMark,
          twoDaysMark,
        ];

        let communicationSent = false;

        for (const getMark of communicationMarks) {
          if (!communicationSent) {
            const isKba = application.kbaRequested && !application.kbaApproved;
            const isOtp = application.otpRequested && !application.otpApproved;

            const validationType = isKba ? "kba" : isOtp ? "otp" : undefined;

            communicationSent = await processPendingValidation(
              validationType,
              application,
              userData,
              getMark
            );
          }
        }
      });

      await Promise.all(promises);

      sails.log.info(
        "checkApplicationsPendingToPerformOtpKbaValidation#finished::",
        applicationsToNotify.length,
        "applications were notified!"
      );
    },
  },
  refreshKbaQuestions: {
    schedule: "0 * * * *",
    timezone: "America/New_York",
    onTick: async () => {
      sails.log.info("refreshKbaQuestions#started");

      const query = {
        isCompleted: false,
        closedApplication: false,
        kbaRequested: true,
        kbaApproved: false,
        // "underwritingDecision.status": "pending",
      };

      const applicationsPendingKba = await Screentracking.find(query).populate(
        "user"
      );

      const promises = applicationsPendingKba.map(async (application) => {
        const { user: userData } = application;
        const {
          createdAt: reportRequestedAt,
          raw: reportData,
        } = await TransUnionTrueValidate.getLatestReportForUser(
          application.user.id,
          TransUnionTrueValidate.caseTypes.KBA_REQUEST
        );

        const is24HoursPast =
          moment(reportRequestedAt).add(24, "hours") < new Date();

        if (is24HoursPast) {
          const isTestSsn = sails.config.checkTestSsn(
            userData.ssnNumber
          );

          // THIS BLOCK SHOULD BE REMOVED AFTER TESTS
          if (isTestSsn) {
            userData.ssnNumber = reportData?.RawData?.Customer?.SocialSecurityNumber.replace(
              /\D+/g,
              ""
            );
          }

          const kbaCaseResponse = await TrueValidate.generateKbaUrl(
            application,
            userData
          );

          await TransUnionTrueValidate.saveTrueValidateResponse(
            userData.id,
            TransUnionTrueValidate.caseTypes.KBA_REQUEST,
            kbaCaseResponse
          );
        }
      });

      await Promise.all(promises);

      sails.log.info(
        "refreshKbaQuestions#finished::",
        applicationsPendingKba.length,
        "applications KBA questions were renewed!"
      );
    },
  },
};

async function processPendingValidation(type, application, userData, getMark) {
  const {
    getCommunicationCode,
  } = require("../api/services/underwriting_steps/helpers");

  const requestDateConfig = {
    kba: application.kbaRequestDate,
    otp: application.otpRequestDate,
  };

  const requestedAt = requestDateConfig[type];
  const communicationMarks =
    application.kbaOptValidationCommunicationMarks?.[type];

  const {
    oneHourMarkSent: priorOneHourMark = false,
    sixHoursMarkSent: priorSixHoursMark = false,
    oneDayMarkSent: priorOneDayMark = false,
    twoDaysMarkSent: priorTwoDaysMark = false,
  } = communicationMarks || {};

  Object.assign(
    application.kbaOptValidationCommunicationMarks?.[type],
    getMark(requestedAt)
  );

  await application.save();

  const {
    oneHourMarkSent: currentOneHourMark = false,
    sixHoursMarkSent: currentSixHoursMark = false,
    oneDayMarkSent: currentOneDayMark = false,
    twoDaysMarkSent: currentTwoDaysMark = false,
  } = communicationMarks || {};

  if (
    (!priorOneHourMark && currentOneHourMark) ||
    (!priorSixHoursMark && currentSixHoursMark) ||
    (!priorOneDayMark && currentOneDayMark)
  ) {
    const applicationUrl = sails.config.getMagicLoginLink(application, userData);

    const communicationConfig = {
      otp: {
        [Screentracking.origins.WEBSITE]: "TUA",
        [Screentracking.origins.LEADS_PROVIDER]: "TUAL",
      },
      kba: {
        [Screentracking.origins.WEBSITE]: "TUB",
        [Screentracking.origins.LEADS_PROVIDER]: "TUBL",
      },
    };

    const communicationCode = getCommunicationCode(
      application.origin,
      communicationConfig[type]
    );

    CommunicationService.sendApplicationCommunication({
      communicationCode,
      user: userData,
      data: {
        completeApplicationLink: applicationUrl,
        smsLink: applicationUrl,
      },
    });
    return true;
  }

  if (!priorTwoDaysMark && currentTwoDaysMark) {
    CommunicationService.sendApplicationCommunication({
      communicationCode: "NED",
      user: userData,
    });

    await closeApplication();
    return true;
  }

  return false;
}

function closeApplication(applicationId) {
  Screentracking.updateContext(
    { id: applicationId },
    {
      closedApplication: true,
    }
  );

  PaymentManagement.updatePaymentManagement(
    {
      screenTracking: applicationId,
    },
    { status: "closed" } // CONFIRM WHICH STATUS TO USE
  );
}
