/* global sails, Payment, PaymentManagement, EmploymentHistory, VikingACHBatch VikingRCCBatch, EventDataWarehouse */
"use strict";

const _ = require( "lodash" );
const BasePaymentService = require( "./BasePaymentService" );
const moment = require( "moment" );
const config = sails.config.nacha;
const ObjectID = require("mongodb").ObjectID;
const fs = require( "fs" );
const path = require( "path" );
const util = require( "util" );
const readFileAsync = util.promisify( fs.readFile );
const requestAsync = require( "request-promise" );

const momentBusiness = require( "moment-business-days" );
const appendFileAsync = util.promisify( fs.appendFile );
const writeFileAsync = util.promisify( fs.writeFile );
const mkdirAsync = util.promisify( fs.mkdir );
const json2csv = require( "json2csv" );
const Client = require( "ssh2-sftp-client" );

const pmtSvcConfig = sails.config.paymentService;
const vikingBatchTransactionStatuses = {
	REJECTED: "Rejected",
	PROCESSING: "Processing",
	SCRUB_COMPLETE: "Scrub Completed",
	SCRUBBING_COMPLETE: "Scrubbing Complete",
	PROCESSING_COMPLETE: "Processing Complete"
};
const vikingIndividualTransactionStatuses = {
	REJECTED: "Rejected",
	PROCESSING: "Processing",
	SCRUB_OUT:"Scrubbed Out",
	QUEUED_TO_BANK: "Queued To Bank",
	SENT_TO_BANK: "Sent To Bank"
};
class VikingPaymentService extends BasePaymentService {
	constructor() {
		super();
		this._instanceClass = "viking";
	}

	/**
	 * Update Payment Schedule for payment management
	 * @param {string} paymentId
	 * @return {Promise}
	 */
	async updatePaymentSchedule( paymentId) {
		if(!paymentId) {
			const error = new Error("missing payment management id");
			sails.log.error( "updatePaymentSchedule; err: ", error );
			throw error;
		}

		const paymentManagement = await PaymentManagement.findOne( { id: paymentId } ).populate( "screentracking" );
		if(!paymentManagement || !paymentManagement.screentracking) {
			const error = new Error("Payment management or screentracking was not found. Both or needed to generate a payment schedule");
			sails.log.error( "updatePaymentSchedule; err: ", error );
			throw error;
		}else {
			const screentracking = paymentManagement.screentracking;
			let offerData = {};
			if(paymentManagement.screentracking.offerdata && paymentManagement.screentracking.offerdata.length > 0) {
				offerData = paymentManagement.screentracking.offerdata[0];
			}
			let originDate = screentracking.applicationDate?moment(screentracking.applicationDate): moment(paymentManagement.loanSetdate);
			let scheduleDate = null;
			if(paymentManagement.nextPaymentSchedule){
				scheduleDate = moment(paymentManagement.nextPaymentSchedule);
			}
			const newOrUpdatedPaymentSchedule = await createPaymentSchedule( paymentManagement, originDate.toDate(), scheduleDate?scheduleDate.toDate(): null, offerData.financedAmount, paymentManagement.paymentFrequency, paymentManagement.isAfterHoliday === 1);
			if(newOrUpdatedPaymentSchedule && newOrUpdatedPaymentSchedule.paymentSchedule && newOrUpdatedPaymentSchedule.paymentSchedule.length > 0) {
				const paymentUpdateResponse = await PaymentManagement.update( { id: paymentManagement.id }, {paymentSchedule: newOrUpdatedPaymentSchedule.paymentSchedule,payOffAmount: offerData.financedAmount, maturityDate: newOrUpdatedPaymentSchedule.paymentSchedule[newOrUpdatedPaymentSchedule.paymentSchedule.length -1].date,
					nextPaymentSchedule: moment(newOrUpdatedPaymentSchedule.firstScheduledDate, "YYYY-MM-DD").toDate(), isPaymentActive: true, estimatedAPR: newOrUpdatedPaymentSchedule.APR, apr: parseFloat((newOrUpdatedPaymentSchedule.APR * 100).toFixed(2)),
					totalPaymentsFeeChargeAmount: newOrUpdatedPaymentSchedule.total_fee_charge, totalPaymentsFinancedAmount: newOrUpdatedPaymentSchedule.total_finance_pay, totalPaymentsPrincipalAmount: newOrUpdatedPaymentSchedule.total_principal_pay});
				if(paymentUpdateResponse && paymentUpdateResponse.length > 0) {
					const scheduleHistory = _.cloneDeep( paymentUpdateResponse[0] );
					delete scheduleHistory.id;
					delete scheduleHistory.createdAt;
					delete scheduleHistory.updatedAt;
					scheduleHistory["paymentManagement"] = paymentManagement.id;
					await PaymentScheduleHistory.create( scheduleHistory );
					return paymentUpdateResponse[0];
				}
			}

		}
		return null;
	}


	/**
	 * process batch of payments
	 * @param {Array} contractPayments
	 * @param {string} ipAddr
	 * @param {string} paymentScheduleItemIndex
	 * @return {Promise}
	 *
	 *  This is almost an exact copy of the function being overwritten.
	 *  The only difference is the calls at the end.
	 */
	async processContractPayments( contractPayments, ipAddr, paymentScheduleItemIndex) {
		try{
			//contractPayments.paymentScheduleItem needs to have a itemIndex
			const self = this;
			const scheduledPayments = [];
			for(let contract of contractPayments){
				contract.paymentScheduleItem["itemIndex"] = paymentScheduleItemIndex;
				const scheduledPayment = await self.processScheduledPayment( contract.paymentmanagement, contract.practicemanagement, contract.user, contract.account, contract.paymentScheduleItem, ipAddr );
				if(scheduledPayment) {
					updatePaymentScheduleItemStatus(contract.paymentmanagement.id, scheduledPayment.pmtRef, scheduledPayment.status, contract.paymentScheduleItem);
					scheduledPayments.push(scheduledPayment);
				}
			}
			const achResponse = await self.processPayments(scheduledPayments);
			return self.postPaymentBatchProcessing(achResponse);
		}catch(exc) {
			sails.log.error("VikingPaymentService#processContractPayments: Error: ",exc);
		}
		return null;
	}

	async prepareDebitPayment( payment, user, account, orderNumber, ipAddr ) {
		// await Payment.update( { id: payment.id }, { status: Payment.STATUS_SCHEDULED } );
		return null;
	}

