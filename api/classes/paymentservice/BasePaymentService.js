/* global sails, PaymentManagement, Payment, Transaction */
"use strict";

const _ = require( "lodash" );
const EventEmitter = require( "events" );
const fs = require( "fs" );
const moment = require( "moment" );
const ObjectID = require( "mongodb" ).ObjectID;
const util = require( "util" );
const querystring = require( "querystring" );

const pmtSvcConfig = sails.config.paymentService;

const CREDIT_STATUS = {
	NA: 0,
	PENDING: 1,
	ACCEPTED: 2,
	ERROR: 3
};

class BasePaymentService extends EventEmitter {
	constructor() {
		super();
		this._instanceClass = "base";
		this.CREDIT_STATUS = CREDIT_STATUS;
	}

	processScheduledPayments( ipAddr ) {
		// const Promise = require( "bluebird" );
		// const self = this;
		// const debugLogPath = `${sails.config.appPath}/paymentservice/processScheduledPayments/${moment().format( "YYYY-MM-DD" )}.txt`;
		// debugLog( `processScheduledPayments[ ${self._instanceClass} ]; START -- ipAddr: ${ipAddr}` );
		// const todayStartOfDay = moment().startOf( "day" ).toDate();
		// const todayEndOfDay = moment().endOf( "day" ).toDate();
		// return Promise.resolve() // create bluebird promise
		// .then( () => {
		// 	return PaymentManagement.find( {
		// 		status: { $in: [ sails.config.paymentManagementStatus.active ], $exists: true },
		// 		isPaymentActive: { $eq: true, $exists: true },
		// 		achstatus: { $eq: 1, $exists: true },
		// 		failedtranscount: { $eq: 0, $exists: true },
		// 		nextPaymentSchedule: { $exists: true, $gte: todayStartOfDay, $lte: todayEndOfDay },
		// 		$and: [ { $or: [ { moveToArchive: { $exists: false } }, { moveToArchive: { $eq: 0, $exists: true } } ] } ]
		// 	} )
		// 	.populate( "user" )
		// 	.populate( "account" )
		// 	.populate( "practicemanagement" );
		// } )
		// .then( ( contracts ) => {
		// 	debugLog( `processScheduledPayments[ ${self._instanceClass} ]; contracts.length: ${contracts.length}` );
		// 	if( contracts.length == 0 ) {
		// 		return;
		// 	}
		// 	const paymentPromises = [];
		// 	const contractPayments = [];
		// 	_.forEach( contracts, ( paymentmanagement ) => {
		// 		let hasPaymentsDue = false;
		// 		let nextPaymentSchedule;
		// 		_.forEach( paymentmanagement.paymentSchedule, ( paymentScheduleItem ) => {
		// 			if( paymentScheduleItem.status != "OPEN" ) return;
		// 			const paymentScheduleDate = moment( paymentScheduleItem.date ).toDate();
		// 			if( paymentScheduleDate >= todayStartOfDay ) {
		// 				if( nextPaymentSchedule == undefined || paymentScheduleDate < nextPaymentSchedule ) nextPaymentSchedule = paymentScheduleDate;
		// 				if( paymentScheduleDate >= todayStartOfDay && paymentScheduleDate <= todayEndOfDay ) {
		// 					sails.log.verbose( `processScheduledPayments[ ${self._instanceClass} ]; item:`, JSON.stringify( paymentScheduleItem ) );
		// 					hasPaymentsDue = true;
		// 					contractPayments.push( {
		// 						paymentmanagement: paymentmanagement,
		// 						practicemanagement: paymentmanagement.practicemanagement,
		// 						user: paymentmanagement.user,
		// 						account: paymentmanagement.account,
		// 						paymentScheduleItem: paymentScheduleItem
		// 					} );
		// 				}
		// 			}
		// 		} );
		// 		if( ! hasPaymentsDue ) {
		// 			if( nextPaymentSchedule ) {
		// 				debugLog( `processScheduledPayments[ ${self._instanceClass} ]; ${paymentmanagement.loanReference} ADJUSTING nextPaymentSchedule: ${moment( nextPaymentSchedule ).format()}` );
		// 				paymentPromises.push( () => {
		// 					return PaymentManagement.update( { id: paymentmanagement.id }, { nextPaymentSchedule: nextPaymentSchedule } );
		// 				} );
		// 			} else {
		// 				debugLog( `processScheduledPayments[ ${self._instanceClass} ]; ${paymentmanagement.loanReference} nextPaymentSchedule: ${moment( paymentmanagement.nextPaymentSchedule ).format()} NO MATCHING PAYMENT IN SCHEDULE` );
		// 			}
		// 		}
		// 	} );
		// 	sails.log.verbose( `processScheduledPayments[ ${self._instanceClass} ]; contractPayments:`, contractPayments.length );
		// 	return self.processContractPayments( contractPayments, ipAddr )
		// 	.then( () => {
		// 		return Promise.each( paymentPromises, ( fn ) => fn() );
		// 	} );
		// } )
		// .catch( ( err ) => {
		// 	sails.log.error( `processScheduledPayments[ ${self._instanceClass} ]; catch:`, err );
		// } )
		// .finally( () => {
		// 	debugLog( `processScheduledPayments[ ${self._instanceClass} ]; END` );
		// } );
		//
		// function debugLog() {
		// 	const logStr = util.format.apply( null, arguments );
		// 	sails.log.info( logStr );
		// 	fs.appendFileSync( debugLogPath, `${moment().format( "YYYY-MM-DD HH:mm:ss.SSS" )}: ${logStr}\n` );
		// }
		return null;
	}

