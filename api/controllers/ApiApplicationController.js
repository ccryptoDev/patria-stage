"use strict";

const moment = require("moment");
const _ = require("lodash");
const { ErrorHandler, SendError } = require("../services/ErrorHandling");
const Screentracking = require("../models/Screentracking");
const ApiApplicationService = require("../services/ApiApplicationService");
const { sendMagicLoginLink } = require("../services/EmailService");
const LoanDocument = require("../models/LoanDocument");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const PaymentManagementModel = require("../models/PaymentManagement");
const PracticeManagementModel = require("../models/PracticeManagement");
const LogActivityService = require("../services/LogActivityService");
const TransUnionTrueValidate = require("../models/TransUnionTrueValidate");
const {
  sendOtpResponseCode,
  postKbaAnswers,
} = require("../services/TrueValidate");
const {
  UNDERWRITING_RULES,
  initContext,
  getRulesByRulesNumber,
  processRules,
  handleRuleResponse,
  getPendingRulesByGroupNumber,
} = require("../services/underwriting_steps/helpers");
const EsignatureService = require("../services/EsignatureService");
const { LOAN_STATUS } = require("../models/PaymentManagement");
const FlinkService = require("../services/FlinksService");
const TrueValidateFraudRisk = require("../services/underwriting_steps/6.TrueValidateFraudRisk");
const communicationService = require("../services/CommunicationService");

const { PASSED, FAILED, QUEUED, RETRY, PENDING } = sails.config.RULE_STATUS;

module.exports = {
  createApplication: createApplication,
  createEmploymentHistory,
  getEmploymentHistory: getEmploymentHistory,
  updateEmployerInfo: updateEmployerInfo,
  updateUserInfo,
  getUserInfo,
  updateUserFinancialInfo,
  createApplicationOffers,
  getApplicationOffers,
  saveOffers,
  uploadLoanDocument,
  getLoanDocuments,
  storeInitialSelectedOffer,
  confirmApplicationReview,
  sendKbaAnswers,
  sendOtpResponse,
  getUserKbaQuestions,
  getTrueValidateStatus,
  resendOtpCode,
  getOtpStatus,
  processUnderwritingStep,
};

async function processUnderwritingStep(req, res) {
  try {
    const { screenId } = req.body;
    let optionalData = {};

    let screendata = await Screentracking.getApplicationById(screenId);
    if (!screendata) {
      throw new ErrorHandler(404, "Application Not Found");
    }

    const paymentData = await PaymentManagementModel.getPaymentCollection({
      screenTracking: screenId,
      status: LOAN_STATUS.MANUAL_REVIEW,
    });
    if (!paymentData) {
      throw new ErrorHandler(404, "Application is not in Review");
    }

    const {
      lastlevel,
      user,
      rulesDetails,
      bankName,
      underwritingDecision,
    } = screendata;

    const lastRule = { ...underwritingDecision };

    await Screentracking.updateContext(
      { id: screenId },
      {
        "underwritingDecision.status": PASSED,
        [`rulesDetails.ruleData.${lastRule.ruleId}.status`]: PASSED,
        [`rulesDetails.ruleData.${lastRule.ruleId}.passed`]: true,
        [`rulesDetails.ruleData.${lastRule.ruleId}.reason`]: "Manually approved",
      }
    );

    if (lastRule.ruleNumber === 20) {
      const magicLoginLink = sails.config.getMagicLoginLink(
        screendata,
        user
      );

      communicationService.sendApplicationCommunication({
        communicationCode: "LDA",
        user,
        screenTracking: screendata,
        data: {
          completeApplicationLink: magicLoginLink,
          smsLink: magicLoginLink,
        },
      });
    }

    const { executionGroup, ruleNumber, status } = lastRule;
    if (executionGroup === 4 && ruleNumber === 17 && status !== "passed") {
      const { flinksLoginId, selectedAccountId } = user;

      const response = await FlinkService.getRequestId(flinksLoginId);
      if (!response.ok) throw new ErrorHandler(404, response.error);

      const flinksRequestId = response?.data?.requestId;

      const flinksPayload = {
        requestId: flinksRequestId,
        loginId: flinksLoginId,
        selectedAccountId,
        userbank: bankName,
      };
      optionalData = { ...flinksPayload };
    }

    const remainingRules = getPendingRulesByGroupNumber(
      { screenTracking: screendata, user, optionalData },
      rulesDetails
    );
    remainingRules.shift();

    const response = await processRules(remainingRules);
    res.json({
      executionGroup,
      response,
    });
  } catch (error) {
    SendError(error, res);
  }
}

