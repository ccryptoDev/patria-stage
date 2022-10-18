const Joi = require("joi");

const communicationAdverseConfig = {
  DA: {
    subject: "Loan Request",
    includesFederalDisclosure: false,
  },
  BSA: {
    includesFederalDisclosure: true,
    subject: "Loan Request",
  },
  CCA: {
    includesFederalDisclosure: true,
    subject: "Loan Request",
  },
  CCB: {
    includesFederalDisclosure: false,
    subject: "Loan Request",
  },
  CCC: {
    includesFederalDisclosure: true,
    subject: "Loan Request",
  },
  FB: {
    includesFederalDisclosure: true,
    subject: "Loan Request",
  },
  CLA: {
    includesFederalDisclosure: true,
    subject: "Loan Request",
  },
  CLB: {
    includesFederalDisclosure: true,
    subject: "Loan Request",
  },
  TUAL: {
    subject: "Loan Retriever Request",
    includesFederalDisclosure: false,
    sendTextMessage: true,
    emailDataValidator: Joi.object({
      completeApplicationLink: Joi.string().required(),
    }).unknown(),
    smsDataValidator: Joi.object({
      smsLink: Joi.string().required(),
    }).unknown(),
  },
  TUBL: {
    subject: "Loan Retriever Request",
    includesFederalDisclosure: false,
    sendTextMessage: true,
    emailDataValidator: Joi.object({
      completeApplicationLink: Joi.string().required(),
    }).unknown(),
    smsDataValidator: Joi.object({
      smsLink: Joi.string().required(),
    }).unknown(),
  },
  NED: {
    subject: "Status Update",
    includesFederalDisclosure: true,
  },
  TUA: {
    subject: "Action Required",
    includesFederalDisclosure: false,
    sendTextMessage: true,
    emailDataValidator: Joi.object({
      completeApplicationLink: Joi.string().required(),
    }).unknown(),
    smsDataValidator: Joi.object({
      smsLink: Joi.string().required(),
    }).unknown(),
  },
  TUB: {
    subject: "Action Required",
    includesFederalDisclosure: false,
    sendTextMessage: true,
    emailDataValidator: Joi.object({
      completeApplicationLink: Joi.string().required(),
    }).unknown(),
    smsDataValidator: Joi.object({
      smsLink: Joi.string().required(),
    }).unknown(),
  },
  TUD: {
    subject: "Status Update",
    includesFederalDisclosure: true,
  },
  TUE: {
    subject: "Status Update",
    includesFederalDisclosure: true,
  },
  MI: {
    subject: "Status Update",
    includesFederalDisclosure: true,
  },
  CRAL: {
    subject: "Loan Retriever Request",
    includesFederalDisclosure: true,
  },
  CRBL: {
    subject: "Loan Retriever Request",
    includesFederalDisclosure: true,
  },
  CRCL: {
    subject: "Loan Retriever Request",
    includesFederalDisclosure: true,
    emailDataValidator: Joi.object({
      clarityRiskScore: Joi.number().required(),
    }).unknown(),
  },
  CRA: {
    subject: "Status Update",
    includesFederalDisclosure: true,
  },
  CRB: {
    subject: "Status Update",
    includesFederalDisclosure: true,
  },
  CRC: {
    subject: "Status Update",
    includesFederalDisclosure: true,
    emailDataValidator: Joi.object({
      clarityRiskScore: Joi.number().required(),
    }).unknown(),
  },
  FTAL: {
    subject: "Loan Retriever Request",
    includesFederalDisclosure: true,
  },
  FTBL: {
    subject: "Loan Retriever Request",
    includesFederalDisclosure: true,
  },
  FTA: {
    subject: "Status Update",
    includesFederalDisclosure: true,
  },
  FTB: {
    subject: "Status Update",
    includesFederalDisclosure: true,
  },
  DSL: {
    subject: "Loan Retriever Request",
    includesFederalDisclosure: true,
    emailDataValidator: Joi.object({
      factorTrustRiskScore: Joi.string().required(),
      clarityRiskScore: Joi.number().required(),
    }).unknown(),
  },
  DSO: {
    subject: "Status Update",
    includesFederalDisclosure: true,
    emailDataValidator: Joi.object({
      factorTrustRiskScore: Joi.string().required(),
      clarityRiskScore: Joi.number().required(),
    }).unknown(),
  },
  COAL: {
    subject: "Loan Retriever Request",
    includesFederalDisclosure: false,
    sendTextMessage: true,
    emailDataValidator: Joi.object({
      completeApplicationLink: Joi.string().required(),
    }).unknown(),
    smsDataValidator: Joi.object({
      smsLink: Joi.string().required(),
    }).unknown(),
  },
  COA: {
    subject: "Congratulations!",
    includesFederalDisclosure: false,
    sendTextMessage: true,
    emailDataValidator: Joi.object({
      completeApplicationLink: Joi.string().required(),
    }).unknown(),
    smsDataValidator: Joi.object({
      smsLink: Joi.string().required(),
    }).unknown(),
  },
  COB: {
    subject: "Status Update",
    includesFederalDisclosure: true,
    sendTextMessage: true,
    smsDataValidator: Joi.object({
      smsLink: Joi.string().required(),
    }).unknown(),
  },
  BDA: {
    subject: "Status Update",
    includesFederalDisclosure: true,
  },
  BDB: {
    subject: "Status Update",
    includesFederalDisclosure: true,
  },
  BDC: {
    subject: "Status Update",
    includesFederalDisclosure: true,
  },
  BDD: {
    subject: "Status Update",
    includesFederalDisclosure: true,
  },
  QRA: {
    subject: "Status Update",
    includesFederalDisclosure: false,
  },
  SPB: {
    subject: "Status Update",
    includesFederalDisclosure: true,
  },
  QRB: {
    subject: "Status Update",
    includesFederalDisclosure: true,
  },
  QRC: {
    subject: "Status Update",
    includesFederalDisclosure: false,
    sendTextMessage: true,
    smsDataValidator: Joi.object({
      smsLink: Joi.string().required(),
    }).unknown(),
  },
  QRE: {
    subject: "Status Update",
    includesFederalDisclosure: false,
    sendTextMessage: true,
    smsDataValidator: Joi.object({
      smsLink: Joi.string().required(),
    }).unknown(),
  },
  QRG: {
    subject: "Status Update",
    includesFederalDisclosure: false,
    sendTextMessage: true,
    smsDataValidator: Joi.object({
      smsLink: Joi.string().required(),
    }).unknown(),
  },
  QRI: {
    subject: "Status Update",
    includesFederalDisclosure: false,
    sendTextMessage: true,
    smsDataValidator: Joi.object({
      smsLink: Joi.string().required(),
    }).unknown(),
  },
  FI: {
    subject: "Status Update",
    includesFederalDisclosure: false,
    sendTextMessage: true,
    smsDataValidator: Joi.object({
      smsLink: Joi.string().required(),
    }).unknown(),
  },
  NEE: {
    subject: "Status Update",
    includesFederalDisclosure: true,
  },
  NEA: {
    subject: "Status Update",
    includesFederalDisclosure: true,
  },
  NEB: {
    subject: "Status Update",
    includesFederalDisclosure: false,
    sendTextMessage: true,
    smsDataValidator: Joi.object({
      smsLink: Joi.string().required(),
    }).unknown(),
  },
  NEC: {
    subject: "Status Update",
    includesFederalDisclosure: false,
    sendTextMessage: true,
    smsDataValidator: Joi.object({
      smsLink: Joi.string().required(),
    }).unknown(),
  },
  CL: {
    subject: "Status Update",
    includesFederalDisclosure: true,
  },
  NSD: {
    subject: "Status Update",
    includesFederalDisclosure: true,
  },
  NSM: {
    subject: "Status Update",
    includesFederalDisclosure: true,
  },
  NSF: {
    subject: "Status Update",
    includesFederalDisclosure: true,
  },
  CBA: {
    subject: "Status Update",
    includesFederalDisclosure: false,
    sendTextMessage: true,
    smsDataValidator: Joi.object({
      smsLink: Joi.string().required(),
    }).unknown(),
  },
  TLA: {
    subject: "Status Update",
    includesFederalDisclosure: true,
  },
  TLB: {
    subject: "Status Update",
    includesFederalDisclosure: false,
    sendTextMessage: true,
    smsDataValidator: Joi.object({
      smsLink: Joi.string().required(),
    }).unknown(),
  },
  PA: {
    subject: "Status Update",
    includesFederalDisclosure: true,
  },
  DDA: {
    subject: "Status Update",
    includesFederalDisclosure: true,
  },
  DDB: {
    subject: "Status Update",
    includesFederalDisclosure: false,
  },
  LDA: {
    subject: "Get Your Money!",
    includesFederalDisclosure: false,
    sendTextMessage: true,
    emailDataValidator: Joi.object({
      completeApplicationLink: Joi.string().required(),
    }).unknown(),
    smsDataValidator: Joi.object({
      smsLink: Joi.string().required(),
    }).unknown(),
  },
  LDB: {
    subject: "Status Update",
    includesFederalDisclosure: false,
  },
  ISA: {
    subject: "Loan Request",
    includesFederalDisclosure: false,
    sendTextMessage: true,
  },
};

