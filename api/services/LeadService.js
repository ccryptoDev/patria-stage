/* global sails Lead Campaign OffersService User LeadConfig Blocklist */
/**
 * Lead Controller
 *
 * @description :: Server-side logic for parsing inbound leads
 */

const moment = require("moment");
const redis = require("ioredis");
const Holidays = require("date-holidays");
const Screentracking = require("../models/Screentracking");
const User = require("../models/User");
const PracticeManagement = require("../models/PracticeManagement");
const PaymentManagement = require("../models/PaymentManagement");
const { LEAD_STATUS } = require("../models/Lead");
const jwt = require("jsonwebtoken");
const {
  processRules,
  getRulesByRulesNumber,
  UNDERWRITING_RULES,
  handleRuleResponse,
} = require("./underwriting_steps/helpers");
const hd = new Holidays();
hd.init("US");

module.exports = {
  postLead,
  refreshConfig: refreshConfig,
  identifyCampaign: identifyCampaign,
  evaluateLead: evaluateLead,
  getStats: getStats,
  getCampaignStats: getCampaignStats,
  setGlobalLimit: setGlobalLimit,
  getGlobalLimit: getGlobalLimit,
  setHoursRange: setHoursRange,
  setCampaignLimit: setCampaignLimit,
  getCampaignLimit: getCampaignLimit,
  setConfigProperty: setConfigProperty,
  getConfigProperty: getConfigProperty,
  getConfig: getConfig,
  getDeniedLeadApiDetails: getDeniedLeadApiDetails,
};

const DAYS_MAX = 90;
const TIE_BREAKERS = 100;
const MILLISECONDS = 1000;
const SECONDS_1_DAYS = 24 * 60 * 60;
const SECONDS_2_DAYS = 2 * SECONDS_1_DAYS;
const SECONDS_30_DAYS = 30 * SECONDS_1_DAYS;
const SLIDE_30_DAYS = SECONDS_30_DAYS * MILLISECONDS * TIE_BREAKERS;

const RDS_CLIENTS = [];
let LAST_TIME_STAMP = 0;
let LAST_TIME_STAMP_SUFFIX = 0;
const incomeTypesEnum = {
  disability: "disability_income",
  social_security: "social_security",
  employed: "employed",
  unemployed: "unemployed",
  pension: "pension",
  others: "others",
};

const employmentStatusEnum = {
  full_time: "full_time",
  part_time: "part_time",
};
const paymentFrequency = {
  B: "BI-WEEKLY",
  M: "MONTHLY",
  S: "SEMI-MONTHLY",
  W: "WEEKLY",
};
function days30SlideId(purchased) {
  return `SLIDECOUNTER|TOTAL|DAYS30|${purchased ? "PURCHASED" : "SEEN"}`;
}

function days30CampaignSlideId(campaign, purchased) {
  return `SLIDECOUNTER|CAMPAIGN|${campaign}|DAYS30|${
    purchased ? "PURCHASED" : "SEEN"
  }`;
}

function todayId(momt, purchased) {
  return `COUNTER|TOTAL|TODAY|${momt.format("YYYY-MM-DD")}|${
    purchased ? "PURCHASED" : "SEEN"
  }`;
}

function todayCampaignId(momt, campaign, purchased) {
  return `COUNTER|CAMPAIGN|${campaign}|TODAY|${momt.format("YYYY-MM-DD")}|${
    purchased ? "PURCHASED" : "SEEN"
  }`;
}

function duplicateId(user, prop) {
  let value;
  switch (prop) {
    case "SSN":
      value = "SSN|" + user.ssn;
      break;
    case "EMAIL":
      value = "EMAIL|" + user.email;
      break;
    case "MOBILE":
      value = "MOBILE|" + user.mobPhone;
      break;
  }
  return `BLOCK|DUPLICATE|${value}`;
}

function blocklistId(user) {
  if (user && user.ssn && user.ssn.split) {
    const ssn = user.ssn.split("-").join("");
    return `BLOCK|BLOCKLIST|SSN|${ssn}`;
  }
}

function blocklistLastUpdateId() {
  return "BLOCK|BLOCKLISTLASTUPDATE";
}

function hourId(momt, purchased, hour) {
  if (hour != undefined) {
    let hourstr;
    if (hour < 10) {
      hourstr = "0";
    } else {
      hourstr = "";
    }
    hourstr = hourstr + hour.toString();
    return `COUNTER|TOTAL|HOUR|${momt.format("YYYY-MM-DD")}:${hourstr}|${
      purchased ? "PURCHASED" : "SEEN"
    }`;
  } else {
    return `COUNTER|TOTAL|HOUR|${momt.format("YYYY-MM-DD:HH")}|${
      purchased ? "PURCHASED" : "SEEN"
    }`;
  }
}

function getTimeStamp() {
  const slideScore = Date.now();
  let artificial = slideScore * TIE_BREAKERS;
  if (slideScore == LAST_TIME_STAMP) {
    /*
			More than one lead has been received in the same millisecond.
			The sliding window code requires each event to have a unique score
			in redis.  This code increments the timestamp (score) to make it
			unique. Roll-over becomes a possibility if more than TIE_BREAKERS leads are
			processed in the same millisecond.
		*/
    LAST_TIME_STAMP_SUFFIX += 1;
    artificial += LAST_TIME_STAMP_SUFFIX;
  } else {
    LAST_TIME_STAMP_SUFFIX = 0;
  }
  LAST_TIME_STAMP = slideScore;
  return artificial;
}

async function acquireRdsClient() {
  if (RDS_CLIENTS.length) {
    const cli = RDS_CLIENTS.pop();
    return cli;
  }
  const rds = redis.createClient();
  return rds;
}

async function releaseRdsClient(client) {
  RDS_CLIENTS.push(client);
}

async function refreshConfig() {
  CONFIG = await getConfig();
  CAMPAIGN = await getCampaignConfig();
}

class LeadError extends Error {
  constructor(
    message,
    stage = 0,
    details = null,
    block = false,
    userid = null
  ) {
    super(message);
    this.id = "lead";
    this.stage = stage;
    this.details = details;
    this.block = block;
    this.userid = userid;
  }
}

function identifyCampaign(lead) {
  let campaign = "";
  if (!lead || !lead.referral || !lead.referral.channelId) {
    campaign = "UNIDENTIFIED";
  } else {
    campaign = lead.referral.channelId;
    const referral = lead.referral;
    if (referral.affSubId) {
      campaign += ":" + referral.affSubId;
    }
  }
  return campaign;
}