	async processPayments(payments){
		sails.log.error("=================================process payments with viking called=======================================");
		return sendAchRequest();
	}
	/**
	 * process prepared payment
	 * @param {Payment} payment
	 * @return {Promise}
	 */
	async processPayment( payment ) {
		sails.log.error("=================================process manual payment with viking called=======================================");
		//make send payment request to viking, update payment (post processing), then return
		//update payment management
		return sendAchManualPayment(payment);
	}



	/**
	 * Error Reasons
	 * @param {string} code
	 * @return {string}
	 */
	errorReasons( code ) {
		code = ( typeof code == "string" ? code.toUpperCase() : "UNKNOWN" );
		const declineCodes = {
			"DAR104": "Account number length > 17",
			"DAR105": "Account number contains 123456",
			"DAR108": "Invalid ABA Number",
			"DAR109": "Invalid Fractional",
			"DCR103": "Name scrub",
			"DCR105": "Email blocking",
			"DCR106": "Previous scrubbed account (Negative BD)",
			"DCR107": "Recurring Velocity Check Exceeded",
			"DDR101": "Duplicate Check indicates that this transaction was previously declined",
			"DMR001": "Invalid merchant",
			"DMR002": "Invalid billing profile",
			"DMR003": "Invalid cross sale ID",
			"DMR004": "Invalid Consumer Unique",
			"DMR005": "Missing field: processtype, parent_id, mersubid, accttype, consumername, accountname, host_ip, or client_ip",
			"DMR006": "Payment Type Not Supported",
			"DMR007": "Invalid Origination Code",
			"DMR104": "Merchant not authorized for credit",
			"DMR105": "Invalid or non-matching original order for repeat-order-only subid",
			"DMR106": "Invalid Amount Passed In",
			"DMR107": "Invalid Merchant TransID Passed In",
			"DMR109": "Invalid SysPass or Subid",
			"DMR110": "Future Initial Billing not authorized for this merchant",
			"DMR201": "Amount over the per-trans limit",
			"DMR202": "Amount over daily amount limit",
			"DMR203": "Count over daily count limit",
			"DMR204": "Amount over monthly amount limit",
			"DMR205": "Count over monthly count limit",
			"DOR002": "A recur has been found for Order",
			"DOR003": "A return has been found for Order",
			"DOR004": "Order was not found",
			"DOR005": "Order is not active.",
			"DOR006": "The merchant does not match the order",
			"DOR008": "Could not find original transaction for orderkeyid",
			"DOR009": "Recur Record not found for keyid",
			"DOR010": "Multiple transactions found with that TransID",
			"DTA001": "Consumer identity could not be verified",
			"DTE200": "Account information could not be verified"
		};
		return _.get( declineCodes, code, "Unspecified Error" );
	}

