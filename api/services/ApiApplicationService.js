"use strict";
const Joi = require("joi");
const _ = require("lodash");
const fs = require("fs");
const LoanDocument = require("../models/LoanDocument");
const { ErrorHandler } = require("./ErrorHandling");
const UserDocuments = require("../models/UserDocuments");

module.exports = {
  validateUserInfo: validateUserInfo,
  updateUserInfo: updateUserInfo,
  validateFinancialInfo: validateFinancialInfo,
  updateUserFinancialInfo: updateUserFinancialInfo,
  validateEmploymentHistory: validateEmploymentHistory,
  updateEmploymentInfo: updateEmploymentInfo,
  grabAndStoreFile,
};

async function validateUserInfo(userInfo) {
  try {
    const zipCodePattern = /^[0-9]{5}(?:-?[0-9]{4})?$/;
    const userSchema = Joi.object({
      firstName: Joi.string().required(),
      lastName: Joi.string().required(),
      requestedLoan: Joi.number().required(),
      phoneNumber: Joi.number().required(),
      phones: Joi.array(),
      dateOfBirth: Joi.date().required(),
      ssn_number: Joi.number(),
      ssnNumber: Joi.number().required(),
      email: Joi.string()
        .email()
        .required(),
      password: Joi.string().required(),
      street: Joi.string().required(),
      city: Joi.string().required(),
      zipCode: Joi.string().pattern(zipCodePattern),
      state: Joi.string().required(),
    });
    await userSchema.validateAsync(userInfo);
    return null;
  } catch (err) {
    return err.message;
  }
}

async function updateUserInfo(userId, updatedInfo) {
  try {
    let userData = await User.findOne({ id: userId });
    const updatableFields = [
      "firstName",
      "middlename",
      "lastName",
      "email",
      "phoneNumber",
      "mobileNumber",
      "street",
      "unitapt",
      "city",
      "state",
      "zipCode",
      "ssn_number",
      "dateOfBirth",
      "stateIdNumber",
      "idState",
      "consentChecked",
    ];
    let updatedUserInfo = {};
    let updateNeeded = false;
    Object.keys(updatedInfo).forEach((key) => {
      if (updatableFields.includes(key)) {
        userData[key] = updatedInfo[key];
        updatedUserInfo[key] = updatedInfo[key];
        updateNeeded = true;
      }
    });
    if (!updateNeeded) {
      throw new Error("No Update Needed");
    }
    await validateUserInfo(userData);
    return await User.update({ id: userId }, updatedUserInfo);
  } catch (err) {
    sails.log.error("ApiApplicationService#UpdateUserInfo -- Error: ", err);
    return err;
  }
}

function validateFinancialInfo(financialInfo) {
  const financialInfoSchema = Joi.object({
    bank: Joi.string().required(),
    routingNumber: Joi.number().required(),
    accountNumber: Joi.number().required(),
    requestedLoanAmount: Joi.number().required(),
    annualIncome: Joi.number(),
    monthlyIncome: Joi.number(),
    paymentmethod: Joi.string().required(),
    paymentFrequency: Joi.string(),
  });
  return financialInfoSchema.validateAsync(financialInfo);
}

async function updateUserFinancialInfo(userId, updatedInfo) {
  try {
    let userData = await User.findOne({ id: userId });
    const updatableFields = [
      "bank",
      "routingNumber",
      "accountNumber",
      "requestedLoanAmount",
      "annualIncome",
      "monthlyIncome",
      "paymentmethod",
      "paymentFrequency",
    ];
    let updatedUserInfo = {};
    let updateNeeded = false;
    Object.keys(updatedInfo).forEach((key) => {
      if (updatableFields.includes(key)) {
        userData[key] = updatedInfo[key].value;
        updatedUserInfo[key] = updatedInfo[key].value;
        updateNeeded = true;
      }
    });
    if (!updateNeeded) {
      throw new Error("No Update Needed");
    }
    await validateUserInfo(userData);
    return await User.update({ id: userId }, updatedUserInfo);
  } catch (err) {
    sails.log.error("ApiApplicationService#UpdateUserInfo -- Error: ", err);
    return err;
  }
}

async function validateEmploymentHistory(employmentHistoryData) {
  try {
    const employmentHistorySchema = Joi.object({
      user: Joi.string()
        .required()
        .trim(),
      typeOfIncome: Joi.string()
        .required()
        .trim(),
      employerName: Joi.string()
        .required()
        .trim(),
      annualIncome: Joi.string()
        .required(),
      employerPhone: Joi.string()
        .required()
        .trim(),
      employerStatus: Joi.string()
        .required()
        .trim(),
      residencePhone: Joi.string().allow(null, ''),
      screenTrackingId: Joi.string(),
    });
    await employmentHistorySchema.validateAsync(employmentHistoryData);
    return null;
  } catch (error) {
    return error.message;
  }
}

async function updateEmploymentInfo(employmentData, employmentId, userId) {
  if (employmentData && !!employmentId) {
    const result = await EmploymentHistory.update(
      { id: employmentId, user: userId },
      employmentData
    );

    if (result.length) {
      return result[0];
    }
    throw new ErrorHandler(404, "Employment not found!");
  }
  throw new ErrorHandler(400, "Unable to update employment information.");
}

async function grabAndStoreFile(
  files,
  newFilename,
  payload,
  createLoanDoc = true
) {
  const { loanId, userId, label } = payload;
  if (!files) return [];
  return Promise.all(
    files.map(async (file, index) => {
      const { type, size, filename } = file;
      const stream = fs.createReadStream(file.fd);
      const fileExt = filename.split(".").pop();
      const s3FilePath = `${newFilename}0${index}-${loanId}.${fileExt}`;
      const contextUpload = {
        fileStream: stream, // doc.stream._readableState,
        contentType: type,
        filename: s3FilePath,
      };
      console.log("contextUpload:", contextUpload);
      const { data: s3Response } = await S3Service.uploadFileToS3(
        contextUpload
      );
      if (createLoanDoc) {
        const dbContext = {
          screenTracking: loanId,
          docName: contextUpload.filename,
          user: userId,
          label,
        };
        const dbsaved = await LoanDocument.createLoanEntry(dbContext);
        const userDocs = {
          uploaderRole: "user",
          user: userId,
          uploaderName: "",
          docName: contextUpload.filename
        }
        await UserDocuments.createContext(userDocs);
        s3Response.dbsaved = dbsaved.success;
        s3Response.filename = contextUpload.filename;
      }
      return s3Response;
    })
  );
}

function getUpdatedUserProperties(user, newUser) {
  if (newUser) {
    if (user) {
      const newUserObj = {};
      _.forEach(Object.keys(newUser), (reApplyUserKey) => {
        if (
          reApplyUserKey !== "id" &&
          ((!user[reApplyUserKey] && !!newUser[reApplyUserKey]) ||
            (!!user[reApplyUserKey] &&
              user[reApplyUserKey] !== newUser[reApplyUserKey]))
        ) {
          newUserObj[reApplyUserKey] = newUser[reApplyUserKey];
        }
      });
      return newUserObj;
    }
    delete newUser.id;
    return newUser;
  }
  delete user.id;
  return user;
}
