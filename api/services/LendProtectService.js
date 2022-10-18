/* global sails, LendProtect */
"use strict";

const _ = require( "lodash" );
const EventEmitter = require( "events" );
const fs = require( "fs" );
const path = require( "path" );
const moment = require( "moment" );
const request = require( "request" );
const xml2js = require( "xml2js" );
const { default: Axios } = require("axios");

const config = sails.config.factorTrust.lendProtect;

class LendProtectService extends EventEmitter {

	constructor() {
		super();
		this.config = config;
	}

	/**
	 * get LendProtect report
	 * @param {User} user
	 * @param {Screentracking} screentracking
	 * @param {Account} bankaccount
	 * @return {string}
	 */
	getReport( user, screentracking, bankaccount ) {
		const self = this;
		const builder = new xml2js.Builder();
		let lendprotect = {
			user: String( user.id ),
			screentracking: String( screentracking.id ),
			request: null,
			response_xml: null,
			response: null
		};
		return Promise.resolve()
		.then( async () => {
			//const logFile = path.join( sails.config.appPath, "logs/lendprotect", `${user.id}.txt` );
			const payrollType = ( screentracking.paymethod == "deposit" ? "D" : "P" );
			const freqMap = { weekly: "W", biweekly: "B", semimonthly: "S", monthly: "M" };
			const payrollFrequency = _.get( freqMap, screentracking.payfreq, "B" );
			const pointOfOrigination = ( String( screentracking.practicemanagement ) == sails.config.onlineStore ? "V" : "R" );
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
						ApplicationID: String( screentracking.id ),
						MobileNumber: String( user.phoneNumber || "" ).replace( /[^0-9]/g, "" ),
						FirstName: user.firstname,
						LastName: user.lastname,
						EmailAddress: user.email,
						IPAddress: "",
						DLNumber: "",
						DLNumberIssueState: "",
						DateOfBirth: moment( user.dateofBirth ).format( "MM/DD/YYYY" ),
						Address1: user.street,
						Address2: user.unitapt,
						City: user.city,
						State: user.state,
						Zip: user.zipCode,
						Country: "USA",
						MonthsAtAddress: "",
						AlternateZip: "",
						HomePhone: "",
						SSN: String( user.ssn_number ).replace( /[^0-9]/g, "" ),
						SSNIssueState: "",
						AccountABA: _.get( bankaccount, "routingNumber", "" ),
						AccountDDA: _.get( bankaccount, "accountNumber", "" ),
						AccountType: "C", // C=Checking, D=Debit, S=Savings
						EmployerName: "",
						LengthOfEmployment: "",
						MonthlyIncome: screentracking.incomemonthly,
						PayrollType: payrollType, // D=Direct Deposit; P=Paper Check
						PayrollFrequency: payrollFrequency, // W=Weekly, B=Bi-Weekly, S=Semi-Monthly, M=Monthly
						PayrollGarnishment: "",
						RequestedLoanAmount: "",
						RequestedEffectiveDate: "",
						RequestedDueDate: "",
						HasBankruptcy: "",
						ProductType: "PER",
						LeadType: "", // (Not Used At This Time)
						LeadSource: "", // (Not Used At This Time)
						BlackBox: "", // (Provided via the iOvation installation software)
						ECOACode: "I",
						PortfolioType: "I",
						PointOfOrigination: pointOfOrigination, // R=Retail, V=Virtual
						SecuritizationType: "U",
						OtherIncome: "",
						LoanPaymentAmount: "",
						OtherPayments: "",
						LoanFees: "",
						TermsDuration: "",
						TermsFrequency: "",
						HousingExpenses: "",
						IsHomeOwner: "",
						LivingExpenses: "",
						CreditCardNumber: ""
					}
				}
            };

            sails.log.info('@@@@@@@@@@@@@@@@@@@@@@@@ Get Report: requestData @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@');
            sails.log.info(requestData);

			lendprotect.request = requestData;
			//lendprotect = await LendProtect.create( lendprotect );
			const xmlData = builder.buildObject( requestData );

