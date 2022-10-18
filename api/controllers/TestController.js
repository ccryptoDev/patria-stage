/* global sails, MathExt */
"use strict";

/**
 * TestController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

const _ = require("lodash");
const moment = require("moment");

const ip = require("ip");
const Screentracking = require("../models/Screentracking");
const {
  UNDERWRITING_RULES,
} = require("../services/underwriting_steps/helpers");
const MinimumIncome = require("../services/underwriting_steps/7.minimumIncome");
const isDuplicated = require("../services/underwriting_steps/1.isDuplicated");
const DualScore = require("../services/underwriting_steps/10.DualScore");
const AssignAPR = require("../services/underwriting_steps/11.AssignAPR");
const { SendError, ErrorHandler } = require("../services/ErrorHandling");
const CalculateMaximumLoanAmount = require("../services/underwriting_steps/13.calculateMaximumLoanAmount");
const CalculateMaximumPayment = require("../services/underwriting_steps/12.calculateMaximumPayment");
const TrueValidateFraudRisk = require("../services/underwriting_steps/6.TrueValidateFraudRisk");
const factorTrustDelinquencyRiskCheck = require("../services/underwriting_steps/9.factorTrustDelinquencyRiskCheck");
const checkForBlockedStates = require("../services/underwriting_steps/2.checkForBlockedStates");
const checkInDnlList = require("../services/underwriting_steps/4.checkInDnlList");
const clarityClearInquiry = require("../services/underwriting_steps/5.clarityClearInquiry");
const PaymentManagementModel = require("../models/PaymentManagement");

module.exports = {
  getLatestPdfReport,
  testClarityServiceCalls: testClarityServiceCalls,
  testFactorTrustLendProtect: testFactorTrustLendProtect,
  // testUnderwriting: testUnderwritingWaterfall,
  regeneratePaymentSchedule: regeneratePaymentSchedule,
  processNachaPayments: processNachaPayments,
  processNachaReturnFile: processNachaReturnFile,
  testSmoothPaymentGeneration,
  testChangingPaymentSchedule,
  insertTestData,
  testAuth,
  testUnderwriting,
  testUnderwritingEmails,
};

async function getLatestPdfReport(req, res) {
  try {
    const { screenTrackingId } = req.params;

    const screenTracking = await Screentracking.getScreenTracking(
      {
        id: screenTrackingId,
      },
      ["user"]
    );

    const getSignature = async () => {
      const { content } = await S3Service.getStreamFromS3File(
        screenTracking.userSignaturePath
      );

      return content;
    };
    const getPayments = async () => {
      const {
        initialPaymentSchedule: payments,
      } = await PaymentManagementModel.getPaymentCollection({
        screenTracking: screenTrackingId,
      });

      payments.map((payment) => {
        payment.date = moment(payment.date).format("YYYY-MM-DD");
      });

      return payments;
    };
    const getCheckingAccount = async () => {
      // const { selectedAccountId, flinksLoginId } = screenTracking.user;

      // const response = await FlinksService.getRequestId(flinksLoginId);
      // if (!response.ok) throw new Error(response.error);

      // const flinksAccount = await FlinksService.retryGetAccountDetails({
      //   requestId: response?.data?.requestId,
      //   loginId: flinksLoginId,
      //   selectedAccountId,
      // });

      // return flinksAccount?.Accounts?.[0];
      return BankService.getDefaultPaymentMethodData(screenTracking.user.id);
    };

    const [
      signature,
      payments,
      selectedCheckingAccount,
    ] = await Promise.all([
      getSignature(),
      getPayments(),
      getCheckingAccount(),
    ]);

    const remotePath = await EsignatureService.generateDocument(
      {
        documentType: "patriaAgreement",
        screenTrackingId,
        user: screenTracking.user,
        signature,
        offer: screenTracking.offers[0],
        payments,
        checkingAccount: {
          routingNumber: selectedCheckingAccount.routingNumber || 'N/A',
          accountNumber: selectedCheckingAccount.accountNumber,
        },
        tribe: sails.config.tribe,
      },
      res
    );

    const pdfDownloadUrl = `${sails.config.env.REACT_APP_ADMIN_BASE_URL}/api/application/s3asset/${remotePath}`;
    res.redirect(pdfDownloadUrl);
  } catch (error) {
    sails.log.error("TestController#getLatestPdfReport::Error", error);
    SendError(new ErrorHandler(400, error.message), res);
  }
}

function testAuth(req, res) {
  return res.send(200);
}

async function testUnderwriting(req, res) {
  try {
    const screenTrackingId = req.param("screenId");
    const { rule } = req.query;
    const { title: ruleName } = UNDERWRITING_RULES[rule];

    if (!ruleName) {
      return res.status(400).json({ error: "Invalid rule" });
    }

    const screenTracking = await Screentracking.getScreenTracking(
      { id: screenTrackingId },
      ["user"]
    );
    if (!screenTracking) {
      return res.status(404).json({
        ok: false,
        msg: "Application not found",
      });
    }

    const selector = {
      [UNDERWRITING_RULES.$1_DUPLICATE_APPLICATION.title]: (_, userData) =>
        isDuplicated(userData),
      [UNDERWRITING_RULES.$2_BLOCKED_STATES.title]: async (_, userData) => {
        userData.state = "GA";
        return checkForBlockedStates(userData);
      },
      [UNDERWRITING_RULES.$4_CHECK_DNL_LIST.title]: checkInDnlList,
      [UNDERWRITING_RULES.$5_CLARITY_CLEAR_INQUIRE.title]: (
        screenTracking,
        userData
      ) => clarityClearInquiry(userData, screenTracking),
      [UNDERWRITING_RULES.$6_TRANSUNION_FRAUD_VALIDATION
        .title]: TrueValidateFraudRisk,
      [UNDERWRITING_RULES.$7_MINIMUM_INCOME.title]: MinimumIncome,
      [UNDERWRITING_RULES.$9_FACTOR_TRUST_CALL
        .title]: factorTrustDelinquencyRiskCheck,
      [UNDERWRITING_RULES.$10_DUAL_SCORE.title]: DualScore,
      [UNDERWRITING_RULES.$11_ASSIGN_APR.title]: AssignAPR,
      [UNDERWRITING_RULES.$12_MINIMUM_PAYMENT.title]: CalculateMaximumPayment,
      [UNDERWRITING_RULES.$13_MAXIMUM_LOAN_AMOUNT
        .title]: CalculateMaximumLoanAmount,
    };

    if (!selector[ruleName]) {
      return res.status(400).json({ error: "Rule test not implemented" });
    }

    const result = await selector[ruleName]({
      screenTracking,
      user: screenTracking.user,
    });

    return res.json(result);
  } catch (error) {
    SendError(error, res);
  }
}

async function testUnderwritingEmails(req, res) {
  try {
    const body = req.allParams();
    const { email, phone = "111111111" } = body;

    await CommunicationService.sendApplicationCommunication({
      communicationCode: req.query.communicationCode || "DA",
      user: { email, phoneNumber: phone },
      data: { completeApplicationLink: "LINK", smsLink: "SMS_LINK" },
    });

    res.status(204).json({ success: true });
  } catch (error) {
    sails.log.error("TestController.testUnderwritingEmails: ", error);
    res.status(400).json({ error: error.message });
  }
}

// --Actum debit recurring
function testActumRecurringPaymentAction(req, res) {
  CronService.getAllActumDebitPayment(req, res)
    .then(function(responseData) {
      const json = {
        status: 200,
        message: "Actum debit recurring payment success",
        responseData: responseData,
      };
      res.contentType("application/json");
      res.json(json);
    })
    .catch(function(err) {
      sails.log.error("Error:", err);

      const json = {
        status: 400,
        message: "Unable to perform actum debit recurring payment",
      };
      res.contentType("application/json");
      res.json(json);
    });
}

// --stripe recurring for practice
function testStripeRecurringPaymentAction(req, res) {
  CronService.getAllStripeRecurringPayment(req, res)
    .then(function(responseData) {
      const json = {
        status: 200,
        message: "Stripe recurring payment success",
        responseData: responseData,
      };
      res.contentType("application/json");
      res.json(json);
    })
    .catch(function(err) {
      sails.log.error("Error:", err);

      const json = {
        status: 400,
        message: "Unable to perform stripe recurring payment",
      };
      res.contentType("application/json");
      res.json(json);
    });
}

// --Actum check payment
function testCheckActumPaymentAction(req, res) {
  // var history_id='80574575';
  const order_id = 18585977;

  ActumService.checkActumPaymentStatus(order_id)
    .then(function(responseData) {
      sails.log.info("Enter Actum responseData::", responseData);

      if (responseData.status == 200) {
        var json = {
          responseData: responseData,
        };
      } else {
        var json = {
          responseData: responseData,
        };
      }
      res.contentType("application/json");
      res.json(json);
    })
    .catch(function(err) {
      sails.log.error("Error:", err);

      const json = {
        status: 400,
        message: "Unable to check payment status",
      };
      res.contentType("application/json");
      res.json(json);
    });
}

// --Actum test debit
function testActumDebitAction(req, res) {
  const userData = [];
  const accountData = [];
  const amount = "1.00";
  const IPFromRequest =
    req.headers["x-forwarded-for"] || req.connection.remoteAddress;

  ActumService.processActumDebitPayment(
    userData,
    accountData,
    amount,
    IPFromRequest
  )
    .then(function(responseData) {
      if (responseData.status == 200) {
        var json = {
          responseData: responseData,
        };
      } else {
        var json = {
          responseData: responseData,
        };
      }
      res.contentType("application/json");
      res.json(json);
    })
    .catch(function(err) {
      sails.log.error("Error:", err);

      const json = {
        status: 400,
        message: "Unable to create debit transaction",
      };
      res.contentType("application/json");
      res.json(json);
    });
}

function testTransuniounAction() {
  const apiuserRefNumber = sails.config.applicationConfig.apiuserRefNumber;
  const apiindustryCode = sails.config.applicationConfig.apiindustryCode;
  const apimemberCode = sails.config.applicationConfig.apimemberCode;
  const apiprefixCode = sails.config.applicationConfig.apiprefixCode;
  const apiKeyPassword = sails.config.applicationConfig.apiKeyPassword;
  const apiEnv = sails.config.applicationConfig.apiEnv;
  const apiPassword = sails.config.applicationConfig.apiPassword;

  const addressarray = {
    untiapt: "",
    street_name: "Deeboyer",
    city: "Lakewood	",
    state: "CA",
    zip_code: "90712",
  };

  const userArray = {
    first: "Anita",
    middle: "",
    last: "Abdo",
  };

  const transactionControl = {
    userRefNumber: apiuserRefNumber,
    subscriber: {
      industryCode: apiindustryCode,
      memberCode: apimemberCode,
      inquirySubscriberPrefixCode: apiprefixCode,
      password: apiPassword,
    },
    options: {
      processingEnvironment: apiEnv,
      country: "us",
      language: "en",
      contractualRelationship: "individual",
      pointOfSaleIndicator: "none",
    },
  };

  const certificate = {
    key: "WAKPAMNIKEY.pem",
    crt: "WAKPAMNI.pem",
    password: apiKeyPassword,
  };

  const userDetail = {
    id: "5b5efde2e7247064aa3bd5c1",
    email: "vigneshs002@gmail.com",
    dateofBirth: "04/22/1996",
  };

  Transunion.createcertificate(
    userArray,
    addressarray,
    "666429061",
    userDetail,
    transactionControl
  )
    .then(function(responseDetails) {
      sails.log.info("responseDetails", responseDetails);

      if (responseDetails.code == 200) {
        Screentracking.updateApplicationDetails(userDetail, addressarray)
          .then(function(applicationDetails) {
            sails.log.info("applicationDetails", applicationDetails);
          })
          .catch(function(err) {
            sails.log.error(
              "ApplicationService#createcertificate::Err ::",
              err
            );
            const responsedata = {
              code: 400,
              message: "Could not recieve your credit details",
            };
            return resolve(responsedata);
          });
      }
    })
    .catch(function(err) {
      sails.log.error("ApplicationService#createcertificate::Err ::", err);
      // return reject(err);
      const responsedata = {
        code: 400,
        message: "Could not recieve your credit details",
      };
      return resolve(responsedata);
    });
}

// --Regenerate promissory note
function testRegeneratePromissoryNoteAction(req, res) {
  let limitvalue = 1; // -- default
  if (
    "undefined" !== typeof req.param("limitvalue") &&
    req.param("limitvalue") != "" &&
    req.param("limitvalue") != null
  ) {
    limitvalue = req.param("limitvalue");
  }

  const consentcriteria = {
    documentKey: "202",
    loanupdated: 1,
    paymentManagement: { $exists: true },
    regenerate: { $exists: false },
  };

  /* var criteriaID ='5c41e8f6cd3b1d763d6dec4d';
	var consentcriteria={
		id:criteriaID
	}*/

  UserConsent.find(consentcriteria)
    // .populate(user)
    // .populate(paymentManagement)
    .sort("createdAt ASC")
    .limit(limitvalue)
    .then(function(consentDetails) {
      sails.log.info("consentDetails.length:", consentDetails.length);

      if (consentDetails.length > 0) {
        const forlength = consentDetails.length;
        let loopcount = 0;
        let errorloopcount = 0;
        const lendingerrorloopcount = 0;
        _.forEach(consentDetails, function(consentData) {
          const paymentDataId = consentData.paymentManagement;
          const userDataId = consentData.user;

          sails.log.info("paymentId:", paymentDataId);
          sails.log.info("userId:", userDataId);
          sails.log.info("---------------------------:");

          ApplicationService.reGeneratepromissorypdf(
            paymentDataId,
            userDataId,
            req,
            res
          )
            .then(function(generatedResponse) {
              sails.log.info("generatedResponse:", generatedResponse);

              if (generatedResponse) {
                UserConsent.update(
                  { id: consentData.id },
                  { regenerate: 1 }
                ).exec(function afterwards(err, updated) {
                  UserConsent.update(
                    { id: generatedResponse.id },
                    { regenerate: 2 }
                  ).exec(function afterwards(err, updated) {
                    loopcount++;

                    if (loopcount == forlength) {
                      const json = {
                        status: 200,
                        message: "Consent count::" + forlength,
                        loopcount: "Loop count::" + loopcount,
                        errorloopcount: "Error Loop count::" + errorloopcount,
                        lendingerrorloopcount:
                          "Lending Error Loop count::" + lendingerrorloopcount,
                      };
                      res.contentType("application/json");
                      res.json(json);
                    }

                    /* UserConsent
							.reGenerateLendingDisclosureAgreement(paymentDataId,res,req)
							.then(function (lendingreponse) {

								sails.log.info("lendingreponse:",lendingreponse);

								if(lendingreponse.code==400)
								{
									errorloopcount++;
									lendingerrorloopcount++;
								}

								loopcount++;

								if(loopcount==forlength)
								{
									var json = {
										status:200,
										message:'Consent count::'+forlength,
										loopcount:'Loop count::'+loopcount,
										errorloopcount:'Error Loop count::'+errorloopcount,
										lendingerrorloopcount:'Lending Error Loop count::'+lendingerrorloopcount
									};
									res.contentType('application/json');
									res.json(json);
								}
							 })
							 .catch(function (err) {

									sails.log.info("Error:",err);

									loopcount++;
									errorloopcount++;
									lendingerrorloopcount++;

									if(loopcount==forlength)
									{
										var json = {
											status:200,
											message:'Consent count::'+forlength,
											loopcount:'Loop count::'+loopcount,
											errorloopcount:'Error Loop count::'+errorloopcount,
											lendingerrorloopcount:'Lending Error Loop count::'+lendingerrorloopcount
										};
										res.contentType('application/json');
										res.json(json);
									}
							 });*/
                  });
                });
              } else {
                sails.log.info("consent not generated:");

                loopcount++;
                errorloopcount++;

                if (loopcount == forlength) {
                  const json = {
                    status: 200,
                    message: "Consent count::" + forlength,
                    loopcount: "Loop count::" + loopcount,
                    errorloopcount: "Error Loop count::" + errorloopcount,
                    lendingerrorloopcount:
                      "Lending Error Loop count::" + lendingerrorloopcount,
                  };
                  res.contentType("application/json");
                  res.json(json);
                }
              }
            })
            .catch(function(err) {
              sails.log.info("Final Error:", err);

              loopcount++;
              errorloopcount++;

              if (loopcount == forlength) {
                const json = {
                  status: 200,
                  message: "Consent count::" + forlength,
                  loopcount: "Loop count::" + loopcount,
                  errorloopcount: "Error Loop count::" + errorloopcount,
                  lendingerrorloopcount:
                    "Lending Error Loop count::" + lendingerrorloopcount,
                };
                res.contentType("application/json");
                res.json(json);
              }
            });
        });
      } else {
        const json = {
          status: 400,
          message: "No consent found::" + consentDetails.length,
        };
        res.contentType("application/json");
        res.json(json);
      }
    })
    .catch(function(err) {
      const json = {
        status: 500,
        message: err,
      };
      res.contentType("application/json");
      res.json(json);
    });
}

