/* global sails, Screentracking, PracticeManagement, FactorTrustLendProtectHistory, Transunions, Consolidateaccount, EmailService */

"use strict";

const _ = require( "lodash" );
const EventEmitter = require( "events" );
const fs = require( "fs" );
const moment = require( "moment" );
const parseAddress = require( "parse-address" );
const path = require( "path" );
const xml2js = require( "xml2js" );
const axios = require("axios");
const https = require("https")
const config = sails.config.factorTrust.lendProtect;
const parser = new xml2js.Parser( { ignoreAttrs: false, mergeAttrs: true, charkey: "_", explicitArray: false } );
const builder = new xml2js.Builder();
class FactorTrustLendProtectService extends EventEmitter {
	constructor() {
		super();
		this.config = config;
	}
	
	/**
	 * Run or pull credit report
	 * @param user
	 * @param screentracking
	 * @param isHardPull
	 * @returns {Promise<*|null|*|*>}
	 */
	async getOrRunCreditReport(user,screentracking, isHardPull = false) {
		const creditReport = await this.getCreditReport(screentracking);
		if(!creditReport) {
			const newCreditReport = await this.runCreditReport(user,screentracking,isHardPull);
			if(newCreditReport && newCreditReport.code === 200) {
				return newCreditReport.lendProtectReport;
			}
		}else {
			return creditReport;
		}
	}

	async getRiskScore(screentracking) {
		const factorTrustReport = await this.getCreditReport(screentracking);

		if (factorTrustReport) {
			const { raw: report } = factorTrustReport;

			return factorTrustReport.getScorecard(report);
		}

		throw new Error("Factor Trust report not found");
	}
	
	/**
	 * get credit report
	 * @param {User} user
	 * @param {Screentracking} screentracking
	 * @return {Promise}
	 */
	async runCreditReport( user, screentracking, isHardPull = false ) {
		let response = null;
		const result = { code: 400, lendProtectReport: null };
		if(!user || !user.id || !screentracking || !screentracking.id) {
			throw new Error("Unable to retrieve factor trust report. Missing user and application data.");
		}
		let factorTrustHistory = null;
		try{
			const xmlData = await getXMLRequest(screentracking,user);
			
			factorTrustHistory = await FactorTrustLendProtectHistory.updateOrCreateCreditPullHistory({
				user: user.id,
				request: xmlData
			})
			
			sails.log.info("FactorTrustLendProtectService.runCreditReport#Request Data", { config: this.config, body: xmlData });
			response = await axios.post(this.config.apiUrl,xmlData, {headers: { "Content-Type": "text/xml" }})
			
			if(!!response && !!response.data && response.data.trim().indexOf("<?xml") === 0) {
				factorTrustHistory = await FactorTrustLendProtectHistory.updateOrCreateCreditPullHistory({response: response.data},  factorTrustHistory.id);
				// sails.log.verbose( "FactorTrustLendProtectService.runCreditReport; body:", response.data );
				
				const jsonResponse = await parseXMLResponse(response.data);

				sails.log.info("FactorTrustLendProtectService.runCreditReport#jsonResponse", jsonResponse);

				if(jsonResponse && jsonResponse.ApplicationResponse) {
					const lendProtectReport = await FactorTrustLendProtect.saveLendProtectResponse(user.id, jsonResponse.ApplicationResponse, factorTrustHistory);
					result.code = 200;
					result.lendProtectReport = lendProtectReport;
					return result;
				}
			}
			result.code = 500;
			result.errorMessage = "Error calling factor trust.";
			if(response && !!response.data) {
				result["response"] = response.data;
			}
			sails.log.error( "FactorTrustLendProtectService#runCreditReport; catch:", result );
		}catch(exc) {
			sails.log.error( "FactorTrustLendProtectService#runCreditReport; catch:", exc );
			result.code = 500;
			result.errorMessage = "Could not retrieve your credit details";
			if(response && !!response.data) {
				result["response"] = response.data;
				if(factorTrustHistory && !!factorTrustHistory .id) {
					await FactorTrustLendProtectHistory.updateOrCreateCreditPullHistory({response: response.data},  factorTrustHistory.id)
				}
			}
		}
		return result;
	}
	
	async getCreditReport(screenTracking) {
		if(!screenTracking || !screenTracking.user) {
			sails.log.error("FactorTrustLendProtectService#getCreditReport Error: Missing application or user data.");
			return null;
		}
		try{
			return await FactorTrustLendProtect.getLatestReportForUser(screenTracking.user);
		}catch(exc) {
			sails.log.error("FactorTrustLendProtectService#getCreditReport Error: ", exc);
			return null;
		}
	}
}
const factorTrustLendProtectService = new FactorTrustLendProtectService();