async function resendOtpCode(req, res) {
  try {
    const { id: userId } = req.user;

    const { screenTrackingId } = req.params;

    const screenTracking = await Screentracking.getScreenTracking(
      {
        id: screenTrackingId,
        user: userId,
      },
      ["user"]
    );

    const { otpRequested = false, otpApproved = false } = screenTracking;

    const isOtpRequested = otpRequested && !otpApproved;

    if (isOtpRequested) {
      const userData = { ...screenTracking.user };
      const isTestSsn = sails.config.checkTestSsn(
        screenTracking.user.ssnNumber
      );

      // THIS BLOCK SHOULD BE REMOVED AFTER TESTS
      if (isTestSsn) {
        const {
          raw: reportData,
        } = await TransUnionTrueValidate.getLatestReportForUser(
          userId,
          TransUnionTrueValidate.caseTypes.OTP_REQUEST
        );

        userData.ssnNumber = reportData?.RawData?.Customer?.SocialSecurityNumber.replace(
          /\D+/g,
          ""
        );
      }

      const otpCaseResponse = await TrueValidate.requestOtp(
        screenTracking,
        userData
      );

      await TransUnionTrueValidate.saveTrueValidateResponse(
        userData.id,
        TransUnionTrueValidate.caseTypes.OTP_REQUEST,
        otpCaseResponse
      );

      return res.status(204).json({});
    }

    throw new ErrorHandler(400, "Otp not requested for this application!");
  } catch (error) {
    SendError(
      error instanceof ErrorHandler
        ? error
        : new ErrorHandler(500, error.message || error),
      res
    );
  }
}

async function getOtpStatus(req, res) {
  try {
    const { id: userId } = req.user;

    const { screenTrackingId } = req.params;

    const screenTracking = await Screentracking.getScreenTracking({
      id: screenTrackingId,
      user: userId,
    });

    const { otpRequested = false, otpApproved = false } = screenTracking;

    const isOtpRequested = otpRequested && !otpApproved;

    if (isOtpRequested) {
      const {
        createdAt: lastOtpRequestedAt,
      } = await TransUnionTrueValidate.getLatestReportForUser(
        userId,
        TransUnionTrueValidate.caseTypes.OTP_REQUEST
      );

      const isPastOneHour =
        moment(lastOtpRequestedAt).add(1, "hour") < new Date();

      const payload = {
        isOtpValid: !isPastOneHour,
      };

      return res.status(200).json(payload);
    }

    throw { message: "" };
  } catch (error) {
    SendError(
      error instanceof ErrorHandler
        ? error
        : new ErrorHandler(500, error.message || error),
      res
    );
  }
}

async function getTrueValidateStatus(req, res) {
  try {
    const { id: userId } = req.user;

    const { screenTrackingId } = req.params;

    const screenTracking = await Screentracking.getScreenTracking({
      id: screenTrackingId,
      user: userId,
    });

    const {
      kbaRequested = false,
      kbaApproved = false,
      otpRequested = false,
      otpApproved = false,
    } = screenTracking;

    const isKbaRequested = kbaRequested && !kbaApproved;
    const isOtpRequested = otpRequested && !otpApproved;

    res.status(200).json({ isKbaRequested, isOtpRequested });
  } catch (error) {
    sails.log.error(`ERROR:getTrueValidateStatus::${error}`);
    SendError(
      error instanceof ErrorHandler
        ? error
        : new ErrorHandler(500, error.message || error),
      res
    );
  }
}

async function getUserKbaQuestions(req, res) {
  try {
    const { raw: report } = await TransUnionTrueValidate.getLatestReportForUser(
      req.user.id,
      TransUnionTrueValidate.caseTypes.KBA_REQUEST
    );

    res.status(200).json(report?.Authentication?.KBA?.Questions);
  } catch (error) {
    SendError(error, res);
  }
}