function testcheckCreditStatusAction(req, res) {
  CronService.checkLenderCreditStatus(req, res)
    .then(function(responseData) {
      const json = {
        status: 200,
        message:
          "Actum " + sails.config.lender.shortName + " Credit Status success",
        responseData: responseData,
      };
      res.contentType("application/json");
      res.json(json);
    })
    .catch(function(err) {
      sails.log.error("Error:", err);

      const json = {
        status: 400,
        message:
          "Unable to perform " +
          sails.config.lender.shortName +
          " Credit Status",
      };
      res.contentType("application/json");
      res.json(json);
    });
}

function testShowInterestRateAction(req, res) {
  const stateCode = req.param("statecode");
  const term = parseInt(req.param("term"));
  const maxloanamount = parseInt(req.param("amount"));

  const intcriteria = {
    stateCode: stateCode,
    term: term,
    maxloanamount: maxloanamount,
  };

  // sails.log.info('testController#testShowInterestRateAction :: intcriteria::', intcriteria);

  Loaninterestrate.find(intcriteria)
    .then(function(interestData) {
      const gradecriteria = {
        stateCode: stateCode,
        gradeterm: term,
        maxloanamount: maxloanamount,
      };

      Loangradesettings.find(gradecriteria)
        .then(function(gradeData) {
          interestData = _.orderBy(interestData, ["maxcreditscore"], ["desc"]);
          gradeData = _.orderBy(gradeData, ["gradelevel"], ["asc"]);

          const responseData = {
            interestData: interestData,
            gradeData: gradeData,
            interestlength: interestData.length,
            gradelength: gradeData.length,
            stateCode: stateCode,
            term: term,
            maxloanamount: maxloanamount,
          };

          sails.log.info(
            "testController#testShowInterestRateAction :: responseData",
            responseData
          );

          res.view("admin/showInterestRate", { responseData: responseData });
        })
        .catch(function(err) {
          sails.log.error(
            "testController#testShowInterestRateAction :: err",
            err
          );
          const errors = err.message;
          res.view("admin/error/404", {
            data: err.message,
            layout: "layout",
          });
        });
    })
    .catch(function(err) {
      sails.log.error("testController#testShowInterestRateAction :: err", err);
      const errors = err.message;
      res.view("admin/error/404", {
        data: err.message,
        layout: "layout",
      });
    });
}
function updateLoansetting(req, res) {
  const loanOptions = {
    $or: [
      { loansettingsupdated: { $eq: 0, $exists: true } },
      { loansettingsupdated: { $exists: false } },
    ],
  };
  PracticeManagement.find(loanOptions).then(function(practicedata) {
    const practiceLength = practicedata.length;
    let loopCount = 0;
    _.forEach(practicedata, function(practice) {
      const inputData = {
        practiceid: practice.id,
        enabledTerms: sails.config.plaid.interestTermsArr,
      };
      LoanSettings.createPracticeLoansettings(inputData, function(
        loansetresponse
      ) {
        sails.log.info("practice ID:", practice.id);
        PracticeManagement.update(
          { id: practice.id },
          { loansettingsupdated: 1 }
        ).exec(function afterwards(err, updated) {
          loopCount++;
          sails.log.info("loop practice ID:", practice.id);
          sails.log.info("loop counter value ", loopCount);
          sails.log.info("=======================================");
          if (loopCount == practiceLength) {
            const json = {
              status: 200,
              message: "Updated",
              loopCount: loopCount,
              practiceLength: practiceLength,
            };
            res.contentType("application/json");
            res.json(json);
          }
        });
      });
    });
  });
}