			return new Promise( ( resolve, reject ) => {
				request.debug = false;
				const reqOpts = {
					url: config.apiUrl,
					method: "POST",
					headers: { "Content-Type": "text/xml" },
					body: xmlData
				};
				//fs.appendFileSync( logFile, `Request: ${reqOpts.url}\n${reqOpts.body}\n` );
				// sails.log.verbose( "getReport; reqOpts:", reqOpts );
				request( reqOpts, async ( err, response, body ) => {
					if( err ) {
						// fs.appendFileSync( logFile, `Error:\n${JSON.stringify( err )}\n` );
						sails.log.error( "LendProtectService.getReport; err:", err );
						return reject( err );
					}
					//fs.appendFileSync( logFile, `Response:\n${body}\n` );
					sails.log.info( "LendProtectService.getReport; response:", response.statusCode, response.statusMessage );
					// sails.log.verbose( "LendProtectService.getReport; body:", body );
					//await LendProtect.update( { id: lendprotect.id }, { response_xml: body } ).then( ( updated ) => _.assign( lendprotect, updated[ 0 ] ) );
					return resolve( body );
				} );
			} );
		} )
		.then( async ( response_xml ) => {
			const parser = new xml2js.Parser( { ignoreAttrs: false, mergeAttrs: true, charkey: "_val", explicitArray: false } );
			const response = await parser.parseStringPromise( response_xml );
			//const lendprotectUpdated = await LendProtect.update( { id: lendprotect.id }, { response: _.get( response, "ApplicationResponse", {} ) } );
			//lendprotect = lendprotectUpdated[ 0 ];
			await Screentracking.update( { id: screentracking.id }, { lendprotect: lendprotect.id } ).then( ( updated ) => _.assign( screentracking, updated[ 0 ] ) );
			return lendprotect;
		} )
		.catch( ( err ) => {
			sails.log.error( "getReport; catch:", err );
		} );
	}
}

async function getReport_v2( userID, applicationObj ) {
	const builder = new xml2js.Builder();
	// Object to store in our db:
	let lendProtectObj = {
		user: userID,
		response: ''
	};
	const xmlData = builder.buildObject( applicationObj );
	const reqOpts = {
		url: config.apiUrl,
		method: "post",
		headers: {
			"Content-Type": "text/xml",
			'Accept': 'text/xml'
		},
		data: xmlData
	};
	let response_xml = await Axios(reqOpts);
	response_xml = response_xml.data;
	// Parse xml 2 json
	const parser = new xml2js.Parser({ ignoreAttrs: false, mergeAttrs: true, charkey: "_val", explicitArray: false });
	let response_json;
	// const response_json = xml2json.toJson(response_xml, {
	// 	object: true,
	// 	sanitize: true,
	// 	alternateTextNode: true
	// });
	parser.parseString(response_xml,  function (err, parsedBody) {
		if (err) { throw err; }
		else { response_json = parsedBody; }
	});
	return response_json;
}

module.exports = {
	getReport: getReport_v2
};

/*
<?xml version="1.0" encoding="utf-8" ?>
<Application>
	<LoginInfo>
		<Username></Username>
		<Password></Password>
		<ChannelIdentifier></ChannelIdentifier>
		<MerchantIdentifier></MerchantIdentifier>
		<StoreIdentifier></StoreIdentifier>
	</LoginInfo>
	<ApplicationInfo>
		<ApplicationID></ApplicationID>
		<MobileNumber></MobileNumber>
		<FirstName></FirstName>
		<LastName></LastName>
		<EmailAddress></EmailAddress>
		<IPAddress></IPAddress>
		<DLNumber></DLNumber>
		<DLNumberIssueState></DLNumberIssueState>
		<DateOfBirth></DateOfBirth> (MM/DD/YYYY)
		<Address1></Address1>
		<Address2></Address2>
		<City></City>
		<State></State>
		<Zip></Zip>
		<Country></Country>
		<MonthsAtAddress></MonthsAtAddress>
		<AlternateZip></AlternateZip>
		<HomePhone></HomePhone>
		<SSN></SSN>
		<SSNIssueState></SSNIssueState>
		<AccountABA></AccountABA>
		<AccountDDA></AccountDDA>
		<AccountType></AccountType>
		<EmployerName> </EmployerName>
		<LengthOfEmployment></LengthOfEmployment>
		<MonthlyIncome></MonthlyIncome>
		<PayrollType></PayrollType>
		<PayrollFrequency></PayrollFrequency>
		<PayrollGarnishment></PayrollGarnishment>
		<HasBankruptcy></HasBankruptcy>
		<RequestedLoanAmount></RequestedLoanAmount>
		<RequestedEffectiveDate></RequestedEffectiveDate>
		<RequestedDueDate></RequestedDueDate>
		<ProductType></ProductType>
		<LeadType></LeadType> (Not Used At This Time)
		<LeadSource></LeadSource> (Not Used At This Time)
		<BlackBox></BlackBox> (Provided via the iOvation installation software)
		<ECOACode></ECOACode>
		<PortfolioType></PortfolioType>
		<PointOfOrigination></PointOfOrigination>
		<SecuritizationType></SecuritizationType>
		<OtherIncome></OtherIncome>
		<LoanPaymentAmount></LoanPaymentAmount>
		<OtherPayments></OtherPayments>
		<LoanFees></LoanFees>
		<TermsDuration></TermsDuration>
		<TermsFrequency></TermsFrequency>
		<HousingExpenses></HousingExpenses>
		<IsHomeOwner></IsHomeOwner>
		<LivingExpenses></LivingExpenses>
		<CreditCardNumber></CreditCardNumber>
	</ApplicationInfo>
</Application>
*/
