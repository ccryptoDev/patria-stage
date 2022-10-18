/* global module, sails */

"use strict";

const { mailer: mailerConfig, communicationAdverseConfig } = sails.config;

module.exports = {
  sendMagicLoginLink,
  sendFailedToCreateSignedTermsDocsEmail,
  sendAdverseEmail,
};

async function renderHtml(template, data) {
  return new Promise((resolve, reject) => {
    sails.renderView(template, data, (err, view) => {
      if (err) return reject(err);
      return resolve(view);
    });
  });
}

async function sendMail({ to, subject, html }) {
  return new Promise((resolve, reject) => {
    mailerConfig.transporter.sendMail(
      {
        from: mailerConfig.email_id,
        to,
        subject,
        html,
      },
      (err, info) => {
        if (err) return reject(err);
        return resolve(info);
      }
    );
  });
}

async function sendMagicLoginLink({ email }, userJwtToken = "") {
  const { env } = sails.config;

  const html = await renderHtml("emailTemplates/login", {
    link: `${env.REACT_APP_BASE_URL}/application/login/magic?userToken=${userJwtToken}`,
    baseUrl: env.REACT_APP_BASE_URL,
  });

  await sendMail({
    to: email,
    subject: "Continue your loan application",
    html,
  });
}

async function sendFailedToCreateSignedTermsDocsEmail(userEmail) {
  //todo: add email template
  // const html = await renderHtml("template_path", {});
  await sendMail({
    to: userEmail,
    subject: "Failed to create signed documents",
    html: "Failed to create signed documents",
  });
}

async function sendAdverseEmail(emailCode, emailData, userData) {
  const emailConfig = communicationAdverseConfig[emailCode];

  if (emailConfig) {
    Object.assign(emailData, {
      emailTemplate: `emailTemplates/${emailCode}.nunjucks`,
      includesFederalDisclosure: emailConfig.includesFederalDisclosure,
      baseUrl: sails.config.env.REACT_APP_BASE_URL,
    });

    if (emailConfig.emailDataValidator) {
      const validation = emailConfig.emailDataValidator.validate(emailData);

      if (validation.error) {
        throw new Error(validation.error);
      }
    }

    const html = await renderHtml(`emailTemplates/index`, emailData);

    await sendMail({
      to: userData.email,
      html,
      subject: emailConfig.subject,
    });

    return true;
  }

  throw new Error("Invalid emailCode");
}
