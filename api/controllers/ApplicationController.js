/* global sails, State, User, ApplicationService, Screentracking, EmailService, Agreement, UserConsent */
/**
 * ApplicationController
 *
 * @description :: Server-side logic for managing States
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
"use strict";

const passport = require("passport");
const _ = require("lodash");
const moment = require("moment");
const bcrypt = require("bcrypt");
const IdologyService = require("../services/IdologyService");
const EmailService = require("../services/EmailService");
const SmoothPaymentService = require("../services/SmoothPaymentService");

module.exports = {
	/* new for MH start */
	signAchDebit,
	userInformation: userInformation,
	application: application,
	emailverifylanding: emailverifylanding,
	createApplication: createApplication,
	createApplicationPost: createApplicationPost,
	createEmploymentAndReference: createEmploymentAndReference,
	getEmploymentAndReference: getEmploymentAndReference,
	applicationWaterfall: applicationWaterfall,
	/* new for MH end */
	addApplication: addApplicationAction,
	testapplication: testapplicationAction,
	uploaddocuments: uploaddocumentsAction,
	adddocument: adddocumentAction,
	uploaddropfiles: uploaddropfilesAction,
	serviceloandocuments: serviceloandocumentsAction,
	serviceconfirmsignature: serviceconfirmsignatureAction,
	servicecreateloandetails: servicecreateloandetailsAction,
	servicesuccessmessage: servicesuccessmessageAction,
	promissorynote: promissorynoteAction,
	createpromissorypdf: createpromissorypdfAction,
	servicecreatepromissorypdf: servicecreatepromissorypdfAction,
	createstateregulation: createstateregulationAction,
	ajaxgetstateregulations: ajaxgetstateregulationsAction,
	getinterestratefields: getinterestratefieldsAction,
	createupdateinterestrate: createupdateinterestrateAction,
	getuploadeddocuments: getuploadeddocumentsAction,
	viewRuleDecisionMaker: viewRuleDecisionMaker,
	postRuleDecisionMaker: postRuleDecisionMaker,
	servicegetuploadeddocuments: servicegetuploadeddocuments,
	updatetranshistorydata: updatetranshistorydata,
	getTransunionDetails: getTransunionDetailsAction,
	getUserBankDetails: getUserBankDetailsAction,
	getPaymentmanagementDetails: getPaymentmanagementDetailsAction,
	postNewRuleDecision: postNewRuleDecisionAction,
	checkuserdocuments: checkuserdocumentsAction,
	couserinformation: couserinformationAction,
	couserinformationfull: couserinformationfullAction,
	cofinancialinfomation: cofinancialinfomationAction,
	sendforgotpassword: sendforgotpasswordAction,
	usersetpassword: usersetpasswordAction,
	updateuserpassword: updateuserpasswordAction,
	savechangepassword: savechangepasswordAction,
	receivenotifi: receivenotifiAction,
	uploadAvatar: uploadAvatarAction,
	contract: contract,
	contractSigned: contractSigned,
	resignChangeScheduleContract: resignChangeScheduleContract,
	redirecttodashboard: redirecttodashboard,
	denyLoan: denyLoan,
	displayErrorPage: displayErrorPage,
	postOffers: postOffers,
	leadUserNewPassword: leadUserNewPassword,
	reApplyApplication: reApplyApplication,
	ajaxPostReApplyApplication: ajaxPostReApplyApplication,
	reApplyOffers: reApplyOffers,
	ajaxReApplyOfferSubmission: ajaxReApplyOfferSubmission,
	leadCreateAccount: leadCreateAccount,
	leadCreateAccountPost: leadCreateAccountPost,
	postVerifyBankInfo: postVerifyBankInfo,
	getLeadBankInfo: getLeadBankInfo,
	denyReapplication: denyReapplication,
	allowReApplication: allowReApplication
};

function userInformation(req, res) {
	sails.log.info("ApplicationController.userinformation");
	// TODO need to change this when we put in correct workflow for picking Practice
	req.session.appPracticeName = "SRM Practice";
	res.view("frontend/application/userinformation", { navtab: 2 });
}