// --Actum Credit Payment
function testFundPracticeCreditPaymentAction(req, res) {
  const IPFromRequest = ip.address();
  const practiceId = "5b803bf89db31e772cb06e14";

  // -- For testing
  const paybackAmount = "1.00";

  let creditStatus = 0;
  let failure_code = "";
  let failure_message = "";
  let message = "";

  PracticeManagement.findOne({ id: practiceId })
    .then(function(practiceData) {
      ActumService.processPracticeCreditPayment(
        practiceData,
        paybackAmount,
        IPFromRequest
      )
        .then(function(transactionDetail) {
          sails.log.info("transactionDetail::", transactionDetail);
          if (transactionDetail.status == 200) {
            const creditResponseData = transactionDetail.jsonObj;
            const creditStatusTxt = creditResponseData.status.toLowerCase();

            if (
              "undefined" !== typeof creditResponseData.authcode &&
              creditResponseData.authcode != "" &&
              creditResponseData.authcode != null
            ) {
              failure_code = creditResponseData.authcode;
            }

            if (
              "undefined" !== typeof creditResponseData.reason &&
              creditResponseData.reason != "" &&
              creditResponseData.reason != null
            ) {
              failure_message = creditResponseData.reason;
            }

            if (creditStatusTxt == "accepted") {
              creditStatus = 1;
              message = "Payment completed successfully";
            } else if (creditStatusTxt == "declined") {
              creditStatus = 2;
              message =
                "Unable to process credit payment: " +
                failure_message +
                " (" +
                failure_code +
                " )";
            } else if (creditStatusTxt == "verify") {
              creditStatus = 3;
              message = "Unable to process credit payment: " + creditStatusTxt;
            } else {
              creditStatus = 4;
              message =
                "Unable to process credit payment: " +
                failure_message +
                " (" +
                failure_code +
                " )";
            }

            var json = {
              status: 200,
              creditStatus: creditStatus,
              failure_code: failure_code,
              failure_message: failure_message,
              message: message || "Unable to perform actum credit payment",
            };
            res.contentType("application/json");
            res.json(json);
          } else {
            var json = {
              status: 400,
              message: "Unable to perform actum credit payment",
            };
            res.contentType("application/json");
            res.json(json);
          }
        })
        .catch(function(err) {
          sails.log.error("Error:", err);
          const json = {
            status: 400,
            message: "Unable to perform actum credit payment",
          };
          res.contentType("application/json");
          res.json(json);
        });
    })
    .catch(function(err) {
      sails.log.error("Error:", err);
      const json = {
        status: 400,
        message: "Unable to fetch practice details",
      };
      res.contentType("application/json");
      res.json(json);
    });
}