async function sendKbaAnswers(req, res) {
  try {
    const { screenTrackingId } = req.params;
    /*
  [{ questionId: 1, answerId: 'yes' }, { ... } }]
  */
    const { raw: report } = await TransUnionTrueValidate.getLatestReportForUser(
      req.user.id,
      TransUnionTrueValidate.caseTypes.KBA_REQUEST
    );

    const kbaData = report.Authentication.KBA;

    kbaData.Questions = kbaData.Questions.map((question) => {
      const { answerId } = req.body.find((a) => a.questionId === question.Id);

      question.Choices.forEach((choice) => {
        if (choice.Id === answerId) {
          choice.Answer = true;
        }
      });

      return question;
    });

    const response = await postKbaAnswers(
      kbaData.AnswerUrl,
      kbaData,
      report.CaseId
    );

    const { KBA: kbaResponse } = response?.Authentication || {};

    TransUnionTrueValidate.saveTrueValidateResponse(
      req.user.id,
      TransUnionTrueValidate.caseTypes.KBA_RESPONSE,
      kbaResponse
    );

    const ruleName = UNDERWRITING_RULES.$6_TRANSUNION_FRAUD_VALIDATION;
    const { context: underwritingContext } = initContext(ruleName);

    const APPROVED_KBA_STATUS = 4;

    const statusMessage =
      kbaResponse?.Status === APPROVED_KBA_STATUS ? PASSED : FAILED;

    const responsePayload = {
      data: kbaResponse,
      status: statusMessage,
    };

    const screenTracking = await Screentracking.getScreenTracking(
      { id: screenTrackingId, user: req.user.id },
      ["user"]
    );

    const userData = { ...screenTracking.user };

    if (statusMessage === PASSED) {
      const { lastlevel: previousLevel } = screenTracking;

      const isFlinksStep =
        previousLevel ===
        UNDERWRITING_RULES.$17_REQUEST_BANK_DETAILS.ruleNumber;

      if (isFlinksStep) {
        // GET FLINKS RESPONSE FROM DB
      }

      const rulesPromises = getPendingRulesByGroupNumber(
        {
          user: userData,
          screenTracking,
          optionalData: {}, // FLINKS STORED RESPONSE
        },
        screenTracking.rulesDetails
      );

      await processRules(rulesPromises.slice(1));

      const isLead =
        screenTracking.origin === Screentracking.origins.LEADS_PROVIDER;

      const newLastLevel = isLead
        ? Screentracking.screens.EMPLOYMENT_INFO
        : previousLevel + 1;
      userData;

      await Object.assign(screenTracking, {
        lastlevel: newLastLevel,
        lastLevel: newLastLevel,
        kbaRequested: true,
        kbaApproved: true,
      }).save();
      res.status(200).json(responsePayload);
    } else {
      const failingStatus = new Map([
        [5, "Wrong answer sent!"],
        [6, "Expired!"],
      ]);

      const reason =
        failingStatus.get(kbaResponse.Status) || `Unexpected error!`;

      Object.assign(underwritingContext.underwritingDecision, {
        kbaApproved: false,
        status: FAILED,
        reason,
      });

      responsePayload.reason = reason;
    }

    await Screentracking.updateUnderwritingContext(
      screenTrackingId,
      underwritingContext
    );

    if (underwritingContext?.underwritingDecision?.status === FAILED) {
      throw new ErrorHandler(400, responsePayload, FAILED);
    }
  } catch (error) {
    SendError(error, res);
  }
}

