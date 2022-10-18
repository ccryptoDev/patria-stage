"use strict";

const sails = require("sails");
const twilio = require("twilio");
const nodemailer = require("nodemailer");
const mandrillTransport = require('nodemailer-mandrill-transport');
const jwt = require("jsonwebtoken");

const prodConfig = require(`./env/production`);
const prodApiKey = prodConfig && prodConfig.sandGridApiKey;

if (!sails.config) {
  sails.config = { environment: "development" };
}
if (!sails.config.environment) {
  sails.config.environment = "development";
}
const currentEnv = sails.config["environment"];
const currentEnvConfig = require(`./env/${currentEnv}`);
const ApiKey =
  (currentEnvConfig && currentEnvConfig.sandGridApiKey) || prodApiKey;

if (!ApiKey || typeof ApiKey !== "string")
  throw new Error(`Sendgrid API key is required!`);

const {
  TWILIO_ACCOUNT_SID: accountSid,
  TWILIO_AUTH_TOKEN: authToken,
  TWILIO_PHONE_NUMBER: phoneNumber,
  MANDRILL_API_KEY: mandrillApiKey,
  MANDRILL_FROM_EMAIL: mandrillFromEmail,
} = currentEnvConfig;

const transporter = nodemailer.createTransport(mandrillTransport({
  auth: {
    apiKey: mandrillApiKey
  }
}));

const twilioClient = twilio(accountSid, authToken, {
  logLevel: "debug",
});

module.exports.mailer = {
  email_id: mandrillFromEmail,
  transporter,
};

module.exports.messenger = {
  async sendSMS({ message, toNumber }) {
    if (message && toNumber) {
      return twilioClient.messages
        .create({ body: message, from: phoneNumber, to: toNumber })
        .then((message) => sails.log.info("textMessages#sendSMS::", message))
        .catch((error) => {
          sails.log.error(
            "textMessages#sendSMS::",
            "##Failed to send SMS##",
            error
          );
          throw Error(error.message || error);
        });
    }

    throw new Error("Missing required parameters!");
  },
};

module.exports.getMagicLoginLink = function (screenTracking, user) {
  if (screenTracking && user) {
    const { env } = sails.config;
    const userToken = jwt.sign(
      {
        screenTrackingId: screenTracking.id,
        user: {
          id: user.id,
          email: user.email,
        },
      },
      env.TOKEN_SECRET,
      { expiresIn: 604800 }
    );

    const magicLoginLink = `${env.REACT_APP_BASE_URL}/application/login/magic?userToken=${userToken}`;

    return magicLoginLink;
  }

  throw new Error("screenTracking and user parameters are required!");
}