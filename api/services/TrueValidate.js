const moment = require("moment");
const request = require("request-promise");
const crypto = require("crypto");

const { truValidate: getTrueValidateCredentials } = sails.config.factorTrust;

let config;
let sessionType = "";

const setConfig = (strategy = "") => {
  const validStrategies = new Set(["device", "identity", "kba_otp"]);

  if (validStrategies.has(strategy)) {
    config = getTrueValidateCredentials(strategy);
    sessionType = strategy;
    return;
  }

  throw new Error(`Invalid strategy: ${strategy}`);
};

const RISK_FLAG = {
  HIGH: 3,
  MEDIUM: 2,
  LOW: 1,
  DEFAULT: 0,
};

let tokenExpiration = null;
let apiToken = null;

module.exports = {
  RISK_FLAG,
  // getDetailedValidationResponse,
  validateUserPhoneEmail,
  validateIdentity,
  sendOtpResponseCode,
  requestOtp,
  postKbaAnswers,
  generateKbaUrl,
};

function getHashField(timestamp, field) {
  const secret = config.secretKey;
  const getHasher = () => {
    const sha256Hasher = crypto.createHash("sha256");
    return {
      hash: (str) => sha256Hasher.update(str).digest("hex"),
    };
  };

  return getHasher().hash(
    getHasher()
      .hash(`${timestamp}.${field}`)
      .concat(`.${secret}`)
  );
}

function getPhoneCasePayload(user = {}, refId, sessionId) {
  // mock for test purposes
  // user = {
  //   phoneNumber: "4045049011",
  //   email: "FTESTF@transunion.com",
  //   dateOfBirth: "4/20/1972",
  //   zipCode: "30326",
  //   state: "GA",
  //   city: "ATLANTA",
  //   firstName: "FRANK",
  //   lastName: "TESTF",
  //   street: "600 FRONTIER STREET S UNIT A",
  //   ssnNumber: "666010006",
  // };

  const basePayloAd = {
    CaseNumber: refId,
    SessionId: sessionId,
    Customer: {
      FirstName: user.firstName,
      LastName: user.lastName,
      Addresses: [
        {
          Address1: user.street,
          Address2: "",
          Address3: "",
          City: user.city,
          CountryCode: "US",
          PhoneNumber: user.phoneNumber,
          FirstName: user.firstName,
          IsDefault: true,
          LastName: user.lastName,
          PostalCode: user.zipCode,
          State: user.state,
          Type: 0,
        },
      ],
      PhoneNumber: user.phoneNumber,
    },
    FirstName: user.firstName,
    LastName: user.lastName,
    SocialSecurityNumber: user.ssnNumber,
    CaseType: 0,
    MarketType: 0,
  };

  console.log({ basePayloAd });
  return basePayloAd;
}

function getEmailPhoneCasePayload(user = {}, refId, sessionId) {
  // mock for test purposes
  // user = {
  //   phoneNumber: "4045049006",
  //   email: "Pass@Test.com",
  // };

  // const getTestEmail = (testCase) => {
  //   const config = {
  //     pass: "Pass@Test.com",
  //     flag: "Flag@Test.com",
  //     fail: "Fail@Test.com",
  //   };

  //   return config[testCase] || user.email;
  // };

  const basePayloAd = {
    CaseNumber: refId,
    SessionId: sessionId,
    Customer: {
      FirstName: user.firstName,
      LastName: user.lastName,
      PhoneNumber: user.phoneNumber,
      Emails: [
        {
          EmailAddress: user.email,
        },
      ],
      Addresses: [
        {
          Address1: user.street,
          Address2: "",
          Address3: "",
          City: user.city,
          CountryCode: "US",
          PhoneNumber: user.phoneNumber,
          FirstName: user.firstName,
          IsDefault: true,
          LastName: user.lastName,
          PostalCode: user.zipCode,
          State: user.state,
          Type: 0,
        },
      ],
    },
    DateOfBirth: user.dateOfBirth,
    FirstName: user.firstName,
    LastName: user.lastName,
    SocialSecurityNumber: user.ssnNumber,
    CaseType: 0,
    MarketType: 0,
  };

  return basePayloAd;
}
function getIdentityCasePayload(user = {}, refId, sessionId) {
  // mock for test purposes
  // user = {
  //   phoneNumber: "4045049011",
  //   email: "FTESTF@transunion.com",
  //   dateOfBirth: "4/20/1972",
  //   zipCode: "30326",
  //   state: "GA",
  //   city: "ATLANTA",
  //   firstName: "FRANK",
  //   lastName: "TESTF",
  //   street: "600 FRONTIER STREET S UNIT A",
  //   ssnNumber: "666010006",
  // };

  const basePayloAd = {
    CaseNumber: refId,
    SessionId: sessionId,
    Customer: {
      FirstName: user.firstName,
      LastName: user.lastName,
      PhoneNumber: user.phoneNumber,
      Addresses: [
        {
          Address1: user.street,
          Address2: "",
          Address3: "",
          City: user.city,
          CountryCode: "US",
          PhoneNumber: user.phoneNumber,
          FirstName: user.firstName,
          IsDefault: true,
          LastName: user.lastName,
          PostalCode: user.zipCode,
          State: user.state,
          Type: 0,
        },
      ],
      DateOfBirth: user.dateOfBirth,
      FirstName: user.firstName,
      LastName: user.lastName,
      SocialSecurityNumber: user.ssnNumber,
    },
    CaseType: 0,
    MarketType: 0,
  };

  return basePayloAd;
}