async function testMakeAmortizationSchedule(req, res) {
  const reqParams = req.allParams();
  const payId = parseFloat(reqParams.payId);

  if (!!payId) {
    const paymentManagement = null;
  }
}

function testRCC(req, res) {
  const CREDIT_STATUS = {
    NA: 0,
    PENDING: 1,
    ACCEPTED: 2,
    ERROR: 3,
  };

  const currentStatus = Payment.STATUS_SCHEDULED;

  const test_payment = {
    pmtRef: "pay_2",
    paymentmanagement: "5d95fd9185de9d335e941ab1", // paymentmanagement.id,
    practicemanagement: "5cdc1374c9675b310c26a2bb", // practicemanagement.id,
    user: "5d95fd5285de9d335e941a9f", // user.id,
    type: sails.config.paymentService.TYPES.OPERATING_DEBIT_USER,

    amount: 22.22,
    interestAmount: 2.22,
    principalAmount: 20.0,
    principalBalance: 200,
    // originationFee: ( isFirstPayment ? parseFloat( pfiOriginationFee.toFixed( 2 ) ) : 0.0 ),
    originationFee: 0.0,
    // fixedFee: parseFloat( sails.config.actumConfig.pfiFixedFee ),
    fixedFee: 0.0,
    commissionFee: 0.0,
    commissionAmount: 0.0,
    paybackAmount: 0.0,
    // contractSoldPercentage: parseInt( _.get( paymentmanagement, "contractSoldPercentage", 0 ) ),
    contractSoldPercentage: 0,
    practicePayback: 0.0,
    debtfundPayback: 0.0,
    operatingPayback: 0.0,
    status: currentStatus,
    errReason: "",
    order_id: null,
    history_id: null,
    authcode: null,
    achJoinDate: moment()
      .startOf("day")
      .toDate(),
    pmtRequest: null,
    pmtResponse: null,
    statusRequest: null,
    statusResponse: null,
    practiceCreditStatus: CREDIT_STATUS.NA,
    practiceCreditPmt: null,
    debtfundCreditStatus: CREDIT_STATUS.NA,
    debtfundCreditPmt: null,
  };

  // return Payment.create( test_payment )
  return Promise.resolve()
    .then(() => {
      return PaymentService.rccRequest("XYZ");
    })
    .then(() => {
      const json = {
        status: 200,
      };
      res.contentType("application/json");
      res.json(json);
    })
    .catch((err) => {
      const json = {
        status: 400,
        error: err.message,
      };
      res.contentType("application/json");
      res.json(json);
    });
}