// TODO: Two return values, check functionality
function application(req, res) {
	return Promise.resolve();
	// wipe out session and start a new session
	return new Promise((resolve) => {
		req.session.regenerate(resolve);
	})
		.then(() => {
			const ip = (req.headers["x-forwarded-for"] || req.headers["x-real-ip"] || req.connection.remoteAddress).replace("::ffff:", "").replace(/^::1$/, "127.0.0.1");
			const todaydate = moment().format("MM/DD/YYYY");
			const firstname = req.param("firstname");
			sails.log.info("ApplicationController.createApplication firstname", firstname);
			req.session.userinfo = {
				firstname: req.param("firstname").trim(),
				middlename: req.param("middlename").trim(),
				lastname: req.param("lastname").trim(),
				email: req.param("email"),
				phoneNumber: req.param("phone").replace(/[^0-9]/g, ""),
				password: req.param("password"),
				confirmpassword: req.param("confirmpassword")
			};
			checkForSuffix(req.session.userinfo.lastname);
			return State.getExistingState()
				.then((states) => {
					return res.view("frontend/application/application", { stateData: states, ip: ip, todaydate: todaydate });
				})
				.catch((err) => {
					sails.log.error("ApplicationController.createApplicationAction.getExistingState; :: err:", err);
					return res.view("admin/error/500", {
						data: err.message,
						layout: 'layout'
					});
				});
		});
	function checkForSuffix(lastname) {
		if (lastname.includes(" ")) {
			const nameParts = lastname.split(" ");
			if (nameParts.length > 1) {
				const suffix = nameParts[1].trim().toUpperCase();
				const genCodes = ["JR", "SR", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX"];
				if (genCodes.indexOf(suffix) >= 0) {
					req.session.userinfo.lastname = nameParts[0].trim();
					req.session.userinfo.generationCode = suffix;
				}
			}
		}
	}
}

function emailverifylanding(req, res) {
	const userid = req.param("id");
	sails.log.info("ApplicationController.emailverifylanding userid", userid);
	let level = 0;

	User.findOne({ id: userid })
		.then((user) => {
			sails.log.info("ApplicationController.js profileemailanding user: ", user);
			if (user) {
				user.isEmailVerified = true;
				user.save(() => {
					if (userid != undefined || userid != "") {
						sails.sockets.broadcast(userid, "emailverified", { msg: "emailverified" });
						return Screentracking.findOne({ user: userid })
							.then((screentrackingData) => {
								level = screentrackingData.lastlevel;
								return res.view("frontend/application/emailverifylanding", { level: level, userid: userid });
							});
					} else {
						return res.redirect("/apply");
					}
				});
			}
		}).catch((err) => {
			sails.log.error("HomeController#emailverifylanding :: err", err);
			return res.handleError(err);
		});
}


async function createApplication(req, res) {
	const userinfo = req.session.deferUser;
	if (typeof userinfo !== "object" || userinfo == null) {
		sails.log.error("createApplication; missing req.session.deferUser");
		return res.redirect("/apply");
	}
	const tplData = {
		error: "",
		reapplyerror: "",
		dupssnerror: "",
		userinfo: userinfo || {},
		screenTracking: req.session.deferScreenTracking || {}
	};
	if (req.session.reapplyerror !== "") {
		tplData.reapplyerror = req.session.reapplyerror;
		req.session.reapplyerror = "";
	}
	if (req.session.dupssnerror !== "") {
		tplData.dupssnerror = req.session.dupssnerror;
		req.session.dupssnerror = "";
	}
	if (req.session.applicationerror !== "") {
		tplData.applicationerror = req.session.applicationerror;
		req.session.applicationerror = "";
	}
	if (req.session.esignPath !== "") {
		tplData.esignPath = req.session.esignPath;
	}
	if (req.session.creditAuthPath !== "") {
		tplData.creditAuthPath = req.session.creditAuthPath;
	}
	if (req.session.smsPath !== "") {
		tplData.smsPath = req.session.smsPath;
	}
	// if( req.session.deniedstatus !== "" && req.session.deniedstatus !== null && "undefined" !== typeof req.session.deniedstatus ) {
	// 	req.session.deniedstatus = "";
	// }
	tplData.stateData = await State.getExistingState();
	tplData.pagename = "application";
	tplData.ip = (req.headers["x-forwarded-for"] || req.headers["x-real-ip"] || req.connection.remoteAddress).replace("::ffff:", "").replace(/^::1$/, "127.0.0.1");
	const barrowername = [userinfo.firstname, userinfo.lastname].join(" ");
	const todaydate = moment().format("MM/DD/YYYY");
	sails.log.info("todaydate", todaydate);
	tplData.agreementObject = { date: todaydate, barrowername: barrowername };
	tplData.dateofBirth = (userinfo.dateofBirth ? moment(new Date(userinfo.dateofBirth)).format("MM/DD/YYYY") : "");
	sails.log.info("tplData ", tplData);
	return res.view("frontend/application/application", tplData);
}


async function createApplicationPost(req, res) {
	const ip = (req.headers["x-forwarded-for"] || req.headers["x-real-ip"] || req.connection.remoteAddress).replace("::ffff:", "").replace(/^::1$/, "127.0.0.1");
	const userInfo = {
		userReference: "",
		// default to null for leads that has not been assigned to a branch
		practicemanagement: req.session.practiceId || null,
		firstname: `${req.param("firstname")}`.trim(),
		middlename: `${req.param("middlename")}`.trim(),
		lastname: `${req.param("lastname")}`.trim(),
		// isPhoneVerified: req.session.deferUser.isPhoneVerified,
		generationCode: "",
		email: `${req.param("email")}`.trim(),
		phoneNumber: `${req.param("phone")}`.trim(),
		mobileNumber: `${req.param("phone")}`.trim(),
		street: `${req.param("street")}`.trim(),
		unitapt: `${req.param("unitapt")}`.trim(),
		city: `${req.param("city")}`.trim(),
		state: `${req.param("state")}`.substr(0, 2),
		_state: null,
		zipCode: `${req.param("zipcode")}`.substr(0, 5),
		ssn_number: `${req.param("ssn_number")}`.replace(/[^0-9]/g, "").substr(0, 9),
		dateofBirth: moment(req.param("dob")).format("YYYY-MM-DD"),
		stateIdNumber: `${req.param("stateidnumber")}`.trim(),
		idState: `${req.param("idstate")}`.substr(0, 2),
		consentChecked: (req.param("creditpullconfirm") == "on"),
		role: "59f9a0db01fa346245e219cf",
		password: `${req.param("password")}`.trim(),
		confirmPassword: `${req.param("confirmpassword")}`.trim(),
		salt: ""
	};

	if (!userInfo.ssn_number) {
		userInfo.ssn_number = `${req.param("ssn")}`.replace(/[^0-9]/g, "").substr(0, 9)
	}
	// bill.TODO: store some info into Screentracking.
	const financialInfo = {
		bank: `${req.param("bankname")}`,
		routingNumber: `${req.param("routingno")}`,
		accountNumber: `${req.param("bankaccno")}`,
		requestedLoanAmount: req.param("requestedLoanAmount"),
		monthlyIncome: req.param("monthlyIncome"),
		paymentmethod: req.param("paymentmethod"),
		paymentFrequency: req.param("paymentFrequency")
	};

	const finInput = {
		user: "",
		accountName: financialInfo.bank,
		routingNumber: financialInfo.routingNumber,
		accountNumber: financialInfo.accountNumber,
		accountNumberLastFour: financialInfo.accountNumber.substring(financialInfo.accountNumber.length - 4),
		accountType: (financialInfo.paymentmethod === "Direct Deposit") ? 'depository' : "",
		incomeamount: financialInfo.monthlyIncome
	};

	let user = null;
	let screenTracking = null;

	// sails.log.info( "ApplicationController.createApplication userinfo:", userInfo );
	// sails.log.info( "ApplicationController.createApplication financialInfo:", financialInfo );

	const practiceId = userInfo.practicemanagement;
	let redirectUrl = "/apply";

	try {
		// Step 1: Create User
		const createdNewUser = await User.createNewUser(req.session.deniedStatus, userInfo); // denied status? hasn't hit waterfall yet
		if (createdNewUser.code == 500) {
			return res.view("admin/error/500", {
				data: 'INTERNAL_SERVER_ERROR',
				layout: 'layout'
			});
		} else if (createdNewUser.code == 400) { // error creating user check for dupusererror or reapply error
			sails.log.info("ApplicationController.createApplication createdNewUSer: ", createdNewUser);
			req.session["applicationerror"] = createdNewUser.dupusererror;
			return res.redirect("/apply");
		}
		finInput.user = createdNewUser.userdetails.id;
		sails.log.info(finInput);
		try {
			await Account.create(finInput);
		} catch (err) {
			sails.log.error(err);
		}
		user = createdNewUser.userdetails;
		req.session.userId = user.id;
		req.session.loginType = "frontend";

		// Login newly created user
		await loginUser(req, user);

		// Update Screentracking
		const applicationReferenceData = await User.getNextSequenceValue("application");
		const screentrackingDocInitial = {
			user: user.id,
			applicationReference: `APL_${applicationReferenceData.sequence_value}`,
			lastlevel: 2,
			lastScreenName: "Application",
			practicemanagement: user.practicemanagement,
			isCompleted: false,
			incomeamount: 0,
			requestedLoanAmount: 0,
			origin: "Website"
		};
		const screentrackingDoc = Object.assign(screentrackingDocInitial, financialInfo);
		const practiceManagement = await PracticeManagement.find({});
		screentrackingDoc.practicemanagement = practiceManagement[0].id;	// Static collection, only 1 entry
		sails.log.info("screentrackingDoc", screentrackingDoc);
		const screenTracking = await Screentracking.create(screentrackingDoc);

		// Louis, copied from fox-hills-cash, input for UserBankAccount and PlaidUser
		const accountsData = [];
		const balanceData = {
			available: 0,
			current: 0,
			limit: ''
		};
		const metaData = {
			limit: null,
			name: "Checking",
			number: finInput.accountNumberLastFour,
			official_name: ''
		};
		const filteredAccountsDetailsJson = {
			account: finInput.accountNumber,
			account_id: '',
			routing: finInput.routingNumber,
			wire_routing: finInput.routingNumber
		};
		const objdata = {
			balance: balanceData,
			institution_type: finInput.accountType,
			meta: metaData,
			numbers: filteredAccountsDetailsJson,
			subtype: 'checking',
			type: 'depository'
		}
		accountsData.push(objdata);
		const transactionGenerated = {};
		const userBankData = {
			accounts: accountsData,
			accessToken: '',
			institutionName: finInput.accountName,
			institutionType: finInput.accountType,
			transactions: transactionGenerated,
			user: user.id,
			item_id: '',
			access_token: '',
			transavail: 0,
			Screentracking: screenTracking.id,
			bankfilloutmanually: 1
		};
		req.session["screenTrackingId"] = screenTracking.id;
		sails.log.info(userBankData);
		try {
			var userBankAccount = await UserBankAccount.create(userBankData);
		} catch (err) {
			sails.log.error(err);
		}
		await Account.update({ user: user.id }, { userBankAccount: userBankAccount.id });
		const plaidNames = [];
		const plaidEmails = [];
		const plaidphoneNumbers = [];
		const plaidAddress = [];
		const fullname = user.firstname + ' ' + user.lastname;
		plaidNames.push(fullname);
		const emailData = {
			primary: true,
			type: 'e-mail',
			data: user.email
		};
		plaidEmails.push(emailData);
		const phoneData = {
			primary: true,
			type: 'mobile',
			data: user.phoneNumber
		};
		plaidphoneNumbers.push(phoneData);
		const addressData = {
			primary: true,
			data: {
				street: user.street,
				city: user.city,
				state: user.state,
				zip: user.zipCode
			}
		};
		plaidAddress.push(addressData);
		const newPlaidUser = {
			names: plaidNames,
			emails: plaidEmails,
			phoneNumbers: plaidphoneNumbers,
			addresses: plaidAddress,
			user: user.id,
			userBankAccount: userBankAccount.id,
			ifuserInput: 1,
			plaidfilloutmanually: 1
		};
		try {
			var userPlaidData = await PlaidUser.create(newPlaidUser);
		} catch (err) {
			sails.log.error(err);
		}


		const underwritingResult = await UnderwritingService.underwritingWaterfall(user, screenTracking);

		if (underwritingResult.error) {
			sails.log.error("ApplicationController#createApplication :: Underwriting err:", underwritingResult.error);
			req.session["applicationerror"] = "'Sorry, there is an error trying to submit this application. Please try again or contact our staff.";
			return res.redirect("/apply")
		} else if (!underwritingResult.passed) {
			const deniedUPdate = { isCompleted: true, isDenied: true, deniedReason: underwritingResult.reason };
			await Screentracking.update({ id: screenTracking.id }, deniedUPdate)
			_.assign(screenTracking, deniedUPdate);
			await createDeniedPaymentManagement(user, screenTracking);

			return res.redirect("/loanDenied");
		} // At this point, there is no error and they have not failed, so they have passed

		EmailService.senduserRegisterEmail(user);

		// Step 2: Twilio (requires sms consent)
		const twillioNotice = {
			gotoTwilio: "true",
			firstname: user.firstname,
			middlename: user.middlename,
			lastname: user.lastname,
			email: user.email,
			phone: user.phoneNumber,
			street: user.street,
			unitapt: user.unitapt,
			city: user.city,
			zipCode: user.zipCode,
			ssn_number: user.ssn_number,
			dateofBirth: user.dateofBirth,
			stateIdNumber: user.stateIdNumber,
			password: user.password,
			confirmPassword: user.confirmPassword,
			bank: financialInfo.bank,
			routingNumber: financialInfo.routingNumber,
			account: financialInfo.account,
			requestedLoanAmount: financialInfo.requestedLoanAmount,
			monthlyIncome: financialInfo.monthlyIncome,
			userId: screenTracking.user,
			screenId: screenTracking.id,
		};
		return res.redirect("/employmentandreferenceinfo")
		//return res.view( "frontend/application/application", twillioNotice );
	} catch (error) {
		sails.log.error("ApplicationController#createApplication :: err:", error);
		req.session["applicationerror"] = "An error occurred while trying to create this application.";
		return res.redirect("/apply")
	}
}

function loginUser(req, userObj) {
	return new Promise((resolve, reject) => {
		const userinfo = {
			email: userObj.email,
			firstname: userObj.firstname,
			lastname: userObj.lastname,
			createdAt: userObj.createdAt,
			role: userObj.role,
			id: userObj.id,
			practicemanagement: userObj.practicemanagement,
			logintype: "user-local", // muy importante
		};
		req.logIn(userinfo, function (err) {
			if (err) {
				return reject(err);
			}
			return resolve(true)
		});
	})
}

async function createEmploymentAndReference(req, res) {
	sails.log.info('Calling createEmploymentAndReference()... ');
	var userId = req.session.userId;
	const employmentHistory = {
		practicemanagement: req.body.practicemanagement,
		typeOfIncome: req.body.incometype,
		employerName: req.body.employername,
		employerPhone: req.body.workphone,
		employerStatus: req.body.employerstatus, // Does not exist in model
		lastPayDate: new Date(req.body.lastPayDate),
		nextPayDate: new Date(req.body.nextPayDate),
		secondPayDate: new Date(req.body.secondPayDate),
		payFrequency: req.body.paymentFrequency,
		isAfterHoliday: req.body.paymentBeforeAfterHolidayWeekend === "1" ? EmploymentHistory.decisionCloudIsAfterHoliday.AFTER_HOLIDAY : EmploymentHistory.decisionCloudIsAfterHoliday.BEFORE_HOLIDAY,
		user: userId
	};
	// const references = {
	// 	name1: req.body.referencename1,
	// 	phoneNumber1: req.body.referencephone1,
	// 	relationship1: req.body.referencerelation1,
	// 	name2: req.body.referencename2,				// DNE in model
	// 	phoneNumber2: req.body.referencephone2,		// DNE in model
	// 	relationship2: req.body.referencerelation2,	// DNE in model
	// 	user: userId
	// };
	sails.log.info(employmentHistory);
	// sails.log.info(references);
	try {
		await EmploymentHistory.create(employmentHistory);
		// await References.create(references);
	} catch (err) {
		sails.log.error(err);
	}
	await Screentracking.update({ user: userId }, { lastlevel: 3, paymentFrequency: employmentHistory.payFrequency || SmoothPaymentService.paymentFrequencyEnum.BI_WEEKLY, isAfterHoliday: employmentHistory.isAfterHoliday });
	return res.redirect("/offers");
}

function uploaddocumentsAction(req, res) {
	const payId = req.param("id");
	let successval = "";
	if (req.session.successval != "") {
		successval = req.session.successval;
		req.session.successval = "";
	}
	res.view("frontend/banktransaction/uploaddocuments", { payId: payId, success: successval });
}

function testapplicationAction(req, res) {
	const userID = "59f99af6739601a616b89da2";
	const usercriteria = { id: userID };
	User.findOne(usercriteria)
		.then(function (userDetail) {
			sails.log.info("userDetail:", userDetail);

			ApplicationService.testcurl(userDetail)
				.then(function (certificateDetails) {
					// return res.redirect("/banktransaction");
				})
				.catch(function (err) {
					sails.log.error("ApplicationController#transunionAddFormAction :: err :", err);
					const json = {
						status: 400,
						message: err.message
					};
					res.contentType("application/json");
					res.json(json);
				});
		})
		.catch(function (err) {
			sails.log.error("ApplicationController#testapplicationAction :: err :", err);
			const errors = {
				code: 404,
				message: "Invalid user data!"
			};
			res.view("admin/error/404", {
				data: errors.message,
				layout: "layout"
			});
		});
}

function addApplicationAction(req, res) {
	const userID = req.session.userId;

	if (userID) {
		const usercriteria = { id: userID };
		sails.log.info("userID:", userID);
		// sails.log.info("usercriteria:", usercriteria);

		User.findOne(usercriteria)
			.then(function (userDetail) {
				if (userDetail.isExistingLoan == true) {
					req.session.applicationerror = "";
					req.session.applicationerror = "Already you have loan in your account";
					return res.redirect("/createapplication");
				} else {
					if (!userDetail.middlename) {
						var middlename = "";
					} else {
						var middlename = userDetail.middlename;
					}

					const first_name = userDetail.firstname;
					const middle_name = middlename;
					const last_name = userDetail.lastname;
					const email = userDetail.email;
					const dob = req.param("dob");
					const dateofBirth = moment(dob).format("YYYY-MM-DD");
					const street_name = req.param("street_name");
					const city = req.param("city");
					const state = req.param("state");
					var zip_code = req.param("zip_code");
					// var phone = userDetail.phoneNumber;
					var zip_code = zip_code.slice(0, 5);
					const ssn_number = req.param("ssn_number");
					const untiapt = req.param("untiapt");

					sails.log.info("untiapt", untiapt);

					const apiindustryCode = sails.config.applicationConfig.apiindustryCode;
					const apimemberCode = sails.config.applicationConfig.apimemberCode;
					const apiprefixCode = sails.config.applicationConfig.apiprefixCode;
					const apiKeyPassword = sails.config.applicationConfig.apiKeyPassword;
					const apiEnv = sails.config.applicationConfig.apiEnv;
					const apiuserRefNumber = sails.config.applicationConfig.apiuserRefNumber;
					const apiPassword = sails.config.applicationConfig.apiPassword;

					User.update(usercriteria, { dateofBirth: dateofBirth, ssn_number: ssn_number, state: state, street: street_name, city: city, zipCode: zip_code, unitapp: untiapt }).exec(function afterwards(err, updated) { });

					userDetail.street = street_name;
					// userDetail.ssn_number = ssn_number;
					userDetail.city = city;
					userDetail.state = state;
					userDetail.zipCode = zip_code;

					const addressarray = {
						untiapt: untiapt,
						street_name: street_name,
						city: city,
						state: state,
						zip_code: zip_code
					};

					const userArray = {
						first: first_name,
						middle: middle_name,
						last: last_name
					};

					const transactionControl = {
						userRefNumber: apiuserRefNumber,
						subscriber: {
							industryCode: apiindustryCode,
							memberCode: apimemberCode,
							inquirySubscriberPrefixCode: apiprefixCode,
							password: apiPassword
						},
						options: {
							processingEnvironment: apiEnv,
							country: "us",
							language: "en",
							contractualRelationship: "individual",
							pointOfSaleIndicator: "none"
						}
					};

					const certificate = {
						key: "WAKPAMNIKEY.pem",
						crt: "WAKPAMNI.pem",
						password: apiKeyPassword
					};
					userDetail.dateofBirth = dateofBirth;

					ApplicationService.createcertificate(addressarray, transactionControl, certificate, userArray, ssn_number, userDetail, req.param)
						.then(function (responseDetails) {
							// sails.log.info("responseDetails code:",responseDetails.code);
							// sails.log.info("===================================================");

							if (responseDetails.code == 200) {
								const resultdataInput = responseDetails.resultdata;

								// sails.log.info("resultdataInput:",resultdataInput);

								ApplicationService.updateApplicationDetails(addressarray, transactionControl, certificate, userArray, ssn_number, userDetail, req.param, resultdataInput)
									.then(function (certificateDetails) {
										sails.log.info("certificateDetails", certificateDetails);

										/* sails.log.info("after service function:");
											sails.log.info("certificateDetails.code:", certificateDetails.code);*/

										if (certificateDetails.code == 200) {
											req.session.applicationReferenceValue = certificateDetails.screenTracking.applicationReference;
											var applicationReference = certificateDetails.screenTracking.applicationReference;
											var IPFromRequest = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
											var indexOfColon = IPFromRequest.lastIndexOf(":");
											var ip = IPFromRequest.substring(indexOfColon + 1, IPFromRequest.length);
											var screenid = certificateDetails.screenTracking.id;

											Agreement.findOne({ documentKey: "126" })
												.then(function (agreement) {
													UserConsent.createConsentfordocuments(agreement, userDetail, ip, screenid)
														.then(function (userconsentdetails) {
															const consentID = userconsentdetails.id;
															const userID = userDetail.id;

															UserConsent.createStaticAgreementPdf(consentID, userconsentdetails, applicationReference, ip, null, null, res, req)
																.then(function (agreementpdf) {
																	Agreement.findOne({ documentKey: "125" })
																		.then(function (agreementdetails) {
																			UserConsent.createConsentfordocuments(agreementdetails, userDetail, ip, screenid)
																				.then(function (userconsentdetail) {
																					const consentID = userconsentdetail.id;
																					const userID = userDetail.id;

																					UserConsent.createStaticAgreementPdf(consentID, userconsentdetail, applicationReference, ip, null, null, res, req)
																						.then(function (agreementpdf) {
																							req.session.levels = "2";
																							return res.redirect("/banktransaction");
																						})
																						.catch(function (err) {
																							sails.log.error("ApplicationController#addApplicationAction :: err :", err);
																							return res.handleError(err);
																						});
																				})
																				.catch(function (err) {
																					sails.log.error("ApplicationController#addApplicationAction :: err :", err);
																					return res.handleError(err);
																				});
																		})
																		.catch(function (err) {
																			// sails.log.info("33333333333:", "33333333333333");
																			sails.log.error("ApplicationController#addApplicationAction :: err :", err);
																			return res.handleError(err);
																		});
																})
																.catch(function (err) {
																	// sails.log.info("4444444444:", "44444444444444");
																	sails.log.error("ApplicationController#addApplicationAction :: err :", err);
																	return res.handleError(err);
																});
														})
														.catch(function (err) {
															// sails.log.info("5555555555:", "555555555555");
															sails.log.error("ApplicationController#addApplicationAction :: err :", err);
															return res.handleError(err);
														});
												})
												.catch(function (err) {
													// sails.log.info("66666666666:", "66666666666666");
													sails.log.error("ApplicationController#addApplicationAction :: err :", err);
													return res.handleError(err);
												});

											/* }else if(certificateDetails.code==402 || certificateDetails.code==403){
														req.session.applicationerror='';
														req.session.applicationerror = certificateDetails.message;
														req.session.deniedstatus = 1;
														return res.redirect("/createapplication");
													}else if(certificateDetails.code==400){
														req.session.applicationerror='';
														req.session.applicationerror = certificateDetails.message;
														req.session.deniedstatus = 1;
														return res.redirect("/createapplication");
													}else if(certificateDetails.code==500){
														req.session.applicationerror='';
														req.session.applicationerror = certificateDetails.message;
														req.session.deniedstatus = 1;
														return res.redirect("/createapplication");
													}else if(certificateDetails.code==200 && rulestatus=='Denied'){
														req.session.applicationerror='';
														req.session.applicationerror = 'Your application has been denied ';
														req.session.deniedstatus = 1;
														return res.redirect("/createapplication");*/
										} else {
											req.session.applicationReferenceValue = certificateDetails.screenTracking.applicationReference;
											var applicationReference = certificateDetails.screenTracking.applicationReference;
											var IPFromRequest = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
											var indexOfColon = IPFromRequest.lastIndexOf(":");
											var ip = IPFromRequest.substring(indexOfColon + 1, IPFromRequest.length);
											var screenid = certificateDetails.screenTracking.screenId;
											const screenDetails = certificateDetails.screenTracking;
											const createdate = moment().format("MM/DD/YYYY");
											const payid = certificateDetails.screenTracking.paymentid;

											// Directmail.createDmDocuments( userDetail, screenid, payid, ip, applicationReference, screenDetails, req, res, createdate )
											// .then( function( directmailDoc ) {
											// 	const consentCriteria = {
											// 		user: userDetail.id,
											// 		loanupdated: 1,
											// 		paymentManagement: { $exists: false }
											// 	};
											// 	UserConsent.find( consentCriteria ).then( function( userConsentAgreement ) {
											// 		_.forEach( userConsentAgreement, function( consentagreement ) {
											// 			UserConsent.updateUserConsentAgreement( consentagreement.id, userDetail.id, payid );
											// 		} );
											// 	} );

											// 	if( certificateDetails.code == 402 || certificateDetails.code == 403 || certificateDetails.code == 400 || certificateDetails.code == 500 ) {
											// 		req.session.applicationerror = "";
											// 		req.session.applicationerror = certificateDetails.message;
											// 		req.session.deniedstatus = 1;
											// 		return res.redirect( "/createapplication" );
											// 	} else if( certificateDetails.code == 200 && rulestatus == "Denied" ) {
											// 		req.session.applicationerror = "";
											// 		req.session.applicationerror = "Your application has been denied ";
											// 		req.session.deniedstatus = 1;
											// 		return res.redirect( "/createapplication" );
											// 	}
											// } )
											// .catch( function( err ) {
											// 	sails.log.error( "ApplicationController#addApplicationAction :: err :", err );
											// 	return res.handleError( err );
											// } );
										}
									})
									.catch(function (err) {
										if (err.code == 400) {
											req.session.applicationerror = "";
											req.session.applicationerror = "Your application has been declined, due to low credit score!";
											req.session.deniedstatus = 1;
											return res.redirect("/createapplication");
										} else {
											sails.log.error("ApplicationController#transunionAddFormAction!400 :: err :", err);
											req.session.applicationerror = "";
											req.session.applicationerror = "Could not receive your credit details";
											req.session.deniedstatus = 1;
											return res.redirect("/createapplication");
										}
									});
							} else {
								req.session.applicationerror = "";
								req.session.applicationerror = "Could not receive your credit details";
								req.session.deniedstatus = 1;
								return res.redirect("/createapplication");
							}
						})
						.catch(function (err) {
							sails.log.error("ApplicationController#transunionAddFormAction :: err :", err);
							req.session.applicationerror = "";
							req.session.applicationerror = "Could not receive your credit details";
							req.session.deniedstatus = 1;
							return res.redirect("/createapplication");
						});
				}
			})
			.catch(function (err) {
				sails.log.error("ApplicationController#addApplicationAction :: err :", err);
				req.session.applicationerror = "";
				req.session.applicationerror = "Invalid user data!";
				req.session.deniedstatus = 1;
				return res.redirect("/createapplication");
			});
	} else {
		req.session.applicationerror = "";
		req.session.applicationerror = "Invalid user data!";
		req.session.deniedstatus = 1;
		return res.redirect("/createapplication");
	}
}

function adddocumentAction(req, res) {
	const localPath = req.localPath;
	sails.log.info("localPath:::", localPath);
	const paymentID = req.param("payId");
	const screenid = req.param("screenId");
	const path = require("path");
	const user_id = req.session.userId;
	const doctype = req.param("doctype");
	const otherdoctype = req.param("other_doctype");

	if (doctype == "Others") {
		var whole_doctype = otherdoctype;
	} else {
		var whole_doctype = doctype;
	}

	sails.log.info("screenid", screenid);

	/* if (!req.form.isValid) {
			 var validationErrors = ValidationService
			.getValidationErrors(req.form.getErrors());
			 return res.failed(validationErrors);
		 }*/

	const filename = path.basename(localPath);

	if (paymentID) {
		const formdatas = {
			user: req.session.userId,
			docname: whole_doctype,
			paymentManagement: paymentID,
			filename: filename
		};

		/** ****************for-s3 userdoucments > Userreference > Application reference************************/
		const criteria = { id: user_id };
		sails.log.info("criteria", criteria);
		User.findOne(criteria)
			.then(function (userDetails) {
				const userReference = userDetails.userReference;

				const screentrackingcriteria = { user: user_id };
				sails.log.info("screentrackingcriteria", screentrackingcriteria);
				Screentracking.findOne(screentrackingcriteria)
					.then(function (screentrackingcriteriaDetails) {
						const applicationReference = screentrackingcriteriaDetails.applicationReference;

						/*  *****************************************/

						Achdocuments.createAchDocuments(formdatas, paymentID)
							.then(function (achdocuments) {
								sails.log.info("Achdocuments", achdocuments);

								Asset.createAssetForAchDocuments(achdocuments, localPath, userReference, applicationReference, Asset.ASSET_TYPE_USER_DOCUMENT)
									.then(function (asset) {
										console.log("asset data", asset);

										if (achdocuments.docname == sails.config.loanDetails.doctype1) {
											User.update({ id: user_id }, { isGovernmentIssued: true }).exec(function afterwards(err, updated) {
												// sails.log.info("updated if",updated);
											});
										} else if (achdocuments.docname == sails.config.loanDetails.doctype2) {
											User.update({ id: user_id }, { isPayroll: true }).exec(function afterwards(err, updated) {
												// sails.log.info("updated else",updated);
											});
										} else {
											sails.log.info("else");
										}

										return Achdocuments.updateDocumentProof(achdocuments, asset);
									})
									.then(function () {
										const json = {
											status: 200,
											message: "Documents updated successfully"
										};
										sails.log.info("json data", json);

										// var redirectpath ="/finalize";
										// return res.redirect(redirectpath);

										req.session.successval = "";
										req.session.uploaddocument = "";
										req.session.successval = "Your Documents Uploaded Successfully.";
										req.session.uploaddocument = "yes";

										sails.log.info("req.session.uploaddocument", req.session.uploaddocument);

										// var redirectpath ="/uploaddocuments/"+paymentID;
										// var redirectpath ="/viewloandetails/"+paymentID;
										const redirectpath = "/dashboard";
										// req.session.levels = '5';

										/* if(paymentID) {
														 var redirectpath ="/viewloandetails/"+paymentID;
													}
													else {
														var redirectpath ="/viewloandetails/"+screenid;
													}*/
										return res.redirect(redirectpath);
									})
									.catch(function (err) {
										sails.log.error("ApplicationController#adddocumentAction  :: Error :: ", err);
										return reject({
											code: 500,
											message: "INTERNAL_SERVER_ERROR"
										});
									});
							})
							.catch(function (err) {
								sails.log.error("ApplicationController#adddocumentAction :: err :", err);
								return res.handleError(err);
							});
					})
					.catch(function (err) {
						sails.log.error("ApplicationController#adddocumentAction :: err :", err);
						return res.handleError(err);
					});
			})
			.catch(function (err) {
				sails.log.error("ApplicationController#adddocumentAction :: err :", err);
				return res.handleError(err);
			});
	}

	/* var path = require('path');
	 var localPath = sails.config.appPath+'/assets/uploads/';
	 var paymentID = req.param('payId');
	 var userid = req.session.userId;
	 var uploadFile = req.file('documents');
	 var uploadFiledrop = req.file('file');
	 sails.log.info("Uploaded Document dropzone", uploadFiledrop);

	 if(paymentID)
		{
			uploadFile.upload({
			dirname:localPath },function onUploadComplete(err, files) {

			var filedata={};
				 filedata.userid = req.session.userId;
				 filedata.filename = files[0].filename;
				 filedata.filepath = files[0].fd;
				 filedata.type = files[0].type;

				 var docname = path.basename(filedata.filepath);

			 var formdatas = {
				userid: req.session.userId,
				filename: filedata.filename,
				path: localPath,
				fullpath: filedata.filepath,
				type: filedata.type,
				docname:docname,
				paymentManagement:paymentID,
			};

			Achdocuments
			.createAchDocuments(formdatas,userid)
			.then(function (achdocuments) {
				sails.log.info("Achdocuments", achdocuments);

				 Asset
					.createAssetForAchDocuments(achdocuments, localPath, Asset.ASSET_MEDIA_TYPE_DOC)
					.then(function(asset) {
					console.log("asset ", asset);

					return Achdocuments.updateDocumentProof(achdocuments, asset);
					})
					.then(function() {

					 var json = {
						status: 200,
						message:"Documents Uploaded successfully"
					 };
					// sails.log.info("json data", json);
					 var redirectpath ="/finalize";
					 return res.redirect(redirectpath);

					})
					.catch(function(err) {
					sails.log.error("Ach#uploadAchDocuments  :: Error :: ", err);
					return reject({
						code: 500,
						message: 'INTERNAL_SERVER_ERROR'
					});
					});

			})
			.catch(function (err) {
			 sails.log.error('ApplicationController#createAchDocuments :: err :', err);
				return res.handleError(err);
			});
	});
	}*/
}

function uploaddropfilesAction(req, res) {
	const localPath = sails.config.appPath + "/assets/uploads/";
	sails.log.info("localPath:::", localPath);
	const path = require("path");
	const paymentID = req.param("payId");
	const userid = req.session.userId;
	const doctype = req.param("doctype");
	const otherdoctype = req.param("other_doctype");

	if (doctype == "Others") {
		var whole_doctype = otherdoctype;
	} else {
		var whole_doctype = doctype;
	}

	req.session.uploaddocument = "";
	req.session.uploaddocument = "yes";

	sails.log.info("doctype", doctype);
	sails.log.info("otherdoctype", otherdoctype);

	req.file("file").upload({ dirname: localPath }, function (err, files) {
		//	sails.log.debug('file is :: ', +files);

		if (err) { return res.serverError(err); }

		const filedata = {};
		filedata.userid = req.session.userId;
		filedata.filepath = files[0].fd;
		const filename = path.basename(filedata.filepath);

		const localPath = filedata.filepath;
		sails.log.info("filedata.filepath", localPath);

		const formdatas = {
			user: req.session.userId,
			docname: whole_doctype,
			paymentManagement: paymentID,
			filename: filename
		};
		/** ****************fors3************************/
		const criteria = { id: userid };
		sails.log.info("criteria", criteria);
		User.findOne(criteria)
			.then(function (userDetails) {
				const userReference = userDetails.userReference;

				const screentrackingcriteria = { user: userid };
				sails.log.info("screentrackingcriteria", screentrackingcriteria);
				Screentracking.findOne(screentrackingcriteria)
					.then(function (screentrackingcriteriaDetails) {
						const applicationReference = screentrackingcriteriaDetails.applicationReference;

						/*  *****************************************/

						Achdocuments.createAchDocuments(formdatas, paymentID)
							.then(function (achdocuments) {
								sails.log.info("Achdocuments", achdocuments);

								Asset.createAssetForAchDocuments(achdocuments, localPath, userReference, applicationReference, Asset.ASSET_TYPE_USER_DOCUMENT)
									.then(function (asset) {
										console.log("asset ", asset);

										Achdocuments.updateDocumentProof(achdocuments, asset).then(function (asset) {
											if (achdocuments.docname == sails.config.loanDetails.doctype1) {
												User.update({ id: userid }, { isGovernmentIssued: true }).exec(function afterwards(err, updated) {
													// sails.log.info("updated if",updated);
												});
											} else if (achdocuments.docname == sails.config.loanDetails.doctype2) {
												User.update({ id: userid }, { isPayroll: true }).exec(function afterwards(err, updated) {
													// sails.log.info("updated else",updated);
												});
											} else {
												sails.log.info("else");
											}

											const json = {
												status: 200,
												message: "Documents Uploaded successfully"
											};
											sails.log.info("json data", json);
										});
										/* .catch(function (err) {
														sails.log.error('ApplicationController#createAchDocuments :: err :', err);
														//return res.handleError(err);
														});*/
									})
									.then(function () {
										const json = {
											status: 200,
											message: "success"
										};
										res.contentType("application/json");
										res.json(json);
									})
									.catch(function (err) {
										sails.log.error("Ach#uploadAchDocuments  :: Error :: ", err);
										const json = {
											status: 500,
											message: "INTERNAL_SERVER_ERROR"
										};
										res.contentType("application/json");
										res.json(json);
									});
							})
							.catch(function (err) {
								sails.log.error("ApplicationController#adddocumentAction :: err :", err);
								return res.handleError(err);
							});
					})
					.catch(function (err) {
						sails.log.error("ApplicationController#adddocumentAction :: err :", err);
						return res.handleError(err);
					});
			})
			.catch(function (err) {
				sails.log.error("ApplicationController#createAchDocuments :: err :", err);
				return res.handleError(err);
			});
	});
}

function serviceloandocumentsAction(req, res) {
	const user_id = req.param("id");

	console.log("user_id:::", user_id);

	const criteria = {
		documentKey: "131"
	};
	Agreement.find(criteria)
		.then(function (agreements) {
			const criteria = { user: user_id, isCompleted: false };

			// var criteria = { user: req.session.userId};
			Screentracking.findOne(criteria)
				.populate("user")
				.populate("accounts")
				.then(function (userscreenres) {
					const userid = userscreenres.user.id;
					const palidcriteria = { user: userid };

					PlaidUser.findOne(palidcriteria)
						.then(function (userres) {
							sails.log.info("userDetails ranjani : ", userres);

							const names = userres.names;
							const street = userres.addresses[0].data.street;
							const city = userres.addresses[0].data.city;
							const state = userres.addresses[0].data.state;
							const zipCode = userres.addresses[0].data.zip;
							const financedAmount = parseFloat(userscreenres.offerdata[0].financedAmount);
							const interestRate = userscreenres.offerdata[0].interestRate;
							const appfeerate = userscreenres.offerdata[0].appfeerate;
							const loanTerm = userscreenres.offerdata[0].month;

							PaymentManagement.getLoanPaymentSchedule(userscreenres)
								.then(function (paymentDetails) {
									const docversion = agreements[0].documentVersion;
									const schedulecount = paymentDetails.length;

									sails.log.info("schedulecount : ", schedulecount);
									sails.log.info("paymentDetails : ", paymentDetails);

									var annualPercentageRate = interestRate;
									const maturityDate = moment()
										.startOf("day")
										.add(loanTerm, "months");

									if (annualPercentageRate > 0) {
										var annualPercentageRate = interestRate;
										const decimalRate = annualPercentageRate / 100 / 12;
										const xpowervalue = decimalRate + 1;
										const ypowervalue = loanTerm;
										const powerrate_value = Math.pow(xpowervalue, ypowervalue) - 1;
										scheduleLoanAmount = (decimalRate + decimalRate / powerrate_value) * financedAmount;
										scheduleLoanAmount = scheduleLoanAmount.toFixed(2);
										checktotalLoanAmount = scheduleLoanAmount * loanTerm;
										creditcost = checktotalLoanAmount - financedAmount;
										creditcost = parseFloat(creditcost.toFixed(2));
									} else {
										var creditcost = 0;
										creditcost = parseFloat(creditcost.toFixed(2));
									}

									checktotalLoanAmount = parseFloat(checktotalLoanAmount.toFixed(2));

									const obj = {
										amount: financedAmount,
										address: street,
										name: names,
										date: moment().format("MM/DD/YYYY"),
										interestRate: interestRate,
										month: loanTerm,
										agreement: agreements,
										createdDate: moment().format(),
										endDate: moment()
											.add(loanTerm, "months")
											.format(),
										signedDate: new Date(),
										paymentschedule: paymentDetails,
										schedulecount: paymentDetails.length,
										annualPercentageRate: interestRate,
										loannumber: userscreenres.applicationReference,
										checktotalLoanAmount: checktotalLoanAmount,
										creditcost: creditcost,
										street: street,
										stateName: state,
										stateCode: state,
										city: city,
										zipCode: zipCode,
										accountDetail: userscreenres.accounts
									};
									sails.log.info("objdata :", obj);

									Esignature.findOne({ user_id: userid }).then(function (esignatureimagedetails) {
										sails.log.info("esignatureimagedetails:", esignatureimagedetails);

										const signautepath = Utils.getS3Url(esignatureimagedetails.standardResolution);

										sails.log.info("esignatureimagedetails signautepath:", signautepath);
										var IPFromRequest = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
										sails.log.info("IPFromRequest**********:", IPFromRequest);
										var IPFromRequest = req.connection.remoteAddress;
										const indexOfColon = IPFromRequest.lastIndexOf(":");
										const ip = IPFromRequest.substring(indexOfColon + 1, IPFromRequest.length);

										UserConsent.findOne({ user: user_id, documentKey: "131" }).then(function (userconsentdetails) {
											sails.log.info("userconsentdetails:", userconsentdetails);
											// sails.log.info("userconsentdetails documentName:", userconsentdetails[0].documentKey);

											var alreadysigned = 0;

											if (userconsentdetails) {
												// if(userconsentdetails) {
												sails.log.info("ifloop:");
												var alreadysigned = 1;
											} else {
												var alreadysigned = 0;
											}

											sails.log.info("alreadysigned:", alreadysigned);

											res.view("customerService/serviceloandocuments", { obj: obj, docversion: docversion, ip: ip, user_id: user_id, signautepath: signautepath, alreadysigned: alreadysigned });
											// res.view("document/loanAgreementAndPromissoryNote_v2", {obj:obj,docversion:docversion,ip:ip});
										});
									});
								})
								.catch(function (err) {
									sails.log.error("ApplicationController#loandocumentsAction :: err", err);
									return res.handleError(err);
								});
						})
						.catch(function (err) {
							sails.log.error("ApplicationController#loandocumentsAction :: err", err);
							return res.handleError(err);
						});
				})
				.catch(function (err) {
					sails.log.error("ApplicationController#loandocumentsAction :: err", err);
					return res.handleError(err);
				});
		})
		.catch(function (err) {
			sails.log.error("ApplicationController#loandocumentsAction :: err", err);
			return res.handleError(err);
		});
}

function serviceconfirmsignatureAction(req, res) {
	const signatureid = req.param("signatureid");
	const user_id = req.param("user_id");
	const criteria = { user: user_id, isCompleted: false };

	sails.log.info("user_id data:::", user_id);

	Screentracking.findOne(criteria)
		.sort("createdAt DESC")
		.then(function (userscreenres) {
			Screentracking.update({ id: userscreenres.id }, { esignature: signatureid })
				.exec(function afterwards(err, updated) {
					const json = {
						updated: updated
					};
					sails.log.info("json data", json);
					res.contentType("application/json");
					res.json(json);
				})
				.catch(function (err) {
					const responsedata = {
						status: 400,
						message: "Signature Error"
					};
					const json = {
						responsedata: responsedata
					};
					sails.log.info("json data", json);
					res.contentType("application/json");
					res.json(json);
				});
		})
		.catch(function (err) {
			sails.log.error("ApplicationController#addconsolidateAction :: err", err);
			return res.handleError(err);
		});
}
function servicecreateloandetailsAction(req, res) {
	const user_id = req.param("id");
	sails.log.info("user_id : ", user_id);

	const criteria = { user: user_id, isCompleted: false };
	// var criteria = { id: '5a9fb9cb7ef82e7641aceae2'};
	// sails.log.info('criteria : ', criteria);

	Screentracking.findOne(criteria)
		.sort("createdAt DESC")
		.then(function (userscreenres) {

			const criteria = { id: user_id };

			User.findOne(criteria)
				.then(function (userDetails) {
					Story.createUserstory(userDetails, userscreenres)
						.then(function (storyDet) {
							// sails.log.info('storyDet ',storyDet);

							PaymentManagement.createLoanPaymentSchedule(userscreenres, storyDet)
								.then(function (paymentDetails) {
									// sails.log.info('paymentDetails ',paymentDetails);

									if (paymentDetails != "" && paymentDetails != null && "undefined" !== typeof paymentDetails) {
										Screentracking.update({ id: userscreenres.id }, { lastlevel: 5 }).exec(function afterwards(err, updated) {
											User.update({ id: userscreenres.user }, { isExistingLoan: true }).exec(function afterwards(err, userupdated) {
												const tranunionid = userscreenres.transunion;
												const transcriteria = { id: tranunionid };

												Transunions.findOne(transcriteria)
													.then(function (userres) {
														const creditscore = userres.score;

														// var creditscore = 637;

														PaymentManagement.update({ id: paymentDetails.id }, { creditScore: creditscore }).exec(function afterwards(err, userupdated) { });
													})
													.catch(function (err) {
														sails.log.error("ApplicationController#servicecreateloandetailsAction :: err", err);
														return res.handleError(err);
													});
											});
										});

										const redirectpath = "/servicesuccessmessage";
										return res.redirect(redirectpath);
									}
								})
								.catch(function (err) {
									sails.log.error("ApplicationController#servicecreateloandetailsAction :: err", err);
									return res.handleError(err);
								});
						})
						.catch(function (err) {
							sails.log.error("ApplicationController#servicecreateloandetailsAction :: err", err);
							return res.handleError(err);
						});
				})
				.catch(function (err) {
					sails.log.error("ApplicationController#servicecreateloandetailsAction :: err", err);
					return res.handleError(err);
				});
		})
		.catch(function (err) {
			sails.log.error("ApplicationController#servicecreateloandetailsAction :: err", err);
			return res.handleError(err);
		});
}

function servicesuccessmessageAction(req, res) {
	res.view("customerService/servicesuccessmessage");
}

function promissorynoteAction(req, res) {
	const userid = req.session.userId;

	UserConsent.objectdataforpdf(userid, req, res)
		.then(function (objectdatas) {
			// sails.log.info("objectdataspdf:", objectdatas);
			const amount = parseFloat(objectdatas.amount);
			objectdatas.amount = amount.toLocaleString();

			const fname = objectdatas.fname;
			const lname = objectdatas.lname;

			Transunions.findOne({ user: userid })
				.then(function (transunionsdetails) {
					var socialnumber = transunionsdetails.response.product.subject.subjectRecord.indicative.socialSecurity.number;
					var socialnumber = socialnumber.replace(/.(?=.{4})/g, "X");

					const scriteria = { user: userid, isCompleted: false };

					Screentracking.findOne(scriteria)
						.populate("accounts")
						.populate("plaiduser")
						.populate("transunion")
						.populate("user")
						.then(function (screentrackingdetails) {
							sails.log.info("screentrack", screentrackingdetails);

							// var accountName = screentrackingdetails.accounts.accountName;
							const accountName = "Installment Loan";
							const accountNumberLastFour = screentrackingdetails.accounts.accountNumberLastFour;
							/* var loanholderstreetname = screentrackingdetails.plaiduser.addresses[0].data.street;
							var loanholderstreetnumber = screentrackingdetails.plaiduser.addresses[0].data.street;
							var loanholdercity = screentrackingdetails.plaiduser.addresses[0].data.city;
							var loanholderzipcode = screentrackingdetails.plaiduser.addresses[0].data.state;*/
							// var loanholderzipcode = screentrackingdetails.offerdata[0].financedAmount;
							const loanholderstreetname = screentrackingdetails.user.street;
							const loanholderstreetnumber = screentrackingdetails.user.street;
							const loanholdercity = screentrackingdetails.user.city;
							const loanholderzipcode = screentrackingdetails.user.zipCode;
							const loanstate = screentrackingdetails.user.state;
							if (screentrackingdetails.user.unitapp) {
								var unitapp = screentrackingdetails.user.unitapp;
							} else {
								var unitapp = "";
							}

							User.findOne({ id: userid })
								.then(function (userdetails) {
									const addressobj = {
										accountName: accountName,
										accountNumberLastFour: accountNumberLastFour,
										loanholderstreetname: loanholderstreetname,
										loanholderstreetnumber: loanholderstreetnumber,
										loanholdercity: loanholdercity,
										loanholderzipcode: loanholderzipcode,
										phonenumber: userdetails.phoneNumber,
										loanstate: loanstate,
										unitapp: unitapp
									};
									// sails.log.info("lname:", addressobj.street);
									const criteria = {
										documentKey: "130"
									};

									Agreement.find(criteria)
										.then(function (agreements) {
											const docversion = agreements[0].documentVersion;
											const IPFromRequest = req.headers["x-forwarded-for"] || req.connection.remoteAddress;

											const indexOfColon = IPFromRequest.lastIndexOf(":");
											const ip = IPFromRequest.substring(indexOfColon + 1, IPFromRequest.length);

											res.view("frontend/banktransaction/promissorynote", { obj: objectdatas, fname: fname, lname: lname, socialnumber: socialnumber, addressobj: addressobj, docversion: docversion, type: "view", ip: ip });
										})
										.catch(function (err) {
											sails.log.error("ApplicationController#promissorynoteAction :: err", err);
											return res.handleError(err);
										});
								})
								.catch(function (err) {
									sails.log.error("ApplicationController#promissorynoteAction :: err", err);
									return res.handleError(err);
								});
						})
						.catch(function (err) {
							sails.log.error("ApplicationController#promissorynoteAction :: err", err);
							return res.handleError(err);
						});
				})
				.catch(function (err) {
					sails.log.error("ApplicationController#promissorynoteAction :: err", err);
					return res.handleError(err);
				});
		})
		.catch(function (err) {
			sails.log.error("ApplicationController#promissorynoteAction :: err", err);
			return res.handleError(err);
		});
}

// function createpromissorypdfAction( req, res ) {
// 	const ip = ( req.headers[ "x-forwarded-for" ] || req.headers[ "x-real-ip" ] || req.connection.remoteAddress ).replace( "::ffff:", "" ).replace( /^::1$/, "127.0.0.1" );
// 	const userId = req.session.userId;
// 	// const anotherUserEnteredName = req.param( "anotherUserEnteredName" );
// 	// const userEnteredName = req.param( "UserEnteredName1" );
// 	const firstUserName = req.param( "anotherUserEnteredName" );
// 	const secondUserName = req.param( "userEnteredName" );
// 	const phoneNumber = req.param( "mobileno" );
// 	let businessPurposesCheckbox = "";
// 	let brokerParticipatedCheckbox = "";
// 	let eftaCheckbox = "";
// 	if( req.param( "businessPurposesCheckbox" ) == "checked" || req.param( "businessCheckboxServer" ) == "checked" ) {
// 		businessPurposesCheckbox = "checked";
// 	}
// 	if( req.param( "brokerParticipatedCheckbox" ) == "checked" || req.param( "brokerCheckboxServer" ) == "checked" ) {
// 		brokerParticipatedCheckbox = "checked";
// 	}
// 	if( req.param( "eftaCheckbox" ) == "checked" || req.param( "eftaCheckboxServer" ) == "checked" ) {
// 		eftaCheckbox = "checked";
// 	}
// 	let promCheckboxes = {
// 		businessPurposesCheckbox: businessPurposesCheckbox,
// 		brokerParticipatedCheckbox: brokerParticipatedCheckbox,
// 		eftaCheckbox: eftaCheckbox
// 	};

// 	sails.log.info( "JH ApplicationController.js createpromissorypdfAction userId", userId );

// 	return Screentracking.findOne( { user: userId } )
// 	.populate( "user" )
// 	.then( ( screentrackingdetails ) => {
// 		const applicationReference = screentrackingdetails.applicationReference;
// 		const userReference = screentrackingdetails.user.userReference;
// 		req.session.applicationReference = applicationReference;
// 		req.session.userReference = userReference;

// 		return PaymentManagement.createLoanPaymentSchedule( screentrackingdetails )
// 		.then( function( paymentDetails ) {
// 			// sails.log.info('paymentDetails ',paymentDetails);

// 			if( paymentDetails == "" || paymentDetails == null || "undefined" == typeof paymentDetails ) {
// 				throw new Error( "Failed to create loan payment schedule." );
// 			}
// 			return Screentracking.update( { id: screentrackingdetails.id }, { lastlevel: 5 } ).toPromise()
// 			.then( ( updated ) => {
// 				return User.update( { id: screentrackingdetails.user.id }, { isExistingLoan: true } ).toPromise()
// 				.then( ( userupdated ) => {
// 					const tranunionid = screentrackingdetails.transunion;
// 					const transcriteria = { id: tranunionid };

// 					return Transunions.findOne( transcriteria )
// 					.then( function( userres ) {
// 						const creditscore = userres.score;

// 						// var creditscore = 637;

// 						return PaymentManagement.update( { id: paymentDetails.id }, { creditScore: creditscore } ).exec( function afterwards( err, userupdated ) {} );
// 					} );
// 				} );
// 			} );
// 		} )
// 		.then( () => {
// 			/*============== Promissory Note save ==========================*/
// 			return Agreement.findOne( { documentKey: "131" } )
// 		} )
// 		.then( ( agreement ) => {
// 			const screenId = screentrackingdetails.id;
// 			sails.log.info("agreement:", agreement);

// 			return UserConsent.createConsent( agreement, screentrackingdetails.user.id, ip, screenId )
// 			.then( ( userconsentdetails ) => {
// 				const consentId = userconsentdetails.id;
// 				sails.log.info("userconsentdetails----------:", userconsentdetails);

// 				return UserConsent.objectdataforpromissory( userId, req, res )
// 				.then( ( objectdatas ) => {
// 					sails.log.info("objectdataspdf----------:", objectdatas);
// 					userconsentdetails.applicationReference = applicationReference;
// 					userconsentdetails.userReference = userReference;

// 					return User.update( { id: userId }, { promName1: firstUserName, promName2: secondUserName, promNumber: phoneNumber } )
// 					.then( ( updateduser ) => {
// 						if( Array.isArray( updateduser ) ) {
// 							updateduser = updateduser.shift();
// 						}
// 						return UserConsent.createPromissoryAgreementPdf( consentId, userId, userconsentdetails, objectdatas, promCheckboxes, res, req )
// 						.then( ( agreementpdf ) => {

// 							/*============== EFT save ==========================*/
// 							return Agreement.findOne( { documentKey: '126' } )
// 							.then( function ( eftAgreement ) {
// 								return UserConsent.createConsentfordocuments( eftAgreement, updateduser, ip, screenId )
// 								.then(function ( userconsentdetails ) {
// 									var consentID = userconsentdetails.id;
// 									var applicationReference = screentrackingdetails.applicationReference;
// 									return UserConsent.createStaticEftPdf( consentID, userconsentdetails, applicationReference, ip, res, req)
// 									.then( () => {
// 										return res.redirect( "/createloandetails" );
// 									} );
// 								} );
// 							} );
// 						} );
// 					} );
// 				} );
// 			} );
// 		} );
// 	} )
// 	.catch( ( err ) => {
// 		sails.log.error( "ApplicationController#createpromissorypdfAction :: err:", err );
// 		return res.handleError( err );
// 	} );
// }

function createpromissorypdfAction(req, res) {
	const ip = (req.headers["x-forwarded-for"] || req.headers["x-real-ip"] || req.connection.remoteAddress).replace("::ffff:", "").replace(/^::1$/, "127.0.0.1");
	const userId = req.session.userId;
	if (!req.session.practiceId && req.session.appPracticeId) {
		req.session.practiceId = req.session.appPracticeId;
	}
	const practiceId = req.session.practiceId;
	const firstUserName = req.param("anotherUserEnteredName");
	const secondUserName = req.param("userEnteredName");
	const phoneNumber = req.param("mobileno");
	let businessPurposesCheckbox = "";
	let brokerParticipatedCheckbox = "";
	let eftaCheckbox = "";
	if (req.param("businessPurposesCheckbox") == "checked" || req.param("businessCheckboxServer") == "checked") {
		businessPurposesCheckbox = "checked";
	}
	if (req.param("brokerParticipatedCheckbox") == "checked" || req.param("brokerCheckboxServer") == "checked") {
		brokerParticipatedCheckbox = "checked";
	}
	if (req.param("eftaCheckbox") == "checked" || req.param("eftaCheckboxServer") == "checked") {
		eftaCheckbox = "checked";
	}
	const promCheckboxes = {
		businessPurposesCheckbox: businessPurposesCheckbox,
		brokerParticipatedCheckbox: brokerParticipatedCheckbox,
		eftaCheckbox: eftaCheckbox
	};

	sails.log.info("JH ApplicationController.js createpromissorypdfAction userId", userId);

	Screentracking.findOne({ user: userId })
		.populate("user")
		.then((screentrackingdetails) => {
			const applicationReference = screentrackingdetails.applicationReference;
			const userReference = screentrackingdetails.user.userReference;
			req.session.applicationReference = applicationReference;
			req.session.userReference = userReference;


			const screenId = screentrackingdetails.id;
			/* ============== Promissory Note save ========================== */
			return Agreement.findOne({ documentKey: "131", practicemanagement: practiceId })
				.then((agreement) => {
					sails.log.info("agreement:", agreement);

					return UserConsent.createConsent(agreement, screentrackingdetails.user, ip, screenId)
						.then((userconsentdetails) => {
							const consentId = userconsentdetails.id;
							sails.log.info("userconsentdetails----------:", userconsentdetails);

							return UserConsent.objectdataforpromissory(userId, req, res, agreement)
								.then((objectdatas) => {
									sails.log.info("objectdataspdf----------:", objectdatas);
									userconsentdetails.applicationReference = applicationReference;
									req.session.applicationReference = applicationReference;
									userconsentdetails.userReference = userReference;

									return User.update({ id: userId }, { promName1: firstUserName, promName2: secondUserName, promNumber: phoneNumber })
										.then((updateduser) => {
											if (Array.isArray(updateduser)) {
												updateduser = updateduser.shift();
											}
											return UserConsent.createPromissoryAgreementPdf(consentId, userId, userconsentdetails, objectdatas, promCheckboxes, res, req)
												.then((agreementpdf) => {
													sails.log.info("ApplicationContreller.createpromissoryPdfAction agreementpdf", agreementpdf);
													/* ============== EFTA save ========================== */
													return Agreement.findOne({ documentKey: "132", practicemanagement: practiceId })
														.then((eftAgreement) => {
															return UserConsent.createConsentfordocuments(eftAgreement, updateduser, ip, screenId)
																.then((userconsentdetails) => {
																	const consentID = userconsentdetails.id;
																	const applicationReference = screentrackingdetails.applicationReference;
																	return UserConsent.createStaticEftPdf(consentID, userconsentdetails, applicationReference, ip, res, req)
																		.then(() => {
																			return res.redirect("/createloandetails");
																		});
																});
														});
												});
										});
								});
						});
				});
		})
		.catch((err) => {
			sails.log.error("ApplicationController#createpromissorypdfAction :: err:", err);
			return res.handleError(err);
		});
}


function servicecreatepromissorypdfAction(req, res) {
	const userid = req.param("id");
	sails.log.info("userid:", userid);

	Screentracking.findOne({ user: userid })
		.populate("user")
		.then(function (screentrackingdetails) {
			// sails.log.info("screentrackingdetails:", screentrackingdetails);
			const applicationReference = screentrackingdetails.applicationReference;
			const userReference = screentrackingdetails.user.userReference;

			req.session.applicationReference = applicationReference;
			req.session.userReference = userReference;

			// var IPFromRequest = req.ip;
			const IPFromRequest = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
			const indexOfColon = IPFromRequest.lastIndexOf(":");
			const ip = IPFromRequest.substring(indexOfColon + 1, IPFromRequest.length);
			const screenid = screentrackingdetails.id;

			const criteria = {
				documentKey: "131"
			};

			Agreement.findOne({ documentKey: "131" })
				.then(function (agreement) {
					//	sails.log.info("agreement:", agreement);

					UserConsent.createConsent(agreement, screentrackingdetails.user, ip, screenid)
						.then(function (userconsentdetails) {
							const consentID = userconsentdetails.id;
							const userID = screentrackingdetails.user.id;
							sails.log.info("userIDuserID:", userID);

							UserConsent.objectdataforpromissory(userID, req, res, agreement)
								.then(function (objectdatas) {
									sails.log.info("objectdataspdf:", objectdatas);

									UserConsent.createServicePromissoryAgreementPdf(consentID, userID, userconsentdetails, objectdatas, res, req)
										.then(function (agreementpdf) {
											sails.log.info("agreementpdf:", agreementpdf);

											// var redirectpath ="/serviceloandocuments/"+userID;
											const redirectpath = "/servicecreateloandetails/" + userID;
											return res.redirect(redirectpath);
										})
										.catch(function (err) {
											sails.log.error("ApplicationController#createpromissorypdfAction :: err", err);
											return res.handleError(err);
										});
								})
								.catch(function (err) {
									sails.log.error("ApplicationController#createpromissorypdfAction :: err", err);
									return res.handleError(err);
								});
						})
						.catch(function (err) {
							sails.log.error("ApplicationController#createpromissorypdfAction :: err", err);
							return res.handleError(err);
						});
				})
				.catch(function (err) {
					sails.log.error("ApplicationController#createpromissorypdfAction :: err", err);
					return res.handleError(err);
				});
		})
		.catch(function (err) {
			sails.log.error("ApplicationController#createpromissorypdfAction :: err", err);
			return res.handleError(err);
		});
}

function createstateregulationAction(req, res) {
	const product_id = req.param("product_id");
	const newstate = req.param("state");
	const newstateCode = req.param("stateCode");
	const newminloanamount = req.param("ratepercycle");
	const action = req.param("action");

	if (action == "update") {
		const loanstateregualtion_id = req.param("loanstateregualtion_id");
		const updatecriteria = { product: product_id, state: newstate, id: { "!": loanstateregualtion_id } };

		Loanstateregulation.find(updatecriteria)
			.then(function (stateregulationupdatedetails) {
				let minimumcriteriaExistrange = 0;
				let maximumcriteriaExistrange = 0;

				_.forEach(stateregulationupdatedetails, function (stateregulationupdatedetails) {
					const minloanamount_range = parseFloat(stateregulationupdatedetails.minloanamount);
					const maxloanamount_range = parseFloat(stateregulationupdatedetails.maxloanamount);

					if (parseFloat(newminloanamount) >= minloanamount_range && parseFloat(newminloanamount) <= maxloanamount_range) {
						minimumcriteriaExistrange = 1;
					}

					if (parseFloat(newmaxloanamount) >= minloanamount_range && parseFloat(newmaxloanamount) <= maxloanamount_range) {
						maximumcriteriaExistrange = 1;
					}
				});
				/* To check ranges end*/
				if (maximumcriteriaExistrange == 1 && minimumcriteriaExistrange == 1) {
					var responsedata = {
						status: "fail",
						message: "Your Minimum And Maximum Loanamount Already In Existing Range. Tryout With Another Range."
					};

					var json = {
						responsedata: responsedata
					};

					sails.log.info("json data", json);
					res.contentType("application/json");
					res.json(json);
				}
				if (minimumcriteriaExistrange == 1) {
					var responsedata = {
						status: "fail",
						message: "Your Minimum Loanamount Already In Existing Range. Tryout With Another Range."
					};

					var json = {
						responsedata: responsedata
					};

					sails.log.info("json data", json);
					res.contentType("application/json");
					res.json(json);
				}
				if (maximumcriteriaExistrange == 1) {
					var responsedata = {
						status: "fail",
						message: "Your Maximum Loanamount Already In Existing Range. Tryout With Another Range."
					};

					var json = {
						responsedata: responsedata
					};

					sails.log.info("json data", json);
					res.contentType("application/json");
					res.json(json);
				}

				if (minimumcriteriaExistrange != 1 && maximumcriteriaExistrange != 1) {
					const criteria = { id: loanstateregualtion_id };

					Loanstateregulation.update(criteria, { state: newstate, stateCode: newstateCode, minloanamount: newminloanamount, maxloanamount: newmaxloanamount, maxapr: newmaxapr, applicationfee: newapplicationfee, originationfeecap: neworiginationfeecap }).exec(function afterwards(err, updateddetails) {
						if (err) {
							sails.log.info("error occured : ", err);
						}

						const responsedata = {
							status: "Success",
							message: "Your Data Successfully Updated."
						};

						const json = {
							responsedata: responsedata
						};

						sails.log.info("json data", json);
						res.contentType("application/json");
						res.json(json);
					});
				}
			})
			.catch(function (err) {
				sails.log.error("UserController#createstateregulationAction ::  err ", err);
				return res.handleError(err);
			});
	}
	if (action == "create") {
		const createcriteria = { product: product_id, state: newstate };

		sails.log.info("create");
		Loanstateregulation.find(createcriteria)
			.then(function (stateregulationdetails) {
				let minimumcriteriaExistrange = 0;
				let maximumcriteriaExistrange = 0;

				if (stateregulationdetails[0]) {
					_.forEach(stateregulationdetails, function (stateregulationdetails) {
						const minloanamount_range = parseFloat(stateregulationdetails.minloanamount);
						const maxloanamount_range = parseFloat(stateregulationdetails.maxloanamount);

						if (parseFloat(newminloanamount) >= minloanamount_range && parseFloat(newminloanamount) <= maxloanamount_range) {
							minimumcriteriaExistrange = 1;
						}

						if (parseFloat(newmaxloanamount) >= minloanamount_range && parseFloat(newmaxloanamount) <= maxloanamount_range) {
							maximumcriteriaExistrange = 1;
						}
					});

					/* To check ranges end*/
					if (maximumcriteriaExistrange == 1 && minimumcriteriaExistrange == 1) {
						var responsedata = {
							status: "fail",
							message: "Your Minimum And Maximum Loanamount Already In Existing Range. Tryout With Another Range."
						};

						var json = {
							responsedata: responsedata
						};

						sails.log.info("json data", json);
						res.contentType("application/json");
						res.json(json);
					}
					if (minimumcriteriaExistrange == 1) {
						var responsedata = {
							status: "fail",
							message: "Your Minimum Loanamount Already In Existing Range. Tryout With Another Range."
						};

						var json = {
							responsedata: responsedata
						};

						sails.log.info("json data", json);
						res.contentType("application/json");
						res.json(json);
					}
					if (maximumcriteriaExistrange == 1) {
						var responsedata = {
							status: "fail",
							message: "Your Maximum Loanamount Already In Existing Range. Tryout With Another Range."
						};

						var json = {
							responsedata: responsedata
						};

						sails.log.info("json data", json);
						res.contentType("application/json");
						res.json(json);
					}

					if (minimumcriteriaExistrange != 1 && maximumcriteriaExistrange != 1) {
						Loanstateregulation.create({ product: product_id, state: newstate, stateCode: newstateCode, minloanamount: newminloanamount, maxloanamount: newmaxloanamount, maxapr: newmaxapr, applicationfee: newapplicationfee, originationfeecap: neworiginationfeecap }).exec(function (err, loandetails) {
							if (err) {
								sails.log.info("error occured : ", err);
							}
							const responsedata = {
								status: "Success",
								message: "Your Data Successfully Created."
							};

							const json = {
								responsedata: responsedata
							};

							sails.log.info("json data", json);
							res.contentType("application/json");
							res.json(json);
						});
					}
				}
			})
			.catch(function (err) {
				sails.log.error("UserController#viewproductdetailsAction ::  err ", err);
				return res.handleError(err);
			});
	}
}

function ajaxgetstateregulationsAction(req, res) {
	const product_id = req.param("product_id");

	Loanstateregulation.find({ product: product_id })
		.then(function (stateregulation) {
			Productlist.findOne({ id: product_id })
				.then(function (productdetails) {
					const responsedata = {
						status: "get success",
						stateregulation: stateregulation,
						productname: productdetails.productname
					};

					const json = {
						responsedata: responsedata
					};

					sails.log.info("json data", json);
					res.contentType("application/json");
					res.json(json);
				})
				.catch(function (err) {
					sails.log.error("UserController#viewproductdetailsAction ::  err ", err);
					return res.handleError(err);
				});
		})
		.catch(function (err) {
			sails.log.error("UserController#viewproductdetailsAction ::  err ", err);
			return res.handleError(err);
		});
}

function getinterestratefieldsAction(req, res) {
	const intrestrate_id = req.param("intrestrate_id");
	const criteria = { id: intrestrate_id };

	Loaninterestrate.findOne(criteria)
		.then(function (loaninterestratedetails) {
			const responsedata = {
				status: "Success",
				loaninterestratedetails: loaninterestratedetails
			};

			const json = {
				responsedata: responsedata
			};
			sails.log.info("json data", json);
			res.contentType("application/json");
			res.json(json);
		})
		.catch(function (err) {
			sails.log.error("UserController#getinterestratefieldsAction#catch :: err :", err);
			return res.handleError(err);
		});
}

function createupdateinterestrateAction(req, res) {
	const minimumcreditscore = req.param("minscoreinterestrate");
	const maximumcreditscore = req.param("maxscoreinterestrate");
	const interestrate_fields_whole = req.param("interestrate_fields_whole");
	const intrestrate_product_id = req.param("intrestrate_product_id");
	const intrestrate_id = req.param("intrestrate_id");
	const loan_intrestrate_action = req.param("loan_intrestrate_action");
	const interestrate_product_type = req.param("interestrate_product_type");

	if (loan_intrestrate_action == "create") {
		var criteria = { product: intrestrate_product_id };
	}

	if (loan_intrestrate_action == "update") {
		var criteria = {
			product: intrestrate_product_id,
			id: { "!": intrestrate_id }
		};
	}

	Loaninterestrate.find(criteria)
		.then(function (filtercapdetails) {
			/* To check ranges start*/
			let minimumcriteriaExist = 0;
			let maximumcriteriaExist = 0;
			_.forEach(filtercapdetails, function (filtercapdetails) {
				const mincreditscore = filtercapdetails.mincreditscore;
				const maxcreditscore = filtercapdetails.maxcreditscore;

				if (minimumcreditscore >= mincreditscore && minimumcreditscore <= maxcreditscore) {
					minimumcriteriaExist = 1;
				}
				if (maximumcreditscore >= mincreditscore && maximumcreditscore <= maxcreditscore) {
					maximumcriteriaExist = 1;
				}
			});
			/* To check ranges end*/

			if (maximumcriteriaExist == 1 && minimumcriteriaExist == 1) {
				var responsedata = {
					status: "fail",
					message: "Your Minimum And Maximum Creditscore Already In Existing Range. Tryout With Another Range."
				};

				var json = {
					responsedata: responsedata
				};

				sails.log.info("json data", json);
				res.contentType("application/json");
				res.json(json);
			}
			if (minimumcriteriaExist == 1) {
				var responsedata = {
					status: "fail",
					message: "Your Minimum Creditscore Already In Existing Range. Tryout With Another Range."
				};

				var json = {
					responsedata: responsedata
				};

				sails.log.info("json data", json);
				res.contentType("application/json");
				res.json(json);
			}
			if (maximumcriteriaExist == 1) {
				var responsedata = {
					status: "fail",
					message: "Your Maximum Creditscore Already In Existing Range. Tryout With Another Range."
				};

				var json = {
					responsedata: responsedata
				};

				sails.log.info("json data", json);
				res.contentType("application/json");
				res.json(json);
			}
			if (minimumcriteriaExist != 1 && maximumcriteriaExist != 1) {
				const criteriamonth = { productid: intrestrate_product_id };

				if (interestrate_product_type == "loanproductsettings") {
					var intrestrateobj = {};
					let no_month = {};
					Loanproductsettings.find(criteriamonth).then(function (monthdata) {
						monthdata.forEach(function (productdata, loopvalue) {
							no_month = parseFloat(productdata.month);
							intrestrateobj[no_month] = interestrate_fields_whole[loopvalue];
						});
						sails.log.info(" intrestrateobj", intrestrateobj);

						const criteria = { id: intrestrate_id };
						if (loan_intrestrate_action == "update") {
							Loaninterestrate.update(criteria, { product: intrestrate_product_id, mincreditscore: minimumcreditscore, maxcreditscore: maximumcreditscore, intrestrate: intrestrateobj }).exec(function afterwards(err, interestrateupdated) {
								sails.log.info(" interestrateupdated", interestrateupdated);
								const responsedata = {
									status: "Success",
									message: "Your Data Successfully Updated."
								};

								const json = {
									responsedata: responsedata
								};

								sails.log.info("json data", json);
								res.contentType("application/json");
								res.json(json);
							});
						}
						if (loan_intrestrate_action == "create") {
							Loaninterestrate.create({ product: intrestrate_product_id, mincreditscore: minimumcreditscore, maxcreditscore: maximumcreditscore, intrestrate: intrestrateobj }).exec(function (err, interestratecreated) {
								sails.log.info(" interestratecreated", interestratecreated);
								const responsedata = {
									status: "Success",
									message: "Your Data Successfully Created."
								};

								const json = {
									responsedata: responsedata
								};

								sails.log.info("json data", json);
								res.contentType("application/json");
								res.json(json);
							});
						}
					});
				}
				if (interestrate_product_type == "loanproductincome") {
					var intrestrateobj = [];
					const intrestrateobject = {};
					const incomerange = {};
					Loanproductincome.find(criteriamonth).then(function (incomedata) {
						sails.log.info("incomedata data", incomedata);
						sails.log.info("interestrate_fields_whole ", interestrate_fields_whole);
						const intrestrateobj = [];
						incomedata.forEach(function (productdata, loopvalue) {
							// sails.log.info("productdata ", productdata);
							const minimumincome = productdata.minimumincome;
							const maximumincome = productdata.maximumincome;

							// intrestrateobject['minimumincome'] = minimumincome;
							// intrestrateobject['maximumincome'] = maximumincome;
							// intrestrateobject['amount'] = interestrate_fields_whole[loopvalue];

							const amount = interestrate_fields_whole[loopvalue];
							const intrestrateobjData = {
								minimumincome: minimumincome,
								maximumincome: maximumincome,
								amount: amount
							};
							sails.log.info("intrestrateobjData: ", intrestrateobjData);
							intrestrateobj.push(intrestrateobjData);
							sails.log.info("intrestrateobject1", intrestrateobj);
						});
						sails.log.info("intrestrateobject2", intrestrateobj);
						const criteria = { id: intrestrate_id };
						sails.log.info("criteria", criteria);
						/* update section start*/
						if (loan_intrestrate_action == "update") {
							Loaninterestrate.update(criteria, { product: intrestrate_product_id, mincreditscore: minimumcreditscore, maxcreditscore: maximumcreditscore, intrestrate: intrestrateobj }).exec(function afterwards(err, interestrateupdated) {
								sails.log.info("interestrateupdated", interestrateupdated);
								const responsedata = {
									status: "Success",
									message: "Your Data Successfully Updated."
								};

								const json = {
									responsedata: responsedata
								};

								sails.log.info("json data", json);
								res.contentType("application/json");
								res.json(json);
							});
						}
						/* update section end*/
						/* create section start*/
						if (loan_intrestrate_action == "create") {
							Loaninterestrate.create({ product: intrestrate_product_id, mincreditscore: minimumcreditscore, maxcreditscore: maximumcreditscore, intrestrate: intrestrateobj }).exec(function (err, interestratecreated) {
								sails.log.info(" interestratecreated", interestratecreated);
								const responsedata = {
									status: "Success",
									message: "Your Data Successfully Created."
								};

								const json = {
									responsedata: responsedata
								};

								sails.log.info("json data", json);
								res.contentType("application/json");
								res.json(json);
							});
						}
						/* create section end*/
					});
				}
			}
		})
		.catch(function (err) {
			sails.log.error("ApplicationController#createupdateinterestrateAction#catch :: err :", err);
			return res.handleError(err);
		});
}

function getuploadeddocumentsAction(req, res) {
	const userid = req.session.userId;
	const documentname = req.param("doc_type");
	const payId = req.param("payId");

	sails.log.info("documentname: ", documentname);
	sails.log.info("userid: ", userid);
	sails.log.info("payId: ", payId);

	Achdocuments.findOne({ docname: documentname, paymentManagement: payId, status: 1 })
		.then(function (achdocument) {
			sails.log.info("achdocument: ", achdocument);

			let alredyuploaded = 0;
			if (achdocument) {
				alredyuploaded = 1;
			}
			// return alredyuploaded;
			const json = {
				responsedata: alredyuploaded
			};

			sails.log.info("json data", json);
			res.contentType("application/json");
			res.json(json);
		})
		.catch(function (err) {
			sails.log.error("HomeController#dashboardAction :: err", err);
			return res.handleError(err);
		});
}

function postNewRuleDecisionAction(req, res) {
	const transdata = req.param("transdata");

	// sails.log.info("transdata: ",transdata);

	const creditReportjson = JSON.parse(transdata);
	const creditReport = creditReportjson.creditBureau;
	// var creditReport = JSON.stringify(transdata);
	// sails.log.info("Initial screditReport: ",creditReport);

	if (creditReport) {
		var transunion_scrore = "";
		if (creditReport.product.subject.subjectRecord.addOnProduct) {
			if (creditReport.product.subject.subjectRecord.addOnProduct.scoreModel) {
				if (creditReport.product.subject.subjectRecord.addOnProduct.scoreModel.score.noScoreReason) {
					// No Hit
					var jsondata = {
						code: 500,
						message: creditReport.product.subject.subjectRecord.addOnProduct.scoreModel.score.noScoreReason
					};
					res.contentType("application/json");
					res.json(jsondata);
				} else {
					if (creditReport.product.subject.subjectRecord.addOnProduct.scoreModel) {
						var transunion_scrore = creditReport.product.subject.subjectRecord.addOnProduct.scoreModel.score.results;
					} else {
						_.forEach(creditReport.product.subject.subjectRecord.addOnProduct, function (value, key) {
							if (value.scoreModel) {
								transunion_scrore = value.scoreModel.score.results;
							}
						});
					}
				}
			} else {
				if (Array.isArray(creditReport.product.subject.subjectRecord.addOnProduct)) {
					_.forEach(creditReport.product.subject.subjectRecord.addOnProduct, function (value, key) {
						if (value.scoreModel != "" && value.scoreModel != null && "undefined" !== typeof value.scoreModel) {
							if (value.scoreModel.score.results != "" && value.scoreModel.score.results != null && "undefined" !== typeof value.scoreModel.score.results) {
								transunion_scrore = value.scoreModel.score.results;
							}
						}
					});
				}
			}
		}

		transunion_scrore = parseInt(transunion_scrore.replace("+", ""));

		sails.log.info("transunion_scrore: ", transunion_scrore);

		ApplicationService.getNewProductRule(creditReport, transunion_scrore)
			.then(function (rulesDetails) {
				sails.log.info("rulesDetails:", rulesDetails);
				sails.log.info("Loanstatus:", rulesDetails.loanstatus);

				const jsondata = {
					code: 200,
					message: rulesDetails
				};
				res.contentType("application/json");
				res.json(jsondata);
			})
			.catch(function (err) {
				var errormessage = "";
				if (err.code == 400) {
					var errormessage = "Your application has been declined, due to low credit score!";
				} else {
					var errormessage = "Could not receive your credit details";
				}
				const jsondata = {
					code: err.code,
					message: errormessage
				};
				res.contentType("application/json");
				res.json(jsondata);
			});
	} else {
		var jsondata = {
			code: 400,
			message: "Invalid Data"
		};
		res.contentType("application/json");
		res.json(jsondata);
	}
}

function viewRuleDecisionMaker(req, res) {
	return res.view("frontend/home/postrulesdecision");
}

function postRuleDecisionMaker(req, res) {
	const transdata = req.param("transdata");

	sails.log.info("transdata: ", transdata);

	const creditReportjson = JSON.parse(transdata);
	const creditReport = creditReportjson.creditBureau;
	// var creditReport = JSON.stringify(transdata);
	// sails.log.info("Initial screditReport: ",creditReport);

	if (creditReport) {
		var transunion_scrore = "";
		if (creditReport.product.subject.subjectRecord.addOnProduct) {
			if (creditReport.product.subject.subjectRecord.addOnProduct.scoreModel) {
				if (creditReport.product.subject.subjectRecord.addOnProduct.scoreModel.score.noScoreReason) {
					// No Hit
					var jsondata = {
						code: 500,
						message: creditReport.product.subject.subjectRecord.addOnProduct.scoreModel.score.noScoreReason
					};
					res.contentType("application/json");
					res.json(jsondata);
				} else {
					if (creditReport.product.subject.subjectRecord.addOnProduct.scoreModel) {
						var transunion_scrore = creditReport.product.subject.subjectRecord.addOnProduct.scoreModel.score.results;
					} else {
						_.forEach(creditReport.product.subject.subjectRecord.addOnProduct, function (value, key) {
							if (value.scoreModel) {
								transunion_scrore = value.scoreModel.score.results;
							}
						});
					}
				}
			} else {
				if (Array.isArray(creditReport.product.subject.subjectRecord.addOnProduct)) {
					_.forEach(creditReport.product.subject.subjectRecord.addOnProduct, function (value, key) {
						if (value.scoreModel != "" && value.scoreModel != null && "undefined" !== typeof value.scoreModel) {
							if (value.scoreModel.score.results != "" && value.scoreModel.score.results != null && "undefined" !== typeof value.scoreModel.score.results) {
								transunion_scrore = value.scoreModel.score.results;
							}
						}
					});
				}
			}
		}

		transunion_scrore = parseInt(transunion_scrore.replace("+", ""));

		sails.log.info("transunion_scrore: ", transunion_scrore);

		ApplicationService.getProductRule(creditReport, transunion_scrore)
			.then(function (rulesDetails) {
				sails.log.info("rulesDetails:", rulesDetails);
				sails.log.info("Loanstatus:", rulesDetails.loanstatus);

				const jsondata = {
					code: 200,
					message: rulesDetails
				};
				res.contentType("application/json");
				res.json(jsondata);
			})
			.catch(function (err) {
				var errormessage = "";
				if (err.code == 400) {
					var errormessage = "Your application has been declined, due to low credit score!";
				} else {
					var errormessage = "Could not receive your credit details";
				}
				const jsondata = {
					code: err.code,
					message: errormessage
				};
				res.contentType("application/json");
				res.json(jsondata);
			});
	} else {
		var jsondata = {
			code: 400,
			message: "Invalid Data"
		};
		res.contentType("application/json");
		res.json(jsondata);
	}
}

function servicegetuploadeddocuments(req, res) {
	const documentname = req.param("doc_type");
	const userId = req.param("userId");

	Achdocuments.findOne({ docname: documentname, user: userId, status: 1 })
		.then(function (achdocument) {
			let alredyuploaded = 0;

			if (achdocument != "" && achdocument != null && "undefined" !== typeof achdocument) {
				alredyuploaded = 1;
			}
			// return alredyuploaded;
			const json = {
				responsedata: alredyuploaded
			};

			res.contentType("application/json");
			res.json(json);
		})
		.catch(function (err) {
			sails.log.error("HomeController#dashboardAction :: err", err);
			return res.handleError(err);
		});
}

function updatetranshistorydata(req, res) {
	const transunionid = req.param("transid");
	const transhistoryid = req.param("historyid");

	const transcriteria = { id: transunionid };

	Transunions.findOne(transcriteria)
		.then(function (transunionInfo) {
			const transresponse = transunionInfo.response;
			const transuserid = transunionInfo.user;
			const updatedAt = transunionInfo.updatedAt;

			const transchistoryriteria = { id: transhistoryid };

			Transunionhistory.findOne(transchistoryriteria)
				.then(function (transunionhistoryInfo) {
					const transhistoryuserid = transunionhistoryInfo.user;
					if (transuserid == transhistoryuserid) {
						sails.log.info("updatedAt: ", updatedAt);
						// var creditBureau = '"creditBureau": {'+transresponse+'}';
						// sails.log.info("creditBureau: ",creditBureau);
						const creditBureau = { creditBureau: transresponse };
						Transunionhistory.update({ id: transhistoryid }, { responsedata: creditBureau, updatedAt: updatedAt }).exec(function afterwards(err, updated) {
							sails.log.info("updatedstatus: ", "Updated Successfullys");
							const updatehistory = "Updated Successfullys=======" + transhistoryid;
							return res.view("frontend/application/updatehistory", { updatehistory: updatehistory });
						});
					}
				})
				.catch(function (err) {
					sails.log.error("HomeController#dashboardAction :: err", err);
					return res.handleError(err);
				});
		})
		.catch(function (err) {
			sails.log.error("HomeController#dashboardAction :: err", err);
			return res.handleError(err);
		});
}

function getTransunionDetailsAction(req, res) {
	const transunionid = req.param("id");

	const transcriteria = { user: transunionid };

	sails.log.info("transcriteria: ", transcriteria);
	sails.log.info("transunionid: ", transunionid);

	Transunions.findOne(transcriteria)
		.then(function (transunionInfo) {
			if (transunionInfo.response != "" && transunionInfo.response != null && "undefined" !== typeof transunionInfo.response) {
				const transresponse = { creditBureau: transunionInfo.response };
				var jsondata = {
					code: 200,
					message: transresponse
				};
				res.contentType("application/json");
				res.json(jsondata);
			} else {
				var jsondata = {
					code: 400,
					message: "Transunion record not found"
				};
				res.contentType("application/json");
				res.json(jsondata);
			}
		})
		.catch(function (err) {
			const jsondata = {
				code: 400,
				message: "Transunion record not found"
			};
			res.contentType("application/json");
			res.json(jsondata);
		});
}

function getUserBankDetailsAction(req, res) {
	const userbankid = req.param("id");

	const bankcriteria = {
		$or: [
			{
				id: userbankid
			},
			{
				user: userbankid
			}
		]
	};
	sails.log.info("bankcriteria: ", bankcriteria);
	sails.log.info("userbankid: ", userbankid);

	UserBankAccount.findOne(bankcriteria)
		.then(function (userbankidInfo) {
			sails.log.info("userbankidInfo: ", userbankidInfo);

			if (userbankidInfo != "" && userbankidInfo != null && "undefined" !== typeof userbankidInfo) {
				var jsondata = {
					code: 200,
					message: userbankidInfo
				};
				res.contentType("application/json");
				res.json(jsondata);
			} else {
				var jsondata = {
					code: 400,
					message: "Userbank Account record not found"
				};
				res.contentType("application/json");
				res.json(jsondata);
			}
		})
		.catch(function (err) {
			const jsondata = {
				code: 400,
				message: "Transunion record not found"
			};
			res.contentType("application/json");
			res.json(jsondata);
		});
}

function getPaymentmanagementDetailsAction(req, res) {
	const userbankid = req.param("id");

	const paymentcriteria = {
		$or: [
			{
				id: userbankid
			},
			{
				user: userbankid
			}
		]
	};

	PaymentManagement.findOne(paymentcriteria)
		.then(function (paymentInfo) {
			sails.log.info("paymentInfo: ", paymentInfo);

			if (paymentInfo != "" && paymentInfo != null && "undefined" !== typeof paymentInfo) {
				var jsondata = {
					code: 200,
					message: paymentInfo
				};
				res.contentType("application/json");
				res.json(jsondata);
			} else {
				var jsondata = {
					code: 400,
					message: "Payment record not found"
				};
				res.contentType("application/json");
				res.json(jsondata);
			}
		})
		.catch(function (err) {
			const jsondata = {
				code: 400,
				message: "Payment record not found"
			};
			res.contentType("application/json");
			res.json(jsondata);
		});
}

function checkuserdocumentsAction(req, res) {
	const userbankid = req.param("id");

	const paymentcriteria = {
		$or: [
			{
				paymentManagement: userbankid
			},
			{
				user: userbankid
			}
		]
	};

	sails.log.info("paymentcriteria: ", paymentcriteria);

	UserConsent.find(paymentcriteria)
		.then(function (agreementInfo) {
			sails.log.info("agreementInfo: ", agreementInfo);

			if (agreementInfo != "" && agreementInfo != null && "undefined" !== typeof agreementInfo) {
				var jsondata = {
					code: 200,
					message: agreementInfo
				};
				res.contentType("application/json");
				res.json(jsondata);
			} else {
				var jsondata = {
					code: 400,
					message: "Agreement record not found"
				};
				res.contentType("application/json");
				res.json(jsondata);
			}
		})
		.catch(function (err) {
			const jsondata = {
				code: 400,
				message: "Agreement record not found"
			};
			res.contentType("application/json");
			res.json(jsondata);
		});
}

function couserinformationAction(req, res) {
	let successval = "";

	if (req.session.successval != "") {
		successval = req.session.successval;
		req.session.successval = "";
	}

	res.view("frontend/coborrower/couserinformation", { success: successval });
}

function couserinformationfullAction(req, res) {
	let successval = "";

	if (req.session.successval != "") {
		successval = req.session.successval;
		req.session.successval = "";
	}

	State.getExistingState().then(function (states) {
		res.view("frontend/coborrower/couserinformationfull", { states: states, success: successval });
	});
}

function cofinancialinfomationAction(req, res) {
	let successval = "";

	if (req.session.successval != "") {
		successval = req.session.successval;
		req.session.successval = "";
	}

	res.view("frontend/coborrower/cofinancialinfomation", { success: successval });
}

function sendforgotpasswordAction(req, res) {
	const email = req.param("forgotemail");
	const userCriteria = { email: email };

	User.findOne(userCriteria).then(function (userdetail) {
		sails.log.info("userdetail::::::", userdetail);
		if (userdetail != "" && userdetail != null && "undefined" !== typeof userdetail) {
			const userdetails = {
				id: userdetail.id,
				email: userdetail.email,
				name: userdetail.firstname + " " + userdetail.lastname
			};

			req.session.errormsg = "";
			req.session.successval = `We've sent an email to ${email} with password reset instructions.`;
			EmailService.sendforgotpasswordEmail(userdetails);

			var redirectpath = "/forgotpassword";
			return res.redirect(redirectpath);
		} else {
			req.session.errormsg = "Sorry, we couldn't find an account with this email address. Try again or contact us.";
			req.session.successval = "";
			var redirectpath = "/forgotpassword";
			return res.redirect(redirectpath);
		}
	});
}

function usersetpasswordAction(req, res, id) {
	let errorval = "";
	let successval = "";
	var id = req.param("id");

	if (req.session.passerror != "") {
		errorval = req.session.passerror;
		req.session.passerror = "";
	}
	if (req.session.successval != "") {
		successval = req.session.successval;
		req.session.successval = "";
	}

	User.findOne({ id: id })
		.populate("practicemanagement")
		.then(function (userinfo) {
			if (userinfo) {
				if (userinfo.practicemanagement) {
					const practiceData = userinfo.practicemanagement;
					var appPracticeId = practiceData.id;
					var appPracticeSlug = practiceData.UrlSlug;
				} else {
					var appPracticeId = "";
					var appPracticeSlug = "";
				}

				res.view("frontend/home/usersetpassword", {
					error: errorval,
					successval: successval,
					id: id,
					appPracticeId: appPracticeId,
					appPracticeSlug: appPracticeSlug
				});
			} else {
				return res.redirect("/");
			}
		})
		.catch(function (err) {
			return res.redirect("/");
		});
}

function updateuserpasswordAction(req, res) {
	const errorval = "";
	const newpassword = req.param("new_pwd");
	const confirmpass = req.param("confirm_pwd");
	const userid = req.param("userid");

	User.findOne({ id: userid })
		.then(function (updatedUser) {
			updatedUser.password = newpassword;
			const salt = PracticeUser.generateSalt();

			User.generateEncryptedPassword(updatedUser, salt).then(function (encryptedPassword) {
				updatedUser.password = encryptedPassword;
				updatedUser.passwordstatus = 1;
				updatedUser.salt = salt;

				const useridemail = updatedUser.id;

				if (userid == useridemail) {
					updatedUser.save(function (err) {
						if (err) {
							const json = {
								status: 500,
								message: "Unable to update Password!"
							};
							req.session.passerror = "";
							req.session.passerror = "Unable to update Password!!";
							return res.redirect("/usersetpassword/" + userid);
						}

						if (req.session.isLead) {
							return res.redirect("/offers");
						}

						req.session.successval = "";
						req.session.successval = "Password changed successfully!";
						return res.redirect("/usersetpassword/" + updatedUser.id);
					});
				} else {
					req.session.passerror = "";
					req.session.passerror = "Invalid Email Address";
					return res.redirect("/usersetpassword/" + userid);
				}
			});
		})
		.catch(function (err) {
			sails.log.error("ApplicatioController#updateuserpasswordAction :: err", err);
			return res.handleError(err);
		});
}

function savechangepasswordAction(req, res) {
	const errorval = "";
	const currentpassword = req.param("currentPassword");
	const newpassword = req.param("newPassword");
	const confirmpass = req.param("confirmPassword");
	const userid = req.session.userId;

	User.findOne({ id: userid })
		.then(function (updatedUser) {
			return bcrypt
				.compare(currentpassword, updatedUser.password, function (err, userres) {
					if (userres) {
						updatedUser.password = newpassword;
						const salt = User.generateSalt();

						User.generateEncryptedPassword(updatedUser, salt).then(function (encryptedPassword) {
							updatedUser.password = encryptedPassword;
							updatedUser.passwordstatus = 1;
							updatedUser.salt = salt;

							const useridemail = updatedUser.id;

							if (userid == useridemail) {
								updatedUser.save(function (err) {
									if (err) {
										const json = {
											status: 500,
											message: "Unable to update Password!"
										};
										req.session.errorval = "";
										req.session.errorval = "Unable to update Password!!";
										return res.redirect("/editprofile");
									}

									req.session.successval = "";
									req.session.successval = "Password changed successfully!";
									return res.redirect("/editprofile");
								});
							} else {
								req.session.errorval = "";
								req.session.errorval = "Invalid User";
								return res.redirect("/editprofile");
							}
						});
					} else {
						req.session.errorval = "";
						req.session.errorval = "Your current password don't match!";
						return res.redirect("/editprofile");
					}
				})
				.catch(function (err) {
					sails.log.error("ApplicatioController#updateuserpasswordAction :: err", err);
					return res.handleError(err);
				});
		})
		.catch(function (err) {
			sails.log.error("ApplicatioController#updateuserpasswordAction :: err", err);
			return res.handleError(err);
		});
}

function receivenotifiAction(req, res) {
	sails.log.info("allParams+++++", req.allParams());

	const notifiemail = req.param("notifiemail");
	const notifimobile = req.param("notifimobile");

	const userid = req.session.userId;
	User.findOne({ id: userid })
		.then(function (updatedUser) {
			const useridemail = updatedUser.id;

			/* updatedUser.password = encryptedPassword;
			updatedUser.passwordstatus = 1;*/

			if (userid == useridemail) {
				User.update({ id: userid }, { notifiemail: notifiemail, notifimobile: notifimobile }).exec(function afterwards(err, notifidata) {
					if (err) {
						req.session.errorval = "";
						req.session.errorval = "Unable to update notification details!";
						return res.redirect("/editprofile");
					}
					req.session.successval = "";
					req.session.successval = "Notification details changed successfully!";
					return res.redirect("/editprofile");
				});
			} else {
				req.session.errorval = "";
				req.session.errorval = "Invalid User";
				return res.redirect("/editprofile");
			}
		})
		.catch(function (err) {
			sails.log.error("ApplicatioController#receivenotifiAction :: err", err);
			return res.handleError(err);
		});
}

function uploadAvatarAction(req, res) {
	const localPath = sails.config.appPath + "/assets/uploads/userprofile/";
	const path = require("path");
	const userid = req.session.userId;

	req.file("userprofile").upload({ dirname: localPath }, function (err, uploadedFiles) {
		sails.log.info("uploadedFileslength", uploadedFiles.length);
		if (err) {
			sails.log.error("@userprofile ::  Uploading Error :: ", err);
		} else {
			if (uploadedFiles.length > 0) {
				if (_.has(uploadedFiles[0], "fd")) {
					const localPath = uploadedFiles[0].fd;
					sails.log.info("localPath****", localPath);
					const criteria = { id: userid };
					User.findOne(criteria)
						.then(function (userDetails) {
							const userReference = userDetails.userReference;
							Asset.createUserProfile(localPath, userReference, Asset.ASSET_TYPE_PROFILE_PICTURE, userid)
								.then(function (asset) {
									sails.log.info("assetasset******", asset);
									return res.redirect("/editprofile");

									/* var json = {
									status: 200,
									message:"Documents Uploaded successfully"
								 };
									sails.log.info("json data", json);*/
								})
								.catch(function (err) {
									sails.log.error("ApplicationController#createAchDocuments :: err :", err);
									return res.handleError(err);
								});
						})
						.catch(function (err) {
							sails.log.error("ApplicationController#createAchDocuments :: err :", err);
							return res.handleError(err);
						});
				}
			}
		}
	});
}

async function leadUserNewPassword(req, res) {
	const userId = req.session.userId;
	const userData = await User.findOne({ id: userId });
	if (!userData.password) {
		req.session.isLead = true;
		res.view('frontend/homev3/leadUserNewPassword.nunjucks', {
			id: userId
		});
	} else {
		return res.redirect('/login');
	}
}

async function contract(req, res) {
	var userid = req.session.userId;
	sails.log.info("ApplicationController.promissorynoteAction userid:", userid);
	const screenId = req.session.screenTrackingId;
	if (!screenId) {
		const errorMessage = `Unable to show contract, missing the contract id`;
		sails.log.error("ApplicationController#contract error: ", errorMessage)
		return res.view("admin/error/400", { data: errorMessage });
	}
	const screentracking = await Screentracking.findOne({ id: screenId }).populate("esignature").populate("user");
	const offerData = screentracking.offerdata[0];
	const latestEmployment = await EmploymentHistory.getLatestEmploymentHistoryForUser(screentracking.user.id);
	const accounts = await Account.find({ user: screentracking.user.id }).sort("createdAt DESC"); // NOT BEING CREATED
	const bankdata = accounts && accounts.length > 0 ? accounts[0] : {};


	let nextStartDate = moment().startOf("day").add(1, "day");
	if (!!screentracking.incompleteFundingPaymentType && screentracking.incompleteFundingPaymentType !== Payment.paymentTypeForFundingEnum.ACH) {

		if (moment().isBefore(moment().hour(sails.config.paymentService.achCutOffHour || 21))) {
			nextStartDate = moment().startOf("day");
		}
	}

	const today = SmoothPaymentService.getBusinessDateBasedOnBankDays(nextStartDate.toDate(), true);

	const scheduledStartDate = SmoothPaymentService.determineFirstPaymentScheduleFromEmploymentPayDates(latestEmployment, today, screentracking.paymentFrequency);

	const paySchedule = await ApplicationService.getContractPaymentSchedule(screentracking, scheduledStartDate, screentracking.offerdata);

	req.session["projectedPaymentSchedule"] = paySchedule.paymentSchedule;
	req.session["projectedFirstPaymentDate"] = scheduledStartDate;
	req.session["projectedOriginDate"] = today;

	await Screentracking.update({ id: screentracking.id }, { projectedPaymentSchedule: paySchedule.paymentSchedule, projectedFirstPaymentDate: scheduledStartDate, projectedOriginDate: today })

	screentracking["totalPaymentsFeeChargedAmount"] = paySchedule.total_fee_charge
	screentracking["interestapplied"] = offerData.interestRate;

	latestEmployment.payFrequency = screentracking.paymentFrequency;
	bankdata["accountType"] = screentracking.paymentmethod;
	// calculate the total payment
	let totalPaymentAmount = 0
	for (let payment of paySchedule.paymentSchedule) {
		totalPaymentAmount += payment.amount
	}
	const ip = (req.headers["x-forwarded-for"] || req.headers["x-real-ip"] || req.connection.remoteAddress).replace("::ffff:", "").replace(/^::1$/, "127.0.0.1");
	return res.view("contractPage.nunjucks", {
		user: screentracking.user,
		employment: latestEmployment,
		bank: bankdata,
		loan: screentracking,
		paymentFrequencyDisplay: PaymentManagement.convertedPeriodicityToText[screentracking.paymentFrequency || PaymentManagement.decisionCloudPeriodicity.BI_WEEKLY],
		paymentSchedule: paySchedule.paymentSchedule,
		monthlyPayment: paySchedule.paymentAmount,
		loanSetdate: today,
		totalPaymentAmount: totalPaymentAmount,
		iroutp: ip
	});
}

async function redirecttodashboard(req, res) {
	const screenId = req.param("screenId");
	if (!screenId) {
		const errorMessage = "Unable to save this contract. The required contract data is missing."
		sails.log.error("ApplicationController.contractSigned Err:", errorMessage);
		return res.status(400).status({ message: errorMessage });
	}
	sails.log.info("ApplicationController.contractSigned screenId:", screenId);

	let screenTracking = await Screentracking.findOne({ id: screenId }).populate("user");
	if (!screenTracking) {
		const errorMessage = "Unable to save this contract. The contract was not found."
		sails.log.error("ApplicationController.contractSigned Err:", errorMessage);
		return res.status(404).status({ message: errorMessage });
	}
	screenTracking.eSignatureDate = moment().startOf("day").toDate();
	try {
		const paymentManagement = await createPaymentManagement(screenTracking, req)
		await Screentracking.update(
			{ id: screenId },
			{ lastlevel: 5, eSignatureDate: screenTracking.eSignatureDate, paymentmanagement: paymentManagement.id })
		const eSignatures = [{
			eSignatureDate: screenTracking.eSignatureDate,
			eSignatureText: '',
			ipAddress: '0.0.0.0'
		}];
		let ssn;
		const agreementCheckboxes = {}
		const loanId = screenTracking.applicationReference

		await FoxHillsIntegrationService.saveDocumentSignature(loanId, ssn, eSignatures, agreementCheckboxes, req, res);
		return res.json({ success: true, redirectUrl: "/dashboard" })

	} catch (exc) {
		sails.log.error("ApplicationController.contractSigned Err:", exc);
		return res.status(500).status(exc);
	}
}

async function signAchDebit(req, res) {
	const ip = (req.headers["x-forwarded-for"] || req.headers["x-real-ip"] || req.connection.remoteAddress).replace("::ffff:", "").replace(/^::1$/, "127.0.0.1");
	const screenId = req.param('screenId');
	if (!screenId) {
		const errorMessage = "Unable to save this contract. The required contract data is missing."
		sails.log.error("ApplicationController.contractSigned Err:", errorMessage);
		return res.status(400).status({ message: errorMessage });
	}
	const screenTracking = await Screentracking.findOne({ id: screenId }).populate("user");

	const agreement = await Agreement.findOne({ documentKey: "220" });
	const userConsent = await UserConsent.createConsent(agreement, screenTracking.user, ip, screenTracking.id, screenTracking.paymentmanagement);
	const results = await UserConsent.createAchAuthorizationPdf(userConsent, screenTracking, screenTracking.user, ip, req, res)

	screenTracking.signACHAuthorization = false;
	screenTracking.signChangeScheduleAuthorization = false;

	await screenTracking.save();

	return res.send({ status: 200 })
}

async function contractSigned(req, res) {
	const screenId = req.param("screenId");
	const user = req.param("user");
	if (!screenId) {
		const errorMessage = "Unable to save this contract. The required contract data is missing."
		sails.log.error("ApplicationController.contractSigned Err:", errorMessage);
		return res.status(400).status({ message: errorMessage });
	}
	sails.log.info("ApplicationController.contractSigned screenId:", screenId);
	try {
		let screenTracking = await Screentracking.findOne({ id: screenId }).populate("user");
		if (!screenTracking) {
			const errorMessage = "Unable to save this contract. The contract was not found."
			sails.log.error("ApplicationController.contractSigned Err:", errorMessage);
			return res.status(404).status({ message: errorMessage });
		}
		screenTracking.eSignatureDate = moment().startOf("day").toDate();
		let paymentManagement = await PaymentManagement.findOne({ screentracking: screenTracking.id });
		const existingPaymentManagement = !!paymentManagement;
		if (!existingPaymentManagement) {
			paymentManagement = await createPaymentManagement(screenTracking, req);
		}


		await Screentracking.update(
			{ id: screenId },
			{ lastlevel: 5, eSignatureDate: screenTracking.eSignatureDate, paymentmanagement: paymentManagement.id, reApplyAuthorizationSignatureNeeded: false })
		const eSignatures = [{
			eSignatureDate: screenTracking.eSignatureDate,
			eSignatureText: '',
			ipAddress: '0.0.0.0'
		}];

		if (!existingPaymentManagement) {
			let ssn;
			const agreementCheckboxes = {}
			const loanId = screenTracking.applicationReference

			await FoxHillsIntegrationService.saveDocumentSignature(loanId, ssn, eSignatures, agreementCheckboxes, req, res);
		}
		return res.json({ success: true, redirectUrl: "/thankyou" })

	} catch (exc) {
		sails.log.error("ApplicationController.contractSigned Err:", exc);
		return res.status(500).status(exc);
	}
}
async function resignChangeScheduleContract(req, res) {
	const screenId = req.param("screenId");
	if (!screenId) {
		const errorMessage = "Unable to save this contract. The required contract data is missing."
		sails.log.error("ApplicationController.resignChangeScheduleContract Err:", errorMessage);
		return res.status(400).status({ message: errorMessage });
	}
	sails.log.info("ApplicationController.resignChangeScheduleContract screenId:", screenId);
	try {
		let screenTracking = await Screentracking.findOne({ id: screenId }).populate("user");
		if (!screenTracking) {
			const errorMessage = "Unable to save this contract. The contract was not found."
			sails.log.error("ApplicationController.resignChangeScheduleContract Err:", errorMessage);
			return res.status(404).status({ message: errorMessage });
		}
		const paymentManagement = await PaymentManagement.findOne({ screentracking: screenTracking.id }).populate("screentracking");
		if (!paymentManagement) {
			const errorMessage = "Unable to save this contract. The loan was not found."
			sails.log.error("ApplicationController.resignChangeScheduleContract Err:", errorMessage);
			return res.status(404).status({ message: errorMessage });
		}
		const ledger = PlatformSpecificService.getPaymentLedger(paymentManagement, moment().startOf("day").toDate());
		//useThisScheduleObj
		screenTracking.eSignatureDate = moment().startOf("day").toDate();

		// const paymentManagement =	await createPaymentManagement(screenTracking,req)

		const eSignatures = [{
			eSignatureDate: screenTracking.eSignatureDate,
			eSignatureText: '',
			ipAddress: '0.0.0.0'
		}];
		let ssn;
		const agreementCheckboxes = {}
		const loanId = screenTracking.applicationReference
		const parsedPaymentSchedule = AchService.scrapePaymentsScheduleActionEligibility(paymentManagement.paymentSchedule, ledger);
		// totalPaymentsPaidAmount: paySchedule.total_paid_amount,
		// totalPaymentAmount: paySchedule.total_finance_pay,
		await FoxHillsIntegrationService.saveDocumentSignature(loanId, ssn, eSignatures, agreementCheckboxes, req, res,
			{ paymentSchedule: parsedPaymentSchedule, paymentAmount: ledger.regularFirstFuturePayment || ledger.regularPayment, loanSetdate: paymentManagement.loanSetdate, total_paid_amount: ledger.totalPaidAmount, total_finance_pay: ledger.totalLeftToPay });
		await Screentracking.update(
			{ id: screenId },
			{ eSignatureDate: screenTracking.eSignatureDate, signChangeScheduleAuthorization: false });
		return res.json({ success: true, redirectUrl: "/dashboard" })

	} catch (exc) {
		sails.log.error("ApplicationController.resignChangeScheduleContract Err:", exc);
		return res.status(500).status(exc);
	}
}

async function denyLoan(req, res) {
	try {
		var userId = req.session.userId;
		req.session.deniedstatus = 1;
		const user = await User.findOne({ id: userId });
		let screenTracking = await Screentracking.update({ user: userId }, { iscompleted: 2, denialReason: req.session.applicationerror });
		if (Array.isArray(screenTracking)) {
			screenTracking = screenTracking[0];
		}
		await PaymentManagement.create({
			user: userId,
			achstatus: 2,
			status: 'DENIED',
			scheduleIdSequenceCounter: 1,
			screentracking: screenTracking.id
		});
		const accounts = await Account.find({ user: userId }).sort("createdAt DESC");
		const financialInfo = accounts[0];
		EmailService.sendDenyLoanMail(user, financialInfo);
		res.view("emailTemplates/denyTest.nunjucks", { user: user, screentracking: screenTracking }); // is apl# getting passed?
	} catch (error) {
		sails.log.error("ApplicationController#denyLoan :: err:", error);
	}
}

function displayErrorPage(req, res) {
	res.view('frontend/FailVerifications.nunjucks', {});
}

async function getEmploymentAndReference(req, res) {
	sails.log.info('Calling getEmploymentAndReference()... ');
	res.view("frontend/application/employmentAndReference");
}

async function applicationWaterfall(req, res) {
	try {
		const userId = req.session.userId;
		const user = await User.findOne({ id: userId });
		const screenTracking = await Screentracking.findOne({ user: userId });

		const underwritingResult = await UnderwritingService.underwritingWaterfall(user, screenTracking);

		if (underwritingResult.error) {
			return res.view("admin/error/500", {
				data: 'Sorry, there is an error with our server. Please try again or contact our staff.',
				layout: 'layout'
			});
		} else if (!underwritingResult.passed) {
			await Screentracking.update({ id: screenTracking.id }, { isDenied: true, deniedReason: underwritingResult.reason })
			return res.redirect("/loanDenied");
		} // At this point, there is no error and they have not failed, so they have passed

		EmailService.senduserRegisterEmail(user);
		await Screentracking.update({ id: screenTracking.id }, { lastlevel: 2 });
		return res.redirect("/employmentandreferenceinfo");
	} catch (error) {
		sails.log.error("ApplicationController#applicationWaterfall :: err:", error);
		req.session["applicationerror"] = "An error occurred while trying to approve this application.";
		return res.redirect("/apply");
	}
}

/**
 * POST application/offers
 * @param {Request} req
 * @param {Reponse} res
 * @return {undefined}
 */
function postOffers(req, res) {
	return Promise.resolve()
		.then(async () => {
			const reqParams = req.allParams();
			sails.log.verbose("postOffers; reqParams:", reqParams);
			const screenId = _.get(reqParams, "screenId", null);
			const offerid = _.get(reqParams, "offerid", null);
			const user = {};
			const screentracking = {};
			await Screentracking.findOne({ id: screenId, isCompleted: false }).populate("user")
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
			await Screentracking.update({ id: screentracking.id }, { offerdata: [selectedOffer], lastlevel: 4, lastpage: "contract" }).then((updated) => _.assign(screentracking, updated[0]));

			var userId = req.session.userId;
			let redirectURL = "/contract";
			if (!user.password) {
				redirectURL = "/leadUserNewPassword";
			}
			return res.json({ code: 200, redirect: redirectURL });
		})
		.catch((err) => {
			sails.log.error("postOffers; catch:", err);
			return res.json({ code: 500, message: "Unable to process request" });
		});
}
async function createPaymentManagement(screentracking, req) {
	const projectedPaymentSchedule = screentracking.projectedPaymentSchedule || req.session.projectedPaymentSchedule;
	const scheduleDate = screentracking.projectedFirstPaymentDate || req.session.projectedFirstPaymentDate;
	const originDate = screentracking.projectedOriginDate || req.session.projectedOriginDate;
	// req.session["projectedPaymentSchedule"] = paySchedule.paymentSchedule;
	// req.session["projectedLoanSetDate"] = scheduledStartDate;
	// req.session["projectedOriginDate"] = today;
	let newPaymentmanagement = await PaymentManagement.createPaymentManagement(
		screentracking,
		projectedPaymentSchedule,
		scheduleDate,
		originDate
	);
	if (newPaymentmanagement && newPaymentmanagement.pay && newPaymentmanagement.paymentSchedule.length > 0) {
		delete req.session.projectedPaymentSchedule;
		delete req.session.projectedFirstPaymentDate;
		delete req.session.projectedOriginDate;
		await Screentracking.update({ id: screentracking.id }, { projectedPaymentSchedule: null, projectedFirstPaymentDate: null, projectedOriginDate: null })
	}
	return newPaymentmanagement;
}

//re-apply
async function reApplyApplication(req, res) {

	let errorMessage = ""
	const userId = req.param("userId");

	if (!userId) {
		errorMessage = "You are missing the user id for re-applying."
		sails.log.error("ApplicationController#reApplyApplication Error: ", errorMessage)
		return res.view("admin/error/400", { data: errorMessage })
	}
	const user = await User.findOne({ id: userId });
	if (!user) {
		errorMessage = `The user with id '${userId}' was not found. Unable to re-apply`
		sails.log.error("ApplicationController#reApplyApplication Error: ", errorMessage)
		return res.view("admin/error/404", { data: errorMessage })
	}
	const recentLoan = await PaymentManagement.getMostRecentReApplyLoanForUser(user);
	if (!recentLoan.screentracking && !recentLoan.paymentManagement) {
		return res.view("admin/pendingach/partials/reApplyNotEligible", {});
	}
	const states = await State.getExistingState();
	let screentracking = recentLoan.screentracking;
	if (screentracking && screentracking.isInReApplyWorkflow && screentracking.reApplyWorkflowStep === "offers") {
		return res.redirect(`/admin/re-apply/offers/${screentracking.id}`)
	}
	if (!screentracking && recentLoan.paymentManagement && recentLoan.paymentManagement.screentracking) {
		screentracking = recentLoan.paymentManagement.screentracking;
	}
	let account = {};
	if (recentLoan.paymentManagement && !!recentLoan.paymentManagement.account) {
		const existingAccount = await Account.findOne({ id: recentLoan.paymentManagement.account }).populate("userBankAccount");
		if (existingAccount) {
			account = existingAccount;
		}
	} else {
		const existingAccounts = await Account.find({ user: user.id, type: "ACH" }).populate("userBankAccount").sort({ createdAt: -1 }).limit(1);
		if (existingAccounts && existingAccounts.length > 0) {
			account = existingAccounts[0];
		}

	}
	let employmentHistory = await EmploymentHistory.find({ user: user.id }).sort({ 'createdAt': -1 }).limit(1)
	if (employmentHistory && employmentHistory.length > 0) {
		employmentHistory = employmentHistory[0];
	} else {
		employmentHistory = {};
	}

	return res.view("admin/pendingach/reApplyApplication", { states: states, paymentManagement: recentLoan.paymentManagement, screentracking: screentracking, user: user, account: account, employment: employmentHistory });
}
async function ajaxPostReApplyApplication(req, res) {
	try {
		const parsedBody = parseReApplyBody(req);
		const updatedUser = await ApplicationService.updateUserWithRevision(parsedBody.user, parsedBody.userId);
		const updatedEmployment = await ApplicationService.updateReApplyEmployment(parsedBody.employmentInfo, updatedUser);
		const accountUpdate = await ApplicationService.updateReapplyBankAccount(parsedBody.userBankAccount, parsedBody.account, updatedUser, parsedBody.paymentmanagement);

		if (updatedUser) {
			const screenTrackingUpdate = await createReApplyScreentracking(updatedUser, parsedBody.screentracking);
			if (screenTrackingUpdate) {
				const underwritingResult = await UnderwritingService.underwritingWaterfall(updatedUser, screenTrackingUpdate);
				if (underwritingResult.error) {
					sails.log.error("ApplicationController#ajaxPostReApplyApplication :: Underwriting err:", underwritingResult.error);
					return res.status(500).json({ message: "'Sorry, there is an error trying to submit this re-apply application. Please try again or contact our staff." })
				} else if (!underwritingResult.passed) {
					const deniedUpdate = {
						isDenied: true,
						deniedReason: underwritingResult.reason,
						iscompleted: 1
					};
					_.assign(screenTrackingUpdate, deniedUpdate);
					await Screentracking.update({ id: screenTrackingUpdate.id }, deniedUpdate);
					await createDeniedPaymentManagement(updatedUser, screenTrackingUpdate);
					return res.status(500).json({ message: `The re-apply application was denied by underwriting for the falling reason: ${underwritingResult.reason}` })
				} else {
					const offersArray = OffersService.generateOffersArray(screenTrackingUpdate.requestedLoanAmount, screenTrackingUpdate.paymentFrequency);
					const screenUpdateObj = { offers: null, reApplyWorkflowStep: "offers" };
					if (offersArray && offersArray.length > 0) {
						screenUpdateObj.offers = offersArray;
						screenTrackingUpdate.offers = offersArray;
					}
					await Screentracking.update({ id: screenTrackingUpdate.id }, screenUpdateObj);
					return res.json({ success: true, redirectUrl: `/admin/re-apply/offers/${screenTrackingUpdate.id}` });
				}
			}
		}
		const error = "Unable to complete re-apply application. An unknown error occurred.";
		sails.log.error("ApplicationController#ajaxPostReApplyApplication: Error ", error);
		return res.status(500).json({ message: error });
	} catch (exc) {
		sails.log.error("ApplicationController#ajaxPostReApplyApplication: Error ", exc);
		return res.status(500).json({ message: exc.message });
	}
}
async function createDeniedPaymentManagement(user, screentracking) {
	const loanReferenceData = await User.getNextSequenceValue("loan");
	const loanReference = "LN_" + loanReferenceData.sequence_value;
	const obj = {
		user: user.id,
		maturityDate: null,
		payOffAmount: screentracking.requestedLoanAmount,
		account: null,
		financeAmount: screentracking.requestedLoanAmount,
		achstatus: 2,
		status: "DENIED",
		loanSetdate: null,
		loanReference: loanReference,
		estimatedAPR: null,
		interestapplied: null,
		loantermcount: null,
		paymentSchedule: null,
		nextPaymentSchedule: null,
		screentracking: screentracking.id,
		consolidateaccount: screentracking.consolidateaccount,
		practicemanagement: screentracking.practicemanagement,
		oldprincipalstatus: 0,
		finalpayoffAmount: null,
		initialPaymentSchedule: null,
		deniedReason: screentracking.deniedReason,
		scheduleIdSequenceCounter: 0
	};
	if (screentracking.isReApply) {
		obj["isReApplyDenied"] = true;
	}
	const paymentUpdate = await PaymentManagement.create(obj);
	await ApplicationService.logLoanActivity(user, paymentUpdate.id, "Loan Denied", `This contract was denied for the following reasons: ${screentracking.deniedReason}`);
	return paymentUpdate
}
async function createReApplyScreentracking(user, screenTrackingUpdate) {
	if (user && !!user.id && screenTrackingUpdate) {
		const existingScreenTracking = await ApplicationService.getLatestEligibleReapplyApplicationForUser(user.id);

		if (existingScreenTracking && existingScreenTracking.iscompleted === false) {
			if (existingScreenTracking.isInReApplyWorkflow) {
				return existingScreenTracking;
			} else {
				const screenUpdate = await Screentracking.update({ id: existingScreenTracking.id }, _.assign({}, { isReApply: true, lastlevel: 2, lastScreenName: "Application", isInReApplyWorkflow: true, reApplyWorkflowStep: "application" }, screenTrackingUpdate));
				if (screenUpdate && screenUpdate.length > 0) {
					return screenUpdate[0];
				}
			}
		}

		const applicationReferenceData = await User.getNextSequenceValue("application");
		const screentrackingDocInitial = _.assign({}, {
			user: user.id,
			applicationReference: `APL_${applicationReferenceData.sequence_value}`,
			lastlevel: 2,
			lastScreenName: "Application",
			practicemanagement: user.practicemanagement,
			iscompleted: false,
			incomeamount: 0,
			requestedLoanAmount: 0,
			origin: "APPLICATION",
			isReApply: true,
			isInReApplyWorkflow: true,
			reApplyWorkflowStep: "application"
		}, screenTrackingUpdate);

		const screentrackingDoc = Object.assign(screentrackingDocInitial, screenTrackingUpdate);
		const practiceManagement = await PracticeManagement.find({});
		screentrackingDoc.practicemanagement = practiceManagement[0].id;	// Static collection, only 1 entry
		sails.log.info("screentrackingDoc", screentrackingDoc);
		return await Screentracking.create(screentrackingDoc);
	}
	throw new Error("Unable to create a re-apply application. Missing application or user data");
}


function parseReApplyBody(req) {
	const reqBody = req.body;
	const userId = `${_.get(reqBody, "userId", "")}`.trim();
	const accountId = `${_.get(reqBody, "reApplyAccountId", "")}`.trim();
	const userBankAccountId = `${_.get(reqBody, "reApplyUserBankAccountId", "")}`.trim();

	const userInfo = {
		// default to null for leads that has not been assigned to a branch
		firstname: `${_.get(reqBody, "firstname", "")}`.trim(),
		middlename: `${_.get(reqBody, "middlename", "")}`.trim(),
		lastname: `${_.get(reqBody, "lastname", "")}`.trim(),
		// isPhoneVerified: req.session.deferUser.isPhoneVerified,
		email: `${_.get(reqBody, "email", "")}`.trim(),
		phoneNumber: `${_.get(reqBody, "phoneNumber", "")}`.trim().replace(/[^0-9]/g, ""),
		street: `${_.get(reqBody, "street", "")}`.trim(),
		unitapt: `${_.get(reqBody, "unitapt", "")}`.trim(),
		city: `${_.get(reqBody, "city", "")}`.trim(),
		state: `${_.get(reqBody, "state", "")}`.substr(0, 2),
		zipCode: `${_.get(reqBody, "zipCode", "")}`.substr(0, 5),
		ssn_number: `${_.get(reqBody, "ssn_number", "")}`.replace(/[^0-9]/g, "").substr(0, 9),
		dateofBirth: moment(_.get(reqBody, "dateofBirth", ""), "MM/DD/YYYY").format("YYYY-MM-DD"),
		stateIdNumber: `${_.get(reqBody, "stateIdNumber", "")}`.trim(),
		idState: `${_.get(reqBody, "idState", "")}`.substr(0, 2),
		consentChecked: (_.get(reqBody, "creditpullconfirm", "").trim() === "on"),
	};

	const employmentInfo = {
		typeOfIncome: `${_.get(reqBody, "typeOfIncome", "")}`,
		employerName: `${_.get(reqBody, "employerName", "")}`,
		employerPhone: `${_.get(reqBody, "employerPhone", "")}`,
		employerStatus: `${_.get(reqBody, "employerStatus", "")}`,
		lastPayDate: `${_.get(reqBody, "lastPayDate", "")}`,
		nextPayDate: `${_.get(reqBody, "nextPayDate", "")}`,
		secondPayDate: `${_.get(reqBody, "secondPayDate", "")}`,
		payFrequency: `${_.get(reqBody, "payFrequency", "")}`,
		isAfterHoliday: `${_.get(reqBody, "paymentBeforeAfterHolidayWeekend", "")}` //paymentBeforeAfterHolidayWeekend
	};
	employmentInfo.isAfterHoliday = employmentInfo.isAfterHoliday === "1" ? EmploymentHistory.decisionCloudIsAfterHoliday.AFTER_HOLIDAY : EmploymentHistory.decisionCloudIsAfterHoliday.BEFORE_HOLIDAY;
	if (!!employmentInfo.lastPayDate) {
		employmentInfo.lastPayDate = moment(employmentInfo.lastPayDate, "YYYY-MM-DD").toDate();
	}
	if (!!employmentInfo.nextPayDate) {
		employmentInfo.nextPayDate = moment(employmentInfo.nextPayDate, "YYYY-MM-DD").toDate();
	}
	if (!!employmentInfo.secondPayDate) {
		employmentInfo.secondPayDate = moment(employmentInfo.secondPayDate, "YYYY-MM-DD").toDate();
	}
	const financialInfo = {
		bank: `${_.get(reqBody, "accountName", "")}`,
		routingNumber: `${_.get(reqBody, "routingNumber", "")}`,
		accountNumber: `${_.get(reqBody, "accountNumber", "")}`,
		requestedLoanAmount: $ize(_.get(reqBody, "requestedLoanAmount", 0)),
		monthlyIncome: _.get(reqBody, "monthlyIncome", ""),
		paymentmethod: _.get(reqBody, "paymentmethod", ""),
		paymentFrequency: employmentInfo.payFrequency || _.get(reqBody, "paymentFrequency", "") || SmoothPaymentService.paymentFrequencyEnum.BI_WEEKLY,
		isAfterHoliday: employmentInfo.isAfterHoliday
	};

	const account = {
		accountName: financialInfo.bank,
		routingNumber: financialInfo.routingNumber,
		accountNumber: financialInfo.accountNumber,
		accountNumberLastFour: financialInfo.accountNumber.substring(financialInfo.accountNumber.length - 4),
		accountType: (financialInfo.paymentmethod === "Direct Deposit") ? 'depository' : "",
		incomeamount: financialInfo.monthlyIncome
	};

	const accountsData = [];
	const balanceData = {
		available: 0,
		current: 0,
		limit: ''
	};
	const metaData = {
		limit: null,
		name: "Checking",
		number: account.accountNumberLastFour,
		official_name: ''
	};
	const filteredAccountsDetailsJson = {
		account: account.accountNumber,
		account_id: '',
		routing: account.routingNumber,
		wire_routing: account.routingNumber
	};
	const objdata = {
		balance: balanceData,
		institution_type: account.accountType,
		meta: metaData,
		numbers: filteredAccountsDetailsJson,
		subtype: 'checking',
		type: 'depository'
	}
	accountsData.push(objdata);
	const transactionGenerated = {};
	const userBankData = {
		accounts: accountsData,
		accessToken: '',
		institutionName: account.accountName,
		institutionType: account.accountType,
		transactions: transactionGenerated,
		item_id: '',
		access_token: '',
		transavail: 0,
		bankfilloutmanually: 1
	}

	let paymentUpdateInfo = null;
	if (!!accountId && !!userBankAccountId) {
		paymentUpdateInfo = { accountId: accountId, userBankAccountId: userBankAccountId };
	}

	return { userId: userId, userBankAccount: userBankData, account: account, user: userInfo, employmentInfo: employmentInfo, screentracking: financialInfo, paymentmanagement: paymentUpdateInfo };
}

async function reApplyOffers(req, res) {
	try {
		const screenId = req.param("screenId");
		let errorMessage = "";
		if (!screenId) {
			errorMessage = "You are missing the application id for getting re-apply offers."
			sails.log.error("ApplicationController#reApplyOffers Error: ", errorMessage)
			return res.view("admin/error/400", { data: errorMessage })
		}

		const screentracking = await Screentracking.findOne({ id: screenId }).populate("user");
		if (!screentracking) {
			errorMessage = `The application with id '${screenId}' was not found.`
			sails.log.error("ApplicationController#reApplyOffers Error: ", errorMessage)
			return res.view("admin/error/404", { data: errorMessage })
		}
		if (!screentracking.isInReApplyWorkflow || screentracking.reApplyWorkflowStep !== "offers") {
			return res.redirect(`/admin/re-apply/application/${screentracking.user.id}`);
		}

		if (!screentracking.offers || screentracking.offers.length === 0) {
			const offersArray = OffersService.generateOffersArray(screentracking.requestedLoanAmount, screentracking.paymentFrequency);
			if (offersArray && offersArray.length > 0) {
				screentracking.offers = offersArray;
				await Screentracking.update({ id: screentracking.id }, { offers: offersArray });
			}
		}

		return res.view("admin/pendingach/reApplyOffers", { screentracking: screentracking, user: screentracking.user });

	} catch (exc) {
		sails.log.error("ApplicationController#reApplyOffers: Error ", exc);
		return res.status(500).json({ message: exc.message });
	}
}

async function ajaxReApplyOfferSubmission(req, res) {
	try {
		let errorMessage = "";
		const reqParams = req.allParams();
		sails.log.verbose("ajaxReApplyOfferSubmission; reqParams:", reqParams);
		const screenId = _.get(reqParams, "screenId", null);
		const offerid = _.get(reqParams, "offerid", null);

		if (!screenId || !offerid) {
			errorMessage = "Unable to submit re-apply offers. Missing required parameters."
			sails.log.error("ApplicationController#ajaxReApplyOfferSubmission Error: ", errorMessage)
			return res.status(400).json({ message: errorMessage })
		}
		const user = {};
		const screentracking = await Screentracking.findOne({ id: screenId }).populate("user");

		const offers = _.get(screentracking, "offers", []);
		if (!offers || offers.length === 0) {
			errorMessage = `Unable to submit re-apply offers. Offers not found by screentracking: ${screenId}`
			sails.log.error("ApplicationController#ajaxReApplyOfferSubmission Error: ", errorMessage)
			return res.status(500).json({ message: errorMessage })
		}
		let selectedOffer = offers[0];
		_.some(offers, (offer) => {
			if (String(offer.id) === offerid) {
				selectedOffer = offer;
				return true;
			}
		});
		await Screentracking.update({ id: screentracking.id }, { offerdata: [selectedOffer], lastlevel: 4, lastpage: "contract", reApplyAuthorizationSignatureNeeded: true, reApplyWorkflowStep: "", isInReApplyWorkflow: false }).then((updated) => _.assign(screentracking, updated[0]));

		return res.json({ code: 200, redirect: `/admin/viewIncomplete/${screentracking.id}` });

	} catch (exc) {
		sails.log.error("ApplicationController#ajaxReApplyOfferSubmission: Error ", exc);
		return res.status(500).json({ message: exc.message });
	}
}
async function leadCreateAccount(req, res) {

	try {
		const userId = req.param("userId");
		let errorMessage = "";
		let errorval = "";
		let successval = "";
		if (req.session.errormsg != "") {
			errorval = req.session.errormsg;
			req.session.errormsg = "";
		}
		if (req.session.successval != "") {
			successval = req.session.successval;
			req.session.successval = "";
		}
		if (!userId) {
			errorMessage = "Unable to create this account. The user id used does not exist."
			sails.log.error("ApplicationController#leadCreateAccount: Error ", errorMessage);
			// return res.view( "admin/error/400", { data: errorMessage } );
			req.session.errormsg = errorMessage;
			return res.redirect("/login")
		}
		const user = await User.findOne({ id: userId });
		if (!user || !user.lead || user.passwordstatus === 1) {
			errorMessage = "The user is not eligible or account already created. Please login to continue."
			sails.log.error("ApplicationController#leadCreateAccount: Error ", errorMessage);
			req.session.errormsg = errorMessage;
			return res.redirect("/login")
		}
		if (!user.isFromLeadApi || user.leadReject || !user.leadApplication) {
			errorMessage = "Unable to create this account. The lead was rejected."
			sails.log.error("ApplicationController#leadCreateAccount: Error ", errorMessage);
			return res.redirect("/loanDenied");
		}
		const screenTracking = await Screentracking.findOne({ id: user.leadApplication })

		return res.view("frontend/application/leadCreateLandingPage", { user: user, screenTracking: screenTracking, error: errorval, successval: successval })

	} catch (exc) {
		sails.log.error("ApplicationController#leadCreateAccount: Error ", exc);
		req.session.errormsg = exc.message;
		return res.redirect("/login")
	}

}
async function leadCreateAccountPost(req, res) {
	const userid = req.param("userid");
	let errorMessage = "";
	try {
		const newpassword = req.param("new_pwd");

		const updatedUser = await User.findOne({ id: userid });
		if (!updatedUser || !updatedUser.isFromLeadApi || updatedUser.leadReject || !updatedUser.leadApplication) {
			errorMessage = "Unable to create this account. The user is not eligible to be created."
			sails.log.error("ApplicationController#leadCreateAccountPost: Error ", errorMessage);
			req.session.errormsg = errorMessage;
			return res.redirect(`/leadCreateAccount/${userid}`)
		}
		updatedUser["password"] = newpassword;
		const salt = PracticeUser.generateSalt();

		const encryptedPassword = await User.generateEncryptedPassword(updatedUser, salt);
		const userUpdateResponse = {
			password: encryptedPassword,
			confirmPassword: updatedUser.password,
			passwordstatus: 1,
			salt: salt
		}
		await User.update({ id: updatedUser.id }, userUpdateResponse);
		req.session.successval = "Lead account password created! Please login to finish your application."
		return res.redirect("/login")
	} catch (exc) {
		sails.log.error("ApplicationController#leadCreateAccountPost: Error ", exc.message);
		req.session.errormsg = "";
		req.session.errormsg = "Unable to create this account: " + exc.message;
		return res.redirect(`/leadCreateAccount/${userid}`);
	}
}
async function postVerifyBankInfo(req, res) {
	let errorMessage = "";
	const userId = req.body.uid;
	const bankName = req.body.bankname;
	const routingNo = req.body.routingno;
	const bankAccNo = req.body.bankaccno;

	const updatedAccountData = {
		accountName: bankName,
		routingNumber: routingNo,
		accountNumber: bankAccNo,
		accountNumberLastFour: bankAccNo.substring(bankAccNo.length - 4),
	}

	const updatedUserBankAccountData = {
		bankNo: routingNo,
		institutionName: bankName,
		accountNo: bankAccNo,
	}

	try {
		const screentracking = await Screentracking.findOne({ user: userId });
		if (!!bankName && !!routingNo && !!bankAccNo) {
			await Account.update({ user: userId }, updatedAccountData);
			await UserBankAccount.update({ screentracking: screentracking.id }, updatedUserBankAccountData);
			await User.update({ id: userId }, { isBankVerified: true });
			await Screentracking.update({ user: userId }, { lastlevel: 3 });
			return res.json({ successval: "ok" });
		} else {
			throw new Error("Account data missing");
		}
	} catch (err) {
		sails.log.error("ApplicationController#leadVerifyBankInfo: Error -- ", err.message);
		throw new Error(err.message);
	}

}

async function getLeadBankInfo(req, res) {
	let errorMessage = "";
	const userId = req.session.userId;
	if (!userId) {
		errorMessage = "There was no user Id to verify."
		sails.log.error("ApplicationController#getLeadBankInfo -- Error: ", errorMessage);
		req.session.errormsg = `There was no user logged in. Please login again.`
		return res.redirect('/login');
	} else try {
		const bankInfo = await Account.findOne({ user: userId });
		const bank = bankInfo.accountName;
		const routingNumber = bankInfo.routingNumber;
		const account = bankInfo.accountNumber;
		return res.view("frontend/application/verifyBankInfo", { userId, bank, routingNumber, account })
	} catch (err) {
		sails.log.error("ApplicationController#getLeadBankInfo -- Error: ", err.message);
		req.session.errormsg = `There was an error fetching the bank data. Please login again.`;
		return res.redirect('/login');
	}
}

async function denyReapplication(req, res) {
	let userId = req.body.userId;
	if (!!userId) {
		try {
			await PaymentManagement.update({ user: userId }, { eligiblereapply: false });
			return res.json("ok");
		} catch (err) {
			sails.log.error("AdminApplicationController#denyReapplication -- Error: ", err.message);
			return res.status(500).json({ message: err.message })
		}
	}
	sails.log.error("AdminApplicationController#denyReapplication -- Error: No user specified");
	return res.status(404).json({ message: "No user found" });
}

async function allowReApplication(req, res) {
	let userId = req.body.userId;
	if (!!userId) {
		try {
			await PaymentManagement.update({ user: userId }, { eligiblereapply: true });
			return res.json("ok");
		} catch (err) {
			sails.log.error("AdminApplicationController#allowReApplication -- Error: ", err.message);
			return res.status(500).json({ message: err.message });
		}
	}
	sails.log.error("AdminApplicationController#allowReApplication -- Error: No user specified");
	return res.status(404).json({ message: err.message });
}