async function initiateSession() {
  const options = {
    url: `${config.url}/session`,
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-PublicKey": config.publicKey,
    },
    body: "{}",
  };

  const { SessionId } = await request.post(options).then(JSON.parse);
  sails.log.info("TrueValidate.initiateSession::SessionId", SessionId);

  return SessionId;
}

async function setApiToken(strategy) {
  try {
    // console.log({ tokenExpiration });
    // const isTokenExpired = moment()
    //   .add(1, "minute")
    //   .isAfter(tokenExpiration);
    const isTokenExpired = true;

    if (sessionType === strategy && (!apiToken || isTokenExpired)) {
      const timestamp = moment
        .utc()
        .format("YYYY-MM-DDTHH:mm:ss.SSS")
        .concat("Z");
      const { username, password, url } = config;

      const body = {
        UserName: username,
        Timestamp: timestamp,
        PasswordHash: getHashField(timestamp, password),
        UserNameHash: getHashField(timestamp, username),
      };

      sails.log.info("TrueValidate.setApiToken::Request Data", {
        config,
        body,
      });

      const options = {
        url: `${url}/token`,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      };

      const res = await request.post(options).then(JSON.parse);

      sails.log.info("TrueValidate.setApiToken::response", res);

      const { ExpireAt = null, APIToken = null, Message = null } = res;

      if (APIToken) {
        tokenExpiration = new Date(ExpireAt);
        apiToken = APIToken;

        return APIToken;
      }

      throw new Error(Message || "Failed to request token");
    }
  } catch (err) {
    err = err.stack || err.message || err;
    sails.log.error("TrueValidate.setApiToken", err);
  }
}

function getHeaders() {
  return {
    "Content-Type": "application/json",
    "X-Authorization": `${config.username} ${apiToken}`,
  };
}

async function postKbaAnswers(kbaUrl = "", kbaPayload, caseId) {
  setConfig("kba_otp");
  await setApiToken("kba_otp");
  sails.log.info("TrueValidate.postKbaAnswers::data", {
    kbaUrl,
    kbaPayload,
    caseId,
  });

  const options = {
    url: kbaUrl,
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(kbaPayload),
  };

  await request(options).then(JSON.parse);

  const detailedResponse = await getDetailedValidationResponse(
    caseId,
    "kba_otp"
  );
  sails.log.info(
    "TrueValidate.postKbaAnswers::detailedResponse",
    detailedResponse
  );

  return detailedResponse;
}

async function sendOtpResponseCode(otpResponseUrl = "", code) {
  sails.log.info("TrueValidate.sendOtpResponseCode::data", {
    otpResponseUrl,
    code,
  });
  if (code && otpResponseUrl) {
    setConfig("kba_otp");
    await setApiToken("kba_otp");

    const options = {
      url: otpResponseUrl,
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify({
        Passcode: code,
      }),
    };

    const response = await request(options).then(JSON.parse);
    sails.log.info("TrueValidate.sendOtpResponseCode::response", response);

    return response;
  }
}