async function testPaymentCompletionCheck(req, res) {
  res.json({ success: true });

  await CollectionsCronService.checkCollectionsCron();

  return;
}

function testFirstPaymentCheck(req, res) {
  CollectionsCronService.checkForFirstPaymentPerforming();
}

function testLatePaymentCollectionCheck(req, res) {
  CollectionsCronService.latePaymentCollectionCheck();
}

function testPaymentReminder(req, res) {
  CronEmailService.paymentReminderEmails();
}

async function testGetAllVikingDebitPayments(req, res) {
  res.json({ ihaveran: "yes" });
  await CronService.getAllVikingDebitPayment("127.0.0.1");
  return;
}
async function testCheckVikingPaymentStatuses(req, res) {
  res.json({ ihaveran: "yes" });
  await CronService.checkVikingPaymentStatuses("127.0.0.1");
  return;
}
//  await CollectionsCronService.checkForLastPaymentCompletion();
//  await CollectionsCronService.checkForFirstPaymentPerforming();
//  await CollectionsCronService.latePaymentCollectionCheck();
//  await CollectionsCronService.checkForNewCollectionItems();
// await CronService.getAllVikingDebitPayment("127.0.0.1");
// await CronService.checkVikingPaymentStatuses("127.0.0.1");

/*********************** CLARITY ***************************/
async function testClarityServiceCalls(req, res) {
  try {
    const clarityResponse = await ClarityService.testVerifyCredit();
    await ClarityResponse.saveClarityResponse(
      "5f3b17ea2b99425583c1e78c",
      clarityResponse
    );
    const json = {
      status: 200,
      message: "Successfully recieved a response",
      clarityResponse: clarityResponse.action,
      // fullResponse: clarityResponse.data,
      denyReason: clarityResponse.deny_descriptions,
    };
    res.json(json);
  } catch (err) {
    sails.log.error(err);
    const json = {
      status: 400,
      message: err.message,
    };
    res.json(json);
  }
}
/** Endpoint: POST /test/waterfall
 * Requires user and screentracking objects in the request
 */
async function testUnderwritingWaterfall(req, res) {
  const user = req.body.user;
  const screentracking = req.body.screentracking;
  const response = await UnderwritingService.underwritingWaterfall(
    user,
    screentracking
  );
  res.send({ success: response.passed, response: response });
}
async function regeneratePaymentSchedule(req, res) {
  const payId = req.param("paymentId");
  const paymentManagement = await PaymentManagement.findOne({ id: payId })
    .populate("user")
    .populate("screentracking");
  const offerData = paymentManagement.screentracking.offerdata[0];
  const today = moment()
    .startOf("day")
    .add(-2, "weeks")
    .add(-3, "day")
    .toDate();
  // const today = moment().startOf("day").toDate();
  // let firstPaymentDate =  moment(today).add(SmoothPaymentService.getCycleDaysInFrequency(SmoothPaymentService.paymentFrequencyEnum.MONTHLY), "day").toDate();
  let firstPaymentDate = moment(today)
    .add(1, "week")
    .add("3", "days")
    .toDate();
  paymentManagement.loanSetdate = today;
  const paySchedule = await SmoothPaymentService.generatePaymentSchedule(
    today,
    firstPaymentDate,
    paymentManagement.screentracking.requestedLoanAmount,
    "W",
    "daily based",
    offerData.interestRate.toFixed(2) / 100,
    offerData.term,
    paymentManagement.scheduleIdSequenceCounter || 1
  );
  if (paymentManagement) {
    if (
      paySchedule &&
      paySchedule.paymentSchedule &&
      paySchedule.paymentSchedule.length > 0
    ) {
      const newPaymentSchedule = paySchedule.paymentSchedule;
      const nextPaymentSchedule = _.find(newPaymentSchedule, (scheduleItem) => {
        return moment()
          .startOf("day")
          .isSameOrBefore(moment(scheduleItem.date).startOf("day"));
      });
      firstPaymentDate = moment(nextPaymentSchedule.date)
        .startOf("day")
        .toDate();
      await PaymentManagement.update(
        { id: payId },
        {
          loanSetdate: today,
          paymentSchedule: newPaymentSchedule,
          initialPaymentSchedule: newPaymentSchedule,
          nextPaymentSchedule: firstPaymentDate,
          // status: "PERFORMING",
          hasWaivedLoan: false,
          loanSetDate: today,
          scheduleIdSequenceCounter: paySchedule.scheduleIdSequenceCounter || 1,
          maturityDate: moment(
            newPaymentSchedule[newPaymentSchedule.length - 1].date
          )
            .startOf("day")
            .toDate(),
          fundingPaymentType: "ACH",
        }
      );
      // await Payment.destroy({paymentmanagement: payId});
      // await Logactivity.destroy({paymentManagement: payId})
      // await Screentracking.update({id: paymentManagement.screentracking.id}, {signACHAuthorization: false, signChangeScheduleAuthorization:false});
    }
  }
  return res.json(paySchedule);
  // return;
}

async function testSmoothPaymentGeneration(req, res) {
  const { requestedLoanAmount, term, interestRate, today: _today } = req.body;
  const {
    getCycleDaysInFrequency,
    paymentFrequencyEnum,
    generatePaymentSchedule,
    determinePaymentAmount,
  } = SmoothPaymentService;

  const cycleDaysInFrequency = getCycleDaysInFrequency(
    paymentFrequencyEnum.BI_WEEKLY
  );
  const today = moment(_today)
    .startOf("day")
    .add(0, "month")
    .add(0, "day")
    .toDate();
  const firstPaymentDate = moment(today)
    .add(cycleDaysInFrequency, "day")
    .toDate();

  const estimatedPaymentAmount = determinePaymentAmount(
    paymentFrequencyEnum.BI_WEEKLY,
    interestRate,
    term,
    requestedLoanAmount
  );
  // TODO: the last argument of this function  asks for the number of payments,
  // but were all the code I can find gives it the term.
  const paymentSchedule = await generatePaymentSchedule(
    today,
    firstPaymentDate,
    requestedLoanAmount,
    "B",
    "daily based",
    interestRate.toFixed(2) / 100,
    term
  );

  res.json({ estimatedPaymentAmount, paymentSchedule });
}

