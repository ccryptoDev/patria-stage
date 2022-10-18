/* global sails, PaymentManagement, Payment, Transaction */
"use strict";

const _ = require( "lodash" );
const EventEmitter = require( "events" );
const fs = require( "fs" );
const moment = require( "moment" );
const ObjectID = require( "mongodb" ).ObjectID;
const util = require( "util" );
class BasePlatformSpecificService extends EventEmitter {
	constructor() {
		super();
		this._instanceClass = "base";
	}
	async updateCollectionItemForBankruptcy(paymentId, bankruptcyData, confirmReason, loggedInUser) {
		sails.log.error( `updateCollectionItemForBankruptcy[ ${this._instanceClass} ][ ${paymentId} ]; METHOD MUST BE OVERRIDDEN!` );
		return null;
	}
	getPaymentLedger( self, ledgerDate ) {
		sails.log.verbose("Using base platform specific service");
		ledgerDate = moment( ledgerDate ).startOf( "day" ).toDate();
		const today = moment().startOf( "day" ).toDate();
		const loanSetdate = moment( _.get( self, "loanSetdate", null ) ).startOf( "day" ).toDate();
		const noInterestPayoffDate = moment( loanSetdate ).startOf( "day" ).add( sails.config.paymentService.waiveInterestMonths, "months" ).toDate();
		// sails.log.verbose( "getPaymentScheduleLedger; noInterestPayoffDate:", noInterestPayoffDate );
		const loanAmount = parseFloat( parseFloat( self.payOffAmount ).toFixed( 2 ) );
		const ledger = {
			registry: [],
			regularPayment: 0,
			payoff: 0,
			principalPayoff: loanAmount,
			noInterestPayoff: loanAmount,
			principalPaid: 0,
			noInterestPaid: 0,
			accruedInterest: 0,
			unpaidInterest: 0,
			unpaidFees: 0,
			canPayoffWithNoInterest: ( sails.config.paymentService.waiveInterestMonths > 0 && ( ledgerDate < noInterestPayoffDate || moment( ledgerDate ).isSame( noInterestPayoffDate, "day" ) ) ),
			hasLatePayments: false
		};
		let totalAccruedInterest = 0;
		let totalInterestPaid = 0;
		let accrueInterestDate = moment( loanSetdate ).startOf( "day" ).toDate();
		const paymentSchedule = self.paymentSchedule;
		_.forEach( paymentSchedule, ( scheduleItem ) => {
			if( ledger.regularPayment == 0 && scheduleItem.initiator == "regular" ) {
				ledger.regularPayment = scheduleItem.amount;
			}
			if( scheduleItem.date < today || moment( scheduleItem.date ).isSame( today, "day" ) ) {
				if( [ "OPENED", "LATE", "DECLINED", "RETURNED" ].indexOf( scheduleItem.status ) >= 0 ) {
					ledger.hasLatePayments = true;
				}
			}
			if( scheduleItem.date < ledgerDate || moment( scheduleItem.date ).isSame( ledgerDate, "day" ) ) {
				const accruedInterest = parseFloat( parseFloat( _.get( scheduleItem, "accruedInterest", scheduleItem.interestAmount ) ).toFixed( 2 ) );
				totalAccruedInterest = parseFloat( ( totalAccruedInterest + accruedInterest ).toFixed( 2 ) );
				totalInterestPaid = parseFloat( ( totalInterestPaid + scheduleItem.interestAmount ).toFixed( 2 ) );
				const lineItem = {
					date: scheduleItem.date,
					initiator: scheduleItem.initiator,
					amount: scheduleItem.amount,
					principalBalance: ledger.principalPayoff,
					startBalanceAmount: scheduleItem.startBalanceAmount,
					accruedInterest: accruedInterest,
					interestPaid: scheduleItem.interestAmount,
					unpaidInterest: parseFloat( parseFloat( _.get( scheduleItem, "unpaidInterest", 0 ) ).toFixed( 2 ) ),
					feesAmount: scheduleItem.feesAmount,
					feesPaid: 0,
					principalPaid: 0,
					status: scheduleItem.status
				};
				const startBalanceAmount = parseFloat( ledger.principalPayoff );
				const noInterestPayoff = parseFloat( ledger.noInterestPayoff );
				// TODO: late payments
				if( scheduleItem.status ) {
					accrueInterestDate = scheduleItem.date;
					let payment = parseFloat( scheduleItem.amount );
					// apply payment to accrued interest
					lineItem.interestPaid = parseFloat( payment > lineItem.accruedInterest ? lineItem.accruedInterest : payment );
					payment = parseFloat( ( payment - lineItem.interestPaid ).toFixed( 2 ) );
					// apply remainder to principal balance
					lineItem.principalPaid = parseFloat( payment );
					ledger.principalPayoff = parseFloat( ( startBalanceAmount - lineItem.principalPaid ).toFixed( 2 ) );
					ledger.noInterestPayoff = ( ledger.canPayoffWithNoInterest ? Math.max( 0, parseFloat( ( noInterestPayoff - lineItem.amount ).toFixed( 2 ) ) ) : ledger.principalPayoff );
					sails.log.verbose( "getPaymentLedger;", [ moment( scheduleItem.date ).format( "MM/DD/YYYY" ), noInterestPayoff, "", scheduleItem.amount, ledger.noInterestPayoff, "", startBalanceAmount, lineItem.principalPaid, ledger.principalPayoff, "", lineItem.accruedInterest, lineItem.interestAmount, lineItem.unpaidInterest ].join( "\t" ) );
				}
				// ledger.registry.push( lineItem ); // TODO: unused
			}
			ledger.payoff = parseFloat( ledger.canPayoffWithNoInterest ? ledger.noInterestPayoff : ledger.principalPayoff );
		} );
		const accruedInterestDays = moment( ledgerDate ).startOf( "day" ).diff( moment( accrueInterestDate ).startOf( "day" ), "days" );
		ledger.accruedInterest = parseFloat( ( ledger.principalPayoff * parseFloat( self.apr ) / 100 / 365 * accruedInterestDays ).toFixed( 2 ) );
		sails.log.verbose( "getPaymentLedger; accrued interest:", accruedInterestDays, "days", ledger.accruedInterest, accrueInterestDate, ledgerDate );
		// sails.log.verbose( "getPaymentScheduleLedger; ledger:", JSON.stringify( ledger, null, 4 ) );
		// sails.log.verbose( "getPaymentScheduleLedger; principalPayoff:", ledger.principalPayoff );
		// sails.log.verbose( "getPaymentScheduleLedger; noInterestPayoff:", ledger.noInterestPayoff );
		// sails.log.verbose( "getPaymentScheduleLedger; payoff:", ledger.payoff );
		ledger.unpaidInterest = parseFloat( ( totalAccruedInterest - totalInterestPaid ).toFixed( 2 ) );
		sails.log.verbose( "getPaymentScheduleLedger; totalAccruedInterest:", totalAccruedInterest );
		sails.log.verbose( "getPaymentScheduleLedger; totalInterestPaid:", totalInterestPaid );
		sails.log.verbose( "getPaymentScheduleLedger; unpaidInterest:", ledger.unpaidInterest );
		return ledger;
	}
	getPaymentSchedule(paymentManagement) {
		const self = this;
		const paymentSchedule = _.get( self, "paymentSchedule", [] );
		paymentSchedule.sort( ( a, b ) => {
			const aDate = moment( a.date ).toDate();
			const bDate = moment( b.date ).toDate();
			if( aDate < bDate ) return -1;
			if( aDate > bDate ) return 1;
			if( _.get( a, "transaction", 1 ) < _.get( b, "transaction", 1 ) ) return -1;
			if( _.get( a, "transaction", 1 ) > _.get( b, "transaction", 1 ) ) return 1;
			return 0;
		} );
		_.forEach( paymentSchedule, ( scheduleItem ) => {
			scheduleItem.startBalanceAmount = parseFloat( scheduleItem.startBalanceAmount );
			scheduleItem.interestAmount = parseFloat( scheduleItem.interestAmount );
			scheduleItem.accruedInterest = parseFloat( parseFloat( _.get( scheduleItem, "accruedInterest", scheduleItem.interestAmount ) ).toFixed( 2 ) );
			scheduleItem.unpaidInterest = parseFloat( scheduleItem.unpaidInterest );
			scheduleItem.feesAmount = parseFloat( _.get( scheduleItem, "feesAmount", 0 ) );
			scheduleItem.principalAmount = parseFloat( scheduleItem.principalAmount );
			scheduleItem.amount = parseFloat( scheduleItem.amount );
			if( scheduleItem.amount == 0 ) {
				scheduleItem.amount = parseFloat( ( scheduleItem.interestAmount + scheduleItem.principalAmount ).toFixed( 2 ) );
			}
			scheduleItem.initiator = _.get( scheduleItem, "initiator", "regular" );
			scheduleItem.date = moment( scheduleItem.date ).toDate();
			scheduleItem.lastpaiddate = moment( scheduleItem.lastpaiddate ).toDate();
		} );
		return paymentSchedule;
	}

