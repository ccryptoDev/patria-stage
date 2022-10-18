/**
 * EsignatureController
 *
 * @description :: Server-side logic for managing Esignatures
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

"use strict";

const fs = require("fs");
const path = require("path");
const ApiApplicationService = require("../services/ApiApplicationService");
const EsignatureService = require("../services/EsignatureService");
const { ErrorHandler, SendError } = require("../services/ErrorHandling");
const { generateDocument } = require("../services/EsignatureService");
const S3Service = require("../services/S3Service");
const moment = require("moment");
const retry = require("async-retry");
const EmailService = require("../services/EmailService");
const Screentracking = require("../models/Screentracking");
const PaymentManagementModel = require("../models/PaymentManagement");
const { LOAN_STATUS } = require("../models/PaymentManagement");
const LoanDocumentModel = require("../models/LoanDocument");
const { ObjectId } = require("mongodb");
const PaymentAccountTokenModel = require("../models/PaymentAccountToken");

function getFileExtension(imageType = "") {
  const validTypes = {
    "image/png": "png",
  };

  return validTypes[imageType];
}

function isValidDocumentType(documentType = "") {
  const validTypes = ["patriaAgreement"];
  return typeof documentType === "string" && validTypes.includes(documentType);
}

async function saveSignatureAction(req, res) {
  const { id: userId } = req.user;
  const { data, fileType } = req.body;
  const screenTrackingId = req.param("screenTrackingId");
  sails.log.info(
    "JH EsignatureController.saveSignatureAction userid: ",
    userId
  );

  const fileExtension = getFileExtension(fileType);
  if (!fileExtension) {
    sails.log.error(
      "EsignatureController.saveSignatureAction invalid file type",
      fileType
    );
    return res.status(400).json({
      message: "Invalid file type!",
    });
  }

  const screenTracking = await Screentracking.getScreenTracking({
    id: screenTrackingId,
    user: userId,
  });

  if (screenTracking) {
    const imageBuffer = Buffer.from(data, "base64");
    const fileName = `${screenTracking.user.id}-${screenTrackingId}.${fileExtension}`;
    const userUploadedFeedMessagesLocation =
      sails.config.appPath + "/assets/images/signatures/";
    const userUploadedImagePath = path.resolve(
      userUploadedFeedMessagesLocation,
      fileName
    );
    fs.writeFileSync(userUploadedImagePath, imageBuffer, { flag: "w" });

    const [{ Key: s3FilePath }] = await ApiApplicationService.grabAndStoreFile(
      [{ fd: userUploadedImagePath, filename: fileName }],
      "signatures/UserSignature",
      { loanId: screenTrackingId, userId },
      false
    );

    sails.log.info(
      "EsignatureController.saveSignatureAction - Created s3 object",
      s3FilePath
    );

    Object.assign(screenTracking, {
      userSignaturePath: s3FilePath,
      acceptedPatriaAgreementTermDate: new Date(),
      acceptedPatriaAgreementTerm: true,
    }),
      await screenTracking.save();

    fs.unlinkSync(userUploadedImagePath);

    return res.status(204).json({});
  }

  return res.status(404).json({ message: "Screentracking not found!" });
}

async function acceptTermAction(req, res) {
  const userId = req.user.id;
  const { documentType } = req.body;
  const screenTrackingId = req.param("screenTrackingId");

  if (!isValidDocumentType(documentType)) {
    sails.log.error(
      "EsignatureController.acceptTerm invalid document type",
      documentType
    );
    return res.status(400).json({
      message: "Invalid document type!",
    });
  }

  const screenTracking = await Screentracking.getScreenTracking({
    id: screenTrackingId,
    user: userId,
  });

  if (screenTracking) {
    const acceptDate = moment()
      .utc()
      .format("MM/DD/YYYY");
    const config = {
      patriaAgreement: () =>
        Object.assign(screenTracking, {
          acceptedPatriaAgreementTermDate: acceptDate,
          acceptedPatriaAgreementTerm: true,
        }),
    };

    await config[documentType]().save();

    return res.status(204).json({});
  }

  return res.status(404).json({ message: "Screentracking not found!" });
}

async function createSignedDocumentsAction(req, res) {
  try {
    const userId = req.user.id;
    const screenTrackingId = req.param("screenTrackingId");

    const screenTracking = await Screentracking.getScreenTracking(
      {
        id: screenTrackingId,
        user: userId,
      },
      ["user"]
    );

    if (screenTracking) {
      const {
        acceptedPatriaAgreementTerm,
        lastlevel,
        user = {},
      } = screenTracking;

      const paymentQuery = {
        id: screenTracking.paymentManagement,
      };
      console.log("\n\n\nfirst-------", paymentQuery);
      const paymentResult = await PaymentManagementModel.getPaymentCollection(
        paymentQuery
      );
      if (!paymentResult) {
        throw new ErrorHandler(400, "Payment Management Not found");
      }

      // await PaymentManagementModel.updatePaymentManagement()

      if (
        lastlevel === Screentracking.screens.SIGN_CONTRACT &&
        acceptedPatriaAgreementTerm
      ) {
        await EsignatureService.saveAndLinkDocuments({
          user_id: userId,
          screenTrackingId,
          signatureType: req.body.signatureType,
          remoteFilePath: req.body.remoteFilePath,
        });

        await Screentracking.updateContext(
          { id: screenTrackingId },
          {
            lastlevel: Screentracking.screens.FUNDING_METHOD,
            lastLevel: Screentracking.screens.FUNDING_METHOD,
          }
        );

        sails.log.info(
          "EsignatureController.createSignedDocumentsAction done!"
        );
        return res.status(204).json({});
      }

      throw { message: "Invalid Screentracking!" };
    }

    throw { message: "Screentracking not found!" };
  } catch (error) {
    sails.log.error(
      "EsignatureController.createSignedDocumentsAction error",
      error.stack || error
    );
    return SendError(
      new ErrorHandler(400, error.message || error.stack || error),
      res
    );
  }
}

async function getUserSignatureContentAction(req, res) {
  try {
    const userId = req.user.id;
    const screenTrackingId = req.param("screenTrackingId");

    const screenTracking = await Screentracking.getScreenTracking({
      id: screenTrackingId,
      user: userId,
    });

    if (screenTracking) {
      if (screenTracking.userSignaturePath) {
        const content = await S3Service.getStreamFromS3File(
          screenTracking.userSignaturePath
        );

        return res.status(200).json(content);
      }
      throw { message: "User has not registered signature!" };
    }

    throw { message: "Screentracking not found!" };
  } catch (error) {
    sails.log.error(
      "EsignatureController.getUserSignatureContentAction error",
      error.stack || error
    );
    return SendError(
      new ErrorHandler(400, error.message || error.stack || error),
      res
    );
  }
}

async function getUserLoanDocument(req, res) {
  try {
    const userId = req.user.id;
    const screenTrackingId = req.param("screenTrackingId");

    const screenTracking = await Screentracking.getScreenTracking({
      id: screenTrackingId,
      user: userId,
    });

    if (!screenTracking) {
      throw new ErrorHandler(404, "Application Not Found");
    }
    const result = await LoanDocumentModel.getAllDocuments(screenTrackingId);
    const accountDetail = await PaymentAccountTokenModel.getOne({
      user: userId,
    });
    const { accountNumber, routingNumber } = accountDetail;
    const paymentData = await PaymentManagementModel.getPaymentCollection({
      screenTracking: screenTrackingId,
    });
    const financialDetails = await EsignatureService.runPaymentCalc(
      screenTracking.selectedOffer.apr,
      screenTracking.selectedOffer.term,
      screenTracking.selectedOffer.financedAmount
    );
    paymentData.financialDetails = financialDetails;
    paymentData.accountDetail = { accountNumber, routingNumber };

    res.json({
      data: {
        ...result,
        paymentData,
      },
    });
  } catch (error) {
    SendError(error, res);
  }
}

module.exports = {
  saveSignature: saveSignatureAction,
  acceptTerm: acceptTermAction,
  createSignedDocuments: createSignedDocumentsAction,
  getUserSignatureContent: getUserSignatureContentAction,
  getUserLoanDocument,
};
