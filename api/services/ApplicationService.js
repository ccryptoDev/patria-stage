/* global sails, Transunionhistory, User, Screentracking, Utils, ProductRules, MathExt */
"use strict";

const _ = require("lodash");
const request = require("request");
const Q = require("q");
const moment = require("moment");
var ObjectId = require('mongodb').ObjectID;

require("request-debug")(request);
const fs = require("fs");
const xml2js = require("xml2js");
// const https = require( "https" );
const pdf = require("html-pdf");
const path = require("path");
// const to_json = require( "xmljson" ).to_json;
const in_array = require("in_array");
// var parseString = require('xml2js').parseString;
// var xmlbuilder = require('xmlbuilder');

module.exports = {
	createcertificate: createcertificate,
	getProductRule: getProductRule,
	getProductNameByscore: getProductNameByscore,
	getProductRulesValue: getProductRulesValue,
	updateApplicationDetails: updateApplicationDetails,
	checkRuleCondition: checkRuleConditionAction,
	reGeneratepromissorypdf: reGeneratepromissorypdfAction,
	getNewProductRule: getNewProductRule,
	getScoringandRules: getScoringandRules,
	getPromissoryNoteData: getPromissoryNoteData,
	getPaymentFrequency: getPaymentFrequency,
	getProductRuleBanking: getProductRuleBanking,
	getContractData: getContractData,
	createEFTA: createEFTA,
	getContractPaymentSchedule: getContractPaymentSchedule,
	getLatestEligibleReapplyApplicationForUser: getLatestEligibleReapplyApplicationForUser,
	logLoanActivity: logLoanActivity,
	isUserEligibleToReApply: isUserEligibleToReApply,
	updateReApplyEmployment: updateReApplyEmployment,
	updateUserWithRevision: updateUserWithRevision,
	getUpdatedUserProperties: getUpdatedUserProperties,
	updateEmploymentInfo: updateEmploymentInfo,
	updateUserBankAccountInfo: updateUserBankAccountInfo,
	updateReapplyBankAccount: updateReapplyBankAccount,
};


function createcertificate(address, transactionControl, certificate, userArray, ssn_number, user, reqdata, leadLogTimeTrack = "") {
	const transunion = sails.config.transunion;
	const pAddress = Utils.parseStreetAddress(`${[user.street, user.unitapt].join(" ").trim()}, ${user.city}, ${user.state} ${user.zipCode}`);
	if (user) {
		const subjectRecord = {
			indicative: {
				name: { person: { first: user.firstname, middle: user.middlename, last: user.lastname, generationalSuffix: user.generationCode } },
				address: {
					status: "current",
					street: { number: pAddress.number, preDirectional: pAddress.prefix, name: pAddress.street, type: pAddress.type, unit: { type: pAddress.sec_unit_type, number: pAddress.sec_unit_num } },
					location: { city: user.city, state: user.state, zipCode: user.zipCode }
				},
				socialSecurity: { number: user.ssn_number },
				dateOfBirth: user.dateofBirth
			},
			addOnProduct: transunion.addOnProduct
		};
		const productData = {
			code: transunion.productCode,
			subject: { number: "1", subjectRecord: subjectRecord },
			responseInstructions: { returnErrorText: "true", document: null },
			permissiblePurpose: { inquiryECOADesignator: "individual" }
		};
		const requestData = {
			document: "request",
			version: transunion.version,
			transactionControl: transactionControl,
			product: productData
		};
		const userData = {
			name: subjectRecord.indicative.name.person,
			email: user.email,
			street: subjectRecord.indicative.address.street,
			city: user.city,
			state: user.state,
			zipCode: user.zipCode,
			ssn_number: ssn_number,
			dob: user.dateofBirth
		};

		return Transunionhistory.create({ user: user.id, requestdata: { userData: userData, requestData: requestData }, status: 0 })
			.then(function (transunionhistory) {
				return new Promise((resolve) => {
					request.debug = false;
					const builder = new xml2js.Builder();
					const xmldata = builder.buildObject(requestData)
						.replace(/\n|\r|\s/g, "")
						.replace('<?xmlversion="1.0"encoding="UTF-8"standalone="yes"?><root>', '<?xml version="1.0" encoding="UTF-8"?><creditBureau xmlns="http://www.transunion.com/namespace" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.transunion.com/namespace">')
						.replace("</root>", "</creditBureau>");
					const reqOpts = {
						url: transunion.baseUrl,
						method: "POST",
						cert: fs.readFileSync(path.join(sails.config.appPath, certificate.crtPath)),
						key: fs.readFileSync(path.join(sails.config.appPath, certificate.keyPath)),
						passphrase: certificate.password,
						rejectUnauthorized: false,
						headers: { "Content-Type": "text/xml" },
						body: xmldata
					};
					fs.appendFileSync(`logs/transunion/${user.id}.txt`, `Request: ${transunion.baseUrl}\n${xmldata}\n`);
					request(reqOpts, (err, response, body) => {
						if (err) {
							sails.log.error("request.error:", err);
							fs.appendFileSync(`logs/transunion/${user.id}.txt`, `Error:\n${JSON.stringify(err)}\n\n`);
							transunionhistory.responsedata = err;
							transunionhistory.status = 2;
							return resolve({ code: 400, message: "Could not retrieve your credit details" });
						}
						if (response.statusCode != 200) {
							sails.log.error("request.response:", response.statusCode, response.statusMessage);
							fs.appendFileSync(`logs/transunion/${user.id}.txt`, `Error:${response.statusCode} ${response.statusMessage}\n${body}\n\n`);
							transunionhistory.responsedata = body;
							transunionhistory.status = 2;
							return resolve({ code: 400, message: "Could not retrieve your credit details" });
						}
						fs.appendFileSync(`logs/transunion/${user.id}.txt`, `Response:\n${body}\n\n`);
						return resolve({ code: 200, body: body });
					});
				})
					.then((response) => {
						return Promise.resolve()
							.then(() => {
								if (response.code == 200) {
									return new Promise((resolve) => {
										const parser = new xml2js.Parser({ charkey: "_val", explicitArray: false, mergeAttrs: true });
										parser.parseString(response.body, function (err, creditReport) {
											if (err) {
												transunionhistory.responsedata = err;
												transunionhistory.status = 3;
												return transunionhistory.save()
													.then(() => resolve({ code: 500, error: err }));
											}
											const error = _.get(creditReport, "creditBureau.product.error", null);
											if (error) {
												transunionhistory.responsedata = error;
												transunionhistory.status = 3;
												return transunionhistory.save()
													.then(() => resolve({ code: 500, error: error }));
											}
											transunionhistory.responsedata = creditReport;
											transunionhistory.status = 1;
											return transunionhistory.save()
												.then(() => resolve({ code: 200, creditReport: creditReport }));
										});
									});
								}
								return transunionhistory.save()
									.then(() => response);
							})
							.then((result) => {
								if (result.code !== 200) {
									return result;
								}
								sails.log.info("creditReport:", JSON.stringify(result.creditReport));
								return Promise.resolve()
									.then(() => {
										const ssn_number = _.get(result, "creditReport.creditBureau.product.subject.subjectRecord.indicative.socialSecurity.number", user.ssn_number);
										if (user.ssn_number !== ssn_number) {
											user.ssn_number = ssn_number;
											return User.update({ id: user.id }, { ssn_number: user.ssn_number });
										}
									})
									.then(() => {
										return { code: 200, message: "Transunion data for customer fetched successfully.", resultdata: result.creditReport, ssnNumberTrans: user.ssn_number };
									});
							});
					});
			})
			.catch(function (err) {
				sails.log.error("ApplicationService#createcertificate::Err ::", err);
				return { code: 400, message: "Could not retrieve your credit details" };
			});
	} else {
		return Promise.resolve({ code: 400, message: "Invalid user details. Try again!" });
	}
}