async function saveCampaign(campaign, referral, defaultLimit = 0) {
  const campdata = await Campaign.findOne({ name: campaign });
  if (!campdata) {
    await Campaign.create({
      name: campaign,
      limitToday: defaultLimit,
      limit30Days: defaultLimit,
      referral: referral,
    });
  }
}

function validate(lead) {
  if (!lead) {
    return {
      type: "Invalid JSON",
      name: "payload",
    };
  }
  if (!lead.referral) {
    return {
      type: "Missing Property",
      name: "referral",
    };
  }
  if (!lead.customer) {
    return {
      type: "Missing Property",
      name: "customer",
    };
  }
  if (!lead.customer.loan) {
    return {
      type: "Missing Property",
      name: "customer.loan",
    };
  }

  if (!lead.customer.loan.loanAmount) {
    return {
      type: "Missing Property",
      name: "customer.loan.loanAmount",
    };
  } else if (
    lead.customer.loan.loanAmount >
    sails.config.loanDetails.maximumRequestedLoanAmount
  ) {
    return {
      type: `Exceeds Maximum`,
      name: "customer.loan.loanAmount",
    };
  } else if (
    lead.customer.loan.loanAmount <
    sails.config.loanDetails.minimumRequestedLoanAmount
  ) {
    return {
      type: `Below Minimum`,
      name: "customer.loan.loanAmount",
    };
  }

  if (!lead.customer.personal) {
    return {
      type: "Missing Property",
      name: "customer.personal",
    };
  } else {
    const user = lead.customer.personal;
    if (!user.ssn) {
      return {
        type: "Missing Property",
        name: "customer.personal.ssn",
      };
    } else {
      if (user.ssn.replace(/[^0-9]/g, "").length < 9) {
        return {
          type: "Invalid Property",
          name: "customer.personal.ssn",
          value: user.ssn.replace(/[^0-9]/g, ""),
        };
      }
      // return {
      // 	type: "Missing Property",
      // 	name: "customer.personal.ssn"
      // };
    }
    if (!user.dob) {
      return {
        type: "Missing Property",
        name: "customer.personal.dob",
      };
    } else if (!moment(user.dob, "MM-DD-YYYY").isValid()) {
      return {
        type: "Invalid Property",
        name: "customer.personal.dob",
        value: user.dob,
      };
    }
    if (!user.firstName) {
      return {
        type: "Missing Property",
        name: "customer.personal.firstName",
      };
    }
    if (!user.lastName) {
      return {
        type: "Missing Property",
        name: "customer.personal.lastName",
      };
    }
    if (!user.address) {
      return {
        type: "Missing Property",
        name: "customer.personal.address",
      };
    }
    if (!user.city) {
      return {
        type: "Missing Property",
        name: "customer.personal.city",
      };
    }
    if (!user.state) {
      return {
        type: "Missing Property",
        name: "customer.personal.state",
      };
    }
    if (!user.zip) {
      return {
        type: "Missing Property",
        name: "customer.personal.zip",
      };
    }
    if (!user.email) {
      return {
        type: "Missing Property",
        name: "customer.personal.email",
      };
    }
    if (!user.homePhone && !user.mobilePhone) {
      return {
        type: "Missing Property",
        name: "customer.personal.mobilePhone and customer.personal.homePhone",
      };
    }
  }

  if (
    !lead.customer.employment ||
    Object.keys(lead.customer.employment).length === 0
  ) {
    return {
      type: "Missing Property",
      name: "lead.customer.employment",
    };
  }
  if (!lead.customer.bank || Object.keys(lead.customer.bank).length === 0) {
    return {
      type: "Missing Property",
      name: "lead.customer.bank",
    };
  }

  const employmentErrors = [];
  if (!!lead.customer.employment) {
    if (
      !lead.customer.employment.monthlyIncome &&
      !!lead.customer.loan.monthlyIncome
    ) {
      lead.customer.employment["monthlyIncome"] =
        lead.customer.loan.monthlyIncome;
    }

    if (!lead.customer.employment.monthlyIncome) {
      employmentErrors.push({
        type: "Missing Property",
        name: "lead.customer.employment.monthlyIncome",
      });
    } else if (
      isNaN(lead.customer.employment.monthlyIncome) ||
      $ize(lead.customer.employment.monthlyIncome) === 0
    ) {
      employmentErrors.push({
        type: "Invalid Property",
        name: "lead.customer.employment.monthlyIncome",
        value: lead.customer.employment.monthlyIncome,
      });
    }
    if (
      !!lead.customer.employment.typeOfIncome &&
      !incomeTypesEnum[lead.customer.employment.typeOfIncome]
    ) {
      employmentErrors.push({
        type: "Invalid Property",
        name: "lead.customer.employment.typeOfIncome",
        value: lead.customer.employment.typeOfIncome,
      });
    } else if (!lead.customer.employment.typeOfIncome) {
      employmentErrors.push({
        type: "Missing Property",
        name: "lead.customer.employment.typeOfIncome",
      });
    }
    if (
      !!lead.customer.employment.employerStatus &&
      !employmentStatusEnum[lead.customer.employment.employerStatus]
    ) {
      employmentErrors.push({
        type: "Invalid Property",
        name: "lead.customer.employment.employerStatus",
        value: lead.customer.employment.employerStatus,
      });
    }
    if (!lead.customer.employment.employerName) {
      employmentErrors.push({
        type: "Missing Property",
        name: "lead.customer.employment.employerName",
      });
    }
    if (!lead.customer.employment.lastPayDate) {
      employmentErrors.push({
        type: "Missing Property",
        name: "lead.customer.employment.lastPayDate",
      });
    } else if (
      !moment(lead.customer.employment.lastPayDate, "MM-DD-YYYY").isValid()
    ) {
      employmentErrors.push({
        type: "Invalid Property",
        name: "lead.customer.employment.lastPayDate",
        value: lead.customer.employment.lastPayDate,
      });
    }
    if (!lead.customer.employment.nextPayDate) {
      employmentErrors.push({
        type: "Missing Property",
        name: "lead.customer.employment.nextPayDate",
      });
    } else if (
      !moment(lead.customer.employment.nextPayDate, "MM-DD-YYYY").isValid()
    ) {
      employmentErrors.push({
        type: "Invalid Property",
        name: "lead.customer.employment.nextPayDate",
        value: lead.customer.employment.nextPayDate,
      });
    }
    if (
      !!lead.customer.employment.secondPayDate &&
      !moment(lead.customer.employment.secondPayDate, "MM-DD-YYYY").isValid()
    ) {
      employmentErrors.push({
        type: "Invalid Property",
        name: "lead.customer.employment.secondPayDate",
        value: lead.customer.employment.secondPayDate,
      });
    }
    if (!lead.customer.employment.employerPhone) {
      employmentErrors.push({
        type: "Missing Property",
        name: "lead.customer.employment.employerPhone",
      });
    }
    if (!lead.customer.employment.jobTitle) {
      employmentErrors.push({
        type: "Missing Property",
        name: "lead.customer.employment.jobTitle",
      });
    }
    if (!lead.customer.employment.payFrequency) {
      employmentErrors.push({
        type: "Missing Property",
        name: "lead.customer.employment.payFrequency",
      });
    }
  }
  if (employmentErrors.length > 0) {
    return {
      type: "Invalid Property",
      name: "lead.customer.employment",
      value: employmentErrors,
    };
  }
  const bankErrors = [];
  if (lead.customer.bank) {
    if (!lead.customer.bank.accountNumber) {
      bankErrors.push({
        type: "Missing Property",
        name: "lead.customer.bank.accountNumber",
      });
    } else if (
      isNaN(lead.customer.bank.accountNumber) ||
      lead.customer.bank.accountNumber.length < 5 ||
      lead.customer.bank.accountNumber.length > 15
    ) {
      bankErrors.push({
        type: "Invalid Property",
        name: "lead.customer.bank.accountNumber",
        value: lead.customer.bank.accountNumber,
        rule: "Invalid account number format",
      });
    } else if (allEqual(lead.customer.bank.accountNumber)) {
      bankErrors.push({
        type: "Invalid Property",
        name: "lead.customer.bank.accountNumber",
        value: lead.customer.bank.accountNumber,
        rule: "Invalid account number format",
      });
    }
    if (!lead.customer.bank.routingNumber) {
      bankErrors.push({
        type: "Missing Property",
        name: "lead.customer.bank.routingNumber",
      });
    } else if (!validateABARouting(lead.customer.bank.routingNumber)) {
      bankErrors.push({
        type: "Invalid Property",
        name: "lead.customer.bank.routingNumber",
        value: lead.customer.bank.routingNumber,
        rule: "Invalid routing number format",
      });
    }
    if (!lead.customer.bank.bankName) {
      bankErrors.push({
        type: "Missing Property",
        name: "lead.customer.bank.bankName",
      });
    }
    if (!lead.customer.bank.accountType) {
      bankErrors.push({
        type: "Missing Property",
        name: "lead.customer.bank.accountType",
      });
    } else if (
      lead.customer.bank.accountType
        .trim()
        .toLowerCase()
        .indexOf("saving") >= 0
    ) {
      bankErrors.push({
        type: "Invalid Property",
        name: "lead.customer.bank.accountType",
        value: lead.customer.bank.accountType,
        rule: "Account should not be a savings account",
      });
    }
    if (
      lead.customer.bank.directDeposit === undefined ||
      lead.customer.bank.directDeposit === null ||
      lead.customer.bank.directDeposit === ""
    ) {
      bankErrors.push({
        type: "Missing Property",
        name: "lead.customer.bank.directDeposit",
      });
    } else if (lead.customer.bank.directDeposit !== true) {
      bankErrors.push({
        type: "Invalid Property",
        name: "lead.customer.bank.directDeposit",
        value: lead.customer.bank.directDeposit,
        rule: "Needs to be a direct deposit account.",
      });
    }
  }
  if (bankErrors.length > 0) {
    return {
      type: "Invalid Property",
      name: "lead.customer.bank",
      value: bankErrors,
    };
  }

  return null;
}

