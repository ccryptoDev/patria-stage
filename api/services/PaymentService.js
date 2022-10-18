/* global sails, PaymentManagement, Payment, Transaction */
"use strict";

const _ = require( "lodash" );
const EventEmitter = require( "events" );
const fs = require( "fs" );
const moment = require( "moment" );
const ObjectID = require( "mongodb" ).ObjectID;
const util = require( "util" );

const pmtSvcConfig = sails.config.paymentService;

const CREDIT_STATUS = {
	NA: 0,
	PENDING: 1,
	ACCEPTED: 2,
	ERROR: 3
};

class PaymentService extends EventEmitter {
	constructor() {
		super();
		this._instanceClass = "base";
		this.CREDIT_STATUS = CREDIT_STATUS;
	}

	async processScheduledPayments( ipAddr, existingPayment = null, startTransactionDate = null) {
		const self = this;
		const directoryPath = `${sails.config.appPath}/paymentservice/processScheduledPayments`
		const debugLogPath = `${directoryPath}/${moment().format( "YYYY-MM-DD" )}.txt`;
		Utils.makeFSDirectory(directoryPath)
		
		debugLog( `processScheduledPayments[ ${self._instanceClass} ]; START -- ipAddr: ${ipAddr}`, debugLogPath  );
		const todayStartOfDay = moment().startOf( "day" );

		let tomorrowDate =  moment(todayStartOfDay).startOf( "day" ).add(1,"day");
		if(startTransactionDate && moment(startTransactionDate).isValid()) {
			tomorrowDate = moment(startTransactionDate).startOf("day");
		}
		const paymentCriteria = {
			status: Payment.STATUS_PENDING,
			$and: [{$or: [{ type: Payment.paymentTypeEnum.ACH_CREDIT }, { type: Payment.paymentTypeEnum.ACH_DEBIT }]},
				{transactionDate: {$eq: tomorrowDate.toDate()} },
				{$or: [{hasBeenSentToAch: {$exists: false}},{hasBeenSentToAch: false} ]},
				{$or: [{transactionType: Payment.transactionTypeEnum.PAYMENT},{transactionType: Payment.transactionTypeEnum.FUNDED},{transactionType: Payment.transactionTypeEnum.AMENDED} ]}
			],
		};
		
		const payments = await Payment.find(paymentCriteria).populate("paymentmanagement").populate("user");
		if(!payments || payments.length === 0) {
			return;
		}
		const contractPayments = [];
		for(let payment of payments) {
			if (!payment || !payment.transactionMeta|| !payment.paymentmanagement ) continue;
			
			let accounts = [];
			if(!!payment.account) {
				accounts = await Account.find( {id: payment.account}).sort( "createdAt DESC" ); // N
			}else {
				accounts = await Account.find(  payment.paymentmanagement && !!payment.paymentmanagement.account?{id: payment.paymentmanagement.account}:{ user: (payment.user || {}).id } ).sort( "createdAt DESC" ); // N
			}
			const account = accounts && accounts.length > 0?accounts[0]:null;
			if(!account) {
				await Payment.update({id: payment.id},{paymentProcessError: "NO DEFAULT BANK ACCOUNT SPECIFIED"})
				debugLog( `processScheduledPayments[ ${self._instanceClass} ]; NO BANK ACCOUNT SPECIFIED SKIPPING -- ipAddr: ${ipAddr}`, debugLogPath  );
			}else {
				sails.log.verbose( `processScheduledPayments[ ${self._instanceClass} ]; item:`, payment.pmtRef );
					if(!payment.transactionDate){
						Payment.update({id: payment.id},{transactionDate: todayStartOfDay.toDate()})
					}
				contractPayments.push({
					paymentmanagement:  payment.paymentmanagement,
					user:  payment.user,
					account: account,
					paymentScheduleItem: payment.transactionMeta,
					existingPayment:payment
				});
			}
		}
				sails.log.verbose( `processScheduledPayments[ ${self._instanceClass} ]; contractPayments:`, contractPayments.length );
					// processManualAndFundingPayments
				
				if( contractPayments.length === 0 ) {
					debugLog( `processScheduledPayments[ ${self._instanceClass} ]; NO MATCHING PAYMENT IN SCHEDULE TO SEND`, debugLogPath  );
					return Promise.resolve();
				}else {
				  // return Promise.resolve()
					 return NachaPaymentService.processContractPayments( contractPayments, ipAddr )
				}
	}