	async postPaymentBatchProcessing( vikingAchBatch ) {
		const self = this;
		if(vikingAchBatch && vikingAchBatch.response && vikingAchBatch.response.MerchantBatchId && vikingAchBatch.response.Batch && !!vikingAchBatch.response.Batch.Status) {
			const updatedPayments = await self.checkPaymentStatus( vikingAchBatch );
			if(updatedPayments && updatedPayments.length > 0) {
				for(let payment of updatedPayments) {
					if(payment.status !== Payment.STATUS_PENDING && payment.status !== Payment.STATUS_PAID) {
						const paymentmanagement = await PaymentManagement.findOne( { id: payment.paymentmanagement } );
						let failure_authcode = "";
						let failure_historyId = "";
						if(payment.status === Payment.STATUS_DECLINED) {
							failure_historyId = payment.history_id;
							failure_authcode = payment.authcode;
						}
						paymentmanagement.failedtranscount = 0;
						if(!paymentmanagement.failedtransactions) {
							paymentmanagement.failedtransactions = [];
						}
						paymentmanagement.failedtransactions.push( {
							amount: payment.amount,
							pmtRef: payment.pmtRef,
							date: new Date()
						} );

						paymentmanagement.usertransactions = _.get( paymentmanagement, "usertransactions", [] );
						paymentmanagement.usertransactions.push( {
							amount: payment.amount,
							loanID: payment.pmtRef,
							paymentId: payment.id,
							status: 3,
							transactionId: "",
							transactionType: "Automatic",
							apiType: sails.config.paymentService.vendor,
							accountName: account.accountName,
							accountNumberLastFour: account.accountNumberLastFour,
							accountId: account.id,
							initialschedule: paymentmanagement.paymentSchedule,
							failure_authcode: failure_authcode,
							failure_historyId: failure_historyId,
							date: new Date()
						} );

						_.forEach( paymentmanagement.paymentSchedule, ( schedule ) => {
							if(moment().startOf( "day" ).toDate().getTime() == moment( schedule.date ).startOf( "day" ).toDate().getTime()) {
								schedule.date = moment().startOf( "day" ).add( 1, "days" ).toDate();
							}
						} );

						await PaymentManagement.update({id: paymentmanagement.id},{paymentSchedule:  paymentmanagement.paymentSchedule, usertransactions: paymentmanagement.usertransactions, failedtransactions: paymentmanagement.failedtransactions});
					}
				}
				return { statusCode: 200, message: "Recurring debit completed successfully" }
			}
		}
		return { statusCode: 500, message: "failed" }
	}
	prepareCreditPayment( payment, practicemanagement, user, orderNumber, ipAddr ) {
		return null;
	}
	async processScheduledPayment( paymentmanagement, practicemanagement, user, account, paymentScheduleItem, ipAddr ) {
		const self = this;
		// const debugLogPath = `${sails.config.appPath}/paymentservice/processScheduledPayments/${moment().format( "YYYY-MM-DD" )}.txt`;
		const debugLogPath = `${sails.config.appPath}/logs/viking/${moment().format( "YYYY-MM-DD" )}.txt`;

		let pmtRef;
		let payment = {
			paymentmanagement: paymentmanagement.id,
			practicemanagement: practicemanagement.id,
			user: user.id,
			type: pmtSvcConfig.TYPES.OPERATING_DEBIT_USER
		};
		debugLog( `processScheduledPayment[ ${paymentmanagement.loanReference} ]; START` );

			try {
				const oldPayment = await Payment.findOne({paymentmanagement: paymentmanagement.id, practicemanagement:practicemanagement.id, user:user.id, type: pmtSvcConfig.TYPES.OPERATING_DEBIT_USER});

				if(oldPayment) {
					return null;
				}
				 const pmtRef = await Payment.getNextValue();
					payment.pmtRef = pmtRef;
							debugLog( `processScheduledPayment[ ${paymentmanagement.loanReference} ][ ${pmtRef} ];` );
				// const isFirstPayment = parseFloat( paymentScheduleItem.startBalanceAmount ) == parseFloat( paymentmanagement.payOffAmount );
				// const pfiPercentFee = parseFloat( sails.config.actumConfig.pfiPercentFee );
				// const pfiOriginationFee = parseFloat( sails.config.actumConfig.pfiOriginationFee );
				// const orderNumber = `${user.userReference}:${paymentmanagement.loanReference}:${payment.pmtRef}`;
				payment.pmtRequest = null;
				payment.amount = parseFloat( parseFloat( paymentScheduleItem.amount ).toFixed( 2 ) );
				payment.interestAmount = parseFloat( parseFloat( paymentScheduleItem.interestAmount ).toFixed( 2 ) );
				payment.principalAmount = parseFloat( parseFloat( paymentScheduleItem.principalAmount ).toFixed( 2 ) );
				payment.principalBalance = parseFloat( ( parseFloat( paymentScheduleItem.startBalanceAmount ) - payment.principalAmount ).toFixed( 2 ) );
				// payment.originationFee = ( isFirstPayment ? parseFloat( pfiOriginationFee.toFixed( 2 ) ) : 0.0 );
				payment.originationFee = 0.0;
				// payment.fixedFee = parseFloat( sails.config.actumConfig.pfiFixedFee );
				payment.fixedFee = 0.0;
				payment.commissionFee = 0.0;
				payment.commissionAmount = 0.0;
				payment.paybackAmount = 0.0;
				// payment.contractSoldPercentage = parseInt( _.get( paymentmanagement, "contractSoldPercentage", 0 ) );
				payment.contractSoldPercentage = 0;
				payment.practicePayback = 0.0;
				payment.debtfundPayback = 0.0;
				payment.operatingPayback = 0.0;
				payment.status = Payment.STATUS_PENDING;
				payment.errReason = "";
				payment.order_id = null;
				payment.history_id = null;
				payment.authcode = null;
				payment.achJoinDate = moment().startOf( "day" ).toDate();
				payment.pmtResponse = null;
				payment.statusRequest = null;
				payment.statusResponse = null;
				sails.log.verbose( `processScheduledPayment[ ${paymentmanagement.loanReference} ][ ${pmtRef} ]; payment:`, JSON.stringify( payment ) );
				await Payment.create( payment ).then( ( created ) => {
					_.assign( payment, created );
				} );
				await EventDataWarehouse.addEvent( "Debit Payment", user.id, paymentmanagement.screentracking, paymentmanagement.id, null, null, paymentmanagement, payment );
				return payment;
			}catch(err) {
				sails.log.error( `processScheduledPayment[ ${paymentmanagement.loanReference} ][ ${pmtRef} ]; catch:`, err );
				return Promise.reject(err);
			}finally {
				debugLog( `processScheduledPayment[ ${paymentmanagement.loanReference} ][ ${pmtRef} ]; END` );
			}

		function debugLog() {
			const logStr = util.format.apply( null, arguments );
			sails.log.verbose( logStr );
			fs.appendFileSync( debugLogPath, `${moment().format( "YYYY-MM-DD HH:mm:ss.SSS" )}: ${logStr}\n` );
		}
	}
	// async rccRequest() {
	// 	const datestamp = moment().format( "YYYY-MM-DD-hh" );
	// 	const logfile = `${sails.config.logPath}/${sails.config.rccPrefix}${datestamp}.txt`;
	// 	let BATCHID = "NOT_STARTED";
	//
	// 	try {
	// 		const rccRequests = await Payment.find( {
	// 			status: Payment.STATUS_SCHEDULED,
	// 			type: sails.config.paymentService.TYPES.OPERATING_DEBIT_RCC
	// 		} ).populate( "paymentmanagement" );
	// 		if(rccRequests.length == 0) {
	// 			await rccLog( "Exiting - no scheduled RCC transactions" );
	// 			return null;
	// 		}
	// 		await rccLog( `Preparing ${rccRequests.length} RCC transactions` );
	// 		const batchId = VikingRCCBatch.getNextSequenceValue();
	// 		BATCHID = batchId;
	// 		// const creditLenderCode = "MDI_" + sails.config.viking.creditLenderCode;
	// 		// const debitLenderCode = "MDI_" + sails.config.viking.debitLenderCode;
	// 		const vikingcsvPath = `${sails.config.appPath}/${sails.config.viking.rccCsvFilePath}`;
	// 		const fields = [ "ROUTING", "ACCOUNT", "AMOUNT", "NAME", "TYPE", "UNIQUEID" ];
	//
	//
	// 		const startDate = moment()
	// 			.tz( "America/New_York" )
	// 			.add( 1, "days" )
	// 			.format( "YYYY-MM-DD" );
	//
	// 		const totalRows = rccRequests.length;
	// 		const totalAmount = Payment.getTotalAmount( rccRequests );
	// 		const transactions = await VikingRCCBatch.getTransactionData( rccRequests );
	//
	// 		if(transactions.length == 0) {
	// 			await rccLog( "Exiting - no rcc requests" );
	// 			return null;
	// 		}
	//
	// 		const debitToCsv = {
	// 			data: transactions,
	// 			fields: fields,
	// 			hasCSVColumnTitle: false
	// 		};
	//
	// 		const debitFileNameOnly = `Debit_${moment().tz( "America/New_York" ).format( "YYYY_MM_DD" )}_${moment().tz( "America/New_York" ).format( "hh_mm" )}.csv`;
	// 		const debitFilename = `${vikingcsvPath}/${debitFileNameOnly}`;
	//
	// 		const descriptiveDate = moment().tz( "America/New_York" ).format( "YYMMDD" );
	// 		const todayNextWorkingDate = momentBusiness().tz( "America/New_York" ).nextBusinessDay()._d;
	// 		const effectiveDate = momentBusiness( todayNextWorkingDate ).tz( "America/New_York" ).format( "YYMMDD" );
	//
	// 		if(transactions.length != 0) {
	// 			const rccBatchHistory = [
	// 				{
	// 					batchId: batchId,
	// 					fileName: debitFileNameOnly,
	// 					requestDate: moment( descriptiveDate, "YYMMDD" ).format( "YYYY-MM-DD" ),
	// 					effectiveDate: moment( effectiveDate, "YYMMDD" ).format( "YYYY-MM-DD" ),
	// 					status: "0",
	// 					totalAmount: totalAmount,
	// 					totalTransactions: totalRows,
	// 					type: "debit",
	// 					transactions: debitToCsv.data
	// 				}
	// 			];
	// 			const rccHistory = await VikingRCCBatch.create( rccBatchHistory );
	//
	// 			let historyStatus = "0";
	// 			await writeFileAsync( debitFilename, json2csv( debitToCsv ) + "\r\n" );
	// 			historyStatus = "1"; // file written
	// 			await rccLog( "File created" );
	// 			await VikingRCCBatch.update( { id: rccHistory[0].id }, { status: historyStatus } );
	//
	// 			const sftp = new Client();
	// 			await sftp.connect( {
	// 				host: sails.config.viking.rccFtpHostName,
	// 				port: sails.config.viking.rccFtpPort,
	// 				username: sails.config.viking.rccFtpUserName,
	// 				password: sails.config.viking.rccFtpPassName,
	// 				readyTimeout: sails.config.viking.rccFtpTimeout,
	// 				retries: 0
	// 			} );
	// 			historyStatus = "2"; // server Connected
	// 			await rccLog( "Connected to sftp server" );
	// 			await VikingRCCBatch.update( { id: rccHistory[0].id }, { status: historyStatus } );
	// 			await sftp.put( debitFilename, sails.config.viking.serverUpPath + debitFileNameOnly, false );
	// 			historyStatus = "3"; // File Transferred
	// 			await rccLog( "File pushed" );
	// 			await VikingRCCBatch.update( { id: rccHistory[0].id }, { status: historyStatus } );
	//
	// 			const updateArray = [];
	// 			_.forEach( rccRequests, ( rccRequest ) => {
	// 				updateArray.push( Payment.update( { id: rccRequest.id }, { status: Payment.STATUS_PENDING } ) );
	// 			} );
	// 			await Promise.all( updateArray );
	// 			return null;
	// 		}
	// 	} catch (err) {
	// 		await appendFileAsync( logfile, `\n${moment().format( "YYYY-MM-DD-hh-mm-ss" )}: error encountered starting rcc batch ${BATCHID}:\n\t ${err}` );
	// 		return err;
	// 	}
	// }