	/**
	 * process contract payments -- MAY BE OVERRIDDEN
	 * @param {Array} contractPayments
	 * @param {string} ipAddr
	 * @return {Promise}
	 */
	processContractPayments( contractPayments, ipAddr, paymentScheduleItemIndex ) {
		// const self = this;
		// const paymentPromises = [];
		// _.forEach( contractPayments, ( contract ) => {
		// 	paymentPromises.push( () => {
		// 		return self.processScheduledPayment( contract.paymentmanagement, contract.practicemanagement, contract.user, contract.account, contract.paymentScheduleItem, ipAddr )
		// 		.catch( ( err ) => {
		// 			sails.log.error( "processContractPayments; catch:", err );
		// 		} );
		// 	} );
		// } );
		// return Promise.each( paymentPromises, ( fn ) => fn() );
		return null;
	}


	/**
	 * process payment
	 * @param {PaymentManagement} paymentmanagement
	 * @param {PracticeManagement} practicemanagement
	 * @param {User} user
	 * @param {Account} account
	 * @param {Object} paymentScheduleItem entry from PaymentManagement.paymentSchedule
	 * @param {string} ipAddr IP Address of payment origination
	 * @return {Promise}
	 */
	processScheduledPayment( paymentmanagement, practicemanagement, user, account, paymentScheduleItem, ipAddr ) {
		// const self = this;
		// // const debugLogPath = `${sails.config.appPath}/paymentservice/processScheduledPayments/${moment().format( "YYYY-MM-DD" )}.txt`;
		// const debugLogPath = `${sails.config.appPath}/logs/viking/${moment().format( "YYYY-MM-DD" )}.txt`;
		//
		// let pmtRef;
		// let payment = {
		// 	paymentmanagement: paymentmanagement.id,
		// 	practicemanagement: practicemanagement.id,
		// 	user: user.id,
		// 	type: pmtSvcConfig.TYPES.OPERATING_DEBIT_USER
		// };
		// debugLog( `processScheduledPayment[ ${paymentmanagement.loanReference} ]; START` );
		//
		// return Promise.resolve()
		// .then( () => {
		// 	return Payment.getNextValue()
		// 	.then( ( ref ) => {
		// 		pmtRef = payment.pmtRef = ref;
		// 		debugLog( `processScheduledPayment[ ${paymentmanagement.loanReference} ][ ${pmtRef} ];` );
		// 	} );
		// } )
		// .then( () => {
		// 	const isFirstPayment = parseFloat( paymentScheduleItem.startBalanceAmount ) == parseFloat( paymentmanagement.payOffAmount );
		// 	// const pfiPercentFee = parseFloat( sails.config.actumConfig.pfiPercentFee );
		// 	// const pfiOriginationFee = parseFloat( sails.config.actumConfig.pfiOriginationFee );
		// 	const isContractSold = _.get( paymentmanagement, "isContractSold", 0 );
		// 	const orderNumber = `${user.userReference}:${paymentmanagement.loanReference}:${payment.pmtRef}`;
		// 	payment.amount = parseFloat( parseFloat( paymentScheduleItem.amount ).toFixed( 2 ) );
		// 	payment.interestAmount = parseFloat( parseFloat( paymentScheduleItem.interestAmount ).toFixed( 2 ) );
		// 	payment.principalAmount = parseFloat( parseFloat( paymentScheduleItem.principalAmount ).toFixed( 2 ) );
		// 	payment.principalBalance = parseFloat( ( parseFloat( paymentScheduleItem.startBalanceAmount ) - payment.principalAmount ).toFixed( 2 ) );
		// 	// payment.originationFee = ( isFirstPayment ? parseFloat( pfiOriginationFee.toFixed( 2 ) ) : 0.0 );
		// 	payment.originationFee = 0.0;
		// 	// payment.fixedFee = parseFloat( sails.config.actumConfig.pfiFixedFee );
		// 	payment.fixedFee = 0.0;
		// 	payment.commissionFee = 0.0;
		// 	payment.commissionAmount = 0.0;
		// 	payment.paybackAmount = 0.0;
		// 	// payment.contractSoldPercentage = parseInt( _.get( paymentmanagement, "contractSoldPercentage", 0 ) );
		// 	payment.contractSoldPercentage = 0;
		// 	payment.practicePayback = 0.0;
		// 	payment.debtfundPayback = 0.0;
		// 	payment.operatingPayback = 0.0;
		// 	payment.status = Payment.STATUS_PENDING;
		// 	payment.errReason = "";
		// 	payment.order_id = null;
		// 	payment.history_id = null;
		// 	payment.authcode = null;
		// 	payment.achJoinDate = moment().startOf( "day" ).toDate();
		// 	payment.pmtRequest = self.prepareDebitPayment( payment, user, account, orderNumber, ipAddr );
		// 	payment.pmtResponse = null;
		// 	payment.statusRequest = null;
		// 	payment.statusResponse = null;
		// 	payment.practiceCreditStatus = CREDIT_STATUS.NA;
		// 	payment.practiceCreditPmt = null;
		// 	payment.debtfundCreditStatus = CREDIT_STATUS.NA;
		// 	payment.debtfundCreditPmt = null;
		// 	// if( isContractSold == 1 ) {
		// 	// 	if( payment.contractSoldPercentage == 100 ) {
		// 	// 		// debtfund: 100% of payment
		// 	// 		payment.debtfundPayback = payment.paybackAmount = payment.amount;
		// 	// 		payment.debtfundCreditStatus = CREDIT_STATUS.PENDING;
		// 	// 	} else {
		// 	// 		// debtfund: x% of payment, practice: y% of payment
		// 	// 		payment.debtfundPayback = parseFloat( ( payment.amount * ( payment.contractSoldPercentage / 100 ) ).toFixed( 2 ) );
		// 	// 		const practicePayback = parseFloat( ( payment.amount - payment.debtfundPayback ).toFixed( 2 ) );
		// 	// 		payment.commissionFee = ( pfiPercentFee > 0 ? parseFloat( ( pfiPercentFee * practicePayback ).toFixed( 2 ) ) : 0.0 );
		// 	// 		payment.commissionAmount = parseFloat( ( payment.originationFee + payment.fixedFee + payment.commissionFee ).toFixed( 2 ) );
		// 	// 		payment.practicePayback = parseFloat( ( practicePayback - payment.commissionAmount ).toFixed( 2 ) );
		// 	// 		payment.paybackAmount = parseFloat( ( payment.amount - payment.commissionAmount ).toFixed( 2 ) );
		// 	// 		payment.debtfundCreditStatus = CREDIT_STATUS.PENDING;
		// 	// 		payment.practiceCreditStatus = CREDIT_STATUS.PENDING;
		// 	// 	}
		// 	// } else {
		// 	// 	// 0% sold
		// 	// 	payment.commissionFee = ( pfiPercentFee > 0 ? parseFloat( ( pfiPercentFee * payment.amount ).toFixed( 2 ) ) : 0.0 ); // patientfi: x% of payment
		// 	// 	payment.commissionAmount = parseFloat( ( payment.originationFee + payment.fixedFee + payment.commissionFee ).toFixed( 2 ) );
		// 	// 	payment.practicePayback = payment.paybackAmount = parseFloat( ( payment.amount - payment.commissionAmount ).toFixed( 2 ) ); // practice: payment - (x% of payment)
		// 	// 	payment.practiceCreditStatus = CREDIT_STATUS.PENDING;
		// 	// }
		// 	sails.log.verbose( `processScheduledPayment[ ${paymentmanagement.loanReference} ][ ${pmtRef} ]; payment:`, JSON.stringify( payment ) );
		// 	return Payment.create( payment )
		// 	.then( ( created ) => {
		// 		payment = created;
		// 		return self.processPayment( payment )
		// 		.then( ( pmtResponse ) => {
		// 			sails.log.info( `processScheduledPayment[ ${paymentmanagement.loanReference} ][ ${pmtRef} ]; status:`, payment.status, JSON.stringify( pmtResponse ) );
		// 			if( payment.status == Payment.STATUS_PENDING ) {
		// 				paymentScheduleItem.status = payment.status;
		// 			} else {
		// 				paymentScheduleItem.status = Payment.STATUS_DECLINED;
		// 			}
		// 			paymentScheduleItem.paymentId = payment.id;
		// 			paymentScheduleItem.pmtRef = payment.pmtRef;
		// 			return PaymentManagement.update( { id: paymentmanagement.id }, { paymentSchedule: paymentmanagement.paymentSchedule } );
		// 		} )
		// 		.then( () => {
		// 			return self.postPaymentProcessing( payment, account ).then( () => payment );
		// 		} );
		// 	} );
		// } )
		// .catch( ( err ) => {
		// 	sails.log.error( `processScheduledPayment[ ${paymentmanagement.loanReference} ][ ${pmtRef} ]; catch:`, err );
		// } )
		// .finally( () => {
		// 	debugLog( `processScheduledPayment[ ${paymentmanagement.loanReference} ][ ${pmtRef} ]; END` );
		// } );
		//
		// function debugLog() {
		// 	const logStr = util.format.apply( null, arguments );
		// 	sails.log.info( logStr );
		// 	fs.appendFileSync( debugLogPath, `${moment().format( "YYYY-MM-DD HH:mm:ss.SSS" )}: ${logStr}\n` );
		// }
		return null;
	}