function validateABARouting(aba) {
  if (typeof aba === "number") {
    aba = aba.toString();
  }
  let n = 0;
  for (let i = 0; i < aba.length; i += 3) {
    n +=
      parseInt(aba.charAt(i), 10) * 3 +
      parseInt(aba.charAt(i + 1), 10) * 7 +
      parseInt(aba.charAt(i + 2), 10);
  }
  // If the resulting sum is an even multiple of ten (but not zero), the aba routing number is good.
  return n != 0 && n % 10 == 0;
}

function allEqual(input) {
  const str = input.toString();
  const strArray = str.split("");
  return strArray.every((char) => {
    return char === str[0];
  });
}

function mapUserData(userObj) {
  const user = {
    ssn_number: userObj.ssn,
    dateofBirth: moment(userObj.dob, "MM-DD-YYYY").format("YYYY-MM-DD"),
    firstname: userObj.firstName,
    lastname: userObj.lastName,
    street: userObj.address,
    city: userObj.city,
    state: userObj.state,
    zipCode: userObj.zip,
    email: userObj.email,
    phoneNumber: userObj.homePhone || userObj.mobilePhone,
    mobileNumber: userObj.mobilePhone,
    idState: userObj.issuedIdState,
    stateIdNumber: userObj.issuedIdNumber,
    isFromLeadApi: true,
  };

  return user;
}

function mapEmploymentData(empObj, applicationData) {
  const employment = {
    typeOfIncome:
      !!empObj.typeOfIncome && !!incomeTypesEnum[empObj.typeOfIncome]
        ? empObj.typeOfIncome
        : incomeTypesEnum.employed,
    employerName: empObj.employerName,
    employerPhone: empObj.employerPhone,
    employerStatus:
      !!empObj.employerStatus && !!employmentStatusEnum[empObj.employerStatus]
        ? empObj.employerStatus
        : employmentStatusEnum.full_time,
    payFrequency:
      !!empObj.payFrequency && !!paymentFrequency[empObj.payFrequency]
        ? empObj.payFrequency
        : null,
    lastPayDate: empObj.lastPayDate
      ? moment(empObj.lastPayDate, "MM-DD-YYYY").toDate()
      : null,
    nextPayDate: empObj.nextPayDate
      ? moment(empObj.nextPayDate, "MM-DD-YYYY").toDate()
      : null,
    secondPayDate: empObj.secondPayDate
      ? moment(empObj.secondPayDate, "MM-DD-YYYY").toDate()
      : null,
    isAfterHoliday: empObj.isPayDayAfterHoliday === true ? 1 : 0,
    jobTitle: empObj.jobTitle,
    monthlyIncome: $ize(_.get(empObj, "monthlyIncome", 0)),
  };
  if (!empObj.monthlyIncome && applicationData.monthlyIncome) {
    employment.monthlyIncome = applicationData.monthlyIncome;
  }

  return employment;
}