function getProductRule(creditReport, transunion_scrore) {
	return Q.promise(function (resolve, reject) {
		const productid = sails.config.product.productid;

		if (productid != "" && productid != null && "undefined" !== typeof productid) {
			ApplicationService.getProductRulesValue(productid)
				.then(function (ruledata) {
					sails.log.info("creditReport.ruledata", ruledata);

					const rule1val = parseInt(ruledata.rules1[0]);
					const rule2val = parseInt(ruledata.rules2[0]);
					const rule3val = parseInt(ruledata.rules3[0]);
					const rule4val = parseInt(ruledata.rules4[0]);
					const rule5val = parseInt(ruledata.rules5[0]);
					const rule6val = parseInt(ruledata.rules6[0]);
					const rule7val = parseInt(ruledata.rules7[0]);
					const rule8val = parseInt(ruledata.rules8[0]);
					const rule9val = parseInt(ruledata.rules9[0]);
					const rule10val = parseFloat(ruledata.rules10[0]);

					const rule1valCon = ApplicationService.checkRuleCondition(ruledata.rules1[1]);
					const rule1valExactCond = rule1valCon;

					const rule2valCon = ApplicationService.checkRuleCondition(ruledata.rules2[1]);
					const rule2valExactCond = rule2valCon;

					const rule3valCon = ApplicationService.checkRuleCondition(ruledata.rules3[1]);
					const rule3valExactCond = rule3valCon;

					const rule4valCon = ApplicationService.checkRuleCondition(ruledata.rules4[1]);
					const rule4valExactCond = rule4valCon;

					const rule5valCon = ApplicationService.checkRuleCondition(ruledata.rules5[1]);
					const rule5valExactCond = rule5valCon;

					const rule6valCon = ApplicationService.checkRuleCondition(ruledata.rules6[1]);
					const rule6valExactCond = rule6valCon;

					const rule7valCon = ApplicationService.checkRuleCondition(ruledata.rules7[1]);
					const rule7valExactCond = rule7valCon;

					const rule8valCon = ApplicationService.checkRuleCondition(ruledata.rules8[1]);
					const rule8valExactCond = rule8valCon;

					const rule9valCon = ApplicationService.checkRuleCondition(ruledata.rules9[1]);
					const rule9valExactCond = rule9valCon;

					const rule10valCon = ApplicationService.checkRuleCondition(ruledata.rules10[1]);
					const rule10valExactCond = rule10valCon;

					sails.log.info("rule10valExactCond", rule10valExactCond);

					const startdate = moment().subtract(rule1val, "months").format("YYYY-MM-DD");
					const rule1startdate = moment().subtract(rule1val, "months").format("YYYY-MM-DD");
					const bankruptcystartdate = moment().subtract(24, "months").format("YYYY-MM-DD");
					const publicrecordstartdate = moment().subtract(24, "months").format("YYYY-MM-DD");
					const enddate = moment().format("YYYY-MM-DD");
					const inquirystartdate = moment().subtract(6, "months").format("YYYY-MM-DD");
					const forclosurestartdate = moment().subtract(12, "months").format("YYYY-MM-DD");
					const tradestartdate = moment().add(30, "days").format("YYYY-MM-DD");
					const ruledatacount = [];
					const utilizationstartdate = moment().subtract(6, "months").format("YYYY-MM-DD");

					// 0 = Approvred 1 == Declined
					// Rule === R1: Months of Credit History  (Month) < 6 then decline
					let rule1 = 0;
					if (creditReport.product.subject.subjectRecord.fileSummary) {
						if (creditReport.product.subject.subjectRecord.fileSummary.inFileSinceDate) {
							const inFileSinceDate = creditReport.product.subject.subjectRecord.fileSummary.inFileSinceDate._val;
							if (inFileSinceDate >= rule1startdate) {
								rule1 = 1;
							} else {
								rule1 = 0;
							}
						} else {
							rule1 = 1;
						}
					} else {
						rule1 = 1;
					}

					ruledatacount.push("R1: Months of Credit History : " + rule1);

					var transunion_credit_trade = "";
					const transunion_credit_collection = "";
					var transunion_credit_inquiry = "";
					if (creditReport.product.subject.subjectRecord.custom) {
						if (creditReport.product.subject.subjectRecord.custom.credit.trade) {
							transunion_credit_trade = creditReport.product.subject.subjectRecord.custom.credit.trade;
						}
						if (creditReport.product.subject.subjectRecord.custom.credit.inquiry) {
							transunion_credit_inquiry = creditReport.product.subject.subjectRecord.custom.credit.inquiry;
						}
					}

					// Rule === R2: Total Number of trade lines < 2 then decline
					let rule2 = 0;
					let tradecount = 0;
					if (transunion_credit_trade) {
						var trade_data = (!Array.isArray(transunion_credit_trade) ? [transunion_credit_trade] : transunion_credit_trade);
						tradecount = trade_data.length;
						if (tradecount > 0) {
							const totaltrade = tradecount;
							if (totaltrade >= rule2val) {
								rule2 = 0;
							} else {
								rule2 = 1;
							}
						} else {
							rule2 = 1;
						}
					} else {
						rule2 = 1;
					}
					ruledatacount.push("R2: Total Number of trade lines : " + tradecount);

					// Rule3=== Number of revolving trade lines
					var rule3counter = 0;
					if (tradecount > 0) {
						var rule3 = 0;
						_.forEach(trade_data, function (value, key) {
							if (value.portfolioType == "revolving") {
								rule3counter++;
							}
						});
						if (parseInt(rule3counter) < rule3val) {
							var rule3 = 1;
						} else {
							var rule3 = 0;
						}
					} else {
						var rule3 = 1;
					}
					ruledatacount.push("R3: Number of revolving trade lines : " + rule3counter);

					// Rule4 === # Inquiries in last 6 months > 8 then decline
					var rule4 = 0;
					var rule4counter = 0;
					// -- Ticket 2731 (disable the Inquiry Rule (R4))
					if (transunion_credit_inquiry) {
						var inquiryRecord_data;
						var inquiryRecord = transunion_credit_inquiry;
						if (!Array.isArray(inquiryRecord)) {
							inquiryRecord_data = [];
							inquiryRecord_data.push(inquiryRecord);
						} else {
							inquiryRecord_data = inquiryRecord;
						}
						var apiinquiryresstartdate = '';
						_.forEach(inquiryRecord_data, function (value, key) {
							if (value.date) {
								apiinquiryresstartdate = value.date._val;
								if (apiinquiryresstartdate >= inquirystartdate) {
									rule4counter = parseInt(rule4counter) + 1;
								}
							}
						});
						if (parseInt(rule4counter) > rule4val) {
							rule4 = 1;
						}
					}
					ruledatacount.push('R4: Inquiries in last 6 months : ' + rule4counter);

					// Rule === R5: Bankruptcy in last 24 months > 0 then decline
					if (creditReport.product.subject.subjectRecord && creditReport.product.subject.subjectRecord.custom && creditReport.product.subject.subjectRecord.custom.credit && creditReport.product.subject.subjectRecord.custom.credit.publicRecord) {
						var publicRecord_data;
						const publicRecord = creditReport.product.subject.subjectRecord.custom.credit.publicRecord;
						if (!Array.isArray(publicRecord)) {
							publicRecord_data = [];
							publicRecord_data.push(publicRecord);
						} else {
							publicRecord_data = publicRecord;
						}
						let rule5counter = 0;
						var rule5 = 0;
						const bankruptcytype = sails.config.applicationConfig.bankruptcytype;

						_.forEach(publicRecord_data, function (value, key) {
							if (value.type) {
								var bankruptcy_date;
								const bankruptcy_type = value.type;
								if (value.dateFiled._val != "" && value.dateFiled._val != null && "undefined" !== typeof value.dateFiled._val) {
									bankruptcy_date = value.dateFiled._val;
								} else {
									bankruptcy_date = value.dateFiled;
								}
								/* sails.log.info('bankruptcy_date1111111',bankruptcy_date);
													sails.log.info('bankruptcystartdate1111111',bankruptcystartdate);
													sails.log.info('bankruptcy_type1111111',bankruptcy_type);
													sails.log.info('bankruptcytype1111111',bankruptcytype);*/

								if (bankruptcy_date >= bankruptcystartdate && in_array(bankruptcy_type, bankruptcytype)) {
									rule5counter = parseInt(rule5counter) + 1;
								}
							}
						});

						if (parseInt(rule5counter) > rule5val) {
							rule5 = 1;
						}

						ruledatacount.push("R5: Bankruptcy in last 24 months : " + rule5counter);

						// R6: Foreclosure in last 12 months > 0 then decline
						let rule6counter = 0;
						var rule6 = 0;
						const forclosuretype = sails.config.applicationConfig.forclosuretype;
						_.forEach(publicRecord_data, function (value, key) {
							if (value.type) {
								var forclosure_date;
								const forclosure_type = value.type;
								if (value.dateFiled._val != "" && value.dateFiled._val != null && "undefined" !== typeof value.dateFiled._val) {
									forclosure_date = value.dateFiled._val;
								} else {
									forclosure_date = value.dateFiled;
								}
								if (forclosure_date >= forclosurestartdate && in_array(forclosure_type, forclosuretype)) {
									rule6counter = parseInt(rule6counter) + 1;
								}
							}
						});

						if (parseInt(rule6counter) > rule6val) {
							rule6 = 1;
						}
						ruledatacount.push("R6: Foreclosure in last 12 months : " + rule6counter);

						// R7: # public records in last 24 months > 2 then decline
						let rule7counter = 0;
						var rule7 = 0;
						_.forEach(publicRecord_data, function (value, key) {
							var publicrecord_date;
							// var publicrecord_date = value.dateFiled;
							if (value.dateFiled._val != "" && value.dateFiled._val != null && "undefined" !== typeof value.dateFiled._val) {
								publicrecord_date = value.dateFiled._val;
							} else {
								publicrecord_date = value.dateFiled;
							}

							if (publicrecord_date >= publicrecordstartdate) {
								rule7counter = parseInt(rule7counter) + 1;
							}
						});
						if (parseInt(rule7counter) > rule7val) {
							rule7 = 1;
						}
						ruledatacount.push("R7: public records in last 24 months : " + rule7counter);
					} else {
						var rule5 = 0;
						var rule6 = 0;
						var rule7 = 0;

						ruledatacount.push("R5: Bankruptcy in last 24 months : 0");
						ruledatacount.push("R6: Foreclosure in last 12 months : 0");
						ruledatacount.push("R7: public records in last 24 months : 0");
					}

					if (transunion_credit_trade) {
						var transunion_credit_trade_data;
						if (!Array.isArray(transunion_credit_trade)) {
							transunion_credit_trade_data = [];
							transunion_credit_trade_data.push(transunion_credit_trade);
						} else {
							transunion_credit_trade_data = transunion_credit_trade;
						}

						// R8: # 30+ day past due occurrences w/in 24 months > 4 then decline
						let rule8counter = 0;
						var rule8 = 0;
						let paymentstartDate24 = "";
						let paymenttext24 = "";
						let pastDue24 = parseFloat(0);
						_.forEach(transunion_credit_trade_data, function (value, key) {
							pastDue24 = parseFloat(value.pastDue);
							if (value.paymentHistory) {
								if (value.paymentHistory.paymentPattern) {
									paymentstartDate24 = value.paymentHistory.paymentPattern.startDate._val;
									paymenttext24 = value.paymentHistory.paymentPattern.text;
									let monthdiffer = moment(paymentstartDate24).diff(enddate, "months");
									monthdiffer = Math.abs(monthdiffer);
									if (monthdiffer < 24 && monthdiffer >= 0) {
										const charcnt = 24 - parseInt(monthdiffer);
										if (charcnt > 0) {
											if (paymenttext24.indexOf("2") > -1 || paymenttext24.indexOf("K") > -1 || paymenttext24.indexOf("G") > -1 || paymenttext24.indexOf("L") > -1) {
												rule8counter = parseInt(rule8counter) + 1;
											}
										}
									}
								}
							}
						});

						sails.log.info("rule8val", rule8val);
						sails.log.info("rule8counter", rule8counter);

						if (parseInt(rule8counter) > rule8val) {
							rule8 = 1;
						}

						ruledatacount.push("R8: #Of trades with #60+DPD in past 24 months : " + rule8counter);

						// R9: # 60+ days past due in past 6 months > 1 then decline
						let rule9counter = 0;
						var rule9 = 0;
						let paymentstartDate60 = "";
						let paymenttext60 = "";
						let pastDue60 = parseFloat(0);
						_.forEach(transunion_credit_trade_data, function (value, key) {
							pastDue60 = parseFloat(value.pastDue);
							if (value.paymentHistory) {
								if (value.paymentHistory.paymentPattern) {
									paymentstartDate60 = value.paymentHistory.paymentPattern.startDate._val;
									paymenttext60 = value.paymentHistory.paymentPattern.text;
									let monthdiffer = moment(paymentstartDate60).diff(enddate, "months");
									monthdiffer = Math.abs(monthdiffer);

									if (monthdiffer < 6 && monthdiffer >= 0) {
										const charcnt = 6 - parseInt(monthdiffer);
										if (charcnt > 0) {
											if (paymenttext60.indexOf("3") > -1 || paymenttext60.indexOf("K") > -1 || paymenttext60.indexOf("G") > -1 || paymenttext60.indexOf("L") > -1) {
												rule9counter = parseInt(rule9counter) + 1;
											}
										}
									}
								}
							}
						});
						/* sails.log.info('rule9val',rule9val);
											sails.log.info('rule9counter',rule9counter);*/
						if (parseInt(rule9counter) > rule9val) {
							rule9 = 1;
						}

						ruledatacount.push("R9: #Of trades with #60+DPD in past 6 months : " + rule9counter);

						var rule10 = 0;
						let portfolioType = "";
						let currentBalance = 0;
						let ECOADesignator = "";
						let dateEffective = "";
						let total_revolving_creditLimit = 0;
						let total_revolving_balance = 0;
						let creditLimit = "";

						_.forEach(transunion_credit_trade_data, function (value, key) {
							if (value.portfolioType) {
								portfolioType = value.portfolioType;
							}
							if (value.currentBalance) {
								currentBalance = parseFloat(value.currentBalance);
							}
							if (currentBalance === 0 && (value.hasOwnProperty("datePaidOut") || value.hasOwnProperty("dateClosed"))) {
								return;
							}
							if (value.ECOADesignator) {
								ECOADesignator = value.ECOADesignator;
							}
							if (value.creditLimit) {
								creditLimit = parseFloat(value.creditLimit);
							}
							if (value.dateEffective) {
								dateEffective = value.dateEffective._val;
							}
							if (portfolioType == "revolving" && dateEffective > utilizationstartdate && (ECOADesignator !== "jointContractLiability" && ECOADesignator !== "authorizedUser" && ECOADesignator !== "terminated")) {
								if (creditLimit > 0) {
									total_revolving_creditLimit += creditLimit;
									if (currentBalance > 0) {
										total_revolving_balance += currentBalance;
									}
								}
							}
						});
						const Utilization = parseFloat(total_revolving_creditLimit == 0 ? 0 : parseFloat(total_revolving_balance) / parseFloat(total_revolving_creditLimit));
						if (Utilization > parseFloat(rule10val)) {
							rule10 = 1;
						} else {
							rule10 = 0;
						}
						ruledatacount.push("R10: Utilization of Revolving trades : " + Utilization.toFixed(2));
					} else {
						var rule8 = 0;
						var rule9 = 0;
						var rule10 = 0;

						/* ruledatacount.push('R8: current 30+ day past due : 0');*/
						ruledatacount.push("R8: #Of trades with #60+DPD in past 24 months : 0");
						ruledatacount.push("R9: #Of trades with #60+DPD in past 6 months : 0");
						ruledatacount.push("R10: Utilization of Revolving trades : 0.0");
					}

					const declinedrulemsg = [];
					const approvedrulemsg = [];

					const rule1Message = "R1: Months of Credit History  (Month) " + rule1valExactCond + "  " + rule1val + " then decline";
					const rule2Message = "R2: Total Number of trade lines " + rule2valExactCond + "  " + rule2val + " then decline";
					const rule3Message = "R3: Number of revolving trade lines " + rule3valExactCond + " " + rule3val + " then decline";
					const rule4Message = "R4: Inquiries in last 6 months " + rule4valExactCond + " " + rule4val + " then decline";
					const rule5Message = "R5: Bankruptcy in last 24 months " + rule5valExactCond + "  " + rule5val + " then decline";
					const rule6Message = "R6: Foreclosure in last 12 months " + rule6valExactCond + "  " + rule6val + " then decline";
					const rule7Message = "R7: Public records in last 24 months " + rule7valExactCond + "  " + rule7val + " then decline";
					const rule8Message = "R8: #Of trades with #60+DPD in past 24 months " + rule8valExactCond + "  " + rule8val + " then decline";
					const rule9Message = "R9: #Of trades with #60+DPD in past 6 months  " + rule9valExactCond + " " + rule9val + " then decline";
					const rule10Message = "R10: Utilization of Revolving trades " + rule10valExactCond + " " + parseFloat(rule10val) + " then decline";

					if (rule1 == 0 && rule2 == 0 && rule3 == 0 && rule4 == 0 && rule5 == 0 && rule6 == 0 && rule7 == 0 && rule8 == 0 && rule9 == 0 && rule10 == 0) {
						var loanstatus = "Approved";
						approvedrulemsg.push(rule1Message);
						approvedrulemsg.push(rule2Message);
						approvedrulemsg.push(rule3Message);
						approvedrulemsg.push(rule4Message);
						approvedrulemsg.push(rule5Message);
						approvedrulemsg.push(rule6Message);
						approvedrulemsg.push(rule7Message);
						approvedrulemsg.push(rule8Message);
						approvedrulemsg.push(rule9Message);
						approvedrulemsg.push(rule10Message);
					} else {
						var loanstatus = "Denied";
						if (rule1 > 0) {
							declinedrulemsg.push(rule1Message);
						} else {
							approvedrulemsg.push(rule1Message);
						}
						if (rule2 > 0) {
							declinedrulemsg.push(rule2Message);
						} else {
							approvedrulemsg.push(rule2Message);
						}
						if (rule3 > 0) {
							declinedrulemsg.push(rule3Message);
						} else {
							approvedrulemsg.push(rule3Message);
						}
						if (rule4 > 0) {
							declinedrulemsg.push(rule4Message);
						} else {
							approvedrulemsg.push(rule4Message);
						}
						if (rule5 > 0) {
							declinedrulemsg.push(rule5Message);
						} else {
							approvedrulemsg.push(rule5Message);
						}
						if (rule6 > 0) {
							declinedrulemsg.push(rule6Message);
						} else {
							approvedrulemsg.push(rule6Message);
						}
						if (rule7 > 0) {
							declinedrulemsg.push(rule7Message);
						} else {
							approvedrulemsg.push(rule7Message);
						}
						if (rule8 > 0) {
							declinedrulemsg.push(rule8Message);
						} else {
							approvedrulemsg.push(rule8Message);
						}
						if (rule9 > 0) {
							declinedrulemsg.push(rule9Message);
						} else {
							approvedrulemsg.push(rule9Message);
						}
						if (rule10 > 0) {
							declinedrulemsg.push(rule10Message);
						} else {
							approvedrulemsg.push(rule10Message);
						}
					}

					const rulesdata = {
						code: 200,
						r1: rule1,
						r2: rule2,
						r3: rule3,
						r4: rule4,
						r5: rule5,
						r6: rule6,
						r7: rule7,
						r8: rule8,
						r9: rule9,
						r10: rule10,
						r11: 0,
						r12: 0,
						r13: 0,
						r14: 0,
						loanstatus: loanstatus,
						approvedrulemsg: approvedrulemsg,
						declinedrulemsg: declinedrulemsg,
						ruledata: ruledata,
						ruledatacount: ruledatacount
					};
					return resolve(rulesdata);
				})
				.catch(function (err) {
					sails.log.error("ApplicationService#createcertificate::Err ::", err);
					return reject(err);
				});
		} else {
			return reject({ code: 400, message: "Invalid Product!" });
		}
	});
}


function getProductNameByscore(creditscore) {
	return Q.promise(function (resolve, reject) {
		/* Productlist.find()
		 .then(function(productdata){

			var productselctid='';
			var forlength = productdata.length;
			var counter=0;
			var productname = '';

			//sails.log.info("forlength ", forlength);

			productdata.forEach(function(productval,loopvalue){

				var minscore = parseInt(productval.mincreditscore);
				var maxscore = parseInt(productval.maxcreditscore);

				if(creditscore >= minscore && creditscore <= maxscore)
				{
					productselctid = productval.id;
					productname = productval.productname;
				}else{
					if(creditscore >= sails.config.product.minCreditScore) {
						productselctid = sails.config.product.productid;
						productname = 'CA High Risk';
					} else {
						productselctid = '';
						productname = '';
					}
				}
				counter++;
				if(counter==forlength){

						var productdatadetails = {
							productid: productselctid,
							productname:productname,
						};
						sails.log.info("productdatadetails ", productdatadetails);
						return resolve(productdatadetails);

				}
			});


		})
		.catch(function (err) {
			if(err){
			return resolve({
					code: 403,
					message: 'Unable to fetch transunion details. Try again!'
			});
			}
		});	*/

		// return resolve(rulesdata);

		if (creditscore >= sails.config.product.minCreditScore) {
			var productselctid = sails.config.product.productid;
			var productname = "CA High Risk";
		} else {
			var productselctid = "";
			var productname = "";
		}
		const productdatadetails = {
			productid: productselctid,
			productname: productname
		};
		sails.log.info("productdatadetails ", productdatadetails);
		return resolve(productdatadetails);
	});
}
function getProductRulesValue(productid) {
	return Q.promise(function (resolve, reject) {
		const rulecriteria = { product: productid };
		const rulearray = [];
		// sails.log.info("rulecriteria ", rulecriteria);
		ProductRules.find(rulecriteria)
			.sort({ id: 1 })
			.then(function (ruledetails) {
				const forcnt = ruledetails.length;
				let i = 0;
				let rkey = 0;
				_.forEach(ruledetails, function (rulevalue, key) {
					// sails.log.info("key: ", key);
					// rulearray['rules'+key].push(rulevalue.value);
					rkey = rulevalue.ruleid.replace(/[^0-9]/g, "");
					const rulekey = "rules" + rkey;
					if (!rulearray.hasOwnProperty(rulekey)) {
						rulearray[rulekey] = [];
					}
					rulearray[rulekey].push(rulevalue.value);
					rulearray[rulekey].push(rulevalue.declinedif);

					// rulearray[rulekey].push(rulevalue.value);
					i++;
					if (forcnt == i) {
						return resolve(rulearray);
					}
				});
			})
			.catch(function (err) {
				if (err) {
					return resolve({
						code: 403,
						message: "Unable to fetch the rules details. Try again!"
					});
				}
			});
	});
}