	postPaymentProcessing( payment, account ) {
		// const self = this;
		// if( payment.status == Payment.STATUS_PENDING ) {
		// 	return Transaction.createPaymentTransaction( payment )
		// 	.then( () => {
		// 		return PaymentManagement.updatePaymentSchedule( payment, account )
		// 		.then( ( paymentDet ) => {
		// 			// return User.findOne( { id: payment.user } )
		// 			// .then( ( userdata ) => {
		// 			// 	EmailService.sendLoanRepaymentEmail( userdata, amountPull ,emailType, type, paymentManagementDetail.story.id );
		// 			// 	return { statusCode: 200, message: "Recurring debit completed successfully" };
		// 			// } );
		// 			return { statusCode: 200, message: "Recurring debit completed successfully" };
		// 		} )
		// 		.catch( ( err ) => {
		// 			sails.log.error( "postPaymentProcessing; catch:", err );
		// 			return { statusCode: 401, message: "Unable to update payment schedule information" };
		// 		} );
		// 	} );
		// } else {
		// 	return PaymentManagement.findOne( { id: payment.paymentmanagement } )
		// 	.then( ( paymentmanagement ) => {
		// 		let failure_authcode = "";
		// 		let failure_historyId = "";
		// 		if( payment.status == Payment.STATUS_DECLINED ) {
		// 			failure_historyId = payment.history_id;
		// 			failure_authcode = payment.authcode;
		// 		}
		// 		// if( paymentmanagement.failedtranscount ) {
		// 		// 	paymentmanagement.failedtranscount = paymentmanagement.failedtranscount + 1;
		// 		// } else {
		// 		// 	paymentmanagement.failedtranscount = 1;
		// 		// }
		// 		paymentmanagement.failedtranscount = 0;
		// 		if( ! paymentmanagement.failedtransactions ) {
		// 			paymentmanagement.failedtransactions = [];
		// 		}
		// 		paymentmanagement.failedtransactions.push( {
		// 			amount: payment.amount,
		// 			pmtRef: payment.pmtRef,
		// 			date: new Date()
		// 		} );
		//
		// 		paymentmanagement.usertransactions = _.get( paymentmanagement, "usertransactions", [] );
		// 		paymentmanagement.usertransactions.push( {
		// 			amount: payment.amount,
		// 			loanID: payment.pmtRef,
		// 			paymentId: payment.id,
		// 			status: 3,
		// 			transactionId: "",
		// 			transactionType: "Automatic",
		// 			apiType: sails.config.paymentService.vendor,
		// 			accountName: account.accountName,
		// 			accountNumberLastFour: account.accountNumberLastFour,
		// 			accountId: account.id,
		// 			initialschedule: paymentmanagement.paymentSchedule,
		// 			failure_authcode: failure_authcode,
		// 			failure_historyId: failure_historyId,
		// 			date: new Date()
		// 		} );
		//
		// 		_.forEach( paymentmanagement.paymentSchedule, ( schedule ) => {
		// 			if( moment().startOf( "day" ).toDate().getTime() == moment( schedule.date ).startOf( "day" ).toDate().getTime() ) {
		// 				schedule.date = moment().startOf( "day" ).add( 1, "days" ).toDate();
		// 			}
		// 		} );
		//
		// 		return paymentmanagement.save()
		// 		.then( () => {
		// 			return { statusCode: 401, message: "failed" };
		// 		} );
		// 	} );
		// }
		return null;
	}


