/* global module, sails */

"use strict";

const { communicationAdverseConfig, textMessages, messenger } = sails.config;

module.exports = {
  sendAdverseSMS,
};

async function sendAdverseSMS(communicationCode, data, user) {
  const { smsDataValidator } = communicationAdverseConfig[communicationCode];

  if (smsDataValidator) {
    const validation = smsDataValidator.validate(data);

    if (validation.error) {
      throw new Error(validation.error);
    }
  }

  return messenger.sendSMS({
    message: textMessages[communicationCode]
      .replace("{{LINK}}", data.smsLink)
      .replace("{{TRIBE}}", sails.config.tribe.firstName),
    toNumber: user.phoneNumber,
  });
}