	async logUserActivity( loggedInUser, paymentId, moduleName, message, additionalLogDataObject = null ) {
		if(!loggedInUser || !paymentId || !moduleName || !message) {
			throw new Error( "Unable to log user activity. Missing required parameters." );
		}
		sails.log.info( "CollectionService#logUserActivity Logging with user", loggedInUser );
		const logReferenceData = await User.getNextSequenceValue( "logs" );
		sails.log.info( "User logReferenceData", logReferenceData );
		const logReference = `LOG_${logReferenceData.sequence_value}`;

		const logDetails = await Logactivity.create( {
			adminuser: loggedInUser.id,
			email: loggedInUser.email,
			modulename: moduleName,
			logmessage: message,
			logdata: additionalLogDataObject,
			logreference: logReference,
			paymentManagement: paymentId
		} );
		return logDetails;
	}

	moduleIsAvailable (path) {
		try {
			require.resolve(path);
			return true;
		} catch (e) {
			return false;
		}
	}


	/**
	 * preview payment and schedule
	 */
	previewPayment(self, paymentDate, paymentAmount, dialogState, accountId = null ) {
		paymentDate = moment( paymentDate ).startOf( "day" ).toDate();
		const today = moment().startOf( "day" ).toDate();
		const loanSetdate = moment( _.get( self, "loanSetdate", null ) ).startOf( "day" ).toDate();
		const noInterestPayoffDate = moment( loanSetdate ).startOf( "day" ).add( sails.config.paymentService.waiveInterestMonths, "months" ).toDate();
		sails.log.verbose( "previewPayment; noInterestPayoffDate:", noInterestPayoffDate );
		const paymentSchedule = self.paymentSchedule;
		const ledger = this.getPaymentLedger(self, paymentDate );
		const preview = {
			interestPayment: 0,
			feesPayment: 0,
			principalPayment: paymentAmount,
			principalBalance: 0,
			interestSavings: 0,
			paymentSchedule: [],
			nextPaymentSchedule: moment( self.nextPaymentSchedule ).startOf( "day" ).toDate()
		};
		if( preview.nextPaymentSchedule > paymentDate ) {
			preview.nextPaymentSchedule = paymentDate;
		}
		if( ledger.canPayoffWithNoInterest ) {
			if( dialogState.isPayoffPayment ) {
				ledger.accruedInterest = 0;
				paymentAmount = preview.principalPayment = parseFloat( ledger.noInterestPayoff );
			}
		} else {
			ledger.payoff = parseFloat( ( ledger.principalPayoff + ledger.accruedInterest ).toFixed( 2 ) );
			if( dialogState.isPayoffPayment ) {
				paymentAmount = preview.principalPayment = parseFloat( ledger.payoff );
			}
		}

		// apply payment to unpaid interest
		// sails.log.verbose( "previewPayment; ledger.unpaidInterest", ledger.unpaidInterest );
		if( ledger.unpaidInterest > 0 ) {
			const unpaidInterestPayment = parseFloat( preview.principalPayment >= ledger.unpaidInterest ? ledger.unpaidInterest : preview.principalPayment );
			preview.interestPayment = parseFloat( ( preview.interestPayment + unpaidInterestPayment ).toFixed( 2 ) );
			preview.principalPayment = parseFloat( ( preview.principalPayment - unpaidInterestPayment ).toFixed( 2 ) );
			ledger.unpaidInterest = parseFloat( ( ledger.unpaidInterest - unpaidInterestPayment ).toFixed( 2 ) );
		}

		// apply remaining payment to accrued interest
		const interestPayment = parseFloat( ( preview.principalPayment >= ledger.accruedInterest ? ledger.accruedInterest : preview.principalPayment ).toFixed( 2 ) );
		const pmtUnpaidInterest = parseFloat( ( ledger.accruedInterest - interestPayment ).toFixed( 2 ) );
		// sails.log.verbose( "previewPayment; interestPayment", interestPayment );
		// sails.log.verbose( "previewPayment; pmtUnpaidInterest", pmtUnpaidInterest );

		// apply remaing payment to principal
		preview.principalPayment = parseFloat( ( preview.principalPayment - interestPayment ).toFixed( 2 ) );
		preview.interestPayment = parseFloat( ( preview.interestPayment + interestPayment ).toFixed( 2 ) );
		const itemPayoff = parseFloat( ledger.canPayoffWithNoInterest ? ledger.noInterestPayoff : ledger.principalPayoff );
		preview.principalBalance = parseFloat( ( itemPayoff - preview.principalPayment ).toFixed( 2 ) );

		// transaction index
		let transactionIdx = 0;
		_.forEach( self.paymentSchedule, ( scheduleItem ) => {
			const itemTransaction = parseInt( _.get( scheduleItem, "transaction", 0 ) );
			if( itemTransaction > transactionIdx ) {
				transactionIdx = parseInt( itemTransaction );
			}
		} );
		++transactionIdx;

		// payment schedule item
		const newScheduleItem = {
			monthcount: transactionIdx,
			startBalanceAmount: parseFloat( dialogState.isPayoffPayment ? ledger.noInterestPayoff : ledger.principalPayoff ),
			principalAmount: parseFloat( preview.principalPayment ),
			interestAmount: parseFloat( preview.interestPayment ),
			amount: parseFloat( paymentAmount ),
			oldprincipalAmount: parseFloat( preview.principalPayment ),
			paidprincipalAmount: 0,
			paidinterestAmount: 0,
			lastpaidprincipalAmount: 0,
			lastpaidinterestAmount: 0,
			accruedInterest: parseFloat( ledger.accruedInterest ),
			unpaidInterest: parseFloat( pmtUnpaidInterest ),
			lastpaidcount: 0,
			date: paymentDate,
			lastpaiddate: paymentDate,
			transaction: transactionIdx,
			status: "OPENED",
			feesAmount: 0,
			initiator: "makepayment",
			account: accountId
		};
		sails.log.verbose( "previewPayment; newScheduleItem:", newScheduleItem );

		let principalPayoff = parseFloat( newScheduleItem.startBalanceAmount );
		let regularInterest = 0;
		let recalculatedInterest = 0;
		_.forEach( paymentSchedule, ( scheduleItem ) => {
			if( scheduleItem.date < newScheduleItem.date || moment( scheduleItem.date ).isSame( newScheduleItem.date, "day" ) ) {
				preview.paymentSchedule.push( scheduleItem );
			}
			if( scheduleItem.date > today || moment( scheduleItem.date ).isSame( today, "day" ) ) {
				regularInterest = parseFloat( ( regularInterest + scheduleItem.accruedInterest ).toFixed( 2 ) );
			}
		} );
		preview.paymentSchedule.push( newScheduleItem );
		principalPayoff = parseFloat( ( principalPayoff - newScheduleItem.principalAmount ).toFixed( 2 ) );
		preview.principalBalance = parseFloat( principalPayoff );
		let nextUnpaidInterest = parseFloat( ( newScheduleItem.unpaidInterest + ledger.unpaidInterest ).toFixed( 2 ) );
		recalculatedInterest = parseFloat( newScheduleItem.accruedInterest );
		let accruedInterestDate = newScheduleItem.date;
		_.forEach( paymentSchedule, ( scheduleItem ) => {
			if( principalPayoff == 0 ) return;
			if( scheduleItem.date > newScheduleItem.date ) {
				// unpaid interest
				const nextInterestPayment = parseFloat( nextUnpaidInterest >= scheduleItem.amount ? scheduleItem.amount : nextUnpaidInterest );
				scheduleItem.interestAmount = parseFloat( nextInterestPayment );
				scheduleItem.principalAmount = parseFloat( ( scheduleItem.amount - scheduleItem.interestAmount ) );
				nextUnpaidInterest = parseFloat( ( nextUnpaidInterest - scheduleItem.interestAmount ).toFixed( 2 ) );
				// accrued interest
				const accruedInterestDays = moment( scheduleItem.date ).startOf( "day" ).diff( moment( accruedInterestDate ).startOf( "day" ), "days" );
				scheduleItem.accruedInterest = parseFloat( ( principalPayoff * parseFloat( self.apr ) / 100 / 365 * accruedInterestDays ).toFixed( 2 ) );
				// sails.log.verbose( "previewPayment; accrued interest:", accruedInterestDays, "days", accruedInterest, accruedInterestDate, scheduleItem.date );
				const itemInterestPayment = parseFloat( scheduleItem.accruedInterest >= scheduleItem.principalAmount ? scheduleItem.principalAmount : scheduleItem.accruedInterest );
				scheduleItem.interestAmount = parseFloat( ( scheduleItem.interestAmount + itemInterestPayment ).toFixed( 2 ) );
				scheduleItem.principalAmount = parseFloat( ( scheduleItem.principalAmount - itemInterestPayment ).toFixed( 2 ) );
				scheduleItem.unpaidInterest = parseFloat( ( scheduleItem.accruedInterest - itemInterestPayment ).toFixed( 2 ) );
				nextUnpaidInterest = parseFloat( ( nextUnpaidInterest + scheduleItem.unpaidInterest ).toFixed( 2 ) );
				if( scheduleItem.principalAmount > principalPayoff ) {
					scheduleItem.principalAmount = parseFloat( principalPayoff );
					scheduleItem.amount = parseFloat( ( scheduleItem.interestAmount + scheduleItem.principalAmount ).toFixed( 2 ) );
				}
				scheduleItem.startBalanceAmount = parseFloat( principalPayoff );
				principalPayoff = parseFloat( ( principalPayoff - scheduleItem.principalAmount ).toFixed( 2 ) );
				// sails.log.verbose( "previewPayment; startBalanceAmount:", scheduleItem.transaction, scheduleItem.startBalanceAmount );
				preview.paymentSchedule.push( scheduleItem );
				accruedInterestDate = scheduleItem.date;
				recalculatedInterest = parseFloat( ( recalculatedInterest + scheduleItem.accruedInterest ).toFixed( 2 ) );
			}
		} );
		if( newScheduleItem.date > today || moment( newScheduleItem.date ).isSame( today, "day" ) ) {
			const lastScheduleItem = preview.paymentSchedule.slice( -1 )[ 0 ];
			const canPayoffWithNoInterest = ( sails.config.paymentService.waiveInterestMonths > 0 && ( lastScheduleItem.date < noInterestPayoffDate || moment( lastScheduleItem.date ).isSame( noInterestPayoffDate, "day" ) ) );
			sails.log.verbose( "previewPayment; canPayoffWithNoInterest:", canPayoffWithNoInterest );
			// recalculate all payments with amounts applied to principal (waived interest)
			if( canPayoffWithNoInterest ) {
				preview.paymentSchedule = [];
				recalculatedInterest = 0;
				preview.interestPayment = 0;
				newScheduleItem.interestAmount = 0;
				preview.principalPayment = newScheduleItem.principalAmount = parseFloat( newScheduleItem.amount );
				principalPayoff = parseFloat( parseFloat( self.payOffAmount ).toFixed( 2 ) );
				_.forEach( paymentSchedule, ( scheduleItem ) => {
					if( principalPayoff == 0 ) return;
					if( scheduleItem.date < today || moment( scheduleItem.date ).isSame( today, "day" ) ) {
						scheduleItem.interestAmount = 0;
						scheduleItem.principalAmount = parseFloat( scheduleItem.amount );
						scheduleItem.startBalanceAmount = parseFloat( principalPayoff );
						principalPayoff = ( parseFloat( ( principalPayoff - scheduleItem.principalAmount ).toFixed( 2 ) ) );
						preview.paymentSchedule.push( scheduleItem );
					}
					if( scheduleItem.date > today && ( scheduleItem.date < newScheduleItem.date || moment( scheduleItem.date ).isSame( newScheduleItem.date, "day" ) ) ) {
						scheduleItem.interestAmount = 0;
						scheduleItem.principalAmount = parseFloat( scheduleItem.amount );
						scheduleItem.startBalanceAmount = parseFloat( principalPayoff );
						principalPayoff = ( parseFloat( ( principalPayoff - scheduleItem.principalAmount ).toFixed( 2 ) ) );
						preview.paymentSchedule.push( scheduleItem );
					}
				} );
				newScheduleItem.startBalanceAmount = parseFloat( principalPayoff );
				preview.paymentSchedule.push( newScheduleItem );
				principalPayoff = preview.principalBalance = parseFloat( ( principalPayoff - newScheduleItem.principalAmount ).toFixed( 2 ) );
				_.forEach( paymentSchedule, ( scheduleItem ) => {
					if( principalPayoff == 0 ) return;
					if( scheduleItem.date > newScheduleItem.date ) {
						scheduleItem.interestAmount = 0;
						scheduleItem.principalAmount = parseFloat( scheduleItem.amount );
						if( scheduleItem.principalAmount > principalPayoff ) {
							scheduleItem.amount = scheduleItem.principalAmount = parseFloat( principalPayoff );
						}
						scheduleItem.startBalanceAmount = parseFloat( principalPayoff );
						principalPayoff = ( parseFloat( ( principalPayoff - scheduleItem.principalAmount ).toFixed( 2 ) ) );
						preview.paymentSchedule.push( scheduleItem );
					}
				} );
			}
		}
		sails.log.verbose( "previewPayment; regularInterest:", regularInterest );
		sails.log.verbose( "previewPayment; recalculatedInterest:", recalculatedInterest );
		preview.interestSavings = parseFloat( ( regularInterest - recalculatedInterest ).toFixed( 2 ) );
		sails.log.verbose( "previewPayment; interestSavings:", preview.interestSavings );
		const templateData = {
			paymentAmount: paymentAmount,
			ledger: ledger,
			preview: preview,
			newScheduleItem: newScheduleItem
		};
		// sails.log.verbose( "previewPayment; templateData:", templateData );
		return templateData;
	}
	/**
	 * get user/loan checking accounts
	 * @return {Array<Object>}
	 */
	 getUserCheckingAccounts(paymentId) {
		const checkingAccounts = [];
		return PaymentManagement.findOne( { id: paymentId } )
			.populate( "account" )
			.then( ( paymentmanagement ) => {
				// sails.log.verbose( "getUserCheckingAccounts; account:", JSON.stringify( paymentmanagement.account ) );
				const accountAba = _.get( paymentmanagement, "account.routingNumber", null );
				const accountNum = _.get( paymentmanagement, "account.accountNumber", null );
				return Account.find( { user: paymentmanagement.user } )
					.then( ( accounts ) => {
						_.forEach( accounts, ( account ) => {
							// sails.log.verbose( "getUserCheckingAccounts;", idx, JSON.stringify( bankaccount ) );
							const checkingAcctName = _.get( account, "accountName", "" ).replace( "Plaid Checking", "Checking" );
							const checkingAcctAba = _.get( account, "routingNumber", "" );
							const checkingAcctNum = _.get( account, "accountNumber", "" );
							const checkingAcctLast4 = checkingAcctNum.substr( -4 );
							const checkingDetail = {
								checkingaccount: account,
								id: account.id,
								label: `${checkingAcctName} - (XXXX${checkingAcctLast4})`,
								selected: ( `${_.get( paymentmanagement, "account.id", "" )}` == `${account.id}` && accountAba == checkingAcctAba && accountNum == checkingAcctNum )
							};
							if( checkingDetail.selected ) {
								checkingDetail.label = `[DEFAULT]&nbsp;&nbsp;&nbsp;${checkingDetail.label}`;
							}
							checkingAccounts.push( checkingDetail );
							// sails.log.verbose( "getUserCheckingAccounts; checkingDetail:", checkingDetail );
						} );
						return checkingAccounts;
					} );
			} );
	}

	processSmearRipples(rejectedPayment, payId) {
		sails.log.error( `processSmearRipples[ ${this._instanceClass} ] METHOD MUST BE OVERRIDDEN!` );
		return null;
	}
}

module.exports = BasePlatformSpecificService;