async function sendOtpResponse(req, res) {
  try {
    const { screenTrackingId } = req.params;
    const { code } = req.body;
    const userId = req.user.id;

    const { raw: report } = await TransUnionTrueValidate.getLatestReportForUser(
      userId,
      TransUnionTrueValidate.caseTypes.OTP_REQUEST
    );

    const screenTracking = await Screentracking.getScreenTracking(
      { id: screenTrackingId, user: req.user.id },
      ["user"]
    );

    const userData = { ...screenTracking.user };

    const { AuthURL: otpAuthUrl } = report;

    const response = await sendOtpResponseCode(otpAuthUrl, code);

    const { context: underwritingContext } = initContext(
      UNDERWRITING_RULES.$6_TRANSUNION_FRAUD_VALIDATION
    );

    const isSuccessResponse = response.Status === 1;
    if (isSuccessResponse) {
      const lastlevel = Screentracking.screens.EMPLOYMENT_INFO;

      await Object.assign(screenTracking, {
        lastlevel,
        lastLevel: lastlevel,
        otpRequested: true,
        otpApproved: true,
      }).save();
    } else {
      const failingStatus = new Map([
        [2, "Wrong code sent!"],
        [5, "Max retries count reach!"],
        [6, "Code is expired!"],
      ]);

      const reason =
        failingStatus.get(response.Status) ||
        `returned status - ${response.Status}`;

      Object.assign(underwritingContext.underwritingDecision, {
        otpApproved: false,
        status: FAILED,
        reason,
      });

      // CommunicationService.sendApplicationCommunication(
      //   "NED",
      //   screenTracking.user
      // );
    }

    TransUnionTrueValidate.saveTrueValidateResponse(
      req.user.id,
      TransUnionTrueValidate.caseTypes.OTP_RESPONSE,
      response
    );

    await Screentracking.updateUnderwritingContext(
      screenTrackingId,
      underwritingContext
    );

    if (underwritingContext.underwritingDecision.status === PASSED) {
      const rule6 = await TrueValidateFraudRisk({
        screenTracking,
        user: userData,
      });

      if ([FAILED, PENDING].includes(rule6.status)) {
        throw new ErrorHandler(400, rule6.reason, rule6.status);
      }
    }

    res
      .status(isSuccessResponse ? 200 : 400)
      .json({ success: isSuccessResponse });
  } catch (error) {
    sails.log.error(
      "ApiApplicationController#createApplication :: Underwriting err:",
      error.stack || error.message || error
    );
    SendError(new ErrorHandler(400, error), res);
  }
}

async function getLoanDocuments(req, res) {
  try {
    const { screenTrackingId } = req.params;
    const { userId } = req.body;

    const isExist = await User.isExist(userId);
    if (!isExist) throw new ErrorHandler(404, "User Not Found");

    const loanDocs = await LoanDocument.getAllDocuments(
      screenTrackingId,
      userId
    );

    res.json({
      data: loanDocs,
      msg: "Fetched Successfully",
    });
  } catch (error) {
    SendError(new ErrorHandler(400, error), res);
  }
}

async function uploadLoanDocument(req, res) {
  try {
    const screenTrackingId = req.params.screenTrackingId;
    const userId = req.user.id;

    const isExist = await User.isExist(userId);
    if (!isExist) throw new ErrorHandler(404, "User Not Found");

    const response = {};
    const payload = { loanId: screenTrackingId, userId };

    const governmentId = new Promise((resolve, reject) => {
      req.file("gid").upload(async function(err, files) {
        payload.label = LoanDocument.LoanDocType.GOVERNMENT_ID;
        const data = await ApiApplicationService.grabAndStoreFile(
          files,
          "GovernmentId",
          payload
        );
        response.gid = data[0];
        resolve(data);
      });
    });

    const payCheck = await new Promise((resolve, reject) => {
      req.file("paycheck").upload(async function(err, files) {
        payload.label = LoanDocument.LoanDocType.PAYCHECK_STUB;
        const data = await ApiApplicationService.grabAndStoreFile(
          files,
          "Paycheck",
          payload
        );
        response.paycheck = data[0];
        resolve(data);
      });
    });

    const bankStatement = new Promise((resolve, reject) => {
      req.file("statement").upload(async function(err, files) {
        payload.label = LoanDocument.LoanDocType.BANK_STATEMENT;
        const data = await ApiApplicationService.grabAndStoreFile(
          files,
          "BankStatement",
          payload
        );
        response.bankStatement = data[0];
        resolve(data);
      });
    });

    await Promise.all([governmentId, payCheck, bankStatement]);

    await Screentracking.updateContext(
      { user: userId, id: screenTrackingId },
      { lastlevel: 7 }
    );

    res.json(response);
  } catch (error) {
    SendError(new ErrorHandler(400, error), res);
  }
}