	/**
	 * Prepare Debit Payment
	 * @param {Payment} payment Payment model
	 * @param {User} user User model
	 * @param {Account} userAccount Account model
	 * @param {string} orderNumber order number
	 * @param {string} ipAddr IP Address
	 * @param {PracticeManagement} practicemanagement PracticeManagement model
	 * @return {Object}
	 */
	prepareDebitPayment( payment, user, userAccount, orderNumber, ipAddr, practicemanagement = null ) {
		// const self = this;
		// const account = {};
		// const customer = { order_number: orderNumber };
		// sails.log.verbose( "prepareDebitPayment; payment.type:", payment.type );
		// switch( payment.type ) {
		// 	case pmtSvcConfig.TYPES.DEBTFUND_CREDIT_PRACTICE:
		// 	case pmtSvcConfig.TYPES.OPERATING_CREDIT_DEBTFUND:
		// 	case pmtSvcConfig.TYPES.OPERATING_CREDIT_PRACTICE:
		// 		sails.log.error( `prepareDebitPayment; Incorrect Payment.type: ${payment.type} for Debit payment` );
		// 		return null;
		// 	case pmtSvcConfig.TYPES.DEBTFUND_DEBIT_PRACTICE:
		// 		account.parent_id = actumConfig.debtfund.parent_id;
		// 		account.sub_id = actumConfig.debtfund.debit_sub_id;
		// 		account.username = actumConfig.debtfund.username;
		// 		account.password = actumConfig.debtfund.password;
		// 		account.syspass = actumConfig.debtfund.syspass;
		// 		customer.name = practicemanagement.PracticeName.substr( 0, 64 );
		// 		customer.email = practicemanagement.PracticeEmail;
		// 		customer.address = practicemanagement.StreetAddress;
		// 		customer.city = practicemanagement.City;
		// 		customer.state = practicemanagement.StateCode;
		// 		customer.zip = practicemanagement.ZipCode;
		// 		customer.phone = practicemanagement.PhoneNo;
		// 		customer.account = practicemanagement.Accountnumber;
		// 		customer.routing = practicemanagement.Routingnumber;
		// 		return self.prepareAchDebit( account, customer, payment.amount, ipAddr );
		// 	case pmtSvcConfig.TYPES.OPERATING_DEBIT_DEBTFUND:
		// 		account.parent_id = actumConfig.operating.parent_id;
		// 		account.sub_id = actumConfig.operating.debit_sub_id;
		// 		account.username = actumConfig.operating.username;
		// 		account.password = actumConfig.operating.password;
		// 		account.syspass = actumConfig.operating.syspass;
		// 		customer.name = actumConfig.pfiCustomer.name;
		// 		customer.email = actumConfig.pfiCustomer.email;
		// 		customer.address = actumConfig.pfiCustomer.address;
		// 		customer.city = actumConfig.pfiCustomer.city;
		// 		customer.state = actumConfig.pfiCustomer.state;
		// 		customer.zip = actumConfig.pfiCustomer.zip;
		// 		customer.phone = actumConfig.pfiCustomer.phone;
		// 		customer.account = actumConfig.debtfund.account;
		// 		customer.routing = actumConfig.debtfund.routing;
		// 		return self.prepareAchDebit( account, customer, payment.amount, ipAddr );
		// 	case pmtSvcConfig.TYPES.OPERATING_DEBIT_USER:
		// 		account.parent_id = actumConfig.operating.parent_id;
		// 		account.sub_id = actumConfig.operating.debit_sub_id;
		// 		account.username = actumConfig.operating.username;
		// 		account.password = actumConfig.operating.password;
		// 		account.syspass = actumConfig.operating.syspass;
		// 		customer.account = userAccount.accountNumber;
		// 		customer.routing = userAccount.routingNumber;
		// 		customer.name = `${user.firstname} ${user.lastname}`.substr( 0, 64 );
		// 		customer.email = user.email;
		// 		customer.address = user.street;
		// 		customer.city = user.city;
		// 		customer.state = user.state;
		// 		customer.zip = user.zipCode;
		// 		customer.phone = user.phoneNumber.replace( /[^0-9]/g, "" );
		// 		return self.prepareAchDebit( account, customer, payment.amount, ipAddr );
		// }
		// sails.log.error( "prepareDebitPayment; Unhandled condition!" );
		return null;
	}