	async makePayment( paymentmanagement, practicemanagement, user, scheduleItem) {
		let pmtRef;
		try {
			const self = this;
			const ip = require( "ip" );
			// const debugLogPath = `${sails.config.appPath}/paymentservice/processScheduledPayments/${moment().format( "YYYY-MM-DD" )}.txt`;
			// const debugLogPath = `${sails.config.appPath}/logs/viking/processScheduledPayments/${moment().format( "YYYY-MM-DD" )}.txt`;

			sails.log.verbose( "makePayment[actum];", paymentmanagement.loanReference, practicemanagement.id, user.userReference, "scheduleItem:", JSON.stringify( scheduleItem ) );
			const ipAddr = ip.address();
			const accountId = _.get( scheduleItem, "account", paymentmanagement.account );
			const account = await Account.findOne( { id: accountId } );
			if(!account) {
				throw Error( `Account not found by Id: ${accountId}` );
			}
			const payment = {
				paymentmanagement: paymentmanagement,
				practicemanagement: practicemanagement,
				user: user,
				account: null,
				type: pmtSvcConfig.TYPES.OPERATING_DEBIT_USER,
				paymentScheduleItem: null
			};
			// debugLog( `makePayment[ ${paymentmanagement.loanReference} ]; START` );
			// pmtRef = await Payment.getNextValue();
			// debugLog( `makePayment[ ${paymentmanagement.loanReference} ][ ${pmtRef} ];` );
			// const isFirstPayment = parseFloat( scheduleItem.startBalanceAmount ) == parseFloat( paymentmanagement.payOffAmount );
			// const pfiOriginationFee = parseFloat( sails.config.viking.originationFee );
			// const orderNumber = `${user.userReference}:${practicemanagement.id}:${paymentmanagement.loanReference}:${payment.pmtRef}`;
			 payment.account = `${account.id}`;
			// payment.amount = parseFloat( parseFloat( scheduleItem.amount ).toFixed( 2 ) );
			// payment.interestAmount = parseFloat( parseFloat( scheduleItem.interestAmount ).toFixed( 2 ) );
			// payment.principalAmount = parseFloat( parseFloat( scheduleItem.principalAmount ).toFixed( 2 ) );
			// payment.principalBalance = parseFloat( ( parseFloat( scheduleItem.startBalanceAmount ) - payment.principalAmount ).toFixed( 2 ) );
			// payment.originationFee = ( isFirstPayment ? parseFloat( pfiOriginationFee.toFixed( 2 ) ) : 0.0 );
			// payment.fixedFee = parseFloat( sails.config.viking.fixedFee );
			// payment.commissionFee = 0.0;
			// payment.commissionAmount = 0.0;
			// payment.paybackAmount = 0.0;
			// payment.status = Payment.STATUS_PENDING;
			// payment.errReason = "";
			// payment.order_id = null;
			// payment.history_id = null;
			// payment.authcode = null;
			// payment.achJoinDate = moment().startOf( "day" ).toDate();
			// payment.pmtRequest = null;
			// payment.pmtResponse = null;
			// payment.statusRequest = null;
			// payment.statusResponse = null;
			// payment.practiceCreditStatus = self.CREDIT_STATUS.NA;
			// sails.log.verbose( `makePayment[ ${paymentmanagement.loanReference} ][ ${pmtRef} ]; payment:`, JSON.stringify( payment ) );
			// payment.pmtRef = pmtRef;
			// const created = await Payment.create( payment );
			// _.assign( payment, created );

			// const pmtResponse = await self.processPayment( payment, true );
			// sails.log.verbose( `makePayment[ ${paymentmanagement.loanReference} ][ ${pmtRef} ]; status:`, payment.status, JSON.stringify( pmtResponse ) );
			_.some( paymentmanagement.paymentSchedule, ( pmtScheduleItem, index ) => {
				if(moment( pmtScheduleItem.date ).isSame( moment(scheduleItem.date), "day" ) && pmtScheduleItem.transaction === scheduleItem.transaction && pmtScheduleItem.amount === scheduleItem.amount) {
					sails.log.verbose( `makePayment[ ${paymentmanagement.loanReference} ][ ${pmtRef} ]; pmtScheduleItem:`, pmtScheduleItem );
					scheduleItem = pmtScheduleItem;
					scheduleItem["itemIndex"] = index;
					return true;
				}
			} );
			// if( payment.status == Payment.STATUS_PENDING ) {
			// 	scheduleItem.status = payment.status;
			// } else {
			// 	scheduleItem.status = Payment.STATUS_DECLINED;
			// }
			// scheduleItem.status = payment.status;
			scheduleItem.paymentId = payment.id;
			scheduleItem.pmtRef = payment.pmtRef;
			scheduleItem.account = `${account.id}`;
			scheduleItem.accountLastFour = account.accountNumber.substr( -4 );

			if(scheduleItem.itemIndex >= 0) {
				paymentmanagement.paymentSchedule[scheduleItem.itemIndex] = scheduleItem;
				const updated = await PaymentManagement.update( { id: paymentmanagement.id }, {
					paymentSchedule: paymentmanagement.paymentSchedule,
					firstpaymentcompleted: 1
				} );
				_.assign( paymentmanagement, updated[0] );

				payment.paymentScheduleItem  = scheduleItem;
				sails.log.verbose( `makePayment[ ${paymentmanagement.loanReference} ][ ${pmtRef} ]; paymentmanagement.paymentSchedule:`, JSON.stringify( paymentmanagement.paymentSchedule ) );

				const scheduledPayment = await self.processScheduledPayment( payment.paymentmanagement, payment.practicemanagement, payment.user, payment.account, payment.paymentScheduleItem, ipAddr );

				await updatePaymentScheduleItemStatus(payment.paymentmanagement.id, scheduledPayment.pmtRef, scheduledPayment.status, payment.paymentScheduleItem);
					const achResponse = await self.processPayments([scheduledPayment]);
					const postBatchProcessesingResponse = await self.postPaymentBatchProcessing(achResponse);
					postBatchProcessesingResponse["pmtRef"] = scheduledPayment.pmtRef;
					return postBatchProcessesingResponse;
			}
		} catch (err) {
			sails.log.error( `makePayment[ ${paymentmanagement.loanReference} ][ ${pmtRef} ]; catch:`, err );
			throw err;
		} finally {
			debugLog( `makePayment[ ${paymentmanagement.loanReference} ][ ${pmtRef} ]; END` );
		}
		return null;

		function debugLog() {
			const debugLogPath = `${sails.config.appPath}/logs/viking/processScheduledPayments/${moment().format( "YYYY-MM-DD" )}.txt`;
			const logStr = util.format.apply( null, arguments );
			sails.log.verbose( logStr );
			fs.appendFileSync( debugLogPath, `${moment().format( "YYYY-MM-DD HH:mm:ss.SSS" )}: ${logStr}\n` );
		}
	}