function updateApplicationDetails(addressarray, transactionControl, certificate, userArray, ssn_number, userDetail, reqdata, creditReportData, leadLogTimeTrack = "", newScreenTrackingData = {}) {
	return Q.promise(function (resolve, reject) {
		Transunionhistory.findOne({ user: userDetail.id })
			.sort("createdAt DESC")
			.then(function (transunionhistoryData) {
				const creditReport = transunionhistoryData.responsedata.creditBureau;
				const transError = transunionhistoryData.responsedata.error;
				if (transError) {
					return Screentracking.findOne({ user: userDetail.id, isCompleted: false })
						.then((screentracking) => {
							return resolve({ code: 202, screenTracking: screentracking });
						});
					// const lastScreenName = "Application";
					// const lastlevel = 1;
					// const idobj = { transid: "", accountid: "", rulesDetails: "", creditscore: "" };
					// const dataObject = { addressarray: addressarray, userArray: userArray, transactionControl: transactionControl };
					// return Screentracking.updatedeclinedloan( lastScreenName, lastlevel, userDetail, dataObject, product, idobj, transError )
					// .then( function( screentracking ) {
					// 	const updateData = {
					// 		applicationType: "Admin create application",
					// 		deniedmessage: `Your application has been declined, due to record ${screentracking.transError.errortext} (Error code: ${screentracking.transError.errorcode})`
					// 	};
					// 	return Screentracking.update( { id: screentracking.screenId }, updateData )
					// 	.then( ( updated ) => {
					// 		return resolve( { code: 400, message: updateData.deniedmessage, screenTracking: screentracking } );
					// 	} )
					// 	.catch( ( err ) => {
					// 		sails.log.error( "updateApplicationDetails; catch:", err );
					// 	} );
					// } );
				} else if (creditReport) {
					if (creditReport.product.error) {
						return Screentracking.findOne({ user: userDetail.id, isCompleted: false })
							.then((screentracking) => {
								return resolve({ code: 202, screenTracking: screentracking });
							});
						// const idobj = { transid: "", accountid: "", rulesDetails: "", creditscore: "" };
						// const dataObject = { addressarray: addressarray, userArray: userArray, transactionControl: transactionControl };
						// var product = sails.config.product.productid;
						// var lastScreenName = "Application";
						// var lastlevel = 1;

						// Screentracking.updatedeclinedloan( lastScreenName, lastlevel, userDetail, dataObject, product, idobj, creditReport.product.error )
						// .then( function( screenTracking ) {
						// 	const producterror = creditReport.product.error.description;
						// 	const updateDatares = { applicationType: "Admin create application", deniedmessage: "Your application has been declined, due to record (" + producterror + ")" };
						// 	Screentracking.update( { id: screenTracking.screenId }, updateDatares ).exec( function afterwards( err, updated ) {
						// 		return resolve( {
						// 			code: 400,
						// 			message: "Could not recieve your credit details"
						// 		} );
						// 	} );
						// } )
						// .catch( function( err ) {
						// 	return resolve( {
						// 		code: 400,
						// 		message: "Could not recieve your credit details"
						// 	} );
						// } );
					} else {
						// sails.log.info("custom: ",creditReport.product.subject.subjectRecord.custom);

						var transunion_first_name = "";
						var transunion_middle_name = "";
						var transunion_last_name = "";
						var transunion_address = "";
						var transunion_socialSecurity_number = "";
						var transunion_employment = "";
						var transunion_credit_trade = "";
						var transunion_credit_collection = "";
						var transunion_credit_inquiry = "";
						var transunion_scrore = "";
						var transunion_addOnProduct = "";
						var transunion_employment_data = [];
						var transunion_address_data = []
						var transunion_credit_trade_data = [];
						var transunion_credit_inquiry_data = [];
						const fileHitIndicator = _.get(creditReport, "product.subject.subjectRecord.fileSummary.fileHitIndicator", "regularNoHit");
						const ssnMatchIndicator = _.get(creditReport, "product.subject.subjectRecord.fileSummary.ssnMatchIndicator", "noHit");
						if (ssnMatchIndicator == "noHit") {
							return Screentracking.findOne({ user: userDetail.id, isCompleted: false })
								.then((screentracking) => {
									return resolve({ code: 202, screenTracking: screentracking, ssnNoHit: true });
								});
						}

						var isNoHit = (fileHitIndicator == "regularNoHit");


						if (!isNoHit && creditReport.product.subject.subjectRecord.custom) {
							if (creditReport.product.subject.subjectRecord.indicative) {
								if (Array.isArray(creditReport.product.subject.subjectRecord.indicative.name)) {
									const creditUserName = creditReport.product.subject.subjectRecord.indicative.name[0];

									if (creditUserName.person.first) {
										transunion_first_name = creditUserName.person.first;
									}

									if (creditUserName.person.middle) {
										transunion_middle_name = creditUserName.person.middle;
									}

									if (creditUserName.person.last) {
										transunion_last_name = creditUserName.person.last;
									}
								} else {
									if (creditReport.product.subject.subjectRecord.indicative.name.person.first) {
										transunion_first_name = creditReport.product.subject.subjectRecord.indicative.name.person.first;
									}

									if (creditReport.product.subject.subjectRecord.indicative.name.person.middle) {
										transunion_middle_name = creditReport.product.subject.subjectRecord.indicative.name.person.middle;
									}

									if (creditReport.product.subject.subjectRecord.indicative.name.person.last) {
										transunion_last_name = creditReport.product.subject.subjectRecord.indicative.name.person.last;
									}
								}

								if (creditReport.product.subject.subjectRecord.indicative.address) {
									transunion_address = creditReport.product.subject.subjectRecord.indicative.address;
								}

								if (Array.isArray(creditReport.product.subject.subjectRecord.indicative.socialSecurity)) {
									transunion_socialSecurity_number = creditReport.product.subject.subjectRecord.indicative.socialSecurity[0].number;
								} else {
									if (creditReport.product.subject.subjectRecord.indicative.socialSecurity.number) {
										transunion_socialSecurity_number = creditReport.product.subject.subjectRecord.indicative.socialSecurity.number;
									}
								}

								if (creditReport.product.subject.subjectRecord.indicative.employment) {
									transunion_employment = creditReport.product.subject.subjectRecord.indicative.employment;
								}
							}

							if (creditReport.product.subject.subjectRecord.custom.credit.trade) {
								transunion_credit_trade = creditReport.product.subject.subjectRecord.custom.credit.trade;
							}

							if (creditReport.product.subject.subjectRecord.custom.credit.collection) {
								transunion_credit_collection = creditReport.product.subject.subjectRecord.custom.credit.collection;
							}

							if (creditReport.product.subject.subjectRecord.custom.credit.inquiry) {
								transunion_credit_inquiry = creditReport.product.subject.subjectRecord.custom.credit.inquiry;
							}



							if (creditReport.product.subject.subjectRecord.addOnProduct) {
								transunion_addOnProduct = creditReport.product.subject.subjectRecord.addOnProduct;

								// sails.log.info("transunion_addOnProduct: ",transunion_addOnProduct);

								if (creditReport.product.subject.subjectRecord.addOnProduct.scoreModel) {
									if (creditReport.product.subject.subjectRecord.addOnProduct.scoreModel.score.noScoreReason) {
										// No Hit
										return Screentracking.findOne({ user: userDetail.id, isCompleted: false })
											.then((screentracking) => {
												return resolve({ code: 202, screenTracking: screentracking });
											});
										// return resolve( {
										// 	code: 500,
										// 	message: creditReport.product.subject.subjectRecord.addOnProduct.scoreModel.score.noScoreReason
										// } );
									} else {
										if (creditReport.product.subject.subjectRecord.addOnProduct.scoreModel) {
											transunion_scrore = creditReport.product.subject.subjectRecord.addOnProduct.scoreModel.score.results;
										} else {
											_.forEach(creditReport.product.subject.subjectRecord.addOnProduct, function (value, key) {
												if (value.scoreModel) {
													transunion_scrore = value.scoreModel.score.results;
												}
											});
										}
									}
								} else {
									// sails.log.info("addOnProduct-111: ",creditReport.product.subject.subjectRecord.addOnProduct[0]);
									// sails.log.info("addOnProduct-2: ",creditReport.product.subject.subjectRecord.addOnProduct[1].scoreModel);

									if (Array.isArray(creditReport.product.subject.subjectRecord.addOnProduct)) {
										// sails.log.info("scoreModel-3: ",creditReport.product.subject.subjectRecord.addOnProduct[1].scoreModel);

										_.forEach(creditReport.product.subject.subjectRecord.addOnProduct, function (value, key) {
											// sails.log.info("value: ",value.scoreModel);
											// sails.log.info("valuescore: ",value.scoreModel);
											if (value.scoreModel != "" && value.scoreModel != null && "undefined" !== typeof value.scoreModel) {
												if (value.scoreModel.score.results != "" && value.scoreModel.score.results != null && "undefined" !== typeof value.scoreModel.score.results) {
													transunion_scrore = value.scoreModel.score.results;
													// sails.log.info("transunion_scrore: ",transunion_scrore);
												}
											}
										});
									}
								}
							}



							// sails.log.info("transunion_scrore00000: ",transunion_scrore);

							if (!Array.isArray(transunion_employment)) {
								transunion_employment_data.push(transunion_employment);
							} else {
								transunion_employment_data = transunion_employment;
							}

							if (!Array.isArray(transunion_address)) {
								transunion_address_data.push(transunion_address);
							} else {
								transunion_address_data = transunion_address;
							}

							if (!Array.isArray(transunion_credit_trade)) {
								transunion_credit_trade_data.push(transunion_credit_trade);
							} else {
								transunion_credit_trade_data = transunion_credit_trade;
							}

							if (!Array.isArray(transunion_credit_inquiry)) {
								transunion_credit_inquiry_data.push(transunion_credit_inquiry);
							} else {
								transunion_credit_inquiry_data = transunion_credit_inquiry;
							}
						} else {

							transunion_first_name = userDetail.firstname;
							transunion_middle_name = userDetail.middlename;
							transunion_last_name = userDetail.lastname;
							transunion_address_data = userDetail.street;
							transunion_socialSecurity_number = userDetail.ssn_number;
							isNoHit = true;
							transunion_scrore = "0";
						}


						const translogdata = {
							user: userDetail.id,
							response: creditReport,
							first_name: transunion_first_name,
							middle_name: transunion_middle_name,
							last_name: transunion_last_name,
							house_number: transunion_address_data,
							socialSecurity: transunion_socialSecurity_number,
							employment: transunion_employment_data,
							trade: transunion_credit_trade_data,
							credit_collection: transunion_credit_collection,
							inquiry: transunion_credit_inquiry_data,
							addOnProduct: transunion_addOnProduct,
							score: transunion_scrore,
							isNoHit: isNoHit,
							status: 0
						};
						// sails.log.info("transunion_scrore22222: ",transunion_scrore);
						// sails.log.info("translogdata",translogdata);

						let creditscore = transunion_scrore;
						creditscore = parseInt(creditscore.replace("+", ""));

						Transunions.create(translogdata)
							.then(function (transuniondetails) {
								Consolidateaccount.createconsolidateaccount(transuniondetails)
									.then(function (accdet) {
										const product = sails.config.product.productid;
										const lastScreenName = "Application";
										const lastlevel = 1;
										const idobj = {
											transid: transuniondetails.id,
											accountid: "",
											rulesDetails: "",
											creditscore: creditscore,
											isNoHit: isNoHit
										};
										const dataObject = {
											addressarray: addressarray,
											userArray: userArray,
											transactionControl: transactionControl,
											certificate: certificate,
											screenTrackingData: newScreenTrackingData
										};

										// sails.log.info("product: ",product);
										Screentracking.createLastScreenName(lastScreenName, lastlevel, userDetail, dataObject, product, idobj)
											.then(function (screenTracking) {
												const screenTrackingId = screenTracking.id;

												sails.log.info("screenTrackingId: ", screenTrackingId);
												//
												const updateData = { consolidateaccount: accdet.consolidateaccount.id, applicationType: "Admin create application" };

												sails.log.info("updateData: ", updateData);

												Screentracking.update({ id: screenTrackingId }, updateData).exec(function afterwards(err, updated) {
													sails.log.info("updated: ", updated);
												});

												sails.log.info("product: ", product);

												const productselctid = sails.config.product.productid;
												userDetail.social_number = transunion_socialSecurity_number;
												// Check user with directmail

												if (creditscore >= sails.config.product.minCreditScore) {
													ApplicationService.getProductRule(creditReport, transunion_scrore)
														// TODO: Do we have a transunion_score to use for patria?
														.then(function (rulesDetails) {
															if (rulesDetails.loanstatus == "Denied") {
																return Screentracking.findOne({ user: userDetail.id, isCompleted: false })
																	.then((screentracking) => {
																		return resolve({ code: 202, screenTracking: screentracking });
																	});
																// -- Application denied
																// const lastScreenName = "Application";
																// const lastlevel = 1;
																// const idobj = {
																// 	transid: transuniondetails.id,
																// 	accountid: "",
																// 	rulesDetails: rulesDetails,
																// 	creditscore: rulesDetails
																// };
																// const dataObject = {
																// 	addressarray: addressarray,
																// 	userArray: userArray,
																// 	transactionControl: transactionControl,
																// 	certificate: certificate
																// };

																// Screentracking.updatedeclinedloan( lastScreenName, lastlevel, userDetail, dataObject, product, idobj )
																// .then( function( screenTracking ) {

																// 	const updateDatares = { applicationType: "Admin create application", deniedmessage: "Your application has been denied due to Rules not matched!", scoringengine: rulesDetails.scoringInfoid, userScore: rulesDetails.userScore };
																// 	Screentracking.update( { id: screenTrackingId }, updateDatares )
																// 	.then( ( updated ) => {
																// 		// sails.log("screentracasd",screenTracking);
																// 		User.callDeclinedEmail( screenTrackingId )
																// 		.then( function( userObjectData ) {} )
																// 		.catch( function( err ) {
																// 			sails.log.error( "#AppService:updateApplicationDetailsRules:callDeclinedEmail :: err :", err );
																// 			return resolve( {
																// 				code: 402,
																// 				message: "Your application has been denied due to Rules not matched!",
																// 				screenTracking: screenTracking
																// 			} );
																// 		} );

																// 	} );
																// } );
															} else {
																var monthlyIncomeamount = parseFloat(newScreenTrackingData.incomeamount || "0");
																var housingExpense = parseFloat(newScreenTrackingData.housingExpense || "0");

																// -- Application approved
																const updateData = {
																	lastlevel: 2,
																	product: productselctid,
																	rulesDetails: rulesDetails,
																	creditscore: creditscore,
																	scoringengine: rulesDetails.scoringInfoid,
																	userScore: rulesDetails.userScore,
																	residenceType: newScreenTrackingData.residenceType,
																	housingExpense: housingExpense,
																	incomeamount: monthlyIncomeamount
																};
																return Screentracking.update({ id: screenTracking.id }, updateData)
																	.then((updated) => {
																		const responsedata = {
																			code: 200,
																			message: "Transunion data for customer fetched successfully.",
																			transuniondetails: transuniondetails,
																			rulesDetails: rulesDetails,
																			screenTracking: screenTracking
																		};
																		return resolve(responsedata);
																	});
															}
														})
														.catch(function (err) {
															sails.log.error("catch:", err);
															// -- Application denied
															// sails.log.info("Enter catch loop:");
															return Screentracking.findOne({ user: userDetail.id, isCompleted: false })
																.then((screentracking) => {
																	return resolve({ code: 202, screenTracking: screentracking });
																});
															// if( transunion_scrore != "" && transunion_scrore != null && "undefined" !== typeof transunion_scrore ) {
															// 	return Screentracking.updatedeclinedloan( lastScreenName, lastlevel, userDetail, dataObject, product, idobj )
															// 	.then( function( screenTracking ) {
															// 		return reject( err );
															// 	} );
															// } else {
															// 	return reject( err );
															// }
														});
												} else {
													return Screentracking.findOne({ user: userDetail.id, isCompleted: false })
														.then((screentracking) => {
															return resolve({ code: 202, screenTracking: screentracking });
														});
													// Screentracking.updatedeclinedloan( lastScreenName, lastlevel, userDetail, dataObject, product, idobj )
													// .then( function( screenTracking ) {
													// 	const updateDatares = { applicationType: "Admin create application", deniedmessage: "Your application has been declined, due to low credit score!" };
													// 	return Screentracking.update( { id: screenTrackingId }, updateDatares )
													// 	.then( ( updated ) => {
													// 		return User.callDeclinedEmail( screenTrackingId )
													// 		.then( function( userObjectData ) {} )
													// 		.catch( function( err ) {
													// 			sails.log.error( "#AppService:updateApplicationDetails:callDeclinedEmail :: err :", err );
													// 			// return res.handleError( err );
													// 			return resolve( { code: 400, message: "Your application has been declined, due to low credit score!", screenTracking: screenTracking } );
													// 		} );
													// 	} );
													// } );
												}
											})
											.catch(function (err) {
												sails.log.error("ApplicationService#createcertificate::Err ::", err);
												return reject(err);
											});
									})
									.catch(function (err) {
										sails.log.error("ApplicationService#createcertificate::Err ::", err);
										return reject(err);
									});
							})
							.catch(function (err) {
								sails.log.error("ApplicationService#createcertificate::Err ::", err);
								return reject(err);
							});
					}
				} else {
					return Screentracking.findOne({ user: userDetail.id, isCompleted: false })
						.then((screentracking) => {
							return resolve({ code: 202, screenTracking: screentracking });
						});
					// return resolve( { code: 402, message: "Could not recieve your credit profile!" } );
				}
			})
			.catch(function (err) {
				sails.log.error("ApplicationService#createcertificate::Err ::", err);
				return resolve({
					code: 402,
					message: "Could not recieve your credit details!"
				});
			});
	});
}