function mapApplicationData(customer) {
  const application = {
    reasonForLoan: _.get(customer.loan, "reasonForLoan", null),
    requestedLoanAmount: $ize(_.get(customer.loan, "loanAmount", 0)),
    monthlyIncome: $ize(_.get(customer.employment, "monthlyIncome", 0)),
  };

  return application;
}

function mapBankData(bank, application) {
  const financialInfo = {
    accountNumber: bank.accountNumber.toString(),
    routingNumber: bank.routingNumber.toString(),
    bank: bank.bankName.toString(),
    paymentmethod: bank.directDeposit === true ? "depository" : "",
  };

  const account = {
    accountName: financialInfo.bank,
    routingNumber: financialInfo.routingNumber,
    accountNumber: financialInfo.accountNumber,
    accountNumberLastFour: financialInfo.accountNumber.substring(
      financialInfo.accountNumber.length - 4
    ),
    accountType: financialInfo.paymentmethod,
    incomeamount: financialInfo.monthlyIncome,
    bankPhone: bank.bankPhone,
    accountSubType: bank.accountType.toString(),
  };

  const accountsData = [];
  const balanceData = {
    available: 0,
    current: 0,
    limit: "",
  };
  const metaData = {
    limit: null,
    name: account.accountSubType,
    number: account.accountNumberLastFour,
    official_name: "",
  };
  const filteredAccountsDetailsJson = {
    account: account.accountNumber,
    account_id: "",
    routing: account.routingNumber,
    wire_routing: account.routingNumber,
  };
  const objdata = {
    balance: balanceData,
    institution_type: account.accountType,
    meta: metaData,
    numbers: filteredAccountsDetailsJson,
    subtype: account.accountSubType,
    type: account.accountType,
  };
  accountsData.push(objdata);
  const transactionGenerated = {};
  const userBankData = {
    accounts: accountsData,
    accessToken: "",
    institutionName: account.accountName,
    institutionType: account.accountType,
    transactions: transactionGenerated,
    item_id: "",
    access_token: "",
    transavail: 0,
    bankfilloutmanually: 1,
  };

  return {
    userBankAccount: userBankData,
    account: account,
    screentracking: financialInfo,
  };
}

function isBankHoliday(momt) {
  const holiday = hd.isHoliday(momt.toDate());
  if (!holiday || holiday.type != "bank") {
    return null;
  }
  return holiday.name;
}

class LeadUnderwritingFailure extends Error {
  constructor(message, status) {
    super(message);
    this.name = "LeadUnderwritingFailure";
    this.status = status;
  }
}