	async checkPaymentStatuses( ipAddr ) {
		try {
			const openPayments = await Payment.find( {
				order_id: { $exists: true, $nin: [ null, "" ] },
				status: { $in: [ Payment.STATUS_PENDING, Payment.STATUS_SETTLING ] }
			} );
			const vikingAchBatchIds = [];
			if(openPayments && openPayments.length > 0) {
				sails.log.verbose(`VikingPaymentService#checkPaymentStatuses: Found ${openPayments.length} open payments`);
				_.forEach(openPayments,(openPayment) => {
						if(vikingAchBatchIds.indexOf(openPayment.vikingAchBatch) < 0) {
							vikingAchBatchIds.push(openPayment.vikingAchBatch);
						}
				});
			}
			if(vikingAchBatchIds.length > 0) {
				for( let vikingAchBatchId of vikingAchBatchIds) {
					const scheduledBatch = await VikingACHBatch.findOne( {
							id: vikingAchBatchId
						} );
					if(scheduledBatch) {
						sails.log.verbose(`VikingPaymentService#checkPaymentStatuses: Checking the status of viking ach batch ${scheduledBatch.merchantBatchId}.`);
						await self.checkPaymentStatus(scheduledBatch);
					}
				}
			}
		}catch(exc) {
			sails.log.error("VikingPaymentService#checkPaymentStatuses Error: ", exc);
		}
		return null;
	}

	async checkPaymentStatus(vikingAchBatch) {
		if(!vikingAchBatch || !vikingAchBatch.response || !vikingAchBatch.response.MerchantBatchId){
			throw Error("Error: Trying to check status of a payment but this ach batch request does not have a response.");
		}
		const merchantBatchId = vikingAchBatch.response.MerchantBatchId;
		const accountTypeName = vikingAchBatch.response.AccountTypeName || "Debit";
		try {
			const statusResponse = await getAchPostTransactionByMerchantBatchId( merchantBatchId, accountTypeName );
			if(statusResponse) {
				sails.log.verbose("VikingPaymentService#checkPaymentStatus: Received ach status from viking: ", statusResponse);
				if(statusResponse.Batch && !!statusResponse.Batch.Status) {
					const messages = statusResponse.Batch.Messages;
					const reason = _.findLast(messages,(messageObj) => {
						return messageObj.IndividualIdentificationNumber === null;
					});
					sails.log.verbose(`VikingPaymentService#checkPaymentStatus: Updating viking ach batch status for ${vikingAchBatch.id} with status of ${statusResponse.Batch.Status}`);
					await VikingACHBatch.update({id: vikingAchBatch.id}, {status: statusResponse.Batch.Status, statusReason: reason.Message})
				}
				if(statusResponse && statusResponse.Detail && statusResponse.Detail.length > 0) {
					const details = statusResponse.Detail;
					const updatedPayments = [];
					let paymentStatus = Payment.STATUS_PENDING;
					for(let batchDetail of details) {
						const paymentReference = batchDetail.IndividualIdentificationNumber.split("_VIKING_ACH_BATCH_")[0];

						switch(statusResponse.Batch.Status) {
							case vikingBatchTransactionStatuses.REJECTED:
								paymentStatus = Payment.STATUS_DECLINED;
								break;
							case vikingBatchTransactionStatuses.SCRUBBING_COMPLETE:
							case vikingBatchTransactionStatuses.SCRUB_COMPLETE:
								paymentStatus = Payment.STATUS_SCRUBBED;
								break;
						}

						const payment = await Payment.findOne({pmtRef: paymentReference}).populate("paymentmanagement");
						const paymentmanagement = payment.paymentmanagement;
						const prevPaymentStatus = _.clone( payment.status );
						if(payment) {
								// const updatedPayment = await Payment.update({id: payment.id},{status: paymentStatus});
								const achJoinDate = moment( _.get( payment, "achJoinDate", new Date() ) );
								const businessDaysDiff = moment().businessDiff( achJoinDate );
								const updatePmt = {vikingAchBatch: vikingAchBatch.id, status: paymentStatus};
								let willUpdatePayment = false;
								if([vikingIndividualTransactionStatuses.QUEUED_TO_BANK,vikingIndividualTransactionStatuses.SENT_TO_BANK,vikingIndividualTransactionStatuses.PROCESSING].indexOf(paymentStatus) >= 0 && businessDaysDiff > pmtSvcConfig.settlingBusinessDays) {
									updatePmt.status = Payment.STATUS_SETTLING;
									willUpdatePayment = true;
								}
								if([vikingIndividualTransactionStatuses.QUEUED_TO_BANK,vikingIndividualTransactionStatuses.SENT_TO_BANK,vikingIndividualTransactionStatuses.PROCESSING].indexOf(paymentStatus) >= 0 && businessDaysDiff > pmtSvcConfig.paidBusinessDays) {
									updatePmt.status = Payment.STATUS_PAID;
									willUpdatePayment = true;
								}
								sails.log.verbose( `VikingPaymentService#checkPaymentStatus: Updating payment status from viking ach status check for ${payment.pmtRef} with status of ${updatePmt.status}` );
									sails.log.verbose( `checkPaymentStatus; ${payment.pmtRef} ${payment.id} updatePmt:`, updatePmt );
									await updatePaymentScheduleItemStatus( paymentmanagement.id, payment.pmtRef, updatePmt.status );
								sails.log.verbose( `checkPaymentStatus; ${payment.pmtRef} ${payment.id} status:`, updatePmt.status );
								const updatedPaymentResponse = await Payment.update( { id: payment.id }, updatePmt );
								if(updatedPaymentResponse && updatedPaymentResponse.length > 0)  {
									_.assign( payment, updatedPaymentResponse[ 0 ] );
									updatedPayments.push( payment );
								}
								if( prevPaymentStatus != payment.status ) {
									await EventDataWarehouse.addEvent( "Payment Status", payment.user, paymentmanagement.screentracking, paymentmanagement.id, null, null, paymentmanagement, payment );
								}
						}
					}
					return updatedPayments;
				}
			}
		}catch(exc) {
			sails.log.error("VikingPaymentService#checkPaymentStatus Error: ", exc);
		}
		return null;
	}
}

