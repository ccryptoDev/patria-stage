const Joi = require("joi");
const Screentracking = require("../models/Screentracking");

module.exports = { addApplication, selectOffer, addLoan, getPractices, getStates, getOffers };

async function getPractices(req, res) {
  return res.send(await PracticeManagement.find());
}

async function getStates(req, res) {
  const allowedOnly = req.query.allowedOnly || "n";
  const allowedStatesCodes = [
    "AK",
    "AL",
    "DE",
    "FL",
    "HI",
    "IA",
    "IL",
    "IN",
    "KY",
    "LA",
    "MI",
    "MO",
    "MS",
    "ND",
    "NE",
    "NM",
    "NV",
    "OK",
    "RI",
    "SD",
    "TN",
    "TX",
    "UT"
  ];
  const states = await State.find();
  if (allowedOnly === "y")
    return res.send(states.filter(state => allowedStatesCodes.includes(state.stateCode)));
  return res.send(states);
}

async function addApplication(req, res) {
  sails.log.info("AdminApplication.addApplication, running");
  try {
    const { formData, shouldRunUnderwriting } = req.body;

    const user = await createUser(formData, true);
    const account = await createAccount(formData, user);
    const application = await createApplication(formData, user, account);
    await createEmploymentHistory(formData, user);

    if (!formData.ignoreUnderwriting ) {
      await runUnderwriting(user, application);
    }else {
      application["dontSendInviteEmail"] = true;
    }

    const userBankAccount = await createUserBankAccount(user, application, account);
    await Account.update({ user: user.id }, { userBankAccount: userBankAccount.id });
    await createPlaidUser(user, userBankAccount);

    const offers = OffersService.generateOffersArray(application.requestedLoanAmount, application.paymentFrequency);
    application.offers = offers;

    application.lastlevel = Screentracking.screens.CHOOSE_OFFER;
    application.lastScreenName = "Offers Details";
    application["sentInviteEmail"] = false;
    await application.save();
    
    if(!formData.ignoreUnderwriting) {
      await EmailService.sendAdminAddApplicationEmail(user, application);
    }

    sails.log.info("AdminApplication.addApplication, complete");
    return res.status(200).send({
      applicationId: application.id
    });
  } catch (error) {
    sails.log.error("AdminApplication.addApplication, error", error);
    if (error.isJoi) {
      return res.status(500).send(error.message);
    } else {
      return res.status(500).send(error.message);
    }
  }
}

async function addLoan(req, res) {
  sails.log.info("AdminApplication.addLoan, running");
  try {
    const { userId, requestedLoanAmount, shouldRunUnderwriting } = req.body;
    const user = await User.findOne({ id: userId });
    const account = await Account.findOne({ user: user.id });

    const formData = { requestedLoanAmount };
    // get the most recent application for paymentmethod
    const existingApplication = await Screentracking.findOne({ user: userId }).sort({ _id: -1 });
    if (existingApplication) formData.paymentMethod = existingApplication.paymentmethod;
    else formData.paymentMethod = "Paper Check";

    const application = await createApplication(formData, user, account);

    if (shouldRunUnderwriting) {
      await runUnderwriting(user, application);
    }

    const offers = OffersService.generateOffersArray(application.requestedLoanAmount, application.paymentFrequency);
    application.offers = offers;

    application.lastlevel = Screentracking.screens.CHOOSE_OFFER;
    application.lastScreenName = "Offers Details";

    await application.save();
    await EmailService.sendAdminAddApplicationEmail(user, application);

    sails.log.info("AdminApplication.addLoan, complete");
    return res.status(200).send({
      applicationId: application.id
    });
  } catch (error) {
    sails.log.error("AdminApplication.addLoan, error", error);
    if (error.isJoi) {
      return res.status(500).send(error.message);
    } else {
      return res.status(500).send(error.message);
    }
  }
}

async function getOffers(req, res) {
  sails.log.info("AdminApplication.getOffers, running");
  try {
    const { applicationId } = req.params;

    const application = await Screentracking.findOne({ id: applicationId });
    if (!application) throw new Error(`No application found for id ${applicationId}`);

    const offersWithAmount = application.offers.map(offer => ({
      ...offer,
      requestedLoanAmount: application.requestedLoanAmount
    }));
    sails.log.info("AdminApplication.getOffers, complete");
    return res.status(200).send(offersWithAmount);
  } catch (error) {
    sails.log.error("AdminApplication.getOffers, error", error);
    return res.status(500).send(error.message);
  }
}