	prepareCreditPayment( payment, practicemanagement, user, orderNumber, ipAddr ) {
		sails.log.error( `prepareCreditPayment[ ${this._instanceClass} ][ ${payment.pmtRef} ]; METHOD MUST BE OVERRIDDEN!` );
		return null;
	}
	postPaymentBatchProcessing( achBatch ) {
		sails.log.error( `postPaymentBatchProcessing[ ${this._instanceClass} ]; METHOD MUST BE OVERRIDDEN!` );
		return null;
	}
	processPayments(payments) {
		sails.log.error( `processPayments[ ${this._instanceClass} ]; METHOD MUST BE OVERRIDDEN!` );
		return null;
	}
	processPayment( payment ) {

		// //Where to send to make payment
		// const self = this;
		// return new Promise( ( resolve, reject ) => {
		// 	const logPath = `paymentservice/processPayment/${payment.id}.txt`;
		// 	sails.log.verbose( "processPayment; pmtRequest:", JSON.stringify( payment.pmtRequest ) );
		// 	fs.appendFileSync( logPath, `${JSON.stringify( payment.pmtRequest )}\n\n` );
		// 	const update = {};
		// 	request( payment.pmtRequest, ( err, response, body ) => {
		// 		if( err ) {
		// 			sails.log.error( "processPayment; request( err ):", err );
		// 			return reject( err );
		// 		}
		// 		sails.log.verbose( "processPayment; status:", response.statusCode, response.statusMessage );
		// 		fs.appendFileSync( logPath, `${body}\n\n` );
		// 		update.pmtResponse = parseResponse( body );
		// 		const pmtStatus = _.get( update, "pmtResponse.status", "unknown" );
		// 		if( `${pmtStatus}`.toLowerCase() == "accepted" ) {
		// 			update.status = Payment.STATUS_PENDING;
		// 			update.order_id = update.pmtResponse.order_id;
		// 			update.history_id = update.pmtResponse.history_id;
		// 			update.authcode = update.pmtResponse.authcode;
		// 		} else {
		// 			update.status = Payment.STATUS_DECLINED;
		// 			update.history_id = update.pmtResponse.history_id;
		// 			update.errReason = self.errorReasons( update.pmtResponse.authcode );
		// 		}
		// 		return Payment.update( { id: payment.id }, update )
		// 			.then( ( updated ) => {
		// 				_.assign( payment, updated[ 0 ] );
		// 				return Promise.resolve()
		// 					.then( () => {
		// 						if( [ Payment.STATUS_DECLINED, Payment.STATUS_RETURNED ].indexOf( payment.status ) >= 0 ) {
		// 							self.sendEmailAlert( { template: "emailTemplates/paymentsAlert", templateData: { subject: "Failed Transaction", payment: payment } } );
		// 							return null;
		// 						}
		// 					} )
		// 					.then( () => {
		// 						return resolve( payment.pmtResponse );
		// 					} );
		// 			} );
		// 	} );
		// } );
		return null;
	}

