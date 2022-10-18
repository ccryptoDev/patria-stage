const fs = require("fs");
const path = require("path");
const pdfConverter = require("html-pdf");
const moment = require("moment");
const ApiApplicationService = require("./ApiApplicationService");
const EsignatureModel = require("../models/Esignature");
const AgreementModel = require("../models/Agreement");
const UserConsentModel = require("../models/UserConsent");
const ScreentrackingModel = require("../models/Screentracking");
const { ErrorHandler } = require("./ErrorHandling");
const request = require("request");

async function generateDocument(
  {
    documentType = "",
    screenTrackingId = "",
    user = {},
    signature = "",
    offer = {},
    payments = [],
    checkingAccount = {},
  },
  res
) {
  const config = {
    patriaAgreement: {
      path: "document/patriaAgreement/index.nunjucks",
      name: "Patria Agreement",
    },
    consumerLoanAgreement: {
      path: "document/ConsumerLoanAgreementTerm.nunjucks",
      name: "Consumer Loan Agreement",
    },
    achAgreement: {
      path: "document/AchAgreementTerm.nunjucks",
      name: "ACH Agreement",
    },
  };
  return new Promise((resolve, reject) => {
    res.render(
      config[documentType].path,
      {
        dateSigned: moment()
          .utc()
          .format("MM/DD/YYYY"),
        signature,
        user,
        offer,
        payments,
        tribe: sails.config.tribe,
        checkingAccount,
      },
      function (err, content) {
        if (err) return reject(err);
        const fileName = `${documentType}-${screenTrackingId}.pdf`;
        const filePath = path.resolve(__dirname, fileName);
        const options = {
          format: "Letter",
          orientation: "portrait",
          zoomFactor: "1",
          type: "pdf",
          quality: "75",
          paginationOffset: 1,
          border: {
            top: "25px",
            right: "15px",
            bottom: "25px",
            left: "15px",
          },
        };

        pdfConverter
          .create(content, options)
          .toFile(filePath, async (err, res) => {
            if (!err) {
              const [
                { Key: s3FilePath },
              ] = await ApiApplicationService.grabAndStoreFile(
                [{ fd: filePath, filename: fileName, type: "application/pdf" }],
                `documents/${documentType}`,
                { loanId: screenTrackingId, userId: user.id }
              );

              const signContext = {
                user_id: user.id,
                screenTrackingId: screenTrackingId,
                signatureType: documentType,
                remoteFilePath: s3FilePath,
                active: 1,
                config,
              };
              await saveAndLinkDocuments(signContext);
              delete signContext.config;
              await EsignatureModel.saveSignature(signContext);

              fs.unlinkSync(filePath);
              resolve(s3FilePath);
            } else reject(err);
          });
      }
    );
  });
}

const saveAndLinkDocuments = async (data) => {
  try {
    const {
      user_id,
      screenTrackingId,
      signatureType,
      remoteFilePath,
    } = data;
    // create doc in Agreement Model
    const config = {
      consumerLoanAgreement: {
        name: "Consumer Loan Agreement",
      },
    };

    const screentracking = await ScreentrackingModel.getApplicationById(
      screenTrackingId
    );
    const agreementContext = {
      active: true,
      documentName: config[signatureType]?.name,
      documentPath: remoteFilePath,
      documentVersion: "1.0",
      practiceManagement: screentracking.practiceManagement,
      signatureRequired: false,
    };
    const agreementResult = await AgreementModel.createContext(
      agreementContext
    );

    // create doc in consent Model
    const agreementDocumentPath = `${sails.config.env.REACT_APP_ADMIN_BASE_URL}/api/application/s3asset/${remoteFilePath}`;
    const consentContext = {
      agreementDocumentPath: agreementDocumentPath,
      agreement: agreementResult.id,
      documentName: config[signatureType]?.name,
      documentVersion: "1.0",
      paymentManagement: screentracking.paymentManagement,
      screenTracking: screenTrackingId,
      signedAt: moment()
        .utc()
        .format("MM/DD/YYYY"),
      user: user_id,
    };
    await UserConsentModel.createContext(consentContext);
  } catch (error) {
    sails.log.error("112:EsignatureService.saveAndLinkDocuments=>", error);
    return null;
  }
};

const requestApi = (reqOpts) => {
  return new Promise(function (resolve, reject) {
    request(reqOpts, function (error, res, body) {
      if (!error) {
        resolve(body);
      } else {
        if (error) return reject(error);
        reject(body);
      }
    });
  });
};

const runPaymentAmortization = async (screenId, userId) => {
  try {
    let lmsUrl = sails?.config?.appManagement.LMS_DEV_URL;;
    if (process.env.NODE_ENV === "staging") {
      lmsUrl = sails?.config?.appManagement.LMS_STAGE_URL;
    } else {
      lmsUrl = sails?.config?.appManagement.LMS_PROD_URL;
    }
    if (!lmsUrl) {
      throw new ErrorHandler(400, "Invalid Environment!");
    }

    const reqOpts = {
      url: `${lmsUrl}/api/application/init-schedule`,
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      json: { screenTracking: screenId, id: userId },
    };
    const response = await requestApi(reqOpts);
    sails.log.info(`\n\nPyamentResponse::${response}\n`);
  } catch (error) {
    sails.log.error(`\nERROR:runPaymentAmortization::${error}`);
    return null;
  }
};

const runPaymentCalc = async (apr, term, financedAmount) => {
  try {
    let lmsUrl = sails?.config?.appManagement.LMS_DEV_URL;;
    if (process.env.NODE_ENV === "staging") {
      lmsUrl = sails?.config?.appManagement.LMS_STAGE_URL;
    } else {
      lmsUrl = sails?.config?.appManagement.LMS_PROD_URL;
    }
    if (!lmsUrl) {
      throw new ErrorHandler(400, "Invalid Environment!");
    }

    const reqOpts = {
      url: `${lmsUrl}/api/application/calPayment`,
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      json: {
        apr: apr,
        term: Math.floor(term * 4.345),
        financedAmount: financedAmount,
      },
    };
    const response = await requestApi(reqOpts);
    sails.log.info(`\n\nPaymentResponse::${response}\n`);
    return response;
  } catch (error) {
    sails.log.error(`\nERROR:runPaymentCalc::${error}`);
    return null;
  }
};
module.exports = {
  generateDocument,
  runPaymentAmortization,
  runPaymentCalc,
  saveAndLinkDocuments,
};