function checkRuleConditionAction(conditionString) {
	let condition = "";
	if (conditionString == "gt") {
		condition = ">";
	} else if (conditionString == "lt") {
		condition = "<";
	} else if (conditionString == "gte") {
		condition = ">=";
	} else if (conditionString == "lte") {
		condition = "<=";
	}
	return condition;
}

/* function reGeneratepromissorypdfAction(payId,userId,reqdata,resdata) {

	return Q.promise(function(resolve, reject) {

	var userid = userId;

		Screentracking
			.findOne({user:userid})
			.sort("createdAt DESC")
			.populate('user')
			.then(function(screentrackingdetails) {

				var applicationReference = screentrackingdetails.applicationReference;
				var userReference = screentrackingdetails.user.userReference;

				//sails.log.info("applicationReference:", applicationReference);
				//sails.log.info("userReference:", userReference);
					var userConsentDoc = {paymentManagement: payId,documentKey:'131'};
					UserConsent.update(userConsentDoc, {loanupdated: 2}).exec(function afterwards(err, updated){

					UserConsent
						.findOne({documentKey:'202',paymentManagement:payId})
						.then(function (userconsent) {

							//sails.log.info("userconsent11111111:", userconsent);

							UserConsent
								.createDuplicateConsent(userconsent,screentrackingdetails.user,userconsent.ip)
								.then(function (userconsentdetails) {

									var payid = userconsent.paymentManagement;
									//sails.log.info("userconsent:", userconsent);
									//sails.log.info("payid:", payid);
									userconsentdetails.paymentManagement = payid;
									userconsentdetails.save();

									var consentID = userconsentdetails.id;
									var userID = screentrackingdetails.user.id;

									UserConsent
									.objectdataRegenerate(userID,reqdata,resdata,payid,userconsent)
									.then(function (objectdatas) {

											 sails.log.info("objectdatas:::::::", objectdatas);
											 sails.log.info("userconsent.agreement:::::::", userconsent.agreement);

											//return false;
											Agreement
											.findOne({id: userconsent.agreement})
											.then(function(agreementDetail) {

															 sails.log.info("agreementDetail:::::::", agreementDetail);

												var replacedFilename = agreementDetail.documentName.split(' ').join('_');

												var pdfFileName ='./'+applicationReference+'_'+replacedFilename+'_'+Math.round(+new Date()/1000)+'.pdf';

												var IPFromRequest = userconsent.ip;
												var indexOfColon = IPFromRequest.lastIndexOf(':');
												var ipaddr = IPFromRequest.substring(indexOfColon+1,IPFromRequest.length);
												var signaturecriteria = {user_id: userID};

												//




												.findOne(signaturecriteria)
//													.then(function(signatureDetails) {

													//sails.log.info("signatureDetails:::::::", signatureDetails);

													var fname = objectdatas.fname;
													var lname = objectdatas.lname;
													var loanamaount = objectdatas.amount;
													var interestRateAmount = parseFloat(objectdatas.interestRate*12).toFixed(2);

													var agreementObject = {
														user : fname,
														date : moment.utc(new Date()).format(),
														agreement:agreementDetail,
													};
													//var agreementsignpath = Utils.getS3Url(signatureDetails.standardResolution);

														Transunions
														.findOne({user:userID})
														.then(function(transunionsdetails) {

															var socialnumber = transunionsdetails.response.product.subject.subjectRecord.indicative.socialSecurity.number;
															var socialnumber = socialnumber.replace(/.(?=.{4})/g, 'X');

															sails.log.info("socialnumber:::::::", socialnumber);

															Screentracking
															.findOne({user:userID})
															.sort("createdAt DESC")
															.populate('accounts')
															.populate('plaiduser')
															.populate('transunion')
															.populate('user')
															.then(function(screentrackingdetails) {

																sails.log.info("screentrackingdetails:::::::", screentrackingdetails);
																var accountName = "Installment Loan";
																var accountNumberLastFour = screentrackingdetails.accounts.accountNumberLastFour;
																var loanholderstreetname = screentrackingdetails.user.street;
																var loanholderstreetnumber = screentrackingdetails.user.street;
																var loanholdercity = screentrackingdetails.user.city;
																var loanholderzipcode = screentrackingdetails.user.zipCode;
																var loanstate = screentrackingdetails.user.state;

																if (screentrackingdetails.user.unitapp){
																var unitapp = screentrackingdetails.user.unitapp;
																}else{
																	var unitapp = '';
																	}

																User
																	.findOne({id:userID})
																	.then(function(userdetails) {

																		var addressobj = {
																			accountName:accountName,
																			accountNumberLastFour:accountNumberLastFour,
																			loanholderstreetname:loanholderstreetname,
																			loanholdercity:loanholdercity,
																			loanholderzipcode:loanholderzipcode,
																			phonenumber:userdetails.phoneNumber,
																			loanstate:loanstate,
																			unitapp:unitapp
																		}


															//resdata.view(agreementObject.agreement.documentPath,{ obj:objectdatas, loanamaount:loanamaount,ip :ipaddr, fname:fname,lname:lname,socialnumber:socialnumber,addressobj:addressobj,type:'pdf',interestRateAmount:interestRateAmount});

															var repsonsePdfData= {
																ip:ipaddr,
																userid:userID,
																todaydate:todaydate,
																financedAmount:financedAmount,
																loanTerm:loanTerm,
																scheduleLoanAmount:scheduleLoanAmount,
																checktotalLoanAmount:checktotalLoanAmount,
																creditcost:creditcost,
																screentrackingdetails:screentrackingdetails,
																type:'pdf',
																practiceData:practiceData,
																userData:userData,
																offerData: offerData
															 }


															//resdata.render(agreementObject.agreement.documentPath, { obj:objectdatas, loanamaount:loanamaount,ip :ipaddr, fname:fname,lname:lname,socialnumber:socialnumber,addressobj:addressobj,type:'pdf',interestRateAmount:interestRateAmount}, function(err, list){

											resdata.render(agreementObject.agreement.documentPath, repsonsePdfData, function(err, list){
															var options = {
																			"format": "Letter",
																			"orientation": "portrait",
																			"zoomFactor": "1",
																			"type": "pdf",
																			"quality": "75",
																			"paginationOffset": 1,
																			"border": {
																						"top": "25px",
																						"right": "15px",
																						"bottom": "25px",
																						"left": "15px"
																						}
																			};


															pdf.create(list, options).toFile(pdfFileName, function(err, result) {
																	if (err)
																	{
																		return reject(err);
																	}

																	var criteria = {
																	 id: consentID
																	};


																	UserConsent
																	.findOne(criteria)
																	.then(function (userConsentData) {

																		userConsentData.applicationReference = applicationReference;
																		userConsentData.userReference = userReference;

																				S3Service.reuploadPromissoryAgreementAsset(pdfFileName,userConsentData,applicationReference,userReference,reqdata);

																		return resolve(userConsentData);

																 })
																 .catch(function (err) {
																	return reject(err);
																 });
																})
															//  .catch(function (err) {
//																return reject(err);
//															 });
														});
														});

													})
												})
											})
										//})
//										.catch(function (err) {
//											 sails.log.error('ApplicationController#Error :: err', err);
//											return reject(err);
//										});

										})
										.catch(function (err) {
											 sails.log.error('ApplicationController#createpromissorypdfAction :: err', err);
											 //return res.handleError(err);
											 return reject(err);
										});
									})
									.catch(function (err) {
										 sails.log.error('dfasdf vignesh :: err', err);
										 //return res.handleError(err);
										 return reject(err);
									});

							})
							.catch(function (err) {
								 sails.log.error('ApplicationController#createpromissorypdfAction :: err', err);
								 //return res.handleError(err);
								 return reject(err);
							});
						});

			})
			.catch(function (err) {
				 sails.log.error('ApplicationController#createpromissorypdfAction :: err', err);
				 //return res.handleError(err);
				 return reject(err);
			});

	});
}*/

function getNewProductRule(creditReport, transunion_scrore) {
	return Q.promise(function (resolve, reject) {
		const enddate = moment().format("YYYY-MM-DD");
		var transunion_credit_trade = "";
		const transunion_credit_collection = "";
		var transunion_credit_inquiry = "";
		if (creditReport.product.subject.subjectRecord.custom && creditReport.product.subject.subjectRecord.custom.credit) {
			if (creditReport.product.subject.subjectRecord.custom.credit.trade) {
				var transunion_credit_trade = creditReport.product.subject.subjectRecord.custom.credit.trade;
			}
			if (creditReport.product.subject.subjectRecord.custom.credit.inquiry) {
				var transunion_credit_inquiry = creditReport.product.subject.subjectRecord.custom.credit.inquiry;
			}
		}

		// Reules 11 if the ratio of all bank trade balance reported in the past three months over the all bank trade credit limit is missing, then do knock-out.
		const rule11counter = 0;
		let rule11 = 0;
		let rule12 = 0;
		const rule11val = 0;
		const reportmonth = 0;
		let reportbalance = 0;
		let reportlimit = 0;
		let totalreportbalance = 0;
		let totalreportlimit = 0;
		let td_reported_3m_yn = 0;
		let totalreportmonth = 0;
		const ruledatacount = [];
		let chargeOffRepocnt = 0;
		let trackingdate = creditReport.transactionControl.tracking.transactionTimeStamp;
		trackingdate = moment(trackingdate).format("YYYY-MM-DD");

		if (!Array.isArray(transunion_credit_trade)) {
			var transunion_credit_trade_data = [];
			transunion_credit_trade_data.push(transunion_credit_trade);
		} else {
			var transunion_credit_trade_data = transunion_credit_trade;
		}
		_.forEach(transunion_credit_trade_data, function (value, key) {
			const td_balance = value.currentBalance;
			const td_creditlim = value.creditLimit;
			const dateeffective = value.dateEffective._val;
			const industryCode = value.subscriber.industryCode;
			const closedIndicator = value.closedIndicator;

			// sails.log.info('===============================');
			sails.log.info("closedIndicator", closedIndicator);

			let monthdiffer = moment(dateeffective).diff(trackingdate, "months");
			monthdiffer = Math.abs(monthdiffer);

			sails.log.info("monthdiffer", monthdiffer);

			if (monthdiffer <= 3) {
				td_reported_3m_yn = 1;
			} else {
				td_reported_3m_yn = 0;
			}
			sails.log.info("td_reported_3m_yn", td_reported_3m_yn);
			if (industryCode == "B") {
				reportbalance = td_reported_3m_yn * td_balance;
				reportlimit = td_reported_3m_yn * td_creditlim;
				totalreportbalance = totalreportbalance + reportbalance;
				totalreportlimit = totalreportlimit + reportlimit;
			}
		});

		sails.log.info("totalreportbalance", totalreportbalance);
		sails.log.info("totalreportlimit", totalreportlimit);
		sails.log.info("=================================");

		if (parseFloat(totalreportbalance) > 0 && parseFloat(totalreportlimit) > 0) {
			var bankr_td_r_3m_blim_pct = Math.abs(parseFloat(totalreportbalance / totalreportlimit).toFixed(2));
		} else {
			var bankr_td_r_3m_blim_pct = 0;
		}
		if (bankr_td_r_3m_blim_pct == 0) {
			rule11 = 1;
		} else {
			rule11 = 0;
		}

		ruledatacount.push("R10: If the ratio of all bank trade balance reported in the past three months over the all bank trade credit limit is missing, then do knock-out. " + bankr_td_r_3m_blim_pct);

		// Reules 12 if the trade closed indicator is being 'chargeOffRepo' and the number of trade reported in the past three months are equal or over two, then do knock-out.
		_.forEach(transunion_credit_trade_data, function (value, key) {
			const dateeffective = value.dateEffective._val;
			const closedIndicator = value.closedIndicator;
			let monthdiffer = moment(dateeffective).diff(trackingdate, "months");
			monthdiffer = Math.abs(monthdiffer);
			// sails.log.info('monthdiffer',monthdiffer);
			if (monthdiffer <= 3) {
				td_reported_3m_yn = 1;
			} else {
				td_reported_3m_yn = 0;
			}
			totalreportmonth = parseInt(totalreportmonth) + parseInt(td_reported_3m_yn);
			if (closedIndicator == "chargeOffRepo" && totalreportmonth >= 2) {
				rule12 = 1;
				chargeOffRepocnt = parseInt(chargeOffRepocnt) + 1;
			}
		});

		ruledatacount.push("R11: If the trade closed indicator is being chargeOffRepo and the number of trade reported in the past three months are equal or over two, then do knock-out. : " + chargeOffRepocnt);
		sails.log.info("rule12", rule12);

		if (rule11 == 0 && rule12 == 0) {
			var loanstatus = "Approved";
		} else {
			var loanstatus = "Denied";
		}

		const rulesdata = {
			code: 200,
			r10: rule11,
			r11: rule12,
			loanstatus: loanstatus,
			bankr_td_r_3m_blim_pct: bankr_td_r_3m_blim_pct,
			totalreportmonth: totalreportmonth,
			ruledatacount: ruledatacount
		};

		return resolve(rulesdata);
	});
}