async function evaluateLead(lead) {
  const { PASSED, PENDING } = sails.config.RULE_STATUS;
  const context = { unsetApplication: false };
  let user;
  let screenTracking;
  try {
    let rulesPromises = [];

    const userInfo = {
      firstName: lead.personalInformation.firstName,
      lastName: lead.personalInformation.lastName,
      phoneNumber: lead.personalInformation.phoneNumber,
      requestedLoan: lead.loanAmount,
      dateOfBirth: moment(
        lead.personalInformation.birthday,
        "YYYY/MM/DD"
      ).format("MM/DD/YYYY"),
      ssnNumber: lead.personalInformation.ssnNumber,
      email: lead.personalInformation.email,
      password: "DefaultPassword@123", // change
      street: lead.personalInformation.address.street,
      city: lead.personalInformation.address.city,
      zipCode: lead.personalInformation.address.zipCode,
      state: lead.personalInformation.address.state,
      phones: [
        {
          phone: lead.personalInformation.phoneNumber,
          type: Screentracking.phoneType.RESIDENCE,
        },
        {
          phone: lead.employmentInformation.employerPhone,
          type: Screentracking.phoneType.WORK_PHONE,
        },
      ],
    };

    rulesPromises = getRulesByRulesNumber({ user: userInfo, isLead: true }, [
      UNDERWRITING_RULES.$1_DUPLICATE_APPLICATION.ruleNumber,
      UNDERWRITING_RULES.$2_BLOCKED_STATES.ruleNumber,
    ]);

    await processRules(rulesPromises, handleRuleResponse);

    const { userdetails, code, dupusererror } = await User.createNewUser(
      null,
      userInfo
    );
    user = userdetails;
    Object.assign(context, { userId: user.id });

    if (code == 500) {
      throw { message: "Internal Server Error" };
    }
    if (code == 400) {
      throw { message: dupusererror };
    }

    const applicationReferenceData = await User.getNextSequenceValue(
      "application"
    );

    const screentrackingDoc = {
      applicationReference: `APL_${applicationReferenceData.sequence_value}`,
      origin: Screentracking.origins.LEADS_PROVIDER,
      user: user.id,
      requestedLoanAmount: user.requestedLoan,
      trueValidateSessionId: lead.trueValidateSessionId,
    };

    screenTracking = await Screentracking.createContext(screentrackingDoc);
    Object.assign(context, { screentrackingId: screenTracking.id });

    const employmentHistoryData = {
      typeOfIncome: lead.employmentInformation.typeOfIncome,
      employerName: lead.employmentInformation.employerName,
      employerPhone: lead.employmentInformation.employerPhone,
      employerStatus: lead.employmentInformation.employerStatus,
      annualIncome: lead.employmentInformation.annualIncome,
      user: user.id,
      screenTrackingId: screenTracking.id,
    };

    const employmentHistory = await EmploymentHistory.findOrCreate(
      employmentHistoryData
    );
    const screenTrackingContext = {
      lastlevel: Screentracking.screens.EMPLOYMENT_INFO,
      lastLevel: Screentracking.screens.EMPLOYMENT_INFO,
      paymentFrequency:
        employmentHistory.payFrequency ||
        SmoothPaymentService.paymentFrequencyEnum.BI_WEEKLY,
      isAfterHoliday: employmentHistory.isAfterHoliday,
      annualIncome: Number(lead.employmentInformation.annualIncome),
      status: "pending",
    };

    await Screentracking.updateContext(
      { user: user.id, id: screenTracking.id },
      screenTrackingContext
    );

    await User.updateContext(
      { id: user.id },
      { screenTracking: screenTracking.id }
    );

    const practiceResult = await PracticeManagement.createPractice({
      phone: user.phoneNumber,
      email: user.email,
      street: user.street,
      city: user.city,
      zip: user.zipCode,
      stateCode: user.state,
    });

    const pmContext = {
      screenTracking: screenTracking.id,
      loanReference: `APL_${applicationReferenceData.sequence_value}`,
      user: user.id,
      practiceManagement: practiceResult.id,
      principalAmount: user.requestedLoan,
    };

    const payResult = await PaymentManagement.createContext(pmContext);

    await Object.assign(screenTracking, {
      lastlevel: Screentracking.screens.EMPLOYMENT_INFO,
      lastLevel: Screentracking.screens.EMPLOYMENT_INFO,
      paymentFrequency:
        employmentHistory.payFrequency ||
        SmoothPaymentService.paymentFrequencyEnum.BI_WEEKLY,
      isAfterHoliday: employmentHistory.isAfterHoliday,
      annualIncome: Number(lead.employmentInformation.annualIncome),
      status: "pending",
      practiceManagement: practiceResult.id,
      paymentManagement: payResult.id,
    }).save();

    rulesPromises = getRulesByRulesNumber({ screenTracking, user }, [
      UNDERWRITING_RULES.$3_CURRENT_CUSTOMER_SCREEN.ruleNumber,
      UNDERWRITING_RULES.$4_CHECK_DNL_LIST.ruleNumber,
      UNDERWRITING_RULES.$5_CLARITY_CLEAR_INQUIRE.ruleNumber,
      UNDERWRITING_RULES.$6_TRANSUNION_FRAUD_VALIDATION.ruleNumber,
      UNDERWRITING_RULES.$7_MINIMUM_INCOME.ruleNumber,
      UNDERWRITING_RULES.$8_CLARITY_CLEAR_CREDIT.ruleNumber,
      UNDERWRITING_RULES.$9_FACTOR_TRUST_CALL.ruleNumber,
      UNDERWRITING_RULES.$10_DUAL_SCORE.ruleNumber,
      UNDERWRITING_RULES.$11_ASSIGN_APR.ruleNumber,
      UNDERWRITING_RULES.$12_MINIMUM_PAYMENT.ruleNumber,
      UNDERWRITING_RULES.$13_MAXIMUM_LOAN_AMOUNT.ruleNumber,
      UNDERWRITING_RULES.$14_LOAN_AMOUNT_ASSIGNMENT.ruleNumber,
      UNDERWRITING_RULES.$15_LOAN_TERM_OPTION.ruleNumber,
    ]);

    await processRules(rulesPromises, handleRuleResponse);

    await Object.assign(screenTracking, {
      lastLevel: Screentracking.screens.CHOOSE_OFFER,
      lastlevel: Screentracking.screens.CHOOSE_OFFER,
    }).save();

    return {
      status: LEAD_STATUS.ACCEPTED,
      message: "Lead accepted",
      redirectLink: sails.config.getMagicLoginLink(screenTracking, user),
      screenTrackingId: screenTracking.id,
      userId: user.id,
      underwriting: screenTracking?.rulesDetails?.ruleData,
    };
  } catch (error) {
    sails.log.error("LeadService.evaluateLead: ", error.stack || error);

    const getRedirectLink = ({ status, ruleNumber }) => {
      if (!screenTracking || !user) {
        return "";
      }

      const config = {
        pending: sails.config.getMagicLoginLink(screenTracking, user),
        failed: `${sails.config.env.REACT_APP_BASE_URL}/application/thankyou`,
      };

      const redirectLink = config[status] || "";

      const canSendRedirectLink =
        status === "pending" ||
        ruleNumber >= 8 ||
        screenTracking?.hasPriorCommunication;

      return canSendRedirectLink ? redirectLink : "";
    };

    return {
      status:
        error?.status === PENDING ? LEAD_STATUS.PENDING : LEAD_STATUS.REJECTED,
      message: error.message,
      redirectLink: getRedirectLink(screenTracking?.underwritingDecision || {}),
      screenTrackingId: screenTracking?.id,
      userId: user?.id,
      underwriting: screenTracking?.rulesDetails?.ruleData,
    };
  }
}

async function postLead(lead, response, userId) {
  try {
    const leadObj = {
      action: response.status,
      lead: lead,
      user: userId,
      reason: response.message,
    };

    const createdLead = await Lead.create(leadObj);

    User.addLeadData(userId, createdLead.id, response.screenTrackingId);
  } catch (err) {
    sails.log.error("postLead: failed with error: ", err);
    return;
  }
}

async function getDeniedLeadApiDetails(
  columnTypeList,
  matchCriteria,
  searchValue = null,
  searchFilters = [],
  orderObj = null,
  offset = "1",
  limit = "100"
) {
  const columnsToShow = CubeListService.getColumnsToShow(columnTypeList);
  return await CubeListService.lookupDataWithAggregate(
    [
      {
        $match: CubeListService.processFiltering(
          matchCriteria,
          searchFilters,
          searchValue,
          columnsToShow
        ),
      },
      {
        $facet: {
          overallTotal: [{ $count: "overallTotalCount" }],
          leadData: [
            {
              $sort: CubeListService.processListSort(orderObj, columnTypeList),
            },
            { $skip: parseInt(offset || "0") },
            { $limit: parseInt(limit || "100") },
          ],
        },
      },
    ],
    columnTypeList,
    Lead,
    "leadData"
  );
}
function getBlockCommands(user) {
  let ttl;
  if (
    process.env.NODE_ENV === "production" ||
    process.env.NODE_ENV === "prod"
  ) {
    ttl = DAYS_MAX * 60 * 60 * 24;
  } else {
    ttl = 60 * 3; // 3 minutes
  }
  const blockCommands = [];
  if (user.ssn) {
    const duplicateSsnId = duplicateId(user, "SSN");
    blockCommands.push(
      ["incr", duplicateSsnId],
      ["expire", duplicateSsnId, ttl]
    );
  }
  if (user.email) {
    const duplicateEmailId = duplicateId(user, "EMAIL");
    blockCommands.push(
      ["incr", duplicateEmailId],
      ["expire", duplicateEmailId, ttl]
    );
  }
  if (user.mobPhone) {
    const duplicateMobileId = duplicateId(user, "MOBILE");
    blockCommands.push(
      ["incr", duplicateMobileId],
      ["expire", duplicateMobileId, ttl]
    );
  }

  return blockCommands;
}