	/**
	 * process contract payments -- MAY BE OVERRIDDEN
	 * @param {Array} contractPayments
	 * @param {string} ipAddr
	 * @return {Promise}
	 */
	processContractPayments( contractPayments, ipAddr ) {
		const Promise = require( "bluebird" );
		const self = this;
		const paymentPromises = [];
		_.forEach( contractPayments, ( contract ) => {
			paymentPromises.push( () => {
				return self.processScheduledPayment( contract.paymentmanagement, contract.practicemanagement, contract.user, contract.account, contract.paymentScheduleItem, ipAddr )
					.catch( ( err ) => {
						sails.log.error( "processContractPayments; catch:", err );
					} );
			} );
		} );
		return Promise.each( paymentPromises, ( fn ) => fn() );
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
		const self = this;
		const debugLogPath = `${sails.config.appPath}/paymentservice/processScheduledPayments/${moment().format( "YYYY-MM-DD" )}.txt`;
		let pmtRef;
		let payment = {
			paymentmanagement: paymentmanagement.id,
			practicemanagement: practicemanagement.id,
			user: user.id,
			type: pmtSvcConfig.TYPES.OPERATING_DEBIT_USER
		};
		debugLog( `processScheduledPayment[ ${paymentmanagement.loanReference} ]; START`, debugLogPath  );
		return Promise.resolve()
			.then( () => {
				return Payment.getNextValue()
					.then( ( ref ) => {
						pmtRef = payment.pmtRef = ref;
						debugLog( `processScheduledPayment[ ${paymentmanagement.loanReference} ][ ${pmtRef} ];`, debugLogPath  );
					} );
			} )
			.then( () => {
				const orderNumber = `${user.userReference}:${paymentmanagement.loanReference}:${payment.pmtRef}`;
				payment.amount = parseFloat( parseFloat( paymentScheduleItem.amount  ).toFixed( 2 ) );

				payment.interestAmount = parseFloat( parseFloat( paymentScheduleItem.interestAmount ).toFixed( 2 ) );
				payment.principalAmount = parseFloat( parseFloat( paymentScheduleItem.principalAmount ).toFixed( 2 ) );
				payment.principalBalance = parseFloat( ( parseFloat( paymentScheduleItem.startBalanceAmount ) - payment.principalAmount ).toFixed( 2 ) );
				payment.isAmendPayment = paymentScheduleItem.isAmendPayment;
				payment.originationFee = 0.0;
				payment.fixedFee = 0.0;
				payment.account = account;
				payment.commissionFee = 0.0;
				payment.commissionAmount = 0.0;
				payment.paybackAmount = 0.0;
				payment.contractSoldPercentage = 0;
				payment.status = Payment.STATUS_PENDING;
				payment.errReason = "";
				payment.order_id = null;
				payment.history_id = null;
				payment.authcode = null;
				payment.achJoinDate = moment().startOf( "day" ).toDate();
				payment.pmtRequest = self.prepareDebitPayment( payment, user, account, orderNumber, ipAddr );
				payment.pmtResponse = null;
				payment.statusRequest = null;
				payment.statusResponse = null;

				if( process.env.NODE_ENV != "production" && process.env.NODE_ENV != "live" ) {
					payment.amount = 1.00;
				}

				sails.log.verbose( `processScheduledPayment[ ${paymentmanagement.loanReference} ][ ${pmtRef} ]; payment:`, JSON.stringify( payment ) );
				return Payment.create( payment )
					.then( ( created ) => {
						payment = created;
						return self.processPayment( payment )
							.then( ( payment ) => {
								sails.log.info( `processScheduledPayment[ ${paymentmanagement.loanReference} ][ ${pmtRef} ]; status:`, payment.status, JSON.stringify( payment.pmtResponse ) );
								_.some( paymentmanagement.paymentSchedule, ( pmtScheduleItem ) => {
									if( moment( pmtScheduleItem.date ).isSame( paymentScheduleItem.date, "day" ) && pmtScheduleItem.transaction == paymentScheduleItem.transaction && pmtScheduleItem.amount == paymentScheduleItem.amount ) {
										// sails.log.info( `processScheduledPayment[ ${paymentmanagement.loanReference} ][ ${pmtRef} ]; pmtScheduleItem:`, pmtScheduleItem );
										paymentScheduleItem = pmtScheduleItem;
										return true;
									}
								} );
								if( payment.status == Payment.STATUS_PENDING || payment.status == Payment.STATUS_PAID ) {
									paymentScheduleItem.status = payment.status;
								} else {
									paymentScheduleItem.status = Payment.STATUS_DECLINED;
								}
								paymentScheduleItem.paymentId = payment.id;
								paymentScheduleItem.pmtRef = payment.pmtRef;
								const nextPaymentSchedule = _.find(paymentmanagement.paymentSchedule,(scheduleItem) => {
									return moment().startOf("day").isSameOrBefore(moment(scheduleItem.date).startOf("day")) &&  moment(paymentScheduleItem.date).startOf("day").isAfter(moment(scheduleItem.date).startOf("day"));
								})
								const nextPaymentScheduleDate = moment(nextPaymentSchedule.date).startOf("day").toDate();
								return PaymentManagement.update( { id: paymentmanagement.id }, { paymentSchedule: paymentmanagement.paymentSchedule, nextPaymentSchedule: nextPaymentScheduleDate } )
									.then(function(){
										return self.postPaymentProcessing( payment, account ).then( () => payment );
									})
							} )
					} );
			} )
			.catch( ( err ) => {
				sails.log.error( `processScheduledPayment[ ${paymentmanagement.loanReference} ][ ${pmtRef} ]; catch:`, err );
			} )
			.finally( () => {
				debugLog( `processScheduledPayment[ ${paymentmanagement.loanReference} ][ ${pmtRef} ]; END`, debugLogPath  );
			} );

	}