function getScoringandRules(creditReport, transunion_scrore, userDetail) {
	return Q.promise(function (resolve, reject) {
		ApplicationService.getProductNameByscore(transunion_scrore)
			.then(function (productdata) {
				const productname = productdata.productname;
				const productid = productdata.productid;

				if (productid != "" && productid != null && "undefined" !== typeof productid) {
					ApplicationService.getProductRulesValue(productid)
						.then(function (ruledata) {
							const rule1val = parseInt(ruledata.rules1[0]);
							const rule2val = parseInt(ruledata.rules2[0]);
							const rule3val = parseInt(ruledata.rules3[0]);
							const rule4val = parseInt(ruledata.rules4[0]);
							const rule5val = parseInt(ruledata.rules5[0]);
							const rule6val = parseInt(ruledata.rules6[0]);
							const rule7val = parseInt(ruledata.rules7[0]);
							const rule8val = parseInt(ruledata.rules8[0]);
							const rule9val = parseInt(ruledata.rules9[0]);
							const rule10val = parseInt(ruledata.rules10[0]);
							const rule11val = parseInt(ruledata.rules11[0]);
							const rule12val = parseInt(ruledata.rules12[0]);
							const rule13val = parseInt(ruledata.rules13[0]);

							const rule1valCon = ApplicationService.checkRuleCondition(ruledata.rules1[1]);
							const rule1valExactCond = rule1valCon;

							const rule2valCon = ApplicationService.checkRuleCondition(ruledata.rules2[1]);
							const rule2valExactCond = rule2valCon;

							const rule3valCon = ApplicationService.checkRuleCondition(ruledata.rules3[1]);
							const rule3valExactCond = rule3valCon;

							const rule4valCon = ApplicationService.checkRuleCondition(ruledata.rules4[1]);
							const rule4valExactCond = rule4valCon;

							const rule5valCon = ApplicationService.checkRuleCondition(ruledata.rules5[1]);
							const rule5valExactCond = rule5valCon;

							const rule6valCon = ApplicationService.checkRuleCondition(ruledata.rules6[1]);
							const rule6valExactCond = rule6valCon;

							const rule7valCon = ApplicationService.checkRuleCondition(ruledata.rules7[1]);
							const rule7valExactCond = rule7valCon;

							const rule8valCon = ApplicationService.checkRuleCondition(ruledata.rules8[1]);
							const rule8valExactCond = rule8valCon;

							const rule9valCon = ApplicationService.checkRuleCondition(ruledata.rules9[1]);
							const rule9valExactCond = rule9valCon;

							const rule10valCon = ApplicationService.checkRuleCondition(ruledata.rules10[1]);
							const rule10valExactCond = rule10valCon;

							const scorecriteria = { user: userDetail.id };
							Scoringengine.findOne(scorecriteria)
								.sort("createdAt DESC")
								.then(function (scoringInfo) {
									const declinedrulemsg = [];
									var approvedrulemsg = [];

									if (scoringInfo.statusCode == 200 && scoringInfo.statusCode != "" && scoringInfo.statusCode != null && "undefined" !== typeof scoringInfo.statusCode) {
										// var scoringInfo = scoringInfores[0];
										// sails.log.info('scoringInfo',scoringInfo);

										const scoringInforule0 = parseInt(scoringInfo.rules[0].Value);
										const scoringInforule1 = parseInt(scoringInfo.rules[1].Value);
										const scoringInforule2 = parseInt(scoringInfo.rules[2].Value);
										const scoringInforule3 = parseInt(scoringInfo.rules[3].Value);
										const scoringInforule4 = parseInt(scoringInfo.rules[4].Value);
										const scoringInforule5 = parseInt(scoringInfo.rules[5].Value);
										const scoringInforule6 = parseInt(scoringInfo.rules[6].Value);
										const scoringInforule7 = parseInt(scoringInfo.rules[7].Value);
										const scoringInforule8 = parseInt(scoringInfo.rules[8].Value);
										const scoringInforule9 = parseInt(scoringInfo.rules[9].Value);
										const scoringInforule11 = parseInt(scoringInfo.rules[10].Value);
										const scoringInforule12 = parseInt(scoringInfo.rules[11].Value);
										const scoringInforule13 = parseInt(scoringInfo.rules[12].Value);

										const rule1descrption = parseInt(scoringInfo.rules[0].descrption);
										const rule2descrption = parseInt(scoringInfo.rules[1].descrption);
										const rule3descrption = parseInt(scoringInfo.rules[2].descrption);
										const rule4descrption = parseInt(scoringInfo.rules[3].descrption);
										const rule5descrption = parseInt(scoringInfo.rules[4].descrption);
										const rule6descrption = parseInt(scoringInfo.rules[5].descrption);
										const rule7descrption = parseInt(scoringInfo.rules[6].descrption);
										const rule8descrption = parseInt(scoringInfo.rules[7].descrption);
										const rule9descrption = parseInt(scoringInfo.rules[8].descrption);
										const rule10descrption = parseInt(scoringInfo.rules[9].descrption);
										const rule11descrption = parseInt(scoringInfo.rules[10].descrption);
										const rule12descrption = parseInt(scoringInfo.rules[11].descrption);
										const rule13descrption = parseInt(scoringInfo.rules[12].descrption);
										var ruledatacount = [];

										// sails.log.info('scoringInforule1',scoringInforule1);
										// sails.log.info('rule1val',rule1val);

										if (scoringInforule1 < rule1val) {
											var rule1 = 1;
										} else {
											var rule1 = 0;
										}
										ruledatacount.push("R1: Months of Credit History : " + scoringInforule1);

										if (scoringInforule2 < rule2val) {
											var rule2 = 1;
										} else {
											var rule2 = 0;
										}
										ruledatacount.push("R2: Total Number of trade lines : " + scoringInforule2);

										if (scoringInforule3 > rule3val) {
											var rule3 = 1;
										} else {
											var rule3 = 0;
										}
										ruledatacount.push("R3: Inquiries in last 6 months : " + scoringInforule3);

										if (scoringInforule4 > rule4val) {
											var rule4 = 1;
										} else {
											var rule4 = 0;
										}
										ruledatacount.push("R4: Bankruptcy in last 24 months : " + scoringInforule4);

										if (scoringInforule5 > rule5val) {
											var rule5 = 1;
										} else {
											var rule5 = 0;
										}
										ruledatacount.push("R5: Foreclosure in last 12 months : " + scoringInforule5);

										if (scoringInforule6 > rule6val) {
											var rule6 = 1;
										} else {
											var rule6 = 0;
										}
										ruledatacount.push("R6: public records in last 24 months : " + scoringInforule6);

										if (scoringInforule7 > rule7val) {
											var rule7 = 1;
										} else {
											var rule7 = 0;
										}
										ruledatacount.push("R7: current 30+ day past due : " + scoringInforule7);

										if (scoringInforule8 > rule8val) {
											var rule8 = 1;
										} else {
											var rule8 = 0;
										}
										ruledatacount.push("R8: 30+ day past due occurrences w/in 24 months : " + scoringInforule8);

										if (scoringInforule9 > rule9val) {
											var rule9 = 1;
										} else {
											var rule9 = 0;
										}
										ruledatacount.push("R9: 60+ days past due in past 6 months : " + scoringInforule9);

										if (scoringInforule11 <= rule11val) {
											var rule11 = 1;
										} else {
											var rule11 = 0;
										}
										ruledatacount.push("R11: Total monthly payment on open, or closed with a balance > $0 trades, reported in past 6 month excluding authorized user trades, is less than or equal to 90 then decline: " + scoringInforule11);

										if (scoringInforule12 < rule12val) {
											var rule12 = 1;
										} else {
											var rule12 = 0;
										}
										ruledatacount.push("R12: Total monthly payment on open student trades reported in past 6 months is less than 100 then decline. If no student loan, do not reject: " + scoringInforule12);

										if (scoringInforule13 >= rule13val) {
											var rule13 = 1;
										} else {
											var rule13 = 0;
										}
										ruledatacount.push("R13: # of charged-off or collection in the past 3 months >= 1 then decline: " + scoringInforule13);

										const rule1Message = "R1: Months of Credit History  (Month) " + rule1valExactCond + "  " + rule1val + " then decline";
										const rule2Message = "R2: Total Number of trade lines " + rule2valExactCond + "  " + rule2val + " then decline";
										const rule3Message = "R3: Inquiries in last 6 months " + rule3valExactCond + "  " + rule3val + " then decline";
										const rule4Message = "R4: Bankruptcy in last 24 months " + rule4valExactCond + "  " + rule4val + " then decline";
										const rule5Message = "R5: Foreclosure in last 12 months " + rule5valExactCond + "  " + rule5val + " then decline";
										const rule6Message = "R6: Public records in last 24 months " + rule6valExactCond + "  " + rule6val + " then decline";
										const rule7Message = "R7: current 30+ day past due " + rule7valExactCond + "  " + rule7val + " then decline";
										const rule8Message = "R8: 30+ day past due occurrences w/in 24 months " + rule8valExactCond + "  " + rule8val + " then decline";
										const rule9Message = "R9: 60+ days past due in past 6 months " + rule9valExactCond + " " + rule9val + " then decline";
										const rule11Message = "R11: If the ratio of all bank trade balance reported in the past three months over the all bank trade credit limit is missing, then do knock-out.";
										const rule12Message = "R12: If the trade closed indicator is being chargeOffRepo and the number of trade reported in the past three months are equal or over two, then do knock-out.";
										const rule13Message = "R13: # of charged-off or collection in the past 3 months >= 1 then decline";

										if ((productname == "CA High Risk" && rule1 == 0 && rule2 == 0 && rule3 == 0 && rule4 == 0 && rule5 == 0 && rule6 == 0 && rule7 == 0 && rule8 == 0 && rule9 == 0 && rule11 == 0 && rule12 == 0 && rule13 == 0)) {
											//  || creditReport.dmstatus == 200
											var loanstatus = "Approved";
											/* if(creditReport.dmstatus==200){
														 var directmailstatus	= 'Yes';
													}else{
														 var directmailstatus	= 'No';
													}*/

											approvedrulemsg.push(rule1Message);
											approvedrulemsg.push(rule2Message);
											approvedrulemsg.push(rule3Message);
											approvedrulemsg.push(rule4Message);
											approvedrulemsg.push(rule5Message);
											approvedrulemsg.push(rule6Message);
											approvedrulemsg.push(rule7Message);
											approvedrulemsg.push(rule8Message);
											approvedrulemsg.push(rule9Message);
											approvedrulemsg.push(rule11Message);
											approvedrulemsg.push(rule12Message);
											approvedrulemsg.push(rule13Message);
										} else {
											var loanstatus = "Denied";
											// var directmailstatus = "No";
											if (rule1 > 0) {
												declinedrulemsg.push(rule1Message);
											} else {
												approvedrulemsg.push(rule1Message);
											}
											if (rule2 > 0) {
												declinedrulemsg.push(rule2Message);
											} else {
												approvedrulemsg.push(rule2Message);
											}
											if (rule3 > 0) {
												declinedrulemsg.push(rule3Message);
											} else {
												approvedrulemsg.push(rule3Message);
											}
											if (rule4 > 0) {
												declinedrulemsg.push(rule4Message);
											} else {
												approvedrulemsg.push(rule4Message);
											}
											if (rule5 > 0) {
												declinedrulemsg.push(rule5Message);
											} else {
												approvedrulemsg.push(rule5Message);
											}
											if (rule6 > 0) {
												declinedrulemsg.push(rule6Message);
											} else {
												approvedrulemsg.push(rule6Message);
											}
											if (rule7 > 0) {
												declinedrulemsg.push(rule7Message);
											} else {
												approvedrulemsg.push(rule7Message);
											}
											if (rule8 > 0) {
												declinedrulemsg.push(rule8Message);
											} else {
												approvedrulemsg.push(rule8Message);
											}
											if (rule9 > 0) {
												declinedrulemsg.push(rule9Message);
											} else {
												approvedrulemsg.push(rule9Message);
											}
											if (rule11 > 0) {
												declinedrulemsg.push(rule11Message);
											} else {
												approvedrulemsg.push(rule11Message);
											}
											if (rule12 > 0) {
												declinedrulemsg.push(rule12Message);
											} else {
												approvedrulemsg.push(rule12Message);
											}
											if (rule13 > 0) {
												declinedrulemsg.push(rule13Message);
											} else {
												approvedrulemsg.push(rule13Message);
											}
										}
									} else {
										var loanstatus = "Denied";
										var approvedrulemsg = "";
										declinedrulemsg.push("No Rules and Scoring information.");
										var ruledata = "";
										var ruledatacount = "";
									}

									// if( creditReport.dmstatus == 200 ) {
									// 	var directmailstatus = "Yes";
									// } else {
									// 	var directmailstatus = "No";
									// }
									const rulesdata = {
										code: 200,
										r1: rule1,
										r2: rule2,
										r3: rule3,
										r4: rule4,
										r5: rule5,
										r6: rule6,
										r7: rule7,
										r8: rule8,
										r9: rule9,
										r11: rule11,
										r12: rule12,
										r13: rule13,
										loanstatus: loanstatus,
										approvedrulemsg: approvedrulemsg,
										declinedrulemsg: declinedrulemsg,
										ruledata: ruledata,
										ruledatacount: ruledatacount,
										//directmailstatus: directmailstatus,
										scoringInfoid: scoringInfo.id,
										userScore: scoringInfo.score
									};
									return resolve(rulesdata);
								})
								.catch(function (err) {
									sails.log.error("Scoringengine#getscoringdetails::Err ::", err);
									return reject(err);
								});
						})
						.catch(function (err) {
							sails.log.error("ApplicationService#createcertificate::Err ::", err);
							return reject(err);
						});
				} else {
					return reject({ code: 400, message: "Invalid Product!" });
				}
			})
			.catch(function (err) {
				sails.log.error("ApplicationService#createcertificate::Err ::", err);
				return reject(err);
			});
	});
}