function getSeenCommands(slideScore, momt, campaign) {
  const daySeenId = todayId(momt, false);
  const hourSeenId = hourId(momt, false);
  const campaignDaySeenId = todayCampaignId(momt, campaign, false);
  const campaignDays30SeenSlideId = days30CampaignSlideId(campaign, false);
  const days30SeenSlideId = days30SlideId(false);
  return [
    ["zremrangebyscore", days30SeenSlideId, 0, slideScore - SLIDE_30_DAYS],
    ["zadd", days30SeenSlideId, slideScore, slideScore],
    [
      "zremrangebyscore",
      campaignDays30SeenSlideId,
      0,
      slideScore - SLIDE_30_DAYS,
    ],
    ["zadd", campaignDays30SeenSlideId, slideScore, slideScore],
    ["incr", daySeenId],
    ["expire", daySeenId, SECONDS_2_DAYS],
    ["incr", hourSeenId],
    ["expire", hourSeenId, SECONDS_2_DAYS],
    ["incr", campaignDaySeenId],
    ["expire", campaignDaySeenId, SECONDS_2_DAYS],
  ];
}

function getPurchasedCommands(slideScore, momt, campaign) {
  const dayPurchasedId = todayId(momt, true);
  const hourPurchasedId = hourId(momt, true);
  const campaignDayPurchasedId = todayCampaignId(momt, campaign, true);
  const campaignDays30PurchasedSlideId = days30CampaignSlideId(campaign, true);
  const days30PurchasedSlideId = days30SlideId(true);
  return [
    ["zremrangebyscore", days30PurchasedSlideId, 0, slideScore - SLIDE_30_DAYS],
    ["zadd", days30PurchasedSlideId, slideScore, slideScore],
    [
      "zremrangebyscore",
      campaignDays30PurchasedSlideId,
      0,
      slideScore - SLIDE_30_DAYS,
    ],
    ["zadd", campaignDays30PurchasedSlideId, slideScore, slideScore],
    ["incr", dayPurchasedId],
    ["expire", dayPurchasedId, SECONDS_2_DAYS],
    ["incr", hourPurchasedId],
    ["expire", hourPurchasedId, SECONDS_2_DAYS],
    ["incr", campaignDayPurchasedId],
    ["expire", campaignDayPurchasedId, SECONDS_2_DAYS],
  ];
}

async function updateStats(campaign, user, block, purchased) {
  const slideScore = getTimeStamp();
  const momt = moment().tz("America/Chicago");
  let commands;

  if (purchased) {
    /* record seen, purchase, and block */
    commands = getSeenCommands(slideScore, momt, campaign)
      .concat(getPurchasedCommands(slideScore, momt, campaign))
      .concat(getBlockCommands(user));
  } else if (block) {
    /* record seen and block */
    commands = getSeenCommands(slideScore, momt, campaign).concat(
      getBlockCommands(user)
    );
  } else {
    /* record seen only */
    commands = getSeenCommands(slideScore, momt, campaign);
  }
  const rds = await acquireRdsClient();
  await rds.multi(commands).exec();
  releaseRdsClient(rds);
}

async function getEvalStats(campaign, user, slideScore, momt) {
  const rds = await acquireRdsClient();

  const days30PurchasedId = days30SlideId(true);
  const campaignDays30PurchasedSlideId = days30CampaignSlideId(campaign, true);
  const replies = await rds
    .multi()
    .zremrangebyscore(days30PurchasedId, 0, slideScore - SLIDE_30_DAYS)
    .zcount(days30CampaignSlideId, "-inf", "+inf")
    .zremrangebyscore(
      campaignDays30PurchasedSlideId,
      0,
      slideScore - SLIDE_30_DAYS
    )
    .zcount(campaignDays30PurchasedSlideId, "-inf", "+inf")
    .get(todayId(momt, true))
    .get(hourId(momt, true))
    .get(todayCampaignId(momt, campaign, true))
    .exists(duplicateId(user, "SSN"))
    .exists(duplicateId(user, "MOBILE"))
    .exists(duplicateId(user, "EMAIL"))
    .get(blocklistId(user))
    .exec();
  releaseRdsClient(rds);
  return {
    currentHour: momt.hour(),
    purchased: {
      month: replies[1][1] || 0,
      today: replies[4][1] || 0,
      hour: replies[5][1] || 0,
      campaign: {
        month: replies[3][1] || 0,
        today: replies[6][1] || 0,
      },
    },
    blocked: {
      ssn: replies[7][1] == 1,
      mobile: replies[8][1] == 1,
      email: replies[9][1] == 1,
      blocklist: replies[10][1],
    },
  };
}

async function getStats(active) {
  try {
    const response = {
      purchasing: false,
      days30: {
        seen: 0,
        purchased: 0,
        limit: 0,
      },
      today: {
        seen: 0,
        purchased: 0,
        limit: 0,
      },
    };
    let hourLimits = [
      999,
      999,
      999,
      999,
      999,
      999,
      999,
      999,
      999,
      999,
      999,
      999,
      999,
      999,
      999,
      999,
      999,
      999,
      999,
      999,
      999,
      999,
      999,
      999,
    ];

    const settings = await LeadConfig.find();
    settings.forEach((setting) => {
      if (setting.name == "limitHours") {
        hourLimits = setting.arrayValue;
      } else if (setting.name == "limitToday") {
        response.today.limit = setting.integerValue;
      } else if (setting.name == "limit30Days") {
        response.days30.limit = setting.integerValue;
      } else if (setting.name == "purchasing") {
        response.purchasing = setting.booleanValue;
      } else if (setting.name == "autoPromoteCampaign") {
        response.autoPromoteCampaign = setting.booleanValue;
      }
    });
    const slideScore = getTimeStamp();
    const momt = moment().tz("America/Chicago");

    const stats = await getGlobalStats(slideScore, momt);
    response.today.seen = stats.today.seen[1]
      ? parseInt(stats.today.seen[1])
      : 0;
    response.today.purchased = stats.today.purchased[1]
      ? parseInt(stats.today.purchased[1])
      : 0;
    response.days30.seen = stats.days30.seen[1]
      ? parseInt(stats.days30.seen[1])
      : 0;
    response.days30.purchased = stats.days30.purchased[1]
      ? parseInt(stats.days30.purchased[1])
      : 0;

    for (let idx = 0; idx < 24; idx++) {
      const hourId = "hour" + idx.toString();
      response.today[hourId] = {};
      response.today[hourId].seen = stats.hour.seen[idx][1]
        ? parseInt(stats.hour.seen[idx][1])
        : 0;
      response.today[hourId].purchased = stats.hour.purchased[idx][1]
        ? parseInt(stats.hour.purchased[idx][1])
        : 0;
      if (hourLimits.length > idx) {
        if (hourLimits[idx] > 0) {
          response.today[hourId].limit = hourLimits[idx];
        } else {
          response.today[hourId].limit = 0;
        }
      }
    }

    return response;
  } catch (err) {
    sails.log.error("getStats: error: ", err);
    return {
      error: err.mesage,
    };
  }
}