module.exports = VikingPaymentService;

async function sendAchManualPayment(manualPayment) {
	if(!manualPayment) {
		sails.log.error("VikingPaymentService#sendAchManualPayment: Error: Manual payment was used by payment data is missing.", err);
		return null;
	}
	return sendAchRequest(manualPayment);
}

async function sendAchRequest(manualPayment = null) {
	const datestamp = moment().format( "YYYY-MM-DD-hh" );
	const logfile = `${sails.config.logPath}/${sails.config.achPrefix}${datestamp}.txt`;
	let BATCHID = "NOT_STARTED";

		let achRequests = [];
		if(manualPayment) {
			if(manualPayment.status !== Payment.STATUS_PENDING || manualPayment.type !== sails.config.paymentService.TYPES.OPERATING_DEBIT_USER) {
				sails.log.error("VikingPaymentService#sendAchRequest: Error: Manual payment was used by the manual payment is either not in PENDING status or not an operating debit user ", err);
				return null;
			}
			achRequests.push(manualPayment)
		}else {
			achRequests = await Payment.find( {
				status: Payment.STATUS_PENDING,
				type: sails.config.paymentService.TYPES.OPERATING_DEBIT_USER,
			    $or: [{vikingAchBatch:{$exists: false}}, {vikingAchBatch:{$eq: null}}, {vikingAchBatch:{$eq: ''}}]
			} ).populate( "paymentmanagement" );
		}

		if(achRequests.length === 0) {
			await achLog( "Exiting - no scheduled ACH transactions" );
			return null;
		}
		const batch = await prepareVikingBatchTransaction(achRequests);
		BATCHID = batch.batchId;
		const response = await sendAchPostTransaction(batch.request);
		if(response && !!response.VikingReferenceId){
			/* TODO: Check the response here */

			//depending on what gets returned
			// await VikingACHBatch.update( { batchId: BATCHID }, { status: "PENDING" } );
			// const updateArray = [];
			// _.forEach( achRequests, ( achRequest ) => {
			// 	updateArray.push( Payment.update( { id: achRequest.id }, { status: Payment.STATUS_PENDING } ) );
			// } );
			// await Promise.all( updateArray );

			const vikingAchBatchUpdate = await VikingACHBatch.update( { batchId: BATCHID }, { status: "Processing", vikingReferenceId: response.VikingReferenceId, response:response } );
			if(vikingAchBatchUpdate && vikingAchBatchUpdate.length > 0) {
				return vikingAchBatchUpdate[0];
			}
		}
		sails.log.error("VikingPaymentService#sendAchRequest: Error: Viking ach batch api did not return a response or it didn't return a viking reference id.", err);
		return null;
}


async function createPaymentSchedule( paymentManagementObj, originDate, scheduleStartDate, financeAmount, payFrequency, isAfterHoliday) {
	if(!paymentManagementObj || !originDate) {
		const error = new Error( "Missing required data to generate a payment schedule." );
		sails.log.error( "VikingPaymentService#createSmoothPaymentSchedule; err: ", error );
		throw error;
	}
	try {
		const latestEmployment = await EmploymentHistory.getLatestEmploymentHistoryForUser( paymentManagementObj.user );
		if(latestEmployment) {
			if(!payFrequency || !scheduleStartDate) {
				payFrequency = payFrequency || latestEmployment.payFrequency;

				let newScheduleDate = SmoothPaymentService.getIncomePayFrequency(paymentManagementObj.loanSetdate, latestEmployment.lastPayDate, latestEmployment.nextPayDate, latestEmployment.secondPayDate, payFrequency || EmploymentHistory.decisionCloudPeriodicity.BI_WEEKLY);
				if(newScheduleDate){
					newScheduleDate = SmoothPaymentService.getBusinessDateBasedOnBankDays(newScheduleDate, false);
					if(newScheduleDate) {
						scheduleStartDate = moment( newScheduleDate ).toDate()
					}
				}
			}
			if(!scheduleStartDate){
				const screentracking = await Screentracking.findOne({id: paymentManagementObj.screentracking});
				if(screentracking && screentracking.loanEffectiveDate) {
					scheduleStartDate = moment( screentracking.loanEffectiveDate ).toDate();
				}
			}
			const scheduleStartDateMoment =  moment(scheduleStartDate);
			if(originDate && moment(originDate).diff(scheduleStartDateMoment) > 0){
				originDate = scheduleStartDateMoment.toDate();
			}
			if(isAfterHoliday === null || isAfterHoliday ===undefined) {
				isAfterHoliday = latestEmployment.isAfterHoliday === 1;
			}
			const practiceSettings = await PracticeManagement.find( { id: paymentManagementObj.practicemanagement } );
			let requiredNumberOfPayments = practiceSettings && practiceSettings.requiredNumberOfPayments ? practiceSettings.requiredNumberOfPayments : 24;
			let interestRatioAmount = practiceSettings && practiceSettings.interestRatioAmount ? practiceSettings.interestRatioAmount : 100;
			let interestRatioFee = practiceSettings && practiceSettings.interestRatioFee ? practiceSettings.interestRatioFee : 30;
			let interestRatioWindowDays = practiceSettings && practiceSettings.interestRatioWindowDays ? practiceSettings.interestRatioWindowDays : 7;
			return await SmoothPaymentService.generatePaymentSchedule( moment( originDate ).format( "YYYY-MM-DD" ), moment( scheduleStartDate ).format( "YYYY-MM-DD" ),
				financeAmount, payFrequency,  "daily based", requiredNumberOfPayments, interestRatioAmount, interestRatioFee, interestRatioWindowDays, isAfterHoliday );
		}
	} catch (exc) {
		sails.log.error( "VikingPaymentService#createSmoothPaymentSchedule; err: ", exc );
		throw exc;
	}
	return null;
}