const textMessages = {
  TUAL:
    "We received your information from Loan Retriever. Please click the link below to complete the verification process. ({{LINK}}) Thank you, {{TRIBE}} Lending. Reply STOP to Opt-out.",
  TUBL:
    "We received your information from Loan Retriever. Please click the link below to complete the verification process. ({{LINK}}) Thank you, {{TRIBE}} Lending. Reply STOP to Opt-out.",
  TUA:
    "Additional information is needed to complete your application. Please click the link below to proceed. ({{LINK}}) Thank you, {{TRIBE}} Lending. Reply STOP to Opt-out.",
  TUB:
    "Additional information is needed to complete your application. Please click the link below to proceed. ({{LINK}}) Thank you, {{TRIBE}} Lending. Reply STOP to Opt-out.",
  COAL:
    "Congratulations! We received your information from Loan Retriever. You have been conditionally approved for your loan. Please click the link below to complete your application. ({{LINK}}) Thank you, {{TRIBE}} Lending. Reply STOP to Opt-out.",
  COA:
    "Congratulations! You have been conditionally approved for your loan. Please click the link below to complete your application. ({{LINK}}) Thank you, {{TRIBE}} Lending. Reply STOP to Opt-out.",
  COB:
    "As a reminder, your loan has been conditionally approved pending completion of your application. Please click the link below to proceed. ({{LINK}}) Thank you, {{TRIBE}} Lending. Reply STOP to Opt-out.",
  QRC:
    "Additional information is needed to complete your application. Please click the link below to proceed. ({{LINK}}) Thank you, {{TRIBE}} Lending. Reply STOP to Opt-out.",
  QRE:
    "Additional information is needed to complete your application. Please click the link below to proceed. ({{LINK}}) Thank you, {{TRIBE}} Lending. Reply STOP to Opt-out.",
  QRG:
    "Additional information is needed to complete your application. Please click the link below to proceed. ({{LINK}}) Thank you, {{TRIBE}} Lending. Reply STOP to Opt-out.",
  QRI:
    "Additional information is needed to complete your application. Please click the link below to proceed. ({{LINK}}}) Thank you, {{TRIBE}} Lending. Reply STOP to Opt-out.",
  FI:
    "Additional information is needed to complete your application. Please click the link below to proceed. ({{LINK}}) Thank you, {{TRIBE}} Lending. Reply STOP to Opt-out.",
  NEB:
    "Additional information is needed to complete your application. Please click the link below to proceed. ({{LINK}}) Thank you, {{TRIBE}} Lending. Reply STOP to Opt-out.",
  NEC:
    "Congratulation! You have been approved. Please click the link below to see your loan offer. ({{LINK}}) Thank you, {{TRIBE}} Lending. Reply STOP to Opt-out.",
  CBA:
    "Additional information is needed to complete your application. Please click the link below to proceed. ({{LINK}}) Thank you, {{TRIBE}} Lending. Reply STOP to Opt-out.",
  TLB:
    "Additional information is needed to complete your application. Please click the link below to proceed. ({{LINK}}) Thank you, {{TRIBE}} Lending. Reply STOP to Opt-out.",
  LDA:
    "Congratulations! You have been approved for your loan. Please click the link below to sign your loan documents. ({{LINK}}) Thank you, {{TRIBE}} Lending. Reply STOP to Opt-out.",
  ISA:
    "As a friendly reminder, your application is pending completion. Thank you, {{TRIBE}} Lending. Reply STOP to Opt-out.",
};

module.exports = {
  communicationAdverseConfig,
  textMessages,
};