function getHourCommands(momt) {
  const commands = [];
  for (let idx = 0; idx < 24; idx++) {
    commands.push(["get", hourId(momt, false, idx)]);
  }
  for (let idx = 0; idx < 24; idx++) {
    commands.push(["get", hourId(momt, true, idx)]);
  }
  return commands;
}

async function getGlobalStats(slideScore, momt) {
  const seenId = days30SlideId(false);
  const purchasedId = days30SlideId(true);
  const commands = [
    ["get", todayId(momt, false)],
    ["get", todayId(momt, true)],
    ["zremrangebyscore", seenId, 0, slideScore - SLIDE_30_DAYS],
    ["zcount", seenId, "-inf", "+inf"],
    ["zremrangebyscore", purchasedId, 0, slideScore - SLIDE_30_DAYS],
    ["zcount", purchasedId, "-inf", "+inf"],
  ].concat(getHourCommands(momt));

  const rds = await acquireRdsClient();
  const results = await rds.multi(commands).exec();
  releaseRdsClient(rds);
  return {
    today: {
      seen: results[0],
      purchased: results[1],
    },
    days30: {
      seen: results[3],
      purchased: results[5],
    },
    hour: {
      seen: results.slice(6, 30),
      purchased: results.slice(30, 54),
    },
  };
}

function getCampaignStatsCommands(slideScore, momt, campaign) {
  const campaignSeenId = days30CampaignSlideId(campaign, false);
  const campaignPurchasedId = days30CampaignSlideId(campaign, true);
  return [
    ["zremrangebyscore", campaignSeenId, 0, slideScore - SLIDE_30_DAYS],
    ["zcount", campaignSeenId, "-inf", "+inf"],
    ["zremrangebyscore", campaignPurchasedId, 0, slideScore - SLIDE_30_DAYS],
    ["zcount", campaignPurchasedId, "-inf", "+inf"],
    ["get", todayCampaignId(momt, campaign, false)],
    ["get", todayCampaignId(momt, campaign, true)],
  ];
}

async function getCampaignStatsAt(slideScore, momt, active = false) {
  let campaigns;
  if (active) {
    campaigns = await Campaign.find({ limit30Days: { $gt: 0 } });
  } else {
    campaigns = await Campaign.find({ limit30Days: 0 });
  }

  if (!campaigns.length) {
    return [];
  }
  const campaignList = [];
  let commandList = [];
  for (let idx = 0; idx < campaigns.length; idx++) {
    const campaign = campaigns[idx];
    campaignList.push({
      name: campaign.name,
      referral: campaign.referral.referringUrl || "--",
      today: {
        seen: 0,
        purchased: 0,
        limit: campaign.limitToday || 0,
      },
      days30: {
        seen: 0,
        purchased: 0,
        limit: campaign.limit30Days || 0,
      },
    });
    commandList.push(getCampaignStatsCommands(slideScore, momt, campaign.name));
  }
  if (commandList.flat) {
    commandList = commandList.flat();
  } else {
    commandList = commandList.reduce((acc, val) => {
      return acc.concat(val);
    });
  }
  const rds = await acquireRdsClient();
  const results = await rds.multi(commandList).exec();
  releaseRdsClient(rds);

  let campaignIdx = 0;
  for (let idx = 0; idx < results.length; idx += 6) {
    const campaignObj = campaignList[campaignIdx];
    campaignObj.days30.seen = results[idx + 1][1];
    campaignObj.days30.purchased = results[idx + 3][1];
    campaignObj.today.seen = results[idx + 4][1]
      ? parseInt(results[idx + 4][1])
      : 0;
    campaignObj.today.purchased = results[idx + 5][1]
      ? parseInt(results[idx + 5][1])
      : 0;
    campaignIdx++;
  }

  return campaignList;
}

async function getCampaignStats(active) {
  try {
    const slideScore = getTimeStamp();
    const momt = moment().tz("America/Chicago");
    return await getCampaignStatsAt(slideScore, momt, active);
  } catch (err) {
    sails.log.error("getCampaignStats: Error:", err);
    return [];
  }
}

async function getCampaignConfig() {
  const campaigns = await Campaign.find();
  const campaignConfig = {};
  campaigns.forEach((campaign) => {
    campaignConfig[campaign.name] = {
      limit30Days: campaign.limit30Days || 0,
      limitToday: campaign.limitToday || 0,
    };
  });
  return campaignConfig;
}

function getTypeName(type) {
  switch (type) {
    case "string":
      return "stringValue";
    case "boolean":
      return "booleanValue";
    case "integer":
      return "integerValue";
    case "float":
      return "floatValue";
    case "array":
      return "arrayValue";
    case "object":
      return "objectValue";
    default:
      return "stringValue";
  }
}

async function setHourLimit(idx, value) {
  const hourList = await LeadConfig.findOne({ name: "limitHours" });
  let newHourList;
  if (hourList) {
    newHourList = hourList.arrayValue;
  } else {
    newHourList = [
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
    ];
  }
  newHourList[idx] = value;
  if (hourList) {
    await LeadConfig.update({ id: hourList.id }, { arrayValue: newHourList });
  } else {
    await LeadConfig.create({
      name: "limitHours",
      arrayValue: newHourList,
    });
  }
  await refreshConfig();
  return newHourList;
}

async function getHourLimit(idx) {
  // const hourList = await LeadConfig.findOne( { name: "limitHours" } );
  // if( hourList && hourList.arrayValue && hourList.arrayValue.length > idx ) {
  // 	return hourList.arrayValue[ idx ];
  // } else {
  // 	return 0;
  // }
  return 999;
}