async function sendVikingApiCall(url, requestBody = null, httpMethod = "GET") {
		const vikingConfig = sails.config.viking;
		const stringBuffer = Buffer.from(`${vikingConfig.apiAuthorizationBearerCredentials.username}:${vikingConfig.apiAuthorizationBearerCredentials.password}`);
		const base64Credentials = stringBuffer.toString("base64");
		let options = {
			method: httpMethod,
			uri: url,
			json: true,
			headers: {
				"Authorization": `Basic ${base64Credentials}`
			},
			agentOptions: {
				cert:fs.readFileSync( path.join( sails.config.appPath, vikingConfig.apiCert)),
				key:  fs.readFileSync( path.join( sails.config.appPath, vikingConfig.apiKey)),
				passphrase: vikingConfig.passphrase,
				rejectUnauthorized: false
			}
		};
		if(httpMethod === "POST") {
			options["body"] = requestBody;
			options.headers["Content-Type"] = "application/json";
			// return {
			// 	"VikingTransactionType": "ACH",
			// 	"MerchantCode": "TTT_TA",
			// 	"AccountTypeName": "Debit",
			// 	"MerchantBatchId": requestBody.BatchHeader.MerchantBatchId,
			// 	"VikingReferenceId": "test-" + requestBody.BatchHeader.MerchantBatchId,
			// 	"CreateDate": requestBody.BatchHeader.CreateDate,
			// 	"EffectiveEntryDate": requestBody.BatchHeader.EffectiveEntryDate,
			// 	"Batch": {
			// 		"Status": "Processing",
			// 		"Count": "000001",
			// 		"Amount": "000000000001",
			// 		"Messages": [
			// 			{
			// 				"Type": "Bus_Msg",
			// 				"Object": null,
			// 				"IndividualIdentificationNumber": null,
			// 				"Field": null,
			// 				"Message": "Batch has been received and accepted"
			// 			}
			// 		]
			// 	},
			// 	"TransactionDetail": {
			// 		"Status": "Processing",
			// 		"Messages": []
			// 	}
			// }
		}
		// else {
		// 	const testResponse = {
		// 		"VikingTransactionType": "ACH",
		// 		"MerchantCode": "TTT_TA",
		// 		"AccountTypeName": "Debit",
		// 		"MerchantBatchId": requestBody.MerchantBatchId,
		// 		"VikingReferenceId": "test-" + requestBody.MerchantBatchId,
		// 		"CreateDate": "200122",
		// 		"EffectiveEntryDate": "200123",
		// 		"Batch": {
		// 			"Status": "Processing",
		// 			"Count": "000001",
		// 			"Amount": "000000000001",
		// 			"Messages": [
		// 				{
		// 					"Type": "Bus Validation Message",
		// 					"Object": null,
		// 					"IndividualIdentificationNumber": null,
		// 					"Field": null,
		// 					"Message": "Batch has been received and accepted"
		// 				}
		// 			]
		// 		},
		// 		"Detail": [
		// 			{
		// 				"ConsumerName": "MockTester Lastname1",
		// 				"IndividualIdentificationNumber": "PMT_10001_" + requestBody.MerchantBatchId,
		// 				"Amount": "0000000001",
		// 				"Status": "Processing",
		// 				"Messages": []
		// 			},
		// 			{
		// 				"ConsumerName": "MockTester Lastname2",
		// 				"IndividualIdentificationNumber": "PMT_10002_" + requestBody.MerchantBatchId,
		// 				"Amount": "0000000001",
		// 				"Status": "Processing",
		// 				"Messages": []
		// 			},
		// 			{
		// 				"ConsumerName": "MockTester Lastname3",
		// 				"IndividualIdentificationNumber": "PMT_10003_" + requestBody.MerchantBatchId,
		// 				"Amount": "0000000001",
		// 				"Status": "Processing",
		// 				"Messages": []
		// 			},
		// 			{
		// 				"ConsumerName": "MockTester Lastname4",
		// 				"IndividualIdentificationNumber": "PMT_10004_" + requestBody.MerchantBatchId,
		// 				"Amount": "0000000001",
		// 				"Status": "Processing",
		// 				"Messages": []
		// 			},
		// 			{
		// 				"ConsumerName": "MockTester Lastname5",
		// 				"IndividualIdentificationNumber": "PMT_10005_" + requestBody.MerchantBatchId,
		// 				"Amount": "0000000001",
		// 				"Status": "Processing",
		// 				"Messages": []
		// 			}
		// 		]
		// 	};
		// 	return testResponse;
		//
		// }

	return await requestAsync( options );
}

async function sendAchPostTransaction(requestBody, accountType = "Debit") {
	const vikingConfig = sails.config.viking;
	try {
		if(!requestBody) {
			const error = `Error: Endpoint method '${vikingConfig.endpoints.sendBatchTransaction}' does not have a transaction request body.`;
			await achLog( error );
			sails.log.error("VikingPaymentService#sendAchPostTransaction Error: ", error);
			return null;
		}
		let url = `${vikingConfig.apiBaseUrl}${vikingConfig.endpoints.sendBatchTransaction}`;
		return await sendVikingApiCall(url,requestBody, "POST")
	}catch(exc) {
		const errorMessage = `Error processing '${vikingConfig.endpoints.sendBatchTransaction}': ${exc.message}`;
		await achLog( errorMessage);
		sails.log.error("VikingPaymentService#sendAchPostTransaction Error: ", exc);
		return null;
	}
}

