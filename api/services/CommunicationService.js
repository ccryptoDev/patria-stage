const Screentracking = require("../models/Screentracking");
const EmailService = require("./EmailService");
const TextMessagesService = require("./TextMessagesService");

module.exports = {
  sendApplicationCommunication,
};

async function sendApplicationCommunication({
  communicationCode,
  user = {},
  data = {},
  screenTracking,
}) {
  const { communicationAdverseConfig } = sails.config;

  const promises = [];

  const communicationConfig = communicationAdverseConfig[communicationCode];

  if (communicationConfig) {
    promises.push(
      EmailService.sendAdverseEmail(communicationCode, data, user)
    );
  }

  const shouldSendTextMessage = communicationConfig?.sendTextMessage;
  if (shouldSendTextMessage) {
    promises.push( 
      TextMessagesService.sendAdverseSMS(communicationCode, data, user)
    );
  } 

  if (
    screenTracking &&
    !screenTracking.hasPriorCommunication) {
    await Object.assign(screenTracking, { hasPriorCommunication: true }).save();
  }

  await Promise.all(promises).catch(console.error);
}