async function processNachaPayments(req, res) {
  const ipAddress = ip.address();
  sails.log.info("processScheduledPayment scheduler");
  try {
    // const paymentManagements = await PaymentManagement.find({status: "PERFORMING"}).populate("screentracking").sort({createdAt: -1}).limit(10);
    // if(paymentManagements) {
    // 	for(let paymentManagement of paymentManagements) {
    // 		if(paymentManagement.screentracking && paymentManagement.screentracking.offerdata && paymentManagement.screentracking.offerdata.length > 0) {
    // 			const offerData = paymentManagement.screentracking.offerdata[ 0 ];
    // 			offerData.apr = offerData.interestRate;
    // 			// if(!paymentManagement.paymentSchedule || paymentManagement.paymentSchedule.length === 0) {
    // 				const today = moment().startOf("day").add(-14, "day").toDate();
    // 				let firstPaymentDate =  moment().startOf("day").toDate();
    // 				if(!paymentManagement.loanSetDate) {
    // 					paymentManagement.loanSetDate =today;
    // 				}
    // 				const paySchedule = await SmoothPaymentService.generatePaymentSchedule( today,firstPaymentDate,
    // 						paymentManagement.screentracking.requestedLoanAmount, 'B', 'daily based',
    // 						offerData.interestRate.toFixed(2)/100, offerData.term, paymentManagement.scheduleIdSequenceCounter || 1);
    // 					if(paySchedule && paySchedule.paymentSchedule && paySchedule.paymentSchedule.length > 0) {
    // 						const newPaymentSchedule = paySchedule.paymentSchedule;
    // 						const nextPaymentSchedule = _.find(newPaymentSchedule,(scheduleItem) => {
    // 							return moment().startOf("day").isSameOrBefore(moment(scheduleItem.date).startOf("day"));
    // 						})
    // 						firstPaymentDate = moment(nextPaymentSchedule.date).startOf("day").toDate();
    // 						await PaymentManagement.update({id:paymentManagement.id},{loanSetdate:paymentManagement.loanSetDate, paymentSchedule: newPaymentSchedule,
    // 							nextPaymentSchedule: firstPaymentDate,
    // 							hasWaivedLoan: false,
    // 							scheduleIdSequenceCounter: paySchedule.scheduleIdSequenceCounter || 1,
    // 							maturityDate:  moment(newPaymentSchedule[newPaymentSchedule.length-1].date).startOf("day").toDate()})
    // 						await Payment.destroy({paymentmanagement: paymentManagement.id});
    // 						await Logactivity.destroy({paymentManagement: paymentManagement.id})
    // 						await Screentracking.update({id: paymentManagement.screentracking.id}, {signACHAuthorization: false, signChangeScheduleAuthorization:false});
    // 					}
    // 			// }
    // 		}
    //
    // 	}
    // }
    // await PaymentService.processPreAutomaticPayments(null, moment().startOf("day").add(".toDate());
    // 	await PaymentService.processScheduledPayments( ipAddress,null, moment().startOf("day").toDate() );
    // 	await PaymentService.checkPaymentStatuses(ipAddress)
    await PaymentService.processPreAutomaticPayments();
    await PaymentService.processScheduledPayments(ipAddress);
    await PaymentService.checkPaymentStatuses(ipAddress);
    // const nacha = await Nacha.findOne({id: "60bfdefb7484e0343f62dfd5"});
    // if(nacha) {
    // 	await NachaFtpService.uploadNachaFile(nacha)
    // }else {
    // 	return res.status(500).json({message: "No nacha"});
    // }
    // const nachaDirectoryPath =  path.resolve( sails.config.appPath, "paymentservice", "nacha");
    // const nachaFilePath = path.resolve( nachaDirectoryPath, "" );
    return res.json({ success: true });
  } catch (exc) {
    sails.log.error("TestController#processNachaPayments Error: ", exc);
    return res.status(500).json({ message: exc.message });
  }
}

async function processNachaReturnFile(req, res) {
  const ipAddress = ip.address();
  sails.log.info("processNachaReturnFile scheduler");
  try {
    const results = await NachaFtpService.checkForNachaReturnFile();
    // await PaymentService.checkPaymentStatuses(ipAddress)
    //
    return res.json({ success: true, data: results });
  } catch (exc) {
    sails.log.error("TestController#processNachaReturnFile Error: ", exc);
    return res.status(500).json({ message: exc.message });
  }
}

async function testChangingPaymentSchedule(req, res) {
  // res.json({test: true});
  try {
    const payId = req.param("paymentId");
    const firstPaymentDateString = req.param("firstPaymentString");
    if (!firstPaymentDateString || !payId) {
      const errorMessage =
        "Missing required parameters to test changing schedule.";
      return res.status(400).json({
        message: errorMessage,
      });
    }
    const firstPaymentDate = moment(firstPaymentDateString, "MM-DD-YYYY")
      .startOf("day")
      .toDate();
    const paymentManagement = await PaymentManagement.findOne({ id: payId })
      .populate("user")
      .populate("screentracking");
    if (paymentManagement) {
      const newScheduleObj = await AchService.readjustPaymentSchedule(
        paymentManagement,
        paymentManagement.screentracking,
        firstPaymentDate
      );
      return res.json(newScheduleObj);
    }
    return res.status(404).json({
      message:
        "Paymentmanagement was not found for changing the payment schedule.",
    });
  } catch (exc) {
    return res.status(500).json({ message: exc.message });
  }
}