async function generateOtpData(screenTracking, user, detailedResponse = true) {
  setConfig("kba_otp");
  await setApiToken("kba_otp");

  const session = await initiateSession();
  const refId = String(Date.now());

  const payload = getPhoneCasePayload(user, refId, session);
  sails.log.info("TrueValidate.generateOtpData::payload", payload);

  const res = await request
    .post(`${config.url}/case`, {
      headers: getHeaders(),
      body: JSON.stringify(payload),
    })
    .then(JSON.parse);

  sails.log.info("TrueValidate.getPhoneCasePayload::response", res);

  if (detailedResponse) {
    const detailedResponse = await getDetailedValidationResponse(
      res.Id,
      "kba_otp"
    );
    sails.log.info(
      "TrueValidate.generateOtpData::DetailedResponse",
      detailedResponse
    );
    return detailedResponse;
  }

  return res;
}

async function requestOtp(screenTracking, user) {
  setConfig("kba_otp");

  const {
    Authentication: { OTP: otpData },
  } = await generateOtpData(screenTracking, user);

  sails.log.info("TrueValidate.requestOtp::otpData", otpData);

  const options = {
    url: otpData.AuthURL,
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({
      DeliveryType: 1,
      Language: 0,
    }),
  };

  const response = await request.post(options).then(JSON.parse);

  sails.log.info("TrueValidate.requestOtp::response", response);

  return response;
}

async function generateKbaUrl(screenTracking, user, detailedResponse = true) {
  setConfig("kba_otp");
  await setApiToken("kba_otp");

  const session = await initiateSession();
  const refId = String(Date.now());

  const payload = getIdentityCasePayload(user, refId, session);

  const res = await request
    .post(`${config.url}/case`, {
      headers: getHeaders(),
      body: JSON.stringify(payload),
    })
    .then(JSON.parse);

  if (detailedResponse) {
    return getDetailedValidationResponse(res.Id, "kba_otp");
  }

  return res;
}

async function validateIdentity(screenTracking, user, detailedResponse = true) {
  try {
    setConfig("identity");
    await setApiToken("identity");

    const session = await initiateSession();
    const refId = String(Date.now());

    const payload = getIdentityCasePayload(user, refId, session);

    const res = await request.post(`${config.url}/case`, {
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });

    const jsonResponse = JSON.parse(res);

    sails.log.info("TrueValidate.validateIdentity::jsonResponse", jsonResponse);

    if (detailedResponse) {
      const detailedResponse = await getDetailedValidationResponse(
        jsonResponse.Id,
        "identity"
      );
      sails.log.info(
        "TrueValidate.validateIdentity::detailedResponse",
        detailedResponse
      );

      return detailedResponse;
    }

    return jsonResponse;
  } catch (err) {
    err = err.stack || err.message || err;
    sails.log.error("TrueValidate#validateIdentity::Error::", err);
    throw err;
  }
}

async function validateUserPhoneEmail(
  screenTracking,
  user,
  detailedResponse = true
) {
  try {
    setConfig("device");
    await setApiToken("device");

    // const session = await initiateSession(); // remove
    let {
      trueValidateSessionId: session,
    } = screenTracking;

    const refId = String(Date.now());

    const payload = getEmailPhoneCasePayload(user, refId, session);

    sails.log.info("TrueValidate.validateUserPhoneEmail::payload", payload);

    const res = await request
      .post(`${config.url}/case`, {
        headers: getHeaders(),
        body: JSON.stringify(payload),
      })
      .then(JSON.parse);

    sails.log.info("TrueValidate.validateUserPhoneEmail::response", res);

    if (detailedResponse) {
      return getDetailedValidationResponse(res.Id, "device");
    }

    return res;
  } catch (err) {
    err = err.stack || err.message || err;
    sails.log.error("TrueValidate.validateUserPhoneEmail", err);
    throw err;
  }
}

async function getDetailedValidationResponse(caseId = "", strategy = "") {
  if (caseId) {
    setConfig(strategy);
    await setApiToken(strategy);

    sails.log.info(
      "TrueValidate.getDetailedValidationResponse::caseId",
      caseId
    );
    sails.log.info(
      "TrueValidate.getDetailedValidationResponse::strategy",
      strategy
    );

    const res = await request
      .get(`${config.url}/detaileddecision/${caseId}`, {
        headers: getHeaders(),
      })
      .then(JSON.parse);

    sails.log.info("TrueValidate.getDetailedValidationResponse::response", res);

    return res;
  }

  throw new Error("CaseId was not provided!");
}