	updatePaymentSchedule( paymentID ) {
		return PaymentManagement.findOne( { id: paymentID } )
		.then( function( paymentmanagement ) {
			return Schedulehistory.changePaymentSchedule( paymentmanagement )
			.then( function( scheduleData ) {
				const schedulehistoryId = scheduleData.id;
				sails.log.info( "paymentmanagement.status:", paymentmanagement.status );
	
				if( paymentmanagement.finalpayoffAmount == "" || paymentmanagement.finalpayoffAmount == null || undefined == paymentmanagement.finalpayoffAmount ) {
					paymentmanagement.finalpayoffAmount = paymentmanagement.payOffAmount;
					paymentmanagement.save();
				}
				return { code: 200, message: "Updated successfully", paymentmanagement: paymentmanagement };
			} )
			.catch( function( err ) {
				sails.log.error( "updatePaymentSchedule; catch:", err );
				return { code: 400, message: "Unable to save schedule history" };
			} );
		} )
		.catch( function( err ) {
			sails.log.error( "updatePaymentSchedule; catch:", err );
			return { code: 400, message: "Invalid payment details" };
		} );
	}


	postPaymentProcessing( payment, account ) {
		return NachaPaymentService.postPaymentProcessing( payment, account ).then( () => payment );
	}


	prepareDebitPayment( payment, user, account, orderNumber, ipAddr ) {
		sails.log.error( `prepareDebitPayment[ ${this._instanceClass} ][ ${payment.pmtRef} ]; METHOD MUST BE OVERRIDDEN!` );
		return null;
	}


	prepareCreditPayment( payment, practicemanagement, user, orderNumber, ipAddr ) {
		sails.log.error( `prepareCreditPayment[ ${this._instanceClass} ][ ${payment.pmtRef} ]; METHOD MUST BE OVERRIDDEN!` );
		return null;
	}


	async processPayment( payment ) {
		//here is where you would split payment to another vendor with a switch/if statement
			return NachaPaymentService.processPayment(payment);
	}