async function storeInitialSelectedOffer(req, res) {
  try {
    const userId = req.user.id;
    const screenTrackingId = req.param("screenTrackingId");

    const result = await Screentracking.storeInitialOffer(
      { user: userId, id: screenTrackingId },
      req.body
    );

    await Screentracking.updateContext(
      { user: userId, id: screenTrackingId },
      { lastlevel: Screentracking.screens.BANK_INFO }
    );

    const paymentContext = {
      loanTermCount: req.body.term,
      interestApplied: req.body.interestRate,
    };
    const paymentQuery = {
      screenTracking: screenTrackingId,
      user: userId,
    };
    PaymentManagementModel.updatePaymentManagement(
      paymentQuery,
      paymentContext
    );

    return res.json({ message: result });
  } catch (err) {
    SendError(new ErrorHandler(400, error), res);
  }
}

async function confirmApplicationReview(req, res) {
  try {
    const userId = req.user.id;
    const screenTrackingId = req.param("screenTrackingId");

    await Screentracking.updateContext(
      { user: userId, id: screenTrackingId },
      { lastlevel: Screentracking.screens.SIGN_CONTRACT }
    );
    EsignatureService.runPaymentAmortization(screenTrackingId, userId);
    return res.json({ message: "ok" });
  } catch (error) {}
}

async function createApplication(req, res) {
  const context = { screentrackingId: null, userId: null };
  try {
    const application = req.body;
    const userInfo = {
      firstName: application.firstName,
      lastName: application.lastName,
      phoneNumber: application.phone,
      phones: [
        { phone: application.phone, type: Screentracking.phoneType.CELL_PHONE },
      ],
      requestedLoan: application.requestedLoan,
      dateOfBirth: application.dob,
      ssn_number: application.ssn,
      email: application.email,
      password: application.password,
      street: application.street,
      city: application.city,
      zipCode: application.zipCode,
      state: application.state,
      ssnNumber: application.ssn,
    };
    if (!userInfo.ssn_number) {
      userInfo.ssn_number = application.ssn.replace(/[^0-9]/g, "").substr(0, 9);
      userInfo.ssnNumber = application.ssn.replace(/[^0-9]/g, "").substr(0, 9);
    }

    const isNotValid = await ApiApplicationService.validateUserInfo(userInfo);
    if (isNotValid) {
      throw new ErrorHandler(400, isNotValid);
    }

    let rulesPromises = [];

    rulesPromises = getRulesByRulesNumber({ user: userInfo }, [
      UNDERWRITING_RULES.$1_DUPLICATE_APPLICATION.ruleNumber,
      UNDERWRITING_RULES.$2_BLOCKED_STATES.ruleNumber,
    ]);

    await processRules(rulesPromises, handleRuleResponse);

    // Step 1: Create User and Screentracking
    const createdNewUser = await User.createNewUser(null, userInfo);
    if (createdNewUser.code == 500) {
      throw new ErrorHandler(500, "Internal Server Error", "");
    }
    // if (createdNewUser.code == 400) {
    //   throw new ErrorHandler(400, createdNewUser.dupusererror);
    // }

    const user = createdNewUser.userdetails;
    const applicationReferenceData = await User.getNextSequenceValue(
      "application"
    );
    context.userId = user.id;

    const previousScreenTracking = await Screentracking.getLastScreenName(
      user
    ).catch();

    const screentrackingDocInitial = {
      applicationReference: `APL_${applicationReferenceData.sequence_value}`,
      origin: Screentracking.origins.WEBSITE,
      user: user.id,
      requestedLoanAmount: application.requestedLoan,
      trueValidateSessionId: application.trueValidateSessionId,
      offerData: [{ financedAmount: application.requestedLoan }],
    };
    const screentrackingDoc = Object.assign(screentrackingDocInitial, null);

    const screenTracking =
      previousScreenTracking ||
      (await Screentracking.createContext(screentrackingDoc));
    context.screentrackingId = screenTracking.id;

    if (previousScreenTracking) {
      delete userInfo.password;
      Object.assign(user, userInfo);
    }

    await User.updateContext(
      { id: user.id },
      Object.assign(
        { screenTracking: screenTracking.id },
        previousScreenTracking ? userInfo : {}
      )
    );

    const practiceResult = await PracticeManagementModel.createPractice(
      application
    );
    if (!practiceResult) throw new ErrorHandler(500, "Partial Service Outage");

    const pmContext = {
      screenTracking: screenTracking.id,
      loanReference: `APL_${applicationReferenceData.sequence_value}`,
      user: user.id,
      practiceManagement: practiceResult.id,
      principalAmount: application.requestedLoan,
    };
    const payResult = await PaymentManagementModel.createContext(pmContext);

    // saving practice id in screentracking modelpic
    Screentracking.updateContext(
      { id: screenTracking.id },
      { practiceManagement: practiceResult.id, paymentManagement: payResult.id }
    );

    if (previousScreenTracking) {
      rulesPromises = getPendingRulesByGroupNumber(
        { user, screenTracking },
        previousScreenTracking.rulesDetails
      );
    } else {
      rulesPromises = getRulesByRulesNumber({ user, screenTracking }, [
        UNDERWRITING_RULES.$3_CURRENT_CUSTOMER_SCREEN.ruleNumber,
        UNDERWRITING_RULES.$4_CHECK_DNL_LIST.ruleNumber,
        UNDERWRITING_RULES.$5_CLARITY_CLEAR_INQUIRE.ruleNumber,
        UNDERWRITING_RULES.$6_TRANSUNION_FRAUD_VALIDATION.ruleNumber,
      ]);
    }

    await processRules(rulesPromises);

    Screentracking.updateContext(
      { id: screenTracking.id },
      { lastlevel: Screentracking.screens.EMPLOYMENT_INFO }
    );

    const userToken = sails.config.getMagicLoginLink(screenTracking, user);

    sendMagicLoginLink(user, userToken);
    return res.status(200).json({
      success: true,
      data: { user: user, screentracking: screenTracking },
    });
  } catch (err) {
    sails.log.error("ApiApplicationController#createApplication::Error", err);
    SendError(new ErrorHandler(400, err, undefined, context), res);
  }
}