function getContractData(userId, programId, practiceId, screenId, ip, eftaCheckbox, funder, isPdf) {
	sails.log.info("ApplicationService.getPromissoryNoteData; userId:", userId);

	const responseData = {
		isBankAdded: false,
		cancelationPeriod: 0,
		completionPercent: 0,
		schoolCancelEmailAddress: "",
		fundedAmount: 0,
		incomeShare: 0,
		numbReqPayments: 0,
		paymentTerm: 0,
		floor: 0,
		floorMonthly: 0,
		ceiling: 0,
		gracePeriod: 0,
		paymentWindow: 0,
		downPaymentDiscount: 0,
		applicationFee: 0,
		latePaymentFee: 0,
		checkProcessFee: 0,
		returnCheckFee: 0,
		hypotheticalRange: 0,
		schoolName: "",
		customerName: "",
		schoolNameSigner: "",
		schoolTitleSigner: "",
		todaydate: moment().format("MM/DD/YYYY"),
		address: "",
		address2: "",
		cityStateZip: "",
		homePhone: "",
		mobilePhone: "",
		email: "",
		formAction: "/createpromissorypdf",
		type: "view",
		ip: ip,
		isPdf: isPdf,
		customerSignature: null,
		signatureExistHighCost: 0,
		signatureExistPromNote: 0,
		signatureIdHighCost: "",
		paymentSchedule: [],
		agreementsignpathHighCost: "",
		counterSignature: null,
		counterSignaturePath: "",
		eftaCheckbox: eftaCheckbox,
		partnerAdmin: funder,
		incrementalPaymentCap1: "--",
		incrementalPaymentCap2: "--",
		incrementalPaymentCap3: "--",
		incrementalPaymentCap4: "--",
		applicationReference: ""
	};

	return Promise.resolve()
		.then(() => {
			return Screentracking.findOne({ id: screenId }).populate("accounts")
		})
		.then((screendata) => {
			responseData.applicationReference = screendata.applicationReference;
			if (screendata.accounts) {
				responseData.bankAccountType = screendata.accounts.accountType;
				responseData.bankRoutingNumber = screendata.accounts.routingNumber;
				responseData.bankAccountNumber = screendata.accounts.accountNumber;
			}
			if (funder) {
				responseData.countersignDate = moment().format("MM/DD/YYYY");
				return Esignature.find({ practicemanagement: practiceId });
			} else {
				return null;
			}
		})
		.then((esignatures) => {
			if (esignatures && (esignatures.length > 0)) {
				for (let i = 0; i < esignatures.length; ++i) {
					if (esignatures[i].type == 16) {
						// partner counter signature exists
						responseData.counterSignature = esignatures[i];
						responseData.counterSignaturePath = Utils.getS3Url(esignatures[i].standardResolution);
						break;
					}
				}
			}
			return User.findOne({ id: userId })
		})
		.then((user) => {
			if (user) {
				responseData.user = user;
				responseData.customerName = `${user.firstName} ${user.lastName}`;
				responseData.address = `${user.street} ${user.unitapt}`;
				responseData.cityStateZip = `${user.city} ${user.state}, ${user.zipCode}`;
				responseData.phoneNumber = user.phoneNumber;
				responseData.email = user.email;
				responseData.practicemanagement = user.practicemanagement;
				responseData.isBankAdded = user.isBankAdded;
			}
			// Skipped over school and practicemanagement
			//return SchoolProgram.findOne( { id: programId } )
			return Esignature.find({ user_id: userId, screentracking: screenId, $or: [{ isDeleted: { $exists: false } }, { isDeleted: { $exists: true, $eq: false } }] })
		})
		// .then( ( schoolprogram ) => {
		// 	const paymentTable = createPaymentTable( schoolprogram.requiredPayments, schoolprogram.paymentCap, schoolprogram.incomePercent, schoolprogram.minimumIncome, schoolprogram.salaryProjectionDefault );
		// 	if( schoolprogram ) {
		// 		responseData.schoolprogram = schoolprogram;
		// 		responseData.incomePercent = schoolprogram.incomePercent;
		// 		responseData.requiredPayments = schoolprogram.requiredPayments;
		// 		responseData.minimumIncome = schoolprogram.minimumIncome;
		// 		responseData.monthlyMinimumIncome = schoolprogram.minimumIncome / 12;
		// 		responseData.annualSalary = schoolprogram.salaryProjectionDefault;
		// 		responseData.paymentCap = schoolprogram.paymentCap;
		// 		responseData.schoolName = schoolprogram.name;
		// 		responseData.paymentWindow = schoolprogram.paymentWindow;
		// 		responseData.advancedAmount = schoolprogram.advancedAmount;
		// 		responseData.advancedAmount1 = schoolprogram.advancedAmount * 1.5;
		// 		responseData.advancedAmount2 = schoolprogram.advancedAmount * 1.7;
		// 		responseData.advancedAmount3 = schoolprogram.advancedAmount * 2;
		// 		responseData.advancedAmount4 = schoolprogram.advancedAmount * 2.5;
		// 		if(schoolprogram.incrementalPaymentCaps && schoolprogram.incrementalPaymentCaps.length > 0) {
		// 			_.forEach(schoolprogram.incrementalPaymentCaps,(incrementalPaymentCap, i) => {
		// 				responseData["incrementalPaymentCap" + (i+1)] = incrementalPaymentCap.toLocaleString("en-US", { style: 'currency', currency: 'USD', maximumFractionDigits: 2, minimumFractionDigits: 2 } );
		// 			});
		// 		}

		// 		responseData.cancelationEmail = schoolprogram.cancelationEmail;
		// 		responseData.gracePeriod = schoolprogram.gracePeriod;
		// 		// responseData.cancelationPeriod = moment().add( schoolprogram.cancelationPeriod, "months" ).format( "MM-DD-YYYY" );
		// 		responseData.cancelationPeriod = schoolprogram.cancelationPeriod;
		// 		responseData.completionPercent = schoolprogram.completionPercent;
		// 		responseData.downPaymentDiscount = schoolprogram.downPaymentDiscount;
		// 		responseData.applicationFee = schoolprogram.applicationFee;
		// 		responseData.latePaymentFee = schoolprogram.latePaymentFee;
		// 		responseData.checkProcessFee = schoolprogram.checkProcessFee;
		// 		responseData.returnCheckFee = schoolprogram.returnCheckFee;
		// 		responseData.paymentTable = paymentTable.htmlLine;
		// 		responseData.lowIncomeRange = paymentTable.lowIncomeRange.toLocaleString( "en-US", { maximumFractionDigits: 0, minimumFractionDigits: 0 } );
		// 		responseData.highIncomeRange = paymentTable.highIncomeRange.toLocaleString( "en-US", { maximumFractionDigits: 0, minimumFractionDigits: 0 } );
		// 	}
		// } )

		// 	return PracticeManagement.findOne( { id: schoolprogram.school } )

		// .then( ( school ) => {
		// 	if( school ) {
		// 		responseData.schoolName = school.PracticeName;
		// 	}

		.then((esignatures) => {
			responseData.signatureExistHighCost = 0;
			if (esignatures.length > 0) {
				for (let i = 0; i < esignatures.length; ++i) {
					if (esignatures[i].type == 12) {
						// HighCost signature exists
						responseData.customerSignature = esignatures[i];
						responseData.signatureExistHighCost = 1;
						responseData.signatureIdHighCost = esignatures[i].id;
						responseData.agreementsignpathHighCost = Utils.getS3Url(esignatures[i].standardResolution);
					}
				}
			}
			return Agreement.findOne({ practicemanagement: new ObjectId(practiceId), documentKey: "131" })
				.then((agreement) => {
					responseData.promNotePath = `${agreement.documentPath}.nunjucks`;
					responseData.agreement = agreement;
					return UserBankAccount.findOne({ user: userId })
				})
				.then((bankInfo) => {
					if (bankInfo) {
						responseData.bankName = bankInfo.institutionName;
					}
					const result = { code: 200, data: responseData };
					return result;
				});
		});
	// } );
}

function reGeneratepromissorypdfAction(payId, userId, reqdata, resdata) {
	return Q.promise(function (resolve, reject) {
		// config set
		const promissorydocumentkey = "131";

		PaymentManagement.findOne({ id: payId })
			.populate("user")
			.populate("screentracking")
			.sort("createdAt DESC")
			.then(function (paymentDetails) {
				// sails.log.info("screenTrackingdata:::::", paymentDetails.screentracking);
				// sails.log.info("userData:::::", paymentDetails.user);

				const applicationReference = paymentDetails.screentracking.applicationReference;
				const userReference = paymentDetails.user.userReference;

				const userConsentDoc = { paymentManagement: payId, documentKey: promissorydocumentkey };
				const appApprovedDate = moment().format("MM/DD/YYYY");
				UserConsent.update(userConsentDoc, { loanupdated: 2, appApprovedDate: appApprovedDate }).exec(function afterwards(err, updated) {

					UserConsent.findOne({ documentKey: promissorydocumentkey, paymentManagement: payId })
						.sort("createdAt DESC")
						.then(function (userconsent) {
							UserConsent.createDuplicateConsent(userconsent, userId, userconsent.ip)
								.then(function (userconsentdetails) {
									const consentID = userconsentdetails.id;
									const newconsentcriteria = {
										id: consentID
									};
									UserConsent.update(newconsentcriteria, { paymentManagement: payId }).exec(function afterwards(err, updated) {
										// temporary purpose
										userconsentdetails.paymentManagement = payId;

										UserConsent.objectdataRegenerate(userId, reqdata, resdata, payId, userconsentdetails)
											.then(function (objectdatas) {
												// sails.log.info("objectdatas:::::", objectdatas);
												Agreement.findOne({ id: userconsentdetails.agreement })
													.then(function (agreementDetail) {
														const replacedFilename = agreementDetail.documentName.split(" ").join("_");

														const pdfFileName = "./" + applicationReference + "_" + replacedFilename + "_" + Math.round(+new Date() / 1000) + ".pdf";

														const IPFromRequest = userconsentdetails.ip;
														const indexOfColon = IPFromRequest.lastIndexOf(":");
														const ipaddr = IPFromRequest.substring(indexOfColon + 1, IPFromRequest.length);

														// var todaydate = moment().format('MM/DD/YYYY');
														const todaydate = moment(userconsent.signedAt).format("MM/DD/YYYY");
														const fname = objectdatas.fname;
														const lname = objectdatas.lname;
														const financedAmount = objectdatas.amount;
														const interestRateAmount = parseFloat(objectdatas.interestRate * 12).toFixed(2);
														const loanTerm = objectdatas.month;
														const scheduleLoanAmount = parseFloat(objectdatas.scheduleLoanAmount).toFixed(2);
														const checktotalLoanAmount = parseFloat(objectdatas.checktotalLoanAmount).toFixed(2);
														const creditcost = parseFloat(objectdatas.creditcost).toFixed(2);
														const screentrackingdetails = paymentDetails.screentracking;
														const userData = objectdatas.paymentmanagementdata.user;
														const practiceData = objectdatas.paymentmanagementdata.practicemanagement;
														const offerData = screentrackingdetails.offerData[0];
														const paymentSchedule = objectdatas.paymentmanagementdata.paymentSchedule;
														let offerdata = {};
														if (Array.isArray(screentrackingdetails.offerData)) {
															offerdata = screentrackingdetails.offerData[0];
														} else {
															offerdata = screentrackingdetails.offerData;
														}

														const tmpfrequency = ApplicationService.getPaymentFrequency(offerdata.paymentFrequency, true);
														const tmp = {
															amountFinanced: offerdata.financedAmount,
															financeCharge: parseFloat(offerdata.financeCharge),
															downpayment: offerdata.downPayment
														};

														const agreementObject = {
															user: fname,
															date: moment.utc(new Date()).format(),
															agreement: agreementDetail
														};

														const screenID = paymentDetails.screentracking.id;
														const signaturecriteria = { screentracking: screenID, active: 1 };

														Esignature.find(signaturecriteria)
															.sort("createdAt DESC")
															.then(function (signatureDetails) {
																let signatureExistHighCost = 0;
																let signatureExistPromNote = 0;
																let signatureIdHighCost = "";
																let signatureIdPromNote = "";
																let agreementsignpathHighCost = "";
																let agreementsignpathPromNote = "";

																if (signatureDetails.length > 0) {
																	for (let i = 0; i < signatureDetails.length; i++) {
																		if (signatureDetails[i].type == 12) {
																			// HighCost signature exists
																			signatureExistHighCost = 1;
																			signatureIdHighCost = signatureDetails[i].id;
																			agreementsignpathHighCost = Utils.getS3Url(signatureDetails[i].standardResolution);
																		}
																		if (signatureDetails[i].type == 13) {
																			// PromNote signature exists
																			signatureExistPromNote = 1;
																			signatureIdPromNote = signatureDetails[i].id;
																			agreementsignpathPromNote = Utils.getS3Url(signatureDetails[i].standardResolution);
																		}
																	}
																}

																const firstPaymentDate = new Date(objectdatas.paymentmanagementdata.loanStartdate);
																firstPaymentDate.setDate(firstPaymentDate.getDate() + 30);

																const finalresponseData = {

																	interestRate: parseInt(offerdata.interestRate),
																	fundingDate: moment(Date.now()).format("MM/DD/YYYY"),
																	loanID: screentrackingdetails.applicationReference,
																	loanTerm: offerdata.loanTerm,
																	frequency: tmpfrequency,
																	paymentAmount: parseFloat(offerdata.monthlyPayment),
																	firstPaymentDate: moment(firstPaymentDate).format("MM/DD/YYYY"),
																	paymentSchedule: paymentSchedule,
																	downpayment: tmp.downpayment,
																	apr: parseFloat(parseFloat(offerdata.apr).toFixed(2)),
																	financeCharge: tmp.financeCharge,
																	amountFinanced: tmp.amountFinanced,
																	totalOfPayments: tmp.amountFinanced + tmp.financeCharge,
																	totalSalePrice: tmp.amountFinanced + tmp.financeCharge + tmp.downpayment,
																	cashPrice: tmp.amountFinanced + tmp.downpayment,
																	practiceRICPath: agreementObject.agreement.documentPath + "_pdf.nunjucks",
																	isPdf: true,

																	userName: paymentDetails.user.firstName + " " + paymentDetails.user.lastname,
																	street: paymentDetails.user.street,
																	city: paymentDetails.user.city,
																	state: paymentDetails.user.state,
																	zipCode: paymentDetails.user.zipCode,
																	unitapt: paymentDetails.user.unitapt,

																	signatureExistHighCost: signatureExistHighCost,
																	signatureExistPromNote: signatureExistPromNote,
																	signatureIdHighCost: signatureIdHighCost,
																	signatureIdPromNote: signatureIdPromNote,
																	agreementsignpathHighCost: agreementsignpathHighCost,
																	agreementsignpathPromNote: agreementsignpathPromNote,

																	ip: ipaddr,
																	userid: userId,
																	todaydate: todaydate,
																	financedAmount: financedAmount,
																	scheduleLoanAmount: scheduleLoanAmount,
																	checktotalLoanAmount: checktotalLoanAmount,
																	creditcost: creditcost,
																	screentrackingdetails: screentrackingdetails,
																	type: "pdf",
																	practiceData: practiceData,
																	userData: userData,
																	offerData: offerData,
																	appApprovedDate: appApprovedDate
																};
																resdata.render("document/pdfwrapper.nunjucks", finalresponseData, function (err, list) {
																	const options = {
																		format: "Letter",
																		orientation: "portrait",
																		zoomFactor: "1",
																		type: "pdf",
																		quality: "75",
																		paginationOffset: 1,
																		border: {
																			top: "25px",
																			right: "15px",
																			bottom: "25px",
																			left: "15px"
																		}
																	};

																	pdf.create(list, options).toFile(pdfFileName, function (err, result) {
																		if (err) {
																			return reject(err);
																		}

																		const criteria = {
																			id: consentID
																		};

																		UserConsent.findOne(criteria)
																			.then(function (userConsentData) {
																				userConsentData.applicationReference = applicationReference;
																				userConsentData.userReference = userReference;

																				S3Service.reuploadPromissoryAgreementAsset(pdfFileName, userConsentData, applicationReference, userReference, reqdata);
																				return resolve(userConsentData);
																			})
																			.catch(function (err) {
																				return reject(err);
																			});
																	});
																});
															})
															.catch(function (err) {
																return reject(err);
															});
													})
													.catch(function (err) {
														return reject(err);
													});
											})
											.catch(function (err) {
												return reject(err);
											});
									});
								})
								.catch(function (err) {
									return reject(err);
								});
						})
						.catch(function (err) {
							return reject(err);
						});
				});
			})
			.catch(function (err) {
				return reject(err);
			});
	});
}

