/**
 * Production environment settings
 *
 * This file can include shared settings for a production environment,
 * such as API keys or remote database passwords.  If you're using
 * a version control solution for your Sails app, this file will
 * be committed to your repository unless you add it to your .gitignore
 * file.  If your repository will be publicly viewable, don't add
 * any private information to this file!
 *
 */

module.exports = {
  port: 8000,
  isSandbox: false,
  isTwilioEnabled: false,
  sandGridApiKey:
    "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",
  MANDRILL_API_KEY: "KiX_5vJyNMfITIf3yF6NvA",
  MANDRILL_FROM_EMAIL: "no-reply@patrialending.com",
  TWILIO_ACCOUNT_SID: "ACf09676ad21bbb20e26edf074c1cbc5bb",
  TWILIO_AUTH_TOKEN: "3547a59dd8a768cca3a4a52b3753ce50",
  TWILIO_PHONE_NUMBER: "+14158256295",
  env: {
    TOKEN_SECRET:
      "14495376e5f661f3d7c525cfedda17c07a548aff5559733810f7ceeba39a82137253adc9b017025b5c6d8cd7f30aa74611d0ae0895e25f67725291ac59927c67",
    REACT_APP_BASE_URL: "https://patrialending.com",
    REACT_APP_ADMIN_BASE_URL: "https://lms-api.patrialending.com",
  },
  tribe: {
    firstName: "Patria",
    firstNameCaps: "PATRIA",
    name: "Patria Lending LLC",
    addressLine1: "8151 Highway 177",
    addressLine2: "Red Rock, Oklahoma 74651",
    legalEmail: "legal@patrialending.com",
    mailTo: "mailto: legal@patrialending.com",
    email: "CustomerCare@PatriaLending.com",
  },
};