async function createEmploymentHistory(req, res) {
  try {
    const application = req.body;
    const { screenTrackingId } = req.params;
    const { id: userId } = req.user;

    const employmentHistoryData = {
      typeOfIncome: application.typeOfIncome,
      employerName: application.employerName,
      employerPhone: application.employerPhone,
      employerStatus: application.employerStatus, // Does not exist in model,
      annualIncome: application.annualIncome,
      residencePhone: application.residencePhone,
      user: userId,
      screenTrackingId,
    };

    const screentrackingData = await Screentracking.getScreenTracking({
      id: screenTrackingId,
      user: userId,
    });

    await Object.assign(screentrackingData, {
      annualIncome: application.annualIncome,
    }).save();

    const userData = await User.getuserById(userId);
    if (!userData) {
      throw new ErrorHandler(404, "User not found");
    }

    const phoneList = userData.phones || [];
    if (application?.residencePhone) {
      phoneList.push({
        phone: application.residencePhone,
        type: Screentracking.phoneType.RESIDENCE,
      });
    }
    phoneList.push({
      phone: application.employerPhone,
      type: Screentracking.phoneType.WORK_PHONE,
    });

    const rulesPromises = getRulesByRulesNumber(
      { user: userData, screenTracking: screentrackingData },
      [
        UNDERWRITING_RULES.$7_MINIMUM_INCOME.ruleNumber,
        UNDERWRITING_RULES.$8_CLARITY_CLEAR_CREDIT.ruleNumber,
        UNDERWRITING_RULES.$9_FACTOR_TRUST_CALL.ruleNumber,
        UNDERWRITING_RULES.$10_DUAL_SCORE.ruleNumber,
        UNDERWRITING_RULES.$11_ASSIGN_APR.ruleNumber,
        UNDERWRITING_RULES.$12_MINIMUM_PAYMENT.ruleNumber,
        UNDERWRITING_RULES.$13_MAXIMUM_LOAN_AMOUNT.ruleNumber,
        UNDERWRITING_RULES.$14_LOAN_AMOUNT_ASSIGNMENT.ruleNumber,
        UNDERWRITING_RULES.$15_LOAN_TERM_OPTION.ruleNumber,
      ]
    );

    await processRules(rulesPromises, handleRuleResponse);

    const validationErr = await ApiApplicationService.validateEmploymentHistory(
      employmentHistoryData
    );
    if (validationErr) {
      throw new ErrorHandler(400, validationErr);
    }

    const employmentHistory = await EmploymentHistory.findOrCreate(
      employmentHistoryData
    );

    const ScreentrackingContext = {
      lastlevel: Screentracking.screens.CHOOSE_OFFER,
      paymentFrequency:
        employmentHistory.payFrequency ||
        SmoothPaymentService.paymentFrequencyEnum.BI_WEEKLY,
      isAfterHoliday: employmentHistory.isAfterHoliday,
      // annualIncome: Number(application.annualIncome),
    };
    console.log("phoneList@@@@@@", phoneList);
    await Object.assign(userData, {
      phones: phoneList,
    }).save();

    await Screentracking.updateContext(
      { user: userId, id: screenTrackingId },
      ScreentrackingContext
    );

    // const logMessage = `Level#${Screentracking.screens.PERSONAL_INFO} Personal Information Completed`;
    // LogActivityService.createApplicationLog(screentrackingData, logMessage);

    return res.status(200).json({ status: true, data: employmentHistory });
  } catch (error) {
    SendError(new ErrorHandler(400, error), res);
  }
}