async function insertTestData(req, res) {
  try {
    const userId = req.param("userId");
    if (!!userId) {
      const user = await User.findOne({ id: userId });
      if (user) {
        await User.update(
          { id: user.id },
          {
            leadReject: false,
            leadDeniedReason: "",
            firstName: "John",
            lastname: "Bolos",
            email: "matt.francis+johnbolosnachatest@trustalchemy.com",
            ssn_number: 123456789,
            street: "123 Test St",
            city: "Test City",
            state: "TN",
            zipCode: 38024,
            phoneNumber: 1234567890,
            mobileNumber: 9876543210,
          }
        );
        const screentracking = await Screentracking.findOne({
          user: user.id,
        }).populate("user");
        const offersArray = OffersService.generateOffersArray(
          screentracking.requestedLoanAmount,
          screentracking.paymentFrequency
        );
        if (offersArray && offersArray.length > 0) {
          const screenUpdate = {
            offers: offersArray,
            offerdata: [offersArray[0]],
            lastlevel: 4,
            lastpage: "contract",
            eSignatureDate: moment()
              .startOf("day")
              .toDate(),
          };
          await Screentracking.update({ id: screentracking.id }, screenUpdate);
          _.assign(screentracking, screenUpdate);

          const today = SmoothPaymentService.getBusinessDateBasedOnBankDays(
            moment()
              .startOf("day")
              .add(-10, "day")
              .toDate(),
            true
          );
          const latestEmployment = await EmploymentHistory.getLatestEmploymentHistoryForUser(
            screentracking.user.id
          );
          const scheduledStartDate = SmoothPaymentService.determineFirstPaymentScheduleFromEmploymentPayDates(
            latestEmployment,
            today,
            screentracking.paymentFrequency
          );

          const paySchedule = await ApplicationService.getContractPaymentSchedule(
            screentracking,
            scheduledStartDate,
            screentracking.offerdata
          );

          req.session["projectedPaymentSchedule"] = paySchedule.paymentSchedule;
          req.session["projectedFirstPaymentDate"] = moment(scheduledStartDate)
            .startOf("day")
            .add(-10)
            .toDate();
          req.session["projectedOriginDate"] = today;

          _.assign(screenUpdate, {
            projectedPaymentSchedule: paySchedule.paymentSchedule,
            projectedFirstPaymentDate: moment(scheduledStartDate)
              .startOf("day")
              .add(-10)
              .toDate(),
            projectedOriginDate: today,
            reApplyAuthorizationSignatureNeeded: false,
            iscompleted: true,
            lastlevel: 5,
          });
          await Screentracking.update({ id: screentracking.id }, screenUpdate);
          _.assign(screentracking, screenUpdate);

          let paymentManagement = await PaymentManagement.findOne({
            screentracking: screentracking.id,
          });
          const existingPaymentManagement = !!paymentManagement;
          if (!existingPaymentManagement) {
            paymentManagement = await createPaymentManagement(
              screentracking,
              req
            );
          }
          const newScheduleTest = [];
          for (let pm of paymentManagement.paymentSchedule) {
            const newSchedItem = _.cloneDeep(pm);
            newSchedItem.amount = 1;
            newScheduleTest.push(newSchedItem);
          }
          await PaymentManagement.update(
            { id: paymentManagement.id },
            { paymentSchedule: newScheduleTest }
          );

          _.assign(screenUpdate, {
            paymentmanagement: paymentManagement.id,
          });

          await Screentracking.update(
            { id: screentracking.id },
            {
              paymentmanagement: paymentManagement.id,
            }
          );
          screentracking.paymentmanagement = paymentManagement.id;
          const eSignatures = [
            {
              eSignatureDate: screenUpdate.eSignatureDate,
              eSignatureText: "",
              ipAddress: "0.0.0.0",
            },
          ];

          if (!existingPaymentManagement) {
            let ssn;
            const agreementCheckboxes = {};
            const loanId = screentracking.applicationReference;

            await FoxHillsIntegrationService.saveDocumentSignature(
              loanId,
              ssn,
              eSignatures,
              agreementCheckboxes,
              req,
              res
            );
          }
          paymentManagement = await PaymentManagement.findOne({
            id: paymentManagement.id,
          })
            .populate("screentracking")
            .populate("user");
          const account = await Account.findOne({
            id: paymentManagement.account,
          });
          const fundPaymentItem = {
            interestAmount: 0,
            principalAmount: 0,
            waivedAmount: 0,
            waivedInterest: 0,
            waivedPrincipal: 0,
            date: moment()
              .startOf("day")
              .toDate(),
            amount: 1,
            status: "PENDING",
            scheduleId: -1,
            isAmendPayment: false,
          };
          const transactionItem = await Payment.createPaymentActionTransaction(
            Payment.transactionTypeEnum.FUNDED,
            fundPaymentItem,
            paymentManagement.id,
            paymentManagement.user.id,
            account.id,
            Payment.paymentTypeEnum.ACH_CREDIT
          );

          const pmUpdateObj = {
            achstatus: 1,
            status: "ACTIVE",
            fundingPaymentType: Payment.paymentTypeEnum.ACH_CREDIT,
            fundedInformation: {
              amount: 1,
              fundingPaymentType: Payment.paymentTypeEnum.ACH_CREDIT,
              date: moment()
                .startOf("day")
                .toDate(),
              pmtRef: transactionItem.pmtRef,
            },
          };
          if (transactionItem && !!transactionItem.pmtRef) {
            const pmUpdate = await PaymentManagement.update(
              { id: paymentManagement.id },
              pmUpdateObj
            );
            _.assign(paymentManagement, pmUpdateObj);
          }

          const dialogState = {
            isRegularPayment: true,
            isPayoffPayment: false,
          };
          const previewResult = await PlatformSpecificService.previewPayment(
            paymentManagement,
            moment()
              .startOf("day")
              .toDate(),
            paymentManagement.paymentSchedule[0].amount,
            dialogState,
            account.id,
            false
          );
          previewResult.newScheduleItem.amount = 1;
          const paymentTransactionItem = await Payment.createPaymentActionTransaction(
            Payment.transactionTypeEnum.PAYMENT,
            previewResult.newScheduleItem,
            paymentManagement.id,
            paymentManagement.user.id,
            account.id,
            Payment.paymentTypeEnum.ACH_DEBIT
          );
          previewResult.preview.paymentSchedule[
            previewResult.newScheduleItemIndex
          ]["transactionId"] = paymentTransactionItem.id;
          previewResult.preview.paymentSchedule[
            previewResult.newScheduleItemIndex
          ]["pmtRef"] = paymentTransactionItem.pmtRef;
          const paymentSchedule = previewResult.preview.paymentSchedule;
          //processChangeSchedule
          paymentManagement.paymentSchedule = paymentSchedule;
          paymentManagement.nextPaymentSchedule = moment(
            previewResult.preview.nextPaymentSchedule
          )
            .startOf("day")
            .toDate();
          paymentManagement.nextManualPaymentDate = moment(
            previewResult.preview.nextManualPaymentDate
          )
            .startOf("day")
            .toDate();
          paymentManagement.scheduleIdSequenceCounter =
            previewResult.preview.scheduleIdSequenceCounter;

          const paymentUpdateObj = {
            paymentSchedule: paymentManagement.paymentSchedule,
            nextPaymentSchedule: previewResult.preview.nextPaymentSchedule,
            nextManualPaymentDate: previewResult.preview.nextManualPaymentDate,
            scheduleIdSequenceCounter:
              paymentManagement.scheduleIdSequenceCounter,
          };
          await PaymentManagement.update(
            { id: paymentManagement.id },
            paymentUpdateObj
          );
          return res.json({ success: true });
        }
      }
    }
  } catch (exc) {
    sails.log.error("TestController#insertTestData Error: ", exc);
    return res.status(500).json({ message: exc.message });
  }
  return res.status(500).json({ message: "missing something" });
}
async function createPaymentManagement(screentracking, req) {
  const projectedPaymentSchedule =
    screentracking.projectedPaymentSchedule ||
    req.session.projectedPaymentSchedule;
  const scheduleDate =
    screentracking.projectedFirstPaymentDate ||
    req.session.projectedFirstPaymentDate;
  const originDate =
    screentracking.projectedOriginDate || req.session.projectedOriginDate;
  // req.session["projectedPaymentSchedule"] = paySchedule.paymentSchedule;
  // req.session["projectedLoanSetDate"] = scheduledStartDate;
  // req.session["projectedOriginDate"] = today;
  let newPaymentmanagement = await PaymentManagement.createPaymentManagement(
    screentracking,
    projectedPaymentSchedule,
    scheduleDate,
    originDate
  );
  if (
    newPaymentmanagement &&
    newPaymentmanagement.pay &&
    newPaymentmanagement.paymentSchedule.length > 0
  ) {
    delete req.session.projectedPaymentSchedule;
    delete req.session.projectedFirstPaymentDate;
    delete req.session.projectedOriginDate;
    await Screentracking.update(
      { id: screentracking.id },
      {
        projectedPaymentSchedule: null,
        projectedFirstPaymentDate: null,
        projectedOriginDate: null,
      }
    );
  }
  return newPaymentmanagement;
}
/*********************** Factor Trust/Lend Protect ***************************/
async function testFactorTrustLendProtect(req, res) {
  try {
    const screenId = req.param("screenId");
    if (!screenId) {
      const error =
        "Unable to pull factor trust credit report. Missing screenId";
      sails.log.error(
        "TestController#testFactorTrustLendProtect Error: ",
        error
      );
      return res.status(400).json({ message: error });
    }
    const screenTracking = await Screentracking.getScreenTracking(
      { id: screenId },
      ["user"]
    );
    if (!screenTracking || !screenTracking.user || !screenTracking.user.id) {
      const error =
        "Unable to pull factor trust credit report. Missing screentracking or user";
      sails.log.error(
        "TestController#testFactorTrustLendProtect Error: ",
        error
      );
      return res.status(404).json({ message: error });
    }
    await cleanupTransunion(screenTracking);
    const switchedUser = await switchUser(screenTracking.user);
    screenTracking.user = switchedUser;

    const factorTrustReport = await FactorTrustLendProtectService.getOrRunCreditReport(
      screenTracking.user,
      screenTracking,
      false
    );
    if (factorTrustReport) {
      res.json(factorTrustReport);
    } else {
      res.json({ success: true, message: "Report not returned" });
    }
    return;
  } catch (exc) {
    sails.log.error("TestController#testFactorTrustLendProtect Error: ", exc);
    return res.status(400).json({ message: exc.message });
  }
}