async function getAchPostTransactionByVikingReferenceId(vikingReferenceId,  accountType = "Debit") {
	const vikingConfig = sails.config.viking;
	try {
		if(!vikingReferenceId) {
			const error = `Error: Endpoint method '${vikingConfig.endpoints.getBatchTransactionByVikingReferenceId}' requires a valid viking reference id.`;
			await achLog( error );
			sails.log.error("VikingPaymentService#getAchPostTransactionByVikingReferenceId Error: ", error);
			return null;
		}
		let url = `${vikingConfig.apiBaseUrl}${vikingConfig.endpoints.getBatchTransactionByVikingReferenceId}?LayoutVersion=${vikingConfig.layoutVersion}&MerchantCode=${vikingConfig.merchantCode}&AccountTypeName=${accountType}&VikingReferenceId=${vikingReferenceId}`;
		return await sendVikingApiCall(url)
	}catch(exc) {
		const errorMessage = `Error processing '${vikingConfig.endpoints.getBatchTransactionByVikingReferenceId}': ${exc.message}`;
		await achLog( errorMessage);
		sails.log.error("VikingPaymentService#getAchPostTransactionByVikingReferenceId Error: ", exc);
		return null;
	}
}
async function getAchPostTransactionByMerchantBatchId(merchantBatchId,  accountType = "Debit") {
	const vikingConfig = sails.config.viking;
	try {
		if(!merchantBatchId) {
			const error = `Error: Endpoint method '${vikingConfig.endpoints.getBatchTransactionByMerchantBatchId}' requires a valid merchant batch id.`;
			await achLog( error );
			sails.log.error("VikingPaymentService#getAchPostTransactionByMerchantBatchId Error: ", error);
			return null;
		}
		let url = `${vikingConfig.apiBaseUrl}${vikingConfig.endpoints.getBatchTransactionByMerchantBatchId}?LayoutVersion=${vikingConfig.layoutVersion}&MerchantCode=${vikingConfig.merchantCode}&AccountTypeName=${accountType}&MerchantBatchId=${merchantBatchId}`;
		return await sendVikingApiCall(url,{MerchantBatchId: merchantBatchId, LayoutVersion:vikingConfig.layoutVersion, MerchantCode: vikingConfig.merchantCode,AccountTypeName: accountType})
	}catch(exc) {
		const errorMessage = `Error processing '${vikingConfig.endpoints.getBatchTransactionByMerchantBatchId}': ${exc.message}`;
		await achLog( errorMessage);
		sails.log.error("VikingPaymentService#getAchPostTransactionByMerchantBatchId Error: ", exc);
		return null;
	}
}
async function prepareVikingBatchTransaction(achRequests, accountTypeName = "Debit") {
	const vikingConfig = sails.config.viking;
	await achLog( `Preparing ${achRequests.length} ACH transactions` );
	const vikingAchBatchId = await VikingACHBatch.getNextSequenceValue();
	const totalRows = achRequests.length;
	const totalAmount = Payment.getTotalAmount( achRequests );
	const transactions = await VikingACHBatch.getTransactionData( achRequests, vikingAchBatchId );

	const today = moment();
	const createDate = moment(today);
	const effectiveDate = moment(today).add( 1, "day" );

	const batch = {
		batchId: vikingAchBatchId,
		requestDate: createDate.toDate(),
		effectiveDate: effectiveDate.toDate(),
		totalAmount: totalAmount,
		totalTransactions: totalRows,
		type: "DEBIT",
		transactions: transactions,
		status: "PENDING",
		request: {

			Header: {
				LayoutVersion: vikingConfig.layoutVersion,
				VikingTransactionType: vikingConfig.vikingTransactionType,
				MerchantCode: sails.config.viking.merchantCode,
				AccountTypeName: accountTypeName,
				CompanyName: vikingConfig.vikingIssuedCompanyName
			},
			BatchHeader: {
				MerchantBatchId: vikingAchBatchId,
				StandardEntryClassCode: vikingConfig.standardEntryClassCode,
				CreateDate: createDate.format( "YYMMDD" ),
				CompanyEntryDescription: vikingConfig.companyIssuedEntryDescription,
				EffectiveEntryDate: effectiveDate.format( "YYMMDD" ),
				BatchCount: totalRows.toString(),
				BatchAmount: totalAmount.toString(),
				RetryPayment: "false"
			},
			Details: transactions
		}
	};

	await VikingACHBatch.create( batch );
	return batch;
}

async function updatePaymentScheduleItemStatus(payId, paymentRef, paymentStatus,paymentScheduleItem=null) {
	const paymentManagement = await PaymentManagement.findOne({id: payId});
	if(paymentManagement) {
		if(paymentStatus === Payment.STATUS_PENDING) {
			paymentStatus = "OPENED"
		}
		let indexToUse = 0;
		if(!paymentScheduleItem || !paymentScheduleItem.itemIndex || paymentManagement.paymentSchedule.length <= paymentScheduleItem.itemIndex){
			indexToUse = _.findIndex(paymentManagement.paymentSchedule, (paySched) => {
				return paySched.pmtRef === paymentRef
			});
		}else {
			indexToUse = paymentScheduleItem.itemIndex
		}

		if(indexToUse >=0) {

			paymentManagement.paymentSchedule[indexToUse].status = paymentStatus;
			paymentManagement.paymentSchedule[indexToUse].pmtRef = paymentRef;
			await PaymentManagement.update({id: payId}, {paymentSchedule: paymentManagement.paymentSchedule})
		}
	}
	return true;
}

function rccLog( msg ) {
	sails.log.error("================rcc log: ", msg);
	// logToFile( sails.config.viking.rccPrefix, "RCCRequest", msg );
}

function achLog( msg ) {
	sails.log.error("================ach log: ", msg);
	// logToFile( sails.config.viking.achPrefix, "ACHRequest", msg );
}

function logToFile( prefix, label, msg ) {

	const datestamp = moment().format( "YYYY-MM-DD" );
	const logfile = `${sails.config.appPath}/${sails.config.viking.logPath}/${prefix}${datestamp}.txt`;
	sails.log.verbose( `{label}: ${msg}` );
	return appendFileAsync( logfile, `\n${moment().format( "YYYY-MM-DD-hh-mm-ss" )}: ${msg}\n` )
		.catch( ( err ) => {
			if(err.code == "ENOENT") {
				return mkdirAsync( sails.config.viking.logPath )
					.then( () => {
						return appendFileAsync( logfile, `\n${moment().format( "YYYY-MM-DD-hh-mm-ss" )}: ${msg}` );
					} );
			}
			throw err;
		} );
}