async function getEmploymentHistory(req, res) {
  try {
    const data = await EmploymentHistory.findOne({ user: req.user.id });
    return res.status(200).json({ status: true, data });
  } catch (err) {
    return res.status(500).json({
      message:
        err.message ||
        "An error occurred while trying to get employment history.",
    });
  }
}

async function updateEmployerInfo(req, res) {
  try {
    const employerData = req.body;
    const { id: userId } = req.user;
    const employmentId = req.param("employmentId");

    if (
      !employerData ||
      _.some(
        [
          "typeOfIncome",
          "annualIncome",
          "employerName",
          "employerPhone",
          "employerStatus",
        ],
        (employerItemKey) => {
          return !employerData[employerItemKey];
        }
      )
    ) {
      const errorMessage =
        "Unable to update employment info. Missing required data";
      sails.log.error(
        "AchController#ajaxUpdateEmployerTabInformation ERROR: ",
        errorMessage
      );
      return res.status(400).json({ message: errorMessage });
    }
    const userUpdateData = await ApiApplicationService.updateEmploymentInfo(
      employerData,
      employmentId,
      userId
    );
    const ScreentrackingContext = {
      annualIncome: employerData.annualIncome,
    };
    console.log("========", userUpdateData.screenTrackingId);
    await Screentracking.updateContext(
      { user: userId, id: userUpdateData.screenTrackingId },
      ScreentrackingContext
    );

    if (userUpdateData) {
      req.session["employmentInfoTab"] = true;
      return res.json(userUpdateData);
    }
    const errorMessage =
      "Unable to update employment info. Unknown error occurred";
    sails.log.error(
      "AchController#ajaxUpdateEmployerTabInformation ERROR: ",
      errorMessage
    );
    return res.status(500).json({ message: errorMessage });
  } catch (error) {
    sails.log.error(
      "AchController#ajaxUpdateEmployerTabInformation :: err - ",
      error.stack || error
    );
    SendError(error, res);
  }
}

async function updateUserInfo(req, res) {
  try {
    const updatedInfo = req.body;
    const userId = req.user.id || null;
    if (!!userId) {
      let updatedUser = await ApiApplicationService.updateUserInfo(
        userId,
        updatedInfo
      );
      return res.status(200).json(updatedUser);
    }
    return res.status(400).json({ message: "Missing User Id" });
  } catch (err) {
    return res.status(500).json({ err });
  }
}

async function getUserInfo(req, res) {
  let { id: userId } = req.user;
  if (!!userId) {
    try {
      const userInfo = await Screentracking.getLastScreenName({ id: userId }, [
        "user",
      ]);
      return res.status(200).json(userInfo);
    } catch (err) {
      sails.log.error("ApiApplicationController#getUserInfo -- Error: ", err);
      return res.status(500).json(err);
    }
  }
  return res.status(400).json({ message: "Request must contain userId." });
}

async function updateUserFinancialInfo(req, res) {
  try {
    const updatedInfo = req.body;
    const userId = req.body.userId || null;
    if (!!userId) {
      const updatedInfo = await ApiApplicationService.updateUserFinancialInfo(
        userId,
        updatedInfo
      );
      return res.status(200).json(updatedInfo);
    }
    return res.status(400).json({ message: "Missing User Id" });
  } catch (err) {
    return res.status(500).json({ err });
  }
}