async function switchUser(user) {
  const userUpdateObj = {};

  //no hit
  userUpdateObj["firstname"] = "Bob";
  userUpdateObj["lastname"] = "Bobby";
  userUpdateObj["middlename"] = "";
  userUpdateObj["street"] = "1234 Something Red St";
  userUpdateObj["city"] = "Pleasant Grove";
  userUpdateObj["state"] = "UT";
  userUpdateObj["zipCode"] = "84062";
  userUpdateObj["phoneNumber"] = "5254587898";
  userUpdateObj["dateofBirth"] = "1979-07-25";
  userUpdateObj["ssn_number"] = "635659821";

  // test case from FT 1
  // userUpdateObj["firstname"] = "DOMINGO";
  // userUpdateObj["lastname"] = "MKZWLKXG";
  // userUpdateObj["middlename"] = "";
  // userUpdateObj["street"] = "9435 JEFF RD";
  // userUpdateObj["city"] = "GULFPORT";
  // userUpdateObj["state"] = "MS";
  // userUpdateObj["zipCode"] = "39503";
  // userUpdateObj["phoneNumber"] = "2285551212"
  // userUpdateObj["dateofBirth"] = "1974-09-13"
  // userUpdateObj["ssn_number"] = "666232029";

  // test case from FT 2
  // userUpdateObj["firstname"] = "REBEKAH";
  // userUpdateObj["lastname"] = "KKKHK";
  // userUpdateObj["middlename"] = "J";
  // userUpdateObj["street"] = "670 NW 6TH ST APT 1102";
  // userUpdateObj["city"] = "MIAMI";
  // userUpdateObj["state"] = "FL";
  // userUpdateObj["zipCode"] = "33136";
  // userUpdateObj["phoneNumber"] = "3055551212"
  // userUpdateObj["dateofBirth"] = "1971-08-13"
  // userUpdateObj["ssn_number"] = "666747869";

  // test case from FT 3
  // userUpdateObj["firstname"] = "DEBRA";
  // userUpdateObj["lastname"] = "MAGWRIE";
  // userUpdateObj["middlename"] = "";
  // userUpdateObj["street"] = "6224 NORTHFORK RD";
  // userUpdateObj["city"] = "AMES";
  // userUpdateObj["state"] = "IA";
  // userUpdateObj["zipCode"] = "50010";
  // userUpdateObj["phoneNumber"] = "5152320625"
  // userUpdateObj["dateofBirth"] = "1981-05-23"
  // userUpdateObj["ssn_number"] = "666435630";

  userUpdateObj["primaryphone"] = userUpdateObj.phoneNumber || user.phoneNumber;
  const updatedUser = await User.update({ id: user.id }, userUpdateObj);
  if (updatedUser && updatedUser.length > 0) {
    return _.assign(user, updatedUser[0]);
  }
  return user;
}
async function cleanupTransunion(screentracking) {
  await FactorTrustLendProtect.destroy({ user: screentracking.user.id });
  await FactorTrustLendProtectHistory.destroy({ user: screentracking.user.id });
  await Screentracking.updateContext(
    { id: screentracking.id },
    { lendprotect: null }
  );
}