	async updatePaymentScheduleForPaymentStatus(payment) {
		if(payment && !!payment.paymentmanagement) {
			const paymentManagement = await PaymentManagement.findOne({id: payment.paymentmanagement}).populate("screentracking");
			if(paymentManagement && paymentManagement.paymentSchedule && paymentManagement.paymentSchedule.length > 0) {
				let paymentManagementUpdateObj = null;
				if(payment.type === Payment.paymentTypeEnum.ACH_CREDIT && payment.status === Payment.STATUS_DECLINED) {
					paymentManagementUpdateObj = {status: PaymentManagement.paymentManagementStatus.pending};
					sails.log.error(`PaymentService#updatePaymentScheduleForPaymentStatus ERROR: A funding payment was declined. id= ${paymentManagement.id} pmtRef=${payment.pmtRef}`)
					const logReferenceData = await User.getNextSequenceValue( "logs" );
					const logReference = `LOG_${logReferenceData.sequence_value}`;
					await Logactivity.create( {
						modulename: "Funding payment was declined",
						logmessage: `The funding payment with transaction id ${payment.pmtRef} for ${payment.amount} was declined. Loan has been moved back to pending.`,
						logreference: logReference,
						paymentManagement: paymentManagement.id
					} );
				}else {
					const paymentScheduleIndex = _.findIndex(paymentManagement.paymentSchedule, (item) => {
						return item.pmtRef === payment.pmtRef
					})
					if(paymentScheduleIndex >= 0) {
						if(paymentManagement.paymentSchedule[paymentScheduleIndex].isAmendPayment && payment.status === Payment.STATUS_DECLINED) {
							
							delete paymentManagement.paymentSchedule[paymentScheduleIndex].amendAmount;
							delete paymentManagement.paymentSchedule[paymentScheduleIndex].amendInterest;
							delete paymentManagement.paymentSchedule[paymentScheduleIndex].amendPrincipal;
							delete paymentManagement.paymentSchedule[paymentScheduleIndex].isAmendPayment;
							delete paymentManagement.paymentSchedule[paymentScheduleIndex].amendedScheduleDate;
							delete paymentManagement.paymentSchedule[paymentScheduleIndex].waivedOriginalDate;
							delete paymentManagement.paymentSchedule[paymentScheduleIndex].waivedAmount;
							delete paymentManagement.paymentSchedule[paymentScheduleIndex].waivedInterest;
							delete paymentManagement.paymentSchedule[paymentScheduleIndex].waivedPrincipal;
							payment.status = Payment.STATUS_OPENED;
						}
						paymentManagement.paymentSchedule[paymentScheduleIndex].status = payment.status
						paymentManagementUpdateObj = { paymentSchedule: paymentManagement.paymentSchedule };
						if(paymentManagement.status === PaymentManagement.paymentManagementStatus.completed && payment.status === Payment.STATUS_DECLINED ) {
							paymentManagement.status = PaymentManagement.paymentManagementStatus.active;
							paymentManagementUpdateObj["status"] = paymentManagement.status;
							sails.log.error(`PaymentService#updatePaymentScheduleForPaymentStatus ERROR: A payment was declined for a completed loan. id= ${paymentManagement.id} pmtRef=${payment.pmtRef}`)
							const logReferenceData = await User.getNextSequenceValue( "logs" );
							const logReference = `LOG_${logReferenceData.sequence_value}`;
							await Logactivity.create( {
								modulename: "Denied payment for completed loan.",
								logmessage: `The payment with transaction id ${payment.pmtRef} for ${payment.amount} was declined. Loan has been moved back to active.`,
								logreference: logReference,
								paymentManagement: paymentManagement.id
							} );
						}else if(payment.status === Payment.STATUS_PAID && paymentManagement.status === PaymentManagement.paymentManagementStatus.active) {
							const ledger = PlatformSpecificService.getPaymentLedger(paymentManagement, moment().startOf("day").toDate());
							if(ledger.principalPayoff <= 0) {
								paymentManagement.status = PaymentManagement.paymentManagementStatus.completed;
								paymentManagementUpdateObj["status"] = 	paymentManagement.status;
								const logReferenceData = await User.getNextSequenceValue( "logs" );
								const logReference = `LOG_${logReferenceData.sequence_value}`;
								await Logactivity.create( {
									modulename: "Loan Completed.",
									logmessage: `The payment with transaction id ${payment.pmtRef} for ${payment.amount} was paid making this loan completed.`,
									logreference: logReference,
									paymentManagement: paymentManagement.id
								} );
							}
						}
					}
				}

					if(paymentManagementUpdateObj) {
						await PaymentManagement.update({ id: paymentManagement.id }, paymentManagementUpdateObj);
					}
			}
		}
	}