async function selectOffer(req, res) {
  sails.log.info("AdminApplication.selectOffer, running");
  try {
    const { applicationId, offerIndex } = req.body;

    const application = await Screentracking.findOne({ id: applicationId });
    if (!application) throw new Error(`Unable to find application with id of ${applicationId}.`);
    if (!application.offers && application.offers[offerIndex])
      throw new Error(`No offer found a index ${offerIndex}`);

    application.offerdata = [application.offers[offerIndex]];
    application.lastlevel = Screentracking.screens.BANK_INFO;
    application.lastScreenName = "Contract";
    await application.save();

    sails.log.info("AdminApplication.selectOffer, complete");
    return res.status(200).send(application.offerdata[0]);
  } catch (error) {
    sails.log.error("AdminApplication.selectOffer, error", error);
    return res.status(500).send(error.message);
  }
}

async function createUser(formData, tempPass = false) {
  const _newUser = {
    practicemanagement: formData.practicemanagement,
    firstname: formData.firstName,
    middlename: formData.middleName,
    lastname: formData.lastName,

    email: formData.email,
    phoneNumber: formData.phoneNumber,
    street: formData.address,
    unitapt: formData.unitApt,
    city: formData.city,
    state: formData.state,
    zipCode: formData.zip,
    ssn_number: formData.ssn,
    dateofBirth: formData.dateOfBirth,
    stateIdNumber: formData.stateIdNumber,
    idState: formData.idState,
    password: formData.password,
    consentChecked: formData.consentChecked || false
  };
  if (tempPass) {
    const ssnLastFour = _newUser.ssn_number.slice(_newUser.ssn_number.length - 4);
    _newUser.password = ssnLastFour;
  }
  // validate new user, throws Joi error on fail
  const newUser = Joi.attempt(_newUser, userSchema);

  // check for existing user
  const [sameSSN, sameEmail] = await Promise.all([
    User.findOne({ ssn_number: newUser.ssn_number }),
    User.findOne({ email: newUser.email })
  ]);
  if( process.env.NODE_ENV === "production" || process.env.NODE_ENV === "prod" ) {
    if(sameSSN) throw new Error("A user with the same social security number already exists.");
  }
  
  if (sameEmail) throw new Error("A user with the same email already exists.");

  // Add state id
  newUser._state = (await State.findOne({ stateCode: newUser.state })).id;

  const { userdetails: user } = await User.createNewUser(null, newUser);
  return user;
}

function createAccount(formData, user) {
  const _newAccount = {
    user: user.id,
    accountName: formData.accountName,
    routingNumber: formData.routingNumber,
    accountNumber: formData.accountNumber,
    accountType: "depository",
    incomeamount: Number(formData.monthlyIncome)
  };

  const newAccount = Joi.attempt(_newAccount, accountSchema);
  newAccount.accountNumberLastFour = _newAccount.accountNumber.substring(
    _newAccount.accountNumber.length - 4
  );

  return Account.create(newAccount);
}

async function createApplication(formData, user, account) {
  const { accountName: bank, routingNumber, accountNumber } = account;
  const { sequence_value } = await User.getNextSequenceValue("application");

  const _newApplication = {
    bank,
    routingNumber,
    accountNumber,
    incomeamount: Number(account.incomeamount),
    requestedLoanAmount: Number(formData.requestedLoanAmount),
    paymentmethod: formData.paymentMethod,
    paymentFrequency: formData.payFrequency,
    isAfterHoliday: formData.paymentBeforeAfterHolidayWeekend === "1"?1:0,
    user: user.id,
    applicationReference: `APL_${sequence_value}`,
    practicemanagement: user.practicemanagement,
    origin: "Add Application",
    iscompleted: 0,
    lastlevel: Screentracking.screens.EMPLOYMENT_INFO,
    lastScreenName: "Application"
  };

  // const newApplication = Joi.attempt(_newApplication, newApplicationSchema);

  return Screentracking.create(_newApplication);
}

async function runUnderwriting(user, application) {
  const { passed, error, reason, stageFailed } = await UnderwritingService.underwritingWaterfall(
    user,
    application
  );
  if (!passed) {
    await Screentracking.update({id: application.id}, {isDenied: true, deniedReason:reason.reason});
    throw new Error(`User failed underwriting with the following reason: ${reason} on stage ${stageFailed}.`);
  }
  if (error)
    throw new Error(`Encountered error during underwriting, reason: ${reason} on stage ${stageFailed}.`);
}

function createUserBankAccount(user, application, account) {
  const userBankData = {
    accounts: [
      {
        balance: {
          available: 0,
          current: 0,
          limit: ""
        },
        institution_type: account.accountType,
        meta: {
          limit: null,
          name: "Checking",
          number: account.accountNumberLastFour,
          official_name: ""
        },
        numbers: {
          account: account.accountNumber,
          account_id: "",
          routing: account.routingNumber,
          wire_routing: account.routingNumber
        },
        subtype: "checking",
        type: "depository"
      }
    ],
    accessToken: "",
    institutionName: account.accountName,
    institutionType: account.accountType,
    transactions: {},
    user: user.id,
    item_id: "",
    access_token: "",
    transavail: 0,
    Screentracking: application.id,
    bankfilloutmanually: 1
  };

  return UserBankAccount.create(userBankData);
}