async function getXMLRequest(screenTracking, user) {
	if(!user || !user.id || !screenTracking || !screenTracking.id) {
		throw new Error("Unable to get lend protect request. Missing required application and user data.");
	}
	let employmentHistory = await EmploymentHistory.getLatestEmploymentHistoryForUser(user.id);
	if(!employmentHistory) {
		employmentHistory = {
			typeOfPayroll: EmploymentHistory.decisionCloudTypeOfPayroll.DIRECT_DEPOSIT,
			payFrequency: screenTracking.paymentFrequency || PaymentManagement.decisionCloudPeriodicity.BI_WEEKLY,
			employerName: "",
			lengthOfEmployment: "",
			monthlyIncome: "",
			payrollGarnishment: "",
		}
	}
	const account = await Account.getLatestBankAccountForUser(user.id);
	const payrollType = ( !employmentHistory || employmentHistory.typeOfPayroll === EmploymentHistory.decisionCloudTypeOfPayroll.DIRECT_DEPOSIT ? "D" : "P" );
	const payrollFrequency =   employmentHistory.payFrequency || screenTracking.paymentFrequency || PaymentManagement.decisionCloudPeriodicity.BI_WEEKLY;
	const pointOfOrigination = screenTracking.pointOfOrigination || FactorTrustLendProtect.pointOfOriginationEnum.VIRTUAL;
	const requestData = {
		Application: {
			LoginInfo: {
				Username: config.username,
				Password: config.password,
				ChannelIdentifier: config.channelId,
				MerchantIdentifier: config.merchantId,
				StoreIdentifier: config.storeId
			},
			ApplicationInfo: {
				//user
				FirstName: user.firstName,
				LastName: user.lastName,
				EmailAddress: user.email,
				SSN: String( user.ssnNumber ).replace( /[^0-9]/g, "" ),
				SSNIssueState: "",
				DateOfBirth: moment( user.dateOfBirth).format( "MM/DD/YYYY" ),
				Address1: user.street,
				Address2: user.unitapt,
				City: user.city,
				State: user.state,
				Zip: user.zipCode,
				Country: "USA",
				MonthsAtAddress: "",
				AlternateZip: "",
				HomePhone:  String( user.phoneNumber || "" ).replace( /[^0-9]/g, "" ),
				MobileNumber: String( user.mobileNumber || user.phoneNumber || "" ).replace( /[^0-9]/g, "" ),
				DLNumber:  String( user.stateIdNumber || "" ).replace( /[^0-9]/g, "" ),
				DLNumberIssueState: String( user.idState || "" ).replace( /[^0-9]/g, "" ),
				//bank account
				AccountABA: _.get( account, "routingNumber", "" ),
				AccountDDA: _.get( account, "accountNumber", "" ),
				AccountType: _.get( account, "accountTypeCode", Account.accountTypeCodeEnum.CHECKING),
				
				//employment
				EmployerName: employmentHistory.employerName || "",
				LengthOfEmployment: employmentHistory.lengthOfEmployment || "",
				MonthlyIncome: employmentHistory.monthlyIncome || "",
				PayrollType: payrollType, // D=Direct Deposit; P=Paper Check
				PayrollFrequency: payrollFrequency, // W=Weekly, B=Bi-Weekly, S=Semi-Monthly, M=Monthly
				PayrollGarnishment: employmentHistory.payrollGarnishment || "",
			
				//application
				ApplicationID: String( screenTracking.id ),
				RequestedLoanAmount: screenTracking.requestedLoanAmount || "",
				RequestedEffectiveDate: moment().startOf("day").format("MM/DD/YYYY"),
				RequestedDueDate: "",
				HasBankruptcy: "",
				ProductType: config.productType,
				LeadType: "", // (Not Used At This Time)
				LeadSource: "", // (Not Used At This Time)
				BlackBox: "", // (Provided via the iOvation installation software)
				ECOACode: config.ecoaCode,
				PortfolioType: config.portfolioType,
				PointOfOrigination: pointOfOrigination,
				SecuritizationType: config.securitizationType,
				OtherIncome: "",
				LoanPaymentAmount: "",
				OtherPayments: "",
				LoanFees: "",
				TermsDuration: "",
				TermsFrequency: "",
				HousingExpenses: "",
				IsHomeOwner: "",
				LivingExpenses: "",
				CreditCardNumber: "",
				IPAddress: "",
			}
		}
	};

	console.log(JSON.stringify(requestData, null, 4));
	return builder.buildObject( requestData ).replace( /\n|\r/g, "" );
	// .replace(
	// 		'<?xmlversion="1.0"encoding="UTF-8"standalone="yes"?>',
	// 		'<?xml version="1.0" encoding="utf-8" ?>')
}
async function parseCreditReport(transunionHistory, user, screentracking, memberCodeUsed) {
	const creditReport = transunionHistory.responsedata.creditBureau;
	const fileSummary = _.get(creditReport, "product.subject.subjectRecord.fileSummary", {ssnMatchIndicator: "noHit"});
	const creditDataStatus = _.get(creditReport, "product.subject.subjectRecord.fileSummary.creditDataStatus", null);
	let name = _.get( creditReport, "product.subject.subjectRecord.indicative.name", null );
	if( name && ! Array.isArray( name ) ) { name = [ name ]; }
	const transunions = {
		user: user.id,
		response: creditReport,
		first_name: _.get( name, "[0].person.first", "" ),
		middle_name: _.get( name, "[0].person.middle", "" ),
		last_name: _.get( name, "[0].person.last", "" ),
		house_number: _.get( creditReport, "product.subject.subjectRecord.indicative.address", [] ),
		socialSecurity: _.get( creditReport, "product.subject.subjectRecord.indicative.socialSecurity.number", "" ),
		employment: _.get( creditReport, "product.subject.subjectRecord.indicative.employment", [] ),
		trade: _.get( creditReport, "product.subject.subjectRecord.custom.credit.trade", [] ),
		credit_collection: _.get( creditReport, "product.subject.subjectRecord.custom.credit.collection", [] ),
		publicrecord: _.get( creditReport, "product.subject.subjectRecord.custom.credit.publicRecord", [] ),
		inquiry: _.get( creditReport, "product.subject.subjectRecord.custom.credit.inquiry", [] ),
		addOnProduct: _.get( creditReport, "product.subject.subjectRecord.addOnProduct", [] ),
		score: "",
		isNoHit: !fileSummary || fileSummary.ssnMatchIndicator === "noHit",
		isSuppressed: creditDataStatus && !!creditDataStatus.suppressed && creditDataStatus.suppressed.toLowerCase() === "true",
		isFrozen: creditDataStatus && creditDataStatus.freeze && !!creditDataStatus.freeze.indicator && creditDataStatus.freeze.indicator.toLowerCase() === "true",
		status: 0,
		isHardPull: config.hardCreditPullConfig.memberCode === memberCodeUsed
	};
	
	if( ! Array.isArray( transunions.house_number ) ) { transunions.house_number = [ transunions.house_number ]; }
	if( ! Array.isArray( transunions.employment ) ) { transunions.employment = [ transunions.employment ]; }
	if( ! Array.isArray( transunions.trade ) ) { transunions.trade = [ transunions.trade ]; }
	if( ! Array.isArray( transunions.credit_collection ) ) { transunions.credit_collection = [ transunions.credit_collection ]; }
	if( ! Array.isArray( transunions.publicrecord ) ) { transunions.publicrecord = [ transunions.publicrecord ]; }
	if( ! Array.isArray( transunions.inquiry ) ) { transunions.inquiry = [ transunions.inquiry ]; }
	if( ! Array.isArray( transunions.addOnProduct ) ) { transunions.addOnProduct = [ transunions.addOnProduct ]; }
	
	/**
	 * sometimes we get a + back for the credit
	 * score so we need to add a 0 in that case
	 * so everything doesn't break
	 **/
	const productLookup = config.scoreResultLocation;
	transunions.addOnProduct = transunions.addOnProduct.map( ( product ) => {
		let score = _.get( product, "scoreModel.score.results", "" );
		if( score && score === "+" ) {
			score = "+0";
		}
		if(
				product &&
				product.scoreModel &&
				product.scoreModel.score &&
				product.scoreModel.score.results
		) {
			
			product.scoreModel.score.results = score;
		}
		if(!!product.code && productLookup) {
			const productParse = productLookup[product.code];
			if(productParse && !!productParse.notation && !!productParse.name) {
				let parsedValue = _.get(product, productParse.notation, "");
				if(!!parsedValue){
					const type = productParse.type;
					switch(type) {
						case "int":
							transunions[productParse.name] = parseInt(parsedValue.replace(/[^0-9]/g,"").trim() || "0");
							break;
						case "string":
						default:
							transunions[productParse.name] = `${parsedValue.trim()}`;
							break;
					}
				}
			}
		}
		return product;
	} );
	
	transunions["tradeDebtBalance"] = transunionService.getMonthlyTradeDebt( screentracking);
	
	const created = await Transunions.create( transunions )
	_.assign( transunions, created );
	const consolidateaccount = {
		user: user.id,
		trade: transunions.trade,
		status: 0
	};
	const createdConsolidateAccount = await Consolidateaccount.create( consolidateaccount );
	await Screentracking.update( { id: screentracking.id }, { consolidateaccount: createdConsolidateAccount.id, transunion: transunions.id} )
	
	return transunions;
}
function parseXMLResponse(body) {
	return  parser.parseStringPromise( body );
}

module.exports = factorTrustLendProtectService;
