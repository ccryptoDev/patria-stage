/**
 * ClarityResponse.js
 */
var Q = require('q');

module.exports = {
  attributes: {
    user: {
      model: "User",
      required: true
    },
    raw: {
      type: "json"
    },
    name: {
      type: "string"
    },
    isHardPull: {
      type: "boolean",
      defaultsTo: true,
    },
    screenTracking: {
      model: "Screentracking"
    },
    ruleName: {
      type: "string"
    },
    ruleNumber: {
      type: "integer"
    },
    data: {
      type: "json",
    },
  },
  // saveClarityResponse: saveResponse,
  getUserLatestInquiryResponse,
  saveClarityResponse
};

async function saveResponse(userId, responseObj, screenTrackingId) {
  let entry = {
    user: userId,
    action: responseObj.action,
    trackingNumber: responseObj.tracking_number,
    data: responseObj,
    screentracking: screenTrackingId
  };
  await ClarityResponse.create(entry);
}

async function saveClarityResponse(screenData, clarityData, ruleName = null, ruleNumber = null) {
  console.log(ruleName, "saving claritu repinse in  rules====", ruleNumber)
  return Q.promise(async function (resolve, reject) {
    const clarityStoreContext = {
      screenTracking: screenData.id,
      user: screenData?.user?.id || screenData?.user,
      raw: clarityData,
      ruleName,
      ruleNumber
    };
    const query = { screenTracking: screenData.id };

    // const isExist = await ClarityResponse.findOne(query);
    // if (!isExist) {
    return ClarityResponse.create(clarityStoreContext)
      .then(function (screenTracking) {
        sails.log.info("saveClarityResponse::Saved");
        return resolve(screenTracking);
      })
      .catch(function (err) {
        sails.log.error("saveClarityResponse::Error", err);
        return reject(err);
      })
    // }

    resolve(isExist);
  })
}

async function getUserLatestInquiryResponse(userId) {
  const [latestInquiryResponse] = await ClarityResponse.find({ user: userId })
    .sort({ createdAt: -1 })
    .limit(1);

  return latestInquiryResponse;
}