	checkPaymentStatuses( ipAddr ) {
		const Promise = require( "bluebird" );
		const moment = require( "moment-business-days" );
		const self = this;
		return Payment.find( {
			order_id: { $exists: true, $nin: [ null, "" ] },
			status: { $in: [ Payment.STATUS_PENDING, Payment.STATUS_SETTLING ] }
		} )
		.then( ( pendingPayments ) => {
			const statusPromiseFns = [];
			_.forEach( pendingPayments, ( _payment ) => {
				const payment = _.cloneDeep( _payment );
				const order_id = _.get( payment, "order_id", null );
				if( ! order_id ) {
					sails.log.error( `checkPaymentStatuses; ${payment.status} missing order_id for: ${payment.pmtRef} ${payment.id}` );
					return;
				}
				statusPromiseFns.push( () => {
					sails.log.verbose( `checkPaymentStatus; ${payment.pmtRef} ${payment.id}` );
					return self.checkPaymentStatus( payment )
					.then( ( updatedPayment ) => {
						const achJoinDate = moment( _.get( updatedPayment, "achJoinDate", new Date() ) );
						const businessDaysDiff = moment().businessDiff( achJoinDate );
						const updatePmt = {};
						let willUpdatePayment = false;
						if( updatedPayment.status = Payment.STATUS_PENDING && businessDaysDiff > pmtSvcConfig.settlingBusinessDays ) {
							updatePmt.status = Payment.STATUS_SETTLING;
							willUpdatePayment = true;
						}
						if( updatedPayment.status = Payment.STATUS_SETTLING && businessDaysDiff > pmtSvcConfig.paidBusinessDays ) {
							updatePmt.status = Payment.STATUS_PAID;
							willUpdatePayment = true;
						}
						if( willUpdatePayment ) {
							sails.log.verbose( `checkPaymentStatus; ${payment.pmtRef} ${payment.id} updatePmt:`, updatePmt );
							return Payment.update( { id: updatedPayment.id }, updatePmt );
						}
						sails.log.verbose( `checkPaymentStatus; ${updatedPayment.pmtRef} ${updatedPayment.id} status:`, updatedPayment.status );
					} )
					.catch( ( err ) => {
						sails.log.error( `checkPaymentStatus; ${payment.pmtRef} ${payment.id} catch:`, err );
					} );
				} );
			} );
			return Promise.each( statusPromiseFns, ( fn ) => fn() );
		} );
	}