function createPlaidUser(user, userBankAccount) {
  const newPlaidUser = {
    ifuserInput: 1,
    plaidfilloutmanually: 1,
    user: user.id,
    userBankAccount: userBankAccount.id,
    names: [`${user.firstname} ${user.lastname}`],
    emails: [{ primary: true, type: "e-mail", data: user.email }],
    phoneNumbers: [{ primary: true, type: "mobile", data: user.phoneNumber }],
    addresses: [
      {
        primary: true,
        data: {
          street: user.street,
          city: user.city,
          state: user.state,
          zip: user.zipCode
        }
      }
    ]
  };

  return PlaidUser.create(newPlaidUser);
}

function createEmploymentHistory(formData, user) {
  const _employmentHistory = {
    practicemanagement: user.practicemanagement,
    user: user.id,
    typeOfIncome: formData.typeOfIncome,
    employerName: formData.employerName,
    employerPhone: formData.employerPhone,
    employerStatus: formData.employerStatus,
    payFrequency: formData.payFrequency,
    secondPayDate: new Date(formData.secondPayDate),
    lastPayDate: new Date(formData.lastPayDate),
    nextPayDate: new Date(formData.nextPayDate),
    isAfterHoliday: formData.paymentBeforeAfterHolidayWeekend === "1"?1:0
  };

  const employmentHistory = Joi.attempt(_employmentHistory, employmentHistorySchema);

  return EmploymentHistory.create(employmentHistory);
}

const employmentHistorySchema = Joi.object({
  practicemanagement: Joi.string()
    .required()
    .trim(),
  user: Joi.string()
    .required()
    .trim(),
  typeOfIncome: Joi.string()
    .required()
    .trim(),
  employerName: Joi.string()
    .required()
    .trim(),
  employerPhone: Joi.string()
    .required()
    .trim(),
  employerStatus: Joi.string()
    .required()
    .trim(),
  payFrequency: Joi.string()
  .required()
  .trim(),
  lastPayDate: Joi.date().required(),
  nextPayDate: Joi.date().required(),
  secondPayDate: Joi.date().optional(),
  isAfterHoliday: Joi.number().optional()
});

const userSchema = Joi.object({
  practicemanagement: Joi.string()
    .required()
    .trim(),

  firstname: Joi.string()
    .required()
    .trim(),
  middlename: Joi.string().trim(),
  lastname: Joi.string()
    .required()
    .trim(),
  dateofBirth: Joi.date().required(),

  email: Joi.string()
    .email()
    .required()
    .trim(),
  phoneNumber: Joi.string()
    .alphanum()
    .required()
    .length(10),

  street: Joi.string().required(),
  unitapt: Joi.string().default(""),
  city: Joi.string().required(),
  state: Joi.string().required(),
  zipCode: Joi.string()
    .alphanum()
    .length(5)
    .pattern(/^[0-9]{5}(?:-[0-9]{4})?$/, { name: "zip code" })
    .required(),

  ssn_number: Joi.string()
    .length(9)
    .pattern(/^[0-9]+$/, { name: "social security number" })
    .required(),
  stateIdNumber: Joi.string()
    .required()
    .trim(),
  idState: Joi.string()
    .length(2)
    .required(),

  consentChecked: Joi.boolean().default(false),

  role: Joi.string().default("59f9a0db01fa346245e219cf"),
  password: Joi.string()
    .required()
    .trim()
});

const applicationSchema = Joi.object({});

const accountSchema = Joi.object({
  user: Joi.string().required(),
  accountName: Joi.string().default(""),
  accountNumber: Joi.string().required(),
  accountType: Joi.string().required(),
  incomeamount: Joi.number().required(),
  routingNumber: Joi.string()
    .required()
    .custom((value, helper) => {
      if (!isValidRoutingNumber(value)) return helper.message("Routing Number is invalid.");
    })
});

function isValidRoutingNumber(t) {
  let n = 0;
  for (i = 0; i < t.length; i += 3) {
    n += parseInt(t.charAt(i), 10) * 3 + parseInt(t.charAt(i + 1), 10) * 7 + parseInt(t.charAt(i + 2), 10);
  }
  // If the resulting sum is an even multiple of ten (but not zero), the aba routing number is good.
  if (n != 0 && n % 10 == 0) return true;
  else return false;
}