	async checkPaymentStatuses( ipAddr ) {
		const self = this;
		const pendingPayments = await Payment.find({
			status: {$in: [Payment.STATUS_PENDING, Payment.STATUS_SETTLING]},
			hasBeenSentToAch: true,
			$or: [{hasAchReturnFileBeenProcessed: { $exists: false }}, {hasAchReturnFileBeenProcessed: false}],
			transactionDate: { $lte: SmoothPaymentService.getBusinessDateBasedOnBankDays(moment().add(-3, "days").toDate(),true) }
		});
		if(pendingPayments && pendingPayments.length > 0) {
			for(let overDuePayment of pendingPayments) {
				sails.log.verbose( `checkPaymentStatuses; ${overDuePayment.pmtRef} ${overDuePayment.id} status:`, overDuePayment.status );
					const paymentUpdate = {hasAchReturnFileBeenProcessed: true, status: Payment.STATUS_PAID};
					await Payment.update({id: overDuePayment.id},paymentUpdate);
					_.assign(overDuePayment, paymentUpdate);
					await self.updatePaymentScheduleForPaymentStatus(overDuePayment)
			}
		}
	}


	checkPaymentStatus( payment ) {
		sails.log.error( `checkPaymentStatuses[ ${this._instanceClass} ][ ${payment.pmtRef} ]; METHOD MUST BE OVERRIDDEN!` );
		return null;
	}
	
