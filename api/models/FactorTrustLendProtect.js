/* global sails */
"use strict";
const _ = require("lodash");
const pointOfOrigination = {
  VIRTUAL: "V",
  RETAIL: "R",
};

module.exports = {
  attributes: {
    user: { model: "User", required: true },
    raw: { type: "json" },
    isHardPull: { type: "boolean" },
    history: { model: "FactorTrustLendProtectHistory" },
    isNoHit,
    getServicesAttribute,
    getScorecard,
    checkForBankruptcy,
    checkForCurrentDue,
  },
  pointOfOriginationEnum: pointOfOrigination,
  saveLendProtectResponse: saveLendProtectResponse,
  getLatestReportForUser: getLatestReportForUser,
};

function checkForBankruptcy(report) {
  const IC_MonSinceMostRecentPubRecBkrcy = parseInt(
    getServicesAttribute(
      report,
      "InsolvencyLogic",
      "Default",
      "IC_MonSinceMostRecentPubRecBkrcy"
    )
  );

  const IC_MonSinceMostRecentTLBkrcy = parseInt(
    getServicesAttribute(
      report,
      "InsolvencyLogic",
      "Default",
      "IC_MonSinceMostRecentTLBkrcy"
    )
  );
  console.log({
    IC_MonSinceMostRecentPubRecBkrcy,
    IC_MonSinceMostRecentTLBkrcy,
  });

  return [IC_MonSinceMostRecentPubRecBkrcy, IC_MonSinceMostRecentTLBkrcy].every(
    (x) => x && x >= 0 && x <= 24
  );
}

function checkForCurrentDue(report) {
  const ACA_LL_TIME_SINCE_NEWEST_DLQNT = parseInt(
    getServicesAttribute(
      report,
      "AlternativeCreditAttributes",
      "Default",
      "ACA_LL_TIME_SINCE_NEWEST_DLQNT"
    )
  );

  console.log({ ACA_LL_TIME_SINCE_NEWEST_DLQNT });

  return ACA_LL_TIME_SINCE_NEWEST_DLQNT && ACA_LL_TIME_SINCE_NEWEST_DLQNT <= 30;
}

function saveLendProtectResponse(
  userId,
  responseObj,
  historyObj,
  isHardPull = false
) {
  let entry = {
    user: userId,
    raw: responseObj,
    isHardPull: isHardPull,
    isNoHit: isNoHit(responseObj),
  };
  if (historyObj && historyObj.id) {
    entry["history"] = historyObj.id;
  }
  return FactorTrustLendProtect.create(entry);
}
async function getLatestReportForUser(user) {
  const userId = _.get(user, "id", user);
  if (!!userId) {
    let criteria = {
      isHardPull: true,
      user: userId,
    };
    let report = await FactorTrustLendProtect.find(criteria)
      .sort({ createdAt: -1 })
      .limit(1);

    if (!report || report.length === 0) {
      delete criteria.isHardPull;
      criteria["$or"] = [
        { isHardPull: { $exists: false } },
        { isHardPull: { $eq: false } },
      ];
      report = await FactorTrustLendProtect.find(criteria)
        .sort({ createdAt: -1 })
        .limit(1);
    }
    if (report && report.length > 0) {
      return report[0];
    }
  }
  return null;
}

function isNoHit(report) {
  const ACA_NumberofApplicationsAllTime = parseInt(
    getServicesAttribute(
      report,
      "AlternativeCreditAttributes",
      "Default",
      "ACA_NumberofApplicationsAllTime",
      0
    ) || 0
  );
  sails.log.verbose(
    "isNoHit; ACA_NumberofApplicationsAllTime:",
    ACA_NumberofApplicationsAllTime
  );
  const ACA_LL_TRADES_EVER = parseInt(
    getServicesAttribute(
      report,
      "AlternativeCreditAttributes",
      "Default",
      "ACA_LL_TRADES_EVER",
      0
    ) || 0
  );
  sails.log.verbose("isNoHit; ACA_LL_TRADES_EVER:", ACA_LL_TRADES_EVER);
  const ACA_NumOfAutoApplicationsAllTime = parseInt(
    getServicesAttribute(
      report,
      "AlternativeCreditAttributes",
      "Default",
      "ACA_NumOfAutoApplicationsAllTime",
      0
    ) || 0
  );
  sails.log.verbose(
    "isNoHit; ACA_NumOfAutoApplicationsAllTime:",
    ACA_NumOfAutoApplicationsAllTime
  );
  return (
    (ACA_NumberofApplicationsAllTime === 0 && ACA_LL_TRADES_EVER === 0) ||
    (ACA_NumOfAutoApplicationsAllTime === 1 &&
      ACA_NumberofApplicationsAllTime === 1 &&
      ACA_LL_TRADES_EVER === 0)
  );
}

function getServicesAttribute(
  report,
  serviceName,
  categoryName,
  attributeName,
  defaultVal
) {
  const services = _.get(report, "Services.Service", []);
  let service = null;
  _.some(services, (svc) => {
    if (svc.Name === serviceName) {
      service = svc;
      return true;
    }
  });
  if (!service) return defaultVal;
  let category = null;
  const categories = _.get(service, "Categories.Category", []);
  if (
    categories &&
    !Array.isArray(categories) &&
    _.get(categories, "Name") === categoryName
  ) {
    category = categories;
  } else if (Array.isArray(categories)) {
    _.some(categories, (cat) => {
      if (cat.Name === categoryName) {
        category = cat;
        return true;
      }
    });
  } else {
    return defaultVal;
  }
  if (!category) return defaultVal;
  const attributes = _.get(category, "Attributes.Attribute", []);
  // sails.log.verbose( "attributes:", attributes );
  if (
    attributes &&
    !Array.isArray(attributes) &&
    _.get(attributes, "Name") === attributeName
  ) {
    return _.get(attributes, "Value", defaultVal);
  }
  let attribute;
  let attrExists = false;
  _.some(attributes, (attr) => {
    if (attr.Name === attributeName) {
      attribute = attr.Value;
      attrExists = true;
    }
  });
  return attrExists ? attribute : defaultVal;
}

function getScorecard(report, type = "Risk") {
  const scoreObject = _.get(report, "TransactionInfo.Scores.ScoreDetail");

  let factorTrustScore;
  if (Array.isArray(scoreObject)) {
    factorTrustScore = scoreObject.find((score) => score.Type === type)?.Score;
    return parseInt(factorTrustScore) < 500 ? "0" : factorTrustScore;
  }

  factorTrustScore = scoreObject.Score;

  return parseInt(factorTrustScore) < 500 ? "0" : factorTrustScore;
}
