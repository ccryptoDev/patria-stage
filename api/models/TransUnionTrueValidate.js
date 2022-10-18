/* global sails */
"use strict";
const _ = require("lodash");
const { ErrorHandler } = require("../services/ErrorHandling");

const caseTypes = {
  PHONE_EMAIL: "phone-emailL",
  IDENTITY: "identity",
  OTP_REQUEST: "otp-request",
  OTP_RESPONSE: "otp-response",
  KBA_REQUEST: "kba-request",
  KBA_RESPONSE: "kba-response",
};

const statuses = {
  PASSED: "passed",
  FAILED: "failed",
  IN_VALIDATION: "in-validation",
};

module.exports = {
  attributes: {
    user: { model: "User", required: true },
    raw: { type: "json" },
    isHardPull: { type: "boolean" },
    sanitizedResponse: { type: "json" },
    type: { type: "string", required: true, enum: Object.values(caseTypes) },
    // status: { type: "string", required: true, enum: Object.values(statuses) },
    // history: { model: "TransUnionTrueValidateHistory" },
  },
  caseTypes,
  statuses,
  saveTrueValidateResponse: saveTrueValidateResponse,
  getLatestReportForUser: getLatestReportForUser,
};

function saveTrueValidateResponse(userId, type, rawResponseObj) {
  let entry = {
    user: userId,
    type,
    raw: rawResponseObj,
  };

  return TransUnionTrueValidate.create(entry);
}
async function getLatestReportForUser(userId, reportType) {
  // const userId = _.get(user, "id", user);
  // if (!!userId) {
  const query = { user: userId };

  if (reportType) {
    query.type = reportType;
  }

  const report = await TransUnionTrueValidate.find(query)
    .sort({ createdAt: -1 })
    .limit(1);

  if (report && report.length > 0) {
    return report[0];
  }
  // }

  throw new ErrorHandler(404, "No report found");
}

async function getUserReports(userId = "") {
  const userReports = await TransUnionTrueValidate.find({
    user: userId,
  });

  return userReports;
}