	async processPreAutomaticPayments(paymentId=null, startTransactionDate = null) {
		const directoryPath = `${sails.config.appPath}/paymentservice/processScheduledPayments`
		const debugLogPath = `${directoryPath}/${moment().format( "YYYY-MM-DD" )}.txt`;
		Utils.makeFSDirectory(directoryPath)
		
		debugLog( `processPreAutomaticPayments[ ${this._instanceClass} ]; START`, debugLogPath );
		
		const criteria = {
			status: PaymentManagement.paymentManagementStatus.active,
			$or: [{disableAutoAch: { $exists: false }},{disableAutoAch: {$eq: false, $exists: true }}],
			$and: [{
				account: {$exists:true},
				achstatus: { $eq: 1, $exists: true },
				$or: [ { moveToArchive: { $exists: false } }, { moveToArchive: { $eq: 0, $exists: true } } ]
			}]
		}
		if(!!paymentId) {
			criteria["id"] = paymentId;
		}
		let skip = 0;
		let limit = 1000;
			let sectionCount = 1;
			let overallCount = 1;
			const totalCollectionCount = await PaymentManagement.count(criteria);
			let paymentManagementSection = await PaymentManagement.find(criteria).limit(limit).skip(skip)
			sails.log.error(`total paymentmanagement count ${totalCollectionCount} with current count ${paymentManagementSection.length}`);
		let tomorrowScheduleDate = moment().startOf("day").add(1, "day");
			while( paymentManagementSection && paymentManagementSection.length > 0) {
				let itemCount = 1;
				let foundItems = false;
				for(let pmdetail of paymentManagementSection) {
					//do stuff
					if( pmdetail.paymentSchedule && pmdetail.paymentSchedule.length > 0 && !pmdetail.disableAutoAch) {
						
						// const scheduleItemsNeedingProcessed = pmdetail.paymentSchedule.filter((item) => {
						// 	return moment(item.date).startOf("day").isSame(todayStartOfDay) && !item.pmtRef && item.initiator === "automatic";
						// })
						let updatedSchedule =  pmdetail.paymentSchedule.sort( ( a, b ) => {
						    if( moment( a.date ).isBefore( moment( b.date ) ) ) {
						        return -1;
						    }
						    if( moment( a.date ).isAfter( moment( b.date ) ) ) {
						        return 1;
						    }
						    if( a.transaction < b.transaction ) {
						        return -1;
						    }
						    if( a.transaction > b.transaction ) {
						        return 1;
						    }
						    return 0;
						} );
							let nextPaymentScheduleDate = null;
							let index = 0;
							let hasScheduleChanges = false;
						  for(let item of updatedSchedule) {
						  	if(startTransactionDate && moment(startTransactionDate).isValid()) {
							    tomorrowScheduleDate = moment(startTransactionDate).startOf("day");
						    }
						  	if(typeof item.date === "string" && moment(item.date,"YYYY-MM-DD").isValid()) {
						  		item.date = moment(item.date, "YYYY-MM-DD").startOf("day").toDate();
							  }
							  if(!nextPaymentScheduleDate && moment(item.date).startOf("day").isAfter(tomorrowScheduleDate) && item.initiator === "automatic" && item.status === Payment.STATUS_OPENED && !item.isAmendPayment){
								  nextPaymentScheduleDate = moment(item.date).startOf("day").toDate();
							  }
						  	if( moment(item.date).startOf("day").isSame(tomorrowScheduleDate) && !item.pmtRef && item.initiator === "automatic" && item.status === Payment.STATUS_OPENED && !item.isAmendPayment) {
								  sails.log.error(`found payments for ${pmdetail.id} to process`);
								  const accounts = await Account.find(  !!pmdetail.account?{id: pmdetail.account}:{ user: (pmdetail.user || {}).id } ).limit(1).sort( "createdAt DESC" );
								  if(accounts && accounts.length === 1) {
								  	  item.status = Payment.STATUS_PENDING;
									   const payment =  await Payment.createPaymentActionTransaction(Payment.transactionTypeEnum.PAYMENT,
										  item,pmdetail.id,pmdetail.user,pmdetail.account, Payment.paymentTypeEnum.ACH_DEBIT,false)
									   updatedSchedule[index].pmtRef = payment.pmtRef;
									   updatedSchedule[index].transactionId = payment.id;
									   updatedSchedule[index].status = payment.status;
									  hasScheduleChanges = true;
								  }else {
								  	sails.log.error(`PaymentService#processPreAutomaticPayments ERROR: no default bank account selected for this loan. - id ${pmdetail.id}`)
									  const logReferenceData = await User.getNextSequenceValue( "logs" );
									  // sails.log.info( "Collections logReferenceData", logReferenceData );
									  const logReference = `LOG_${logReferenceData.sequence_value}`;
									  await Logactivity.create( {
										  modulename: "Attempted to process automatic payment",
										  logmessage: `An automatic payment attempted to go out today but it does not have a selected default bank account for ACH`,
										  logreference: logReference,
										  paymentManagement: pmdetail.id
									  } );
								  }
							  }
						  	index = index +1;
						  }
						  if(hasScheduleChanges || (nextPaymentScheduleDate && (!pmdetail.nextPaymentSchedule || !moment(pmdetail.nextPaymentSchedule).isSame(moment(nextPaymentScheduleDate),"day")))) {
						  	const paymentUpdate = hasScheduleChanges? {paymentSchedule: updatedSchedule}: {};
						  	if(nextPaymentScheduleDate) {
						  		paymentUpdate["nextPaymentSchedule"] = nextPaymentScheduleDate;
							  }
						      await PaymentManagement.update({id: pmdetail.id},paymentUpdate);
						  }
					}
					sails.log.error(`=================================${overallCount} - section item: ${itemCount} | payment item: ${pmdetail.id}`);
					itemCount = itemCount +1;
					// overallCount = overallCount +1;
					
				}
				skip = skip + limit;
				paymentManagementSection = await PaymentManagement.find(criteria).limit(limit).skip(skip);
				sails.log.error(`${overallCount}=========================${sectionCount} test process auto payments stuff: section start with ${paymentManagementSection.length}`)
				itemCount = 1;
				sectionCount = sectionCount +1;
				overallCount = overallCount+limit;
			}
			
			sails.log.error("END test process auto payments stuff")
			return;
	}
	
}
function debugLog(logStr, debugLogPath) {
	sails.log.info( logStr );
	fs.appendFileSync( debugLogPath, `${moment().format( "YYYY-MM-DD HH:mm:ss.SSS" )}: ${logStr}\n` );
}



let paymentService = new PaymentService();

module.exports = paymentService;