async function setHoursRange(start, end) {
  const hours = [];
  if (end > start) {
    for (let idx = 0; idx < 24; idx++) {
      if (idx < start) {
        hours.push(0);
      } else if (idx > end) {
        hours.push(0);
      } else {
        hours.push(1000000);
      }
    }
  } else {
    for (let idx = 0; idx < 24; idx++) {
      if (idx >= start) {
        hours.push(1000000);
      } else if (idx <= end) {
        hours.push(1000000);
      } else {
        hours.push(0);
      }
    }
  }
  const hourList = await LeadConfig.findOne({ name: "limitHours" });
  if (hourList) {
    await LeadConfig.update({ id: hourList.id }, { arrayValue: hours });
  } else {
    await LeadConfig.create({
      name: "limitHours",
      arrayValue: hours,
    });
  }
  await refreshConfig();
  return hours;
}

async function setCampaignLimit(name, period, value) {
  const campaigndata = await Campaign.findOne({ name: name });
  if (campaigndata) {
    if (period == "day") {
      await Campaign.update({ id: campaigndata.id }, { limitToday: value });
    } else {
      await Campaign.update({ id: campaigndata.id }, { limit30Days: value });
    }
    await refreshConfig();
  }
}

async function getCampaignLimit(name, period) {
  const campaigndata = await Campaign.findOne({ name: name });
  let limit;
  if (campaigndata) {
    if (period == "day") {
      limit = campaigndata.limitToday || 0;
    } else {
      limit = campaigndata.limit30Days || 0;
    }
  }
  return limit;
}

async function setConfigProperty(name, value, type) {
  const configData = await LeadConfig.findOne({ name: name });
  const newObj = {
    name: name,
  };
  newObj[getTypeName(type)] = value;
  if (configData) {
    await LeadConfig.update({ id: configData.id }, newObj);
  } else {
    await LeadConfig.create(newObj);
  }
  await refreshConfig();
}

async function getConfigProperty(name, type) {
  const configData = await LeadConfig.findOne({ name: name });
  if (configData) {
    return configData[getTypeName(type)];
  }
  return null;
}

async function setGlobalLimit(period, limit, hour) {
  switch (period) {
    case "hour":
      await setHourLimit(hour, limit);
      await refreshConfig();
      return;
    case "day":
      return await setConfigProperty("limitToday", limit, "integer");
    case "month":
      return await setConfigProperty("limit30Days", limit, "integer");
  }
  return;
}

async function getGlobalLimit(period, hour) {
  let limit;
  switch (period) {
    case "hour":
      limit = await getHourLimit(hour);
      break;
    case "day":
      limit = await getConfigProperty("limitToday", "integer");
      break;
    case "month":
      limit = await getConfigProperty("limit30Days", "integer");
      break;
  }
  if (!limit) {
    limit = 0;
  }
  return limit;
}

async function getConfig() {
  const response = {
    purchasing: false,
    purchasingWeekends: false,
    purchasingHolidays: false,
    autoPromoteCampaign: true,
    days30: {
      limit: 0,
    },
    today: {
      limit: 0,
      hourLimits: [
        999,
        999,
        999,
        999,
        999,
        999,
        999,
        999,
        999,
        999,
        999,
        999,
        999,
        999,
        999,
        999,
        999,
        999,
        999,
        999,
        999,
        999,
        999,
        999,
      ],
    },
  };
  const configData = await LeadConfig.find();
  configData.forEach((config) => {
    switch (config.name) {
      case "limit30Days":
        response.days30.limit = config.integerValue;
        break;
      case "limitToday":
        response.today.limit = config.integerValue;
        break;
      case "limitHours":
        response.today.hourLimits = config.arrayValue;
        break;
      case "purchasing":
        response.purchasing = config.booleanValue;
        break;
      case "purchasingHolidays":
        response.purchasingHolidays = config.booleanValue;
        break;
      case "purchasingWeekends":
        response.purchasingWeekends = config.booleanValue;
        break;
      case "autoPromoteCampaign":
        response.autoPromoteCampaign = config.booleanValue;
        break;
    }
  });
  return response;
}

// async function updateBlockList() {
//   try {
//     let rds = await acquireRdsClient();
//     const lastUpdate = await rds.get(blocklistLastUpdateId());
//     releaseRdsClient(rds);
//     let timestamp;
//     if (lastUpdate) {
//       timestamp = parseInt(lastUpdate);
//     } else {
//       timestamp = 0;
//     }
//     console.log(`last time stamp: ${timestamp}`);
//     let dateLastUpdated = new Date(timestamp);
//     const now = new Date();
//     let chunk;
//     let lastid;
//     const brokenUsers = [];

//     let importCount = 0;
//     do {
//       chunk = await Blocklist.find({
//         $or: [
//           { updatedAt: { $exists: false } },
//           {
//             $and: [
//               { updatedAt: { $gte: dateLastUpdated } },
//               { updatedAt: { $lt: now } },
//             ],
//           },
//         ],
//       }).limit(1000);

//       if (chunk.length) {
//         const idList = [];

//         chunk.forEach((user) => {
//           idList.push(user.id);
//         });

//         const users = chunk.filter((user) => {
//           if (user.ssn && user.ssn.split && user.reason) {
//             return user;
//           } else {
//             brokenUsers.push(user);
//           }
//         });
//         importCount = importCount + users.length;
//         const commands = users.map((user) => {
//           return ["set", blocklistId(user), user.reason || "Unknown"];
//         });

//         rds = await acquireRdsClient();
//         await rds.multi(commands).exec();
//         releaseRdsClient(rds);

//         await Blocklist.update({ id: idList }, {});
//         lastid = idList[idList.length - 1];
//         sails.log.info(
//           `${importCount} imported users added to the block list index`
//         );
//       }
//     } while (chunk.length);

//     if (lastid) {
//       console.log(
//         "++++++++++++++++++++++++++++++++++ blocklist users that could not be added to the index ++++++++++++++++++++++++++++++++++++++"
//       );
//       console.log(brokenUsers);
//       const lastRecord = await Blocklist.findOne({ id: lastid });
//       dateLastUpdated = new Date(lastRecord.updatedAt);
//     }

//     if (importCount) {
//       const newtimestamp = dateLastUpdated.getTime() + 1;
//       rds = await acquireRdsClient();
//       await rds.set(blocklistLastUpdateId(), newtimestamp);
//       releaseRdsClient(rds);
//       console.log(`new time stamp: ${newtimestamp}`);
//     }
//   } catch (err) {
//     sails.log.error("updateBlockList: failed with error: ", err);
//   }
// }

// setTimeout(updateBlockList, 20000);