	checkPaymentStatus( payment ) {
		sails.log.error( `checkPaymentStatuses[ ${this._instanceClass} ][ ${payment.pmtRef} ]; METHOD MUST BE OVERRIDDEN!` );
		return null;
	}

	updatePaymentSchedule( payment ) {
		sails.log.error( `updatePaymentSchedule[ ${this._instanceClass} ][ ${payment.pmtRef} ]; METHOD MUST BE OVERRIDDEN!` );
		return null;
	}

	/**
	 * send email alert
	 * @param {Object} params
	 * @param {string} params.template template path and filename
	 * @param {Object} params.templateData
	 * @param {string} params.templateData.subject email subject header
	 * @return {Promise}
	 */
	sendEmailAlert( params ) {
		const Promise = require( "bluebird" );
		const self = this;
		const mailerConfig = sails.config.mailer;
		const mailer = mailerConfig.contactAccount;
		const template = _.get( params, "template", null );
		const templateData = _.get( params, "templateData", {} );
		if( ! template ) {
			sails.log.error( "sendEmailAlert; missing template!", JSON.stringify( params ) );
			return Promise.resolve();
		}
		return Promise.resolve()
			.then( () => {
				const paymentId = _.get( templateData, "payment.id", null );
				if( paymentId ) {
					return Payment.findOne( { id: paymentId } )
						.populate( "paymentmanagement" )
						.populate( "practicemanagement" )
						.populate( "user" )
						.then( ( payment ) => {
							if( payment == undefined ) return;
							templateData.paymentmanagement = _.get( payment, "paymentmanagement", null );
							templateData.practicemanagement = _.get( payment, "practicemanagement", null );
							templateData.user = _.get( payment, "user", null );
						} );
				}
			} )
			.then( () => {
				return new Promise( ( resolve, reject ) => {
					templateData.hostname = mailerConfig.hostName;
					sails.renderView( template, templateData, ( err, view ) => {
						if( err ) {
							sails.log.error( "sendEmailAlert; renderView error:", err );
							return resolve();
						}
						const mailOptions = {
							from: mailerConfig.sender,
							to: pmtSvcConfig.emailAlerts.toEmail,
							cc: pmtSvcConfig.emailAlerts.ccEmails,
							bcc: pmtSvcConfig.emailAlerts.bccEmails,
							subject: _.get( templateData, "subject", "Alert" ),
							html: view
						};
						mailer.sendMail( mailOptions, ( err, info ) => {
							if( err ) {
								sails.log.error( "sendEmailAlert; mailer.sendMail error:", err );
								return resolve();
							}
							sails.log.verbose( "sendEmailAlert; mailer.sendMail info:", JSON.stringify( info ) );
							return resolve();
						} );
					} );
				} )
					.catch( ( err ) => {
						sails.log.error( "sendEmailAlert; catch:", err );
					} );
			} );
	}
	 prepareAchDebit( account, customer, amount, ipAddr ) {
		if( process.env.NODE_ENV != "production" && process.env.NODE_ENV != "live" ) {
			customer = Object.assign( customer, sails.config.actumConfig.testCustomer );
			amount = 0.01;
		}
		const debitData = {
			parent_id: account.parent_id,
			sub_id: account.sub_id,
			pmt_type: "chk",
			chk_acct: customer.account,
			chk_aba: customer.routing,
			custname: customer.name,
			custemail: customer.email,
			custaddress1: customer.address,
			custcity: customer.city,
			custstate: customer.state,
			custzip: customer.zip,
			custphone: customer.phone,
			merordernumber: customer.order_number,
			initial_amount: parseFloat( amount ).toFixed( 2 ),
			billing_cycle: "-1",
			ip_forward: ipAddr,
			action_code: "P",
			trans_modifier: "S"
		};
		const reqParams = {
			method: "POST",
			uri: sails.config.actumConfig.actumApiUrl,
			headers: {
				"username": account.username,
				"password": account.password,
				"syspass": account.syspass,
				"Content-Type": "application/x-www-form-urlencoded"
			},
			body: querystring.stringify( debitData )
		};
		return reqParams;
	}
}

module.exports = BasePaymentService;