async function createApplicationOffers(req, res) {
  const userId = req.body.userId;
  const userData = await User.findOne(userId);
  const screentrackingData = await Screentracking.findOne({ user: userId });

  if (
    userData.isFromLeadApi &&
    !userData.leadReject &&
    !userData.isBankVerified
  ) {
    //if they are a lead and are not rejected and have not verified their bank info (I don't know if this is applicable for Patria)
    return res.redirect(`/verifybankinfo`);
  } else {
    const offersArray = OffersService.generateOffersArray(
      screentrackingData.requestedLoanAmount,
      screentrackingData.paymentFrequency
    );
    screentrackingData.offers = offersArray;
    await screentrackingData.save();

    return res
      .status(200)
      .json({ data: screentrackingData.offers, screentrackingData, userData });
  }
}

async function getApplicationOffers(req, res) {
  try {
    const screenTrackingId = req.param("screenTrackingId");
    const screentrackingData = await Screentracking.getScreetrackingAndPopulate(
      { id: screenTrackingId },
      "user"
    );
    const { terms, apr, assignedLoan } = screentrackingData?.offerData[0];
    if (!terms || terms.length === 0) {
      throw new ErrorHandler(404, "offers not available");
    }

    const getRegularPayment = (financedAmount, apr, term) => {
      function fn(financedAmount, apr, numberOfPayments) {
        const weeklyInterestRate = apr / 100 / 52;
        const expression = Math.pow(1 + weeklyInterestRate, numberOfPayments);
        return (
          financedAmount *
          ((weeklyInterestRate * expression) / (expression - 1))
        );
      }

      switch (term) {
        case 6:
          return fn(financedAmount, apr, 26);
        case 9:
          return fn(financedAmount, apr, 39);
        case 12:
          return fn(financedAmount, apr, 52);
        default:
          throw new ErrorHandler(400, "Invalid term");
      }
    };

    const totalPaid = (assignedLoan * apr) / 100;

    const userOffers = terms.map((term) => {
      const offer = {
        apr: apr,
        term: term,
        totalPaid,
        regularPayment: parseFloat(
          getRegularPayment(assignedLoan, apr, term).toFixed(9)
        ),
        financedAmount: assignedLoan,
        interestRate: parseFloat((apr / 52).toFixed(9)),
        loanCost: totalPaid - assignedLoan,
      };
      return offer;
    });
    return res.status(200).json({ data: userOffers });
  } catch (error) {
    SendError(error, res);
  }
}

function saveOffers(req, res) {
  return Promise.resolve()
    .then(async () => {
      const reqParams = req.body;
      sails.log.verbose("postOffers; reqParams:", reqParams);
      const screenId = _.get(reqParams, "screenId", null);
      const offerid = _.get(reqParams, "id", null);
      const user = {};
      const screentracking = {};
      await Screentracking.findOne({ id: screenId, isCompleted: false })
        .populate("user")
        .then((screendetail) => {
          if (screendetail) {
            _.assign(screentracking, screendetail);
            _.assign(user, screendetail.user);
            return;
          }
          throw new Error(`Screentracking not found by id: ${screenId}`);
        });
      const offers = _.get(screentracking, "offers", []);
      if (!Array.isArray(offers) || offers.length == 0) {
        throw new Error(`Offers not found by screentracking: ${screenId}`);
      }
      const selectedOffer = offers[0];
      _.some(offers, (offer) => {
        if (String(offer.id) == offerid) {
          _.assign(selectedOffer, offer);
          return true;
        }
      });
      await Screentracking.update(
        { id: screentracking.id },
        {
          offerdata: [selectedOffer],
          lastlevel: Screentracking.screens.BANK_INFO,
          lastpage: "contract",
        }
      ).then((updated) => _.assign(screentracking, updated[0]));

      var userId = req.session.userId;
      return res.status(200).json({ data: screentracking.offerdata });
    })
    .catch((err) => {
      sails.log.error("postOffers; catch:", err);
      return res.status(500).json({ err });
    });
}