function getPromissoryNoteData(req, screentrackingId, userObjId = null) {
	const userId = userObjId || req.session.userId;
	sails.log.info("ApplicationService.getPromissoryNoteData; userId:", userId);

	const responseData = {
		formAction: "/createpromissorypdf",
		userName: "",
		street: "",
		city: "",
		state: "",
		zipCode: "",
		unitapt: "",
		phoneNumber: "",
		applicationReference: "",
		fundingDate: "",
		finalPaymentDate: "",
		apr: 0,
		interestRate: 0,
		financeCharge: 0,
		amountFinanced: 0,
		totalOfPayments: 0,
		numberOfPayments: 0,
		paymentAmount: 0,
		frequency: "",
		firstPaymentDate: "",
		finalPaymentAmount: 0,
		applicationFee: 0,
		totalLoanAmount: 0,
		bankName: "",
		bankAccountType: "",
		bankRoutingNumber: "",
		bankAccountNumber: "",
		signatureExistHighCost: 0,
		signatureExistPromNote: 0,
		signatureIdHighCost: "",
		signatureIdPromNote: "",
		paymentSchedule: [],
		agreementsignpathPromNote: "",
		todaydate: moment().format("MM/DD/YYYY"),
		type: "view",
		ip: (req.headers["x-forwarded-for"] || req.headers["x-real-ip"] || req.connection.remoteAddress).replace("::ffff:", "").replace(/^::1$/, "127.0.0.1"),
		isPdf: false,
		businessPurposesCheckbox: req.session.businessPurposesCheckbox,
		brokerParticipatedCheckbox: req.session.brokerParticipatedCheckbox,
		eftaCheckbox: req.session.eftaCheckbox,
		eftaSignatureRequired: true,
		test: "GOOD"
	};
	// req.session.businessPurposesCheckbox = "";
	// req.session.brokerParticipatedCheckbox = "";
	// req.session.eftaCheckbox = "";

	return User.findOne({ id: userId })
		.then((user) => {
			if (user) {
				responseData.userName = `${user.firstName} ${user.lastName}`;
				responseData.street = user.street;
				responseData.unitapt = user.unitapt;
				responseData.city = user.city;
				responseData.state = user.state;
				responseData.zipCode = user.zipCode;
				responseData.phoneNumber = user.phoneNumber;
				responseData.practicemanagement = user.practicemanagement;
			}

			const screentrackingCriteria = (screentrackingId ? { id: screentrackingId } : { user: userId, isCompleted: false });
			return Screentracking.findOne(screentrackingCriteria)
				.populate("accounts")
				.populate("paymentmanagement")
				.then((screentracking) => {
					if (!screentracking) {
						sails.log.error("ApplicationService.getPromissoryNoteData; not found! -- criteria:", screentrackingCriteria, "session:", JSON.stringify(req.session), "params:", JSON.stringify(req.allParams()));
						return { code: 400 };
					}
					const paymentSchedule = screentracking.paymentmanagement.paymentSchedule;
					responseData.paymentSchedule = paymentSchedule;
					const psd = [{ amount: 120.22, date: "04/19/2020" }, { amount: 120.22, date: "05/19/2020" }, { amount: 120.22, date: "06/19/2020" }, { amount: 120.22, date: "07/19/2020" }];

					// paymentSchedule.forEach(ps=>{
					// 	psd.push(ps);
					// })

					responseData.interestRate = parseInt(screentracking.offerData[0].interestRate);
					responseData.fundingDate = moment(Date.now()).format("MM/DD/YYYY");
					responseData.loanID = screentracking.applicationReference;
					responseData.loanTerm = screentracking.offerData[0].term;
					responseData.frequency = getPaymentFrequency(screentracking.offerData[0].paymentFrequency, true);
					responseData.paymentAmount = parseFloat(screentracking.offerData[0].monthlyPayment);
					responseData.firstPaymentDate = moment().add(30, "days").format("MM/DD/YYYY");
					responseData.downpayment = screentracking.offerData[0].downPayment;
					if (!screentracking.offerData[0].apr) {
						screentracking.offerData[0]["apr"] = screentracking.offerData[0].interestRate;
					}
					responseData.apr = parseFloat(parseFloat(screentracking.offerData[0].apr).toFixed(2));
					responseData.financeCharge = parseFloat(screentracking.offerData[0].financeCharge);
					responseData.amountFinanced = screentracking.offerData[0].financedAmount;
					responseData.totalOfPayments = parseFloat((responseData.amountFinanced + responseData.financeCharge).toFixed(2));
					responseData.totalSalePrice = parseFloat((responseData.amountFinanced + responseData.financeCharge + responseData.downpayment).toFixed(2));
					responseData.cashPrice = responseData.amountFinanced + responseData.downpayment;
					responseData.testing = "WORKING";


					return UserBankAccount.findOne({ user: userId, id: screentracking.userBankAccount })
						.then((userbankaccount) => {
							if (userbankaccount) {
								responseData.bankName = userbankaccount.institutionName;
								responseData.bankAccountType = screentracking.accounts.accountSubType;
								responseData.bankAccountNumber = screentracking.accounts.accountNumber;
								responseData.bankRoutingNumber = screentracking.accounts.routingNumber;
							}

							return Esignature.find({ user_id: userId, screentracking: screentracking.id, $or: [{ isDeleted: { $exists: false } }, { isDeleted: { $exists: true, $eq: false } }] })
								.then((esignatures) => {
									responseData.signatureExistHighCost = 0;
									responseData.signatureExistPromNote = 0;
									if (esignatures.length > 0) {
										for (let i = 0; i < esignatures.length; ++i) {
											if (esignatures[i].type == 12) {
												// HighCost signature exists
												responseData.signatureExistHighCost = 1;
												responseData.signatureIdHighCost = esignatures[i].id;
												responseData.agreementsignpathHighCost = Utils.getS3Url(esignatures[i].standardResolution);
											}
											if (esignatures[i].type == 13) {
												// PromNote signature exists
												responseData.signatureExistPromNote = 1;
												responseData.signatureIdPromNote = esignatures[i].id;
												responseData.agreementsignpathPromNote = Utils.getS3Url(esignatures[i].standardResolution);
											}
										}
									}
									return Agreement.findOne({ practicemanagement: responseData.practicemanagement, documentKey: "131" })
										.then((agreement) => {
											responseData.promNotePath = `${agreement.documentPath}.nunjucks`;
											// const result = { code: 200, data: responseData };
											// sails.log.verbose( "ApplicationService.getPromissoryNoteData; result:", JSON.stringify( result ) );
											return responseData;
										});
								});
						})
						.catch((err) => {
							sails.log.error("ApplicationService.getPromissoryNoteData; catch:", err, "session:", JSON.stringify(req.session), "params:", JSON.stringify(req.allParams()));
							return { code: 500, data: null };
						});
				})
				.catch((err) => {
					sails.log.error("ApplicationService.getPromissoryNoteData; catch:", err, "session:", JSON.stringify(req.session), "params:", JSON.stringify(req.allParams()));
					return { code: 500, data: null };
				});
		})
		.catch((err) => {
			sails.log.error("ApplicationService.getPromissoryNoteData; catch:", err, "session:", JSON.stringify(req.session), "params:", JSON.stringify(req.allParams()));
			return { code: 500, data: null };
		});
}

function getPaymentFrequency(freq, human) {
	switch (freq.toLowerCase()) {
		case "weekly":
		case "loan.frequency.weekly":
			return (human ? "Weekly" : "weekly");
		case "biweekly":
		case "bi-weekly":
		case "loan.frequency.biweekly":
			return (human ? "Bi-Weekly" : "bi-weekly");
		case "semimonthly":
		case "semi-monthly":
		case "loan.frequency.semimonthly":
			return (human ? "Semi-Monthly" : "semi-monthly");
		case "monthly":
		case "loan.frequency.monthly":
			return (human ? "Monthly" : "monthly");
	}
}


function getProductRuleBanking(screentracking) {
	const userId = (screentracking.user.id || screentracking.user);
	const rulesFn = { r11, r12, r13, r14 };
	const ruleStatus = {};
	const operatorMap = { "eq": "=", "gt": ">", "gte": ">=", "lt": "<", "lte": "<=", "ne": "!=" };
	const ruleCriteria = {
		product: sails.config.product.productid,
		$and: [{ $or: [{ ruleid: "r11" }, { ruleid: "r12" }, { ruleid: "r13" }, { ruleid: "r14" }] }]
	};
	let userBankAccounts;
	let checkingAccounts = [];
	let offers;
	return Screentracking.getOffers(screentracking, false, 0, 0)
		.then((screentracking) => {
			offers = screentracking.offers;
			// sails.log.verbose( "getProductRuleBanking; offers:", offers );
			return UserBankAccount.find({ user: userId, screentracking: screentracking.id })
				.then((userbankaccounts) => {
					userBankAccounts = userbankaccounts;
					_.forEach(userBankAccounts, (userbankaccount) => {
						_.forEach(userbankaccount.accounts, (account) => {
							if (account.type == "depository" && account.subtype == "checking") {
								checkingAccounts.push(account);
							}
						});
					});
				});
		})
		.then(() => {
			return ProductRules.find(ruleCriteria)
				.sort("ruleid ASC")
				.then((productrules) => {
					sails.log.verbose("getProductRuleBanking; productrules:", productrules);
					_.forEach(productrules, (productrule) => {
						ruleStatus[productrule.ruleid] = { status: -1 };
						if (rulesFn.hasOwnProperty(productrule.ruleid)) {
							return rulesFn[productrule.ruleid](productrule);
						}
					});
				});
		})
		.then(() => {
			sails.log.verbose("getProductRuleBanking; ruleStatus:", JSON.stringify(ruleStatus, null, 4));
			const rulesDetails = screentracking.rulesDetails;
			_.forEach(ruleStatus, (rule, ruleid) => {
				rulesDetails[ruleid] = (rule.status ? 1 : 0);
				rulesDetails.ruledatacount.push(rule.count);
				if (rule.status) {
					rulesDetails.code = 400;
					rulesDetails.loanstatus = "Denied";
					rulesDetails.declinedrulemsg.push(rule.description);
					screentracking.lockCreditTier = "G";
					return;
				}
				rulesDetails.approvedrulemsg.push(rule.description);
			});
			sails.log.info("getProductRuleBanking; rulesDetails:", JSON.stringify(rulesDetails, null, 4));
			return screentracking.save()
				.then(() => screentracking.rulesDetails);
		});

	function r11(productrule) {
		const payrolls = _.get(screentracking, "payrolldata", []);
		let monthlyIncome = 0;
		_.forEach(payrolls, (payroll) => {
			monthlyIncome = MathExt.float(monthlyIncome + (payroll.annualIncome / 12));
		});
		ruleStatus[productrule.ruleid].description = `R11: ${productrule.description} (${monthlyIncome}) ${operatorMap[productrule.declinedif]} ${productrule.value}`;
		ruleStatus[productrule.ruleid].count = `R11: ${productrule.description} : ${monthlyIncome}`;
		ruleStatus[productrule.ruleid].status = testCondition(monthlyIncome, productrule.declinedif, parseFloat(productrule.value));
	}

	function r12(productrule) {
		let postDTI = 0;
		let anyValidOffers = false;
		let highestValidDTI = 0;
		let lowestInvalidDTI = 0;
		_.forEach(offers, (offer) => {
			if (offer.postDTIPercentValue <= 50) {
				anyValidOffers = true;
				highestValidDTI = Math.max(highestValidDTI, offer.postDTIPercentValue);
			} else {
				if (lowestInvalidDTI == 0) lowestInvalidDTI = offer.postDTIPercentValue;
				lowestInvalidDTI = Math.min(lowestInvalidDTI, offer.postDTIPercentValue);
			}
		});
		postDTI = MathExt.float(((anyValidOffers ? highestValidDTI : lowestInvalidDTI) / 100), 2);
		// sails.log.verbose( "getProductRuleBanking.r12;", anyValidOffers, highestValidDTI, lowestInvalidDTI, postDTI );
		ruleStatus[productrule.ruleid].description = `R12: ${productrule.description} (${postDTI}) ${operatorMap[productrule.declinedif]} ${productrule.value}`;
		ruleStatus[productrule.ruleid].count = `R12: ${productrule.description} : ${postDTI}`;
		ruleStatus[productrule.ruleid].status = testCondition(postDTI, productrule.declinedif, parseFloat(productrule.value));
	}

	function r13(productrule) {
		let availableBalance = 0;
		_.forEach(checkingAccounts, (account) => {
			const bal = _.get(account, "balance.available", 0);
			availableBalance = Math.max(availableBalance, bal);
		});
		ruleStatus[productrule.ruleid].description = `R13: ${productrule.description} (${availableBalance}) ${operatorMap[productrule.declinedif]} ${productrule.value}`;
		ruleStatus[productrule.ruleid].count = `R13: ${productrule.description} : ${availableBalance}`;
		ruleStatus[productrule.ruleid].status = testCondition(availableBalance, productrule.declinedif, parseFloat(productrule.value));
	}

	function r14(productrule) {
		let overdrafts = 0;
		const categories = ["10001000", "10007000"];
		const recentMonths = moment().startOf("day").subtract(3, "months");
		_.forEach(userBankAccounts, (userbankaccount) => {
			_.forEach(userbankaccount.transactions, (account) => {
				_.forEach(account, (transaction) => {
					if (categories.indexOf(transaction.category_id) >= 0 && moment(transaction.date) >= recentMonths) {
						++overdrafts;
					}
				});
			});
		});
		ruleStatus[productrule.ruleid].description = `R14: ${productrule.description} (${overdrafts}) ${operatorMap[productrule.declinedif]} ${productrule.value}`;
		ruleStatus[productrule.ruleid].count = `R14: ${productrule.description} : ${overdrafts}`;
		ruleStatus[productrule.ruleid].status = testCondition(overdrafts, productrule.declinedif, parseFloat(productrule.value));
	}
}


function testCondition(value, operator, threshold) {
	switch (operator.toLowerCase()) {
		case "eq":
			return (value == threshold);
		case "gt":
			return (value > threshold);
		case "gte":
			return (value >= threshold);
		case "lt":
			return (value < threshold);
		case "lte":
			return (value <= threshold);
		case "ne":
			return (value != threshold);
	}
}

async function createEFTA(accountid, userdata, screendata, paydata, ip, reqdata, resdata) {
	try {
		/* create the consent record */
		const agreement = await Agreement.findOne({ $and: [{ practicemanagement: screendata.practicemanagement }, { documentKey: "125" }] });

		/* Set create argument to true when calling createConsentfordocument to make sure it creates a new document instead of updating an existing one */
		const userconsent = await UserConsent.createConsentfordocuments(agreement, userdata, ip, screendata.id, null, true);

		/* create the pdf versions */
		await UserConsent.createStaticAgreementPdf(userconsent.id, userconsent, screendata.applicationReference, ip, accountid, screendata.practicemanagement, resdata, reqdata);

		let latestConsent = userconsent;
		if (paydata) {
			/* there is a contract: update the consent object to be associated with the new account */
			latestConsent = await UserConsent.update({ id: userconsent.id }, { paymentManagement: paydata.id })[0];

			const updateData = {};
			if (sails.config.feature && sails.config.feature.employmentHistory) {
				/* update paymentmanagement */
				const employmentdata = await EmploymentHistory.findOne({ paymentmanagement: paydata.id });
				let status;
				let active;

				if (employmentdata && employmentdata.verifiedIncome) {
					updateData.achstatus = 1;
					if (employmentdata.verifiedIncome >= paydata.minimumIncome) {
						status = sails.config.paymentManagementStatus.active;
						active = true;
					} else {
						status = sails.config.paymentManagementStatus.deferred;
						active = false;
					}
					updateData.status = status;
					updateData.isPaymentActive = active;
				}
			}

			if (accountid) {
				updateData.account = accountid;
			}

			await PaymentManagement.update({ id: paydata.id }, updateData);
		}
		return { code: 200, consent: latestConsent };
	} catch (err) {
		return { code: 400, error: err };
	}
}

async function getContractPaymentSchedule(screentracking, originalScheduleStartDate, offerData) {

	const today = moment().startOf("day");
	if (!screentracking || !offerData || offerData.length <= 0) {
		throw new Error("Unable to get contract payment schedule. Missing offer and application data.")
	}
	// paySchedule = await SmoothPaymentService.generatePaymentSchedule(
	// 		today,
	// 		scheduledStartDate,
	// 		screentracking.requestedLoanAmount,
	// 		SmoothPaymentService.paymentFrequencyEnum.BI_WEEKLY,
	// 		"daily based",
	// 		offerData.interestRate.toFixed(2) / 100,
	// 		offerData.term
	// );

	// if(screentracking.isAChangeSchedule) {
	// 	const paymentManagement = await PaymentManagement.findOne({screentracking: screentracking.id});
	// 	if(paymentManagement) {
	// 		let nextPaymentScheduleAfterChange = null;
	// 		let lastScheduleItemMade = null;
	// 		for(let scheduleItem of paymentManagement.paymentSchedule) {
	// 			if(["PAID", "WAIVED"].indexOf(scheduleItem.status) >= 0 && moment(scheduleItem.date).startOf("day").isSameOrBefore(today)) {
	// 				lastScheduleItemMade = scheduleItem;
	// 			}
	// 			if(["OPEN", "OPENED"].indexOf(scheduleItem.status) >= 0 && moment(scheduleItem.date).startOf("day").isSameOrAfter(today)) {
	// 				nextPaymentScheduleAfterChange = scheduleItem;
	// 			}
	// 		}
	// 		if(nextPaymentScheduleAfterChange && lastScheduleItemMade) {
	// 			const ledger = PlatformSpecificService.getPaymentLedger(paymentManagement, today);
	// 			if(ledger && ledger.principalPayoff) {
	// 				// SmoothPaymentService.generatePaymentSchedule(Orig_date, scheduled_date, beg_balance, pay_cycle, method, apr, numberOfPayments, placeDateAfterHoliday = false)
	// 				paymentScheduleObj = await SmoothPaymentService.generatePaymentSchedule(moment(lastScheduleItemMade).startOf("day").toDate(), moment(nextPaymentScheduleAfterChange).startOf("day").toDate(),
	// 						ledger.principalPayoff, SmoothPaymentService.paymentFrequencyEnum.BI_WEEKLY, "daily based", $ize($ize(offerData[0].apr) / 100), offerData[0].term);
	// 				if(paymentScheduleObj && paymentScheduleObj.paymentSchedule && paymentScheduleObj.paymentSchedule.length > 0) {
	// 					return paymentScheduleObj;
	// 					// screentracking["totalPaymentsFeeChargedAmount"] = paySchedule.total_fee_charge
	// 					// let totalPaymentAmount = 0
	// 					// for(let payment of paySchedule.paymentSchedule){
	// 					// 	totalPaymentAmount += payment.amount
	// 					// }
	// 				}
	// 			}
	// 		}
	// 	}
	// }

	let paymentScheduleObj = await SmoothPaymentService.generatePaymentSchedule(
		today,
		originalScheduleStartDate,
		screentracking.requestedLoanAmount,
		screentracking.paymentFrequency || SmoothPaymentService.paymentFrequencyEnum.BI_WEEKLY,
		"daily based",
		$ize($ize(offerData[0].apr) / 100),
		offerData[0].term,
		1,
		screentracking.isAfterHoliday || 0
	);
	return paymentScheduleObj;
}
async function getLatestEligibleReapplyApplicationForUser(user) {
	if (user && !!user.id) {
		let screentrackings = await Screentracking.find({ user: user.id }).sort({ createdAt: -1 });
		if (screentrackings && screentracking.lengths > 0) {
			return screentrackings[0];
		}
		return null;
	}
}
async function isUserEligibleToReApply(user) {
	if (user && !!user.id) {
		let recentLoan = await PaymentManagement.getMostRecentReApplyLoanForUser(user);
		let paymentmanagement = await PaymentManagement.findOne({ user: user.id });
		if (paymentmanagement === undefined) return false; // Prevents errors and prevents re-application on unprocessed leads
		if (paymentmanagement.eligiblereapply === false || paymentmanagement.eligiblereapply === "0") {
			return false;
		}
		if (!recentLoan.screentracking && !recentLoan.paymentManagement) {
			return false;
		}
		return true;
	}
	return false;
}
async function logLoanActivity(loggedInUser, paymentId, moduleName, message, additionalLogDataObject = null) {
	if (!loggedInUser || !paymentId || !moduleName || !message) {
		throw new Error("Unable to log loan activity. Missing required parameters.");
	}
	// sails.log.info( "CollectionService#logColllectionActivity Logging with user", loggedInUser );
	const logReferenceData = await User.getNextSequenceValue("logs");
	// sails.log.info( "Collections logReferenceData", logReferenceData );
	const logReference = `LOG_${logReferenceData.sequence_value}`;

	const logDetails = await Logactivity.create({
		adminuser: loggedInUser.id,
		email: loggedInUser.email,
		modulename: moduleName,
		logmessage: message,
		logdata: additionalLogDataObject,
		logreference: logReference,
		paymentManagement: paymentId
	});
	return logDetails;
}


async function updateReApplyEmployment(newEmployment, user) {
	if (newEmployment && user && !!user.id) {
		newEmployment["user"] = user.id;
		return EmploymentHistory.create(newEmployment);
	}
	throw new Error("Unable to update employment information. User and/or employment data is missing. ");
}
async function updateUserWithRevision(newUser, userId) {
	if (newUser) {
		let existingUser = null;
		if (!!userId) {
			existingUser = await User.findOne({ id: userId });
		}
		if (!existingUser) {
			existingUser = await User.findOne({ email: newUser.email, ssn_number: newUser.ssn_number });
		}
		if (existingUser) {
			if (!!newUser.state && existingUser.state !== newUser.state) {
				const stateObj = await State.findOne({ stateCode: newUser.state });
				if (stateObj) {
					newUser["_state"] = stateObj.id;
				} else {
					newUser["_state"] = null;
				}
			}
			const parsedUpdatedProperties = getUpdatedUserProperties(existingUser, newUser);
			if (Object.keys(parsedUpdatedProperties).length > 0) {
				await UserRevisionHistory.createNewRevision(existingUser);
				const userUpdate = await User.update({ id: userId }, getUpdatedUserProperties(existingUser, newUser));
				if (userUpdate && userUpdate.length > 0) {
					return userUpdate[0];
				}
			} else {
				return existingUser
			}
		}
	}
	throw new Error("Unable to update user information. User does not exist. A new application is needed.")
}
async function updateReapplyBankAccount(newUserBankAccount, newAccount, user, paymentManagementUpdate) {
	if (user && user.id) {
		let account = null;
		if (!!paymentManagementUpdate.accountId) {
			const existingAccount = await Account.findOne({ id: paymentManagementUpdate.accountId });
			if (existingAccount) {
				account = existingAccount;
			}
		}

		let existingUserBankAccount = null;
		if (account && !!account.userBankAccount) {
			existingUserBankAccount = await UserBankAccount.findOne({ id: account.userBankAccount });
		}
		if (existingUserBankAccount) {
			const parsedUpdatedUserBankAccountProperties = getUpdatedUserProperties(existingUserBankAccount, newUserBankAccount);
			if (Object.keys(parsedUpdatedUserBankAccountProperties).length > 0) {
				await UserBankAccount.update({ id: account.userBankAccount }, parsedUpdatedUserBankAccountProperties);
				newAccount["userBankAccount"] = existingUserBankAccount.id;
			}
		} else {
			newUserBankAccount["user"] = user.id;
			existingUserBankAccount = await UserBankAccount.create(newUserBankAccount);
			if (existingUserBankAccount) {
				newAccount["userBankAccount"] = existingUserBankAccount.id;
			}
		}

		if (account) {
			const parsedUpdatedAccountProperties = getUpdatedUserProperties(account, newAccount);
			const accountUpdate = await Account.update({ id: account.id }, parsedUpdatedAccountProperties);
			if (accountUpdate && accountUpdate.length > 0) {
				return accountUpdate[0];
			}
		} else {
			return await Account.create(newAccount);
		}
	}
	return null;
}

async function updateEmploymentInfo(employmentData, userId) {
	if (employmentData && !!userId) {
		const employment = await EmploymentHistory.getLatestEmploymentHistoryForUser(userId);
		if (employment) {
			const parsedUpdatedProperties = getUpdatedUserProperties(employment, employmentData);
			if (Object.keys(parsedUpdatedProperties).length > 0) {
				const updatedEmployer = await EmploymentHistory.update({ id: employment.id }, parsedUpdatedProperties);
				if (updatedEmployer && updatedEmployer.length > 0) {
					return updatedEmployer[0];
				}
			}
			return employment;
		}
	}
	throw new Error("Unable to update employment information. Employer does not exist.")
}
async function updateUserBankAccountInfo(bankData, userBankAccountId) {
	if (bankData && !!userBankAccountId) {
		const account = await Account.findOne({ userBankAccount: userBankAccountId }).populate("userBankAccount");
		if (account && account.userBankAccount) {
			const newUserBankAccountData = await BankService.getUpdateBankObjectsManualPathObject(account.user, bankData.accountNumber, bankData.accountName, account.userBankAccount.institutionType, bankData.routingNumber, account.userBankAccount.Screentracking)
			await UserBankAccount.update({ id: account.userBankAccount.id }, newUserBankAccountData);
			await Account.update({ id: account.id }, bankData);
			return account;
		}
	}
	throw new Error("Unable to update bank account information. Bank was not found or required data is missing.");
}

function getUpdatedUserProperties(user, newUser) {
	if (newUser) {
		if (user) {
			const newUserObj = {}
			_.forEach(Object.keys(newUser), (reApplyUserKey) => {
				if (reApplyUserKey !== "id" && ((!user[reApplyUserKey] && !!newUser[reApplyUserKey]) || (!!user[reApplyUserKey] && user[reApplyUserKey] !== newUser[reApplyUserKey]))) {
					newUserObj[reApplyUserKey] = newUser[reApplyUserKey];
				}
			});
			return newUserObj;
		}
		delete newUser.id;
		return newUser;
	}
	delete user.id;
	return user;
}
