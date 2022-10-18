/* global sails, PaymentManagement, CollectionsService, PlatformSpecificService, AchService, EmailService */
"use strict";
const moment = require( "moment" );
const _ = require( "lodash" );
const { UserBindingContext } = require("twilio/lib/rest/chat/v2/service/user/userBinding");

module.exports = {
	checkCollectionsCron,
	updateNextPaymentScheduleDate,
};

async function checkAndProcessCollectionContracts( paymentId = null, useDefaultPractice = true ) {
	sails.log.verbose( "Collections Cron Service - check promise to pay called" );
	const paymentManagements = await PaymentManagement.find( {
		isInCollections: true,
		contactScheduleReminderDate: { $exists: true },
		collectionsAccountStatus: PaymentManagement.collectionsAccountStatusEnum.PROMISE_TO_PAY
	} );
	if( paymentManagements && paymentManagements.length > 0 ) {
		for( const paymentManagement of paymentManagements ) {
			checkPromiseToPay( paymentManagement );
		}
	}
}

function checkPromiseToPay( paymentManagement ) {
	const contactScheduleMoment = moment( paymentManagement.contactScheduleReminderDate );
	if( moment().diff( contactScheduleMoment ) >= 0 ) {
		sails.log.verbose(
				`Collections Cron Service - check promise to pay: Moving ${paymentManagement.id} to contact needed status`
		);
		paymentManagement.collectionsAccountStatusEnum =
				PaymentManagement.collectionsAccountStatusEnum.PROMISE_TO_PAY_CONTACT_NEEDED;
		// add logactivity
	}
}


function checkForLastPaymentCompletion() {
	return new Promise( ( resolve, reject ) => {
		const criteria = {
			status: PaymentManagement.paymentManagementStatus.active,
			isPaymentActive: true
		};
		
		PaymentManagement.find( criteria )
		.populate( "screentracking" )
		.then( function( pmdata ) {
			sails.log.info( "checkForLastPaymentCompletion count value : ", pmdata.length );
			const currentDateTime = moment().startOf( "day" );
			let initialData = "Last Payment Completion cron called \n";
			initialData += "Cron time: " + currentDateTime + " \n";
			initialData += "Check count: " + pmdata.length + " \n";
			initialData += "************************************************\n\n";
			sails.log.info( initialData );
			let foundItems = false;
			if( pmdata.length > 0 ) {
				_.forEach( pmdata, function( pmdetail ) {
					const paymentLedger = PlatformSpecificService.getPaymentLedger( pmdetail, currentDateTime.toDate() );
					if( paymentLedger.totalAmountOwned === 0 ) {
						sails.log.verbose(
								`CollectionsCronService#checkForLastPaymentCompletion Found last payment ${pmdetail.id} to be completed `
						);
						AchService.changeContractStatus( pmdetail.id, "COMPLETED", "LastPaymentCompletion Cron" );
						EmailService.processSendingStatusEmail( EmailService.emailSendType.partnerProgramEnding, pmdetail );
						if( !foundItems ) {
							foundItems = true;
						}
					}
				} );
			} else {
				// -- No data to run for performing loans
			}
			if( !foundItems ) {
				return resolve( { statuscode: 200, message: "No performing contracts found for payment completion check." } );
			} else {
				return resolve( {
					statuscode: 200,
					message: "Found completed contracts. It has been processed."
				} );
			}
		} )
		.catch( function( err ) {
			sails.log.error( "#checkForLastPaymentCompletion::Error", err );
			return reject( err );
		} );
	} );
}

function checkCollectionsCron(paymentId) {
	const criteria = {
		$or: [{status: PaymentManagement.paymentManagementStatus.active}, {status: PaymentManagement.paymentManagementStatus.chargeOff}],
		$and: [{
			$or: [{moveToArchive: {$exists: false}}, {moveToArchive: {$eq: 0, $exists: true}}]
		}]
	}
	if(!!paymentId) {
		criteria["id"] = paymentId;
	}
	let skip = 0;
	let limit = 1000;
	return new Promise( async ( resolve, reject ) => {
		let sectionCount = 1;
		let overallCount = 1;
		const totalCollectionCount = await PaymentManagement.count(criteria);
		let paymentManagementSection = await PaymentManagement.find(criteria).limit(limit).skip(skip).populate("screentracking")
		sails.log.error(`total collection count ${totalCollectionCount} with current count ${paymentManagementSection.length}`);
		while( paymentManagementSection && paymentManagementSection.length > 0) {
			let itemCount = 1;
			let foundItems = false;
			const currentDateTime = moment().startOf( "day" );
			for(let pmdetail of paymentManagementSection) {
				//do stuff
				if( pmdetail.paymentSchedule && pmdetail.paymentSchedule.length > 0 ) {
					const pastDuePayments = CollectionsService.getPastDueFromPayments( pmdetail );
					const ledger = pastDuePayments && pastDuePayments.ledger? pastDuePayments.ledger: null;
					let sendToCollection = false;
					let sendPendingCollection = false;
					if(ledger && !ledger.hasScheduleError ) {
						const actualMissedPayments = findOldestPastDue( ledger.missedPayments );
						let paymentUpdateObj =  {
						}
						if(
							(actualMissedPayments &&
								actualMissedPayments.actualPastDueSchedule &&
								actualMissedPayments.actualPastDueSchedule.length > 0) || pmdetail.disableAchMoveToCollections
						) {
							
							if(actualMissedPayments.actualPastDueSchedule.length <= 2 && !pmdetail.disableAchMoveToCollections) {
									paymentUpdateObj["isInCollections"] = false;
									paymentUpdateObj["isInPendingCollections"] = true;
									paymentUpdateObj["movedToCollectionsDate"] = null;
									paymentUpdateObj["movedToPendingCollectionsDate"] = currentDateTime.toDate();
								paymentUpdateObj["collectionsAccountStatus"] = PaymentManagement.collectionsAccountStatusEnum.PENDING_COLLECTIONS;
								sendPendingCollection = true;
							}else {
									paymentUpdateObj["isInCollections"] = true;
									paymentUpdateObj["isInPendingCollections"] = false;
								paymentUpdateObj["movedToCollectionsDate"] = currentDateTime.toDate();
								paymentUpdateObj["movedToPendingCollectionsDate"] = null;
								paymentUpdateObj["collectionsAccountStatus"] = PaymentManagement.collectionsAccountStatusEnum.WAITING_TO_COLLECT;
	
							}
						}else if(pmdetail.isInCollections || pmdetail.isInPendingCollections) {
								sendToCollection = false;
								sendPendingCollection = false;
								paymentUpdateObj["isInCollections"] = false;
								paymentUpdateObj["isInPendingCollections"] = false;
							paymentUpdateObj["movedToCollectionsDate"] = null;
							paymentUpdateObj["movedToPendingCollectionsDate"] = null;
							paymentUpdateObj["collectionsAccountStatus"] = null;
						}
						if( Object.keys(paymentUpdateObj).length > 0 ) {
							paymentUpdateObj["payOffAmount"] = ledger.principalPayoff;
								const updateResponse = await PaymentManagement.update({id: pmdetail.id}, paymentUpdateObj);
								if(updateResponse && updateResponse.length > 0) {
									const user = {
										id: "Cron Job", email: "Cron Job"
									};
									let collectionStatus = null;
									let logMessagePartial = `Scheduled payment was late ${actualMissedPayments.actualPastDueSchedule.length} payment(s)`;
									if(!paymentUpdateObj.isInCollections && paymentUpdateObj.isInPendingCollections && !pmdetail.isInPendingCollections) {
										collectionStatus =  PaymentManagement.collectionsAccountStatusEnum.PENDING_COLLECTIONS;
									}else if(paymentUpdateObj.isInCollections && !paymentUpdateObj.isInPendingCollections && !pmdetail.isInCollections) {
										collectionStatus =  PaymentManagement.collectionsAccountStatusEnum.WAITING_TO_COLLECT;
									}
									let logMessage = `This contract was moved to '${collectionStatus}' with comment '${logMessagePartial}'.`;
									if(!collectionStatus && !paymentUpdateObj.isInCollections && !paymentUpdateObj.isInPendingCollections && (pmdetail.isInCollections || pmdetail.isInPendingCollections) && pmdetail.status !== PaymentManagement.paymentManagementStatus.chargeOff ) {
										logMessage = `This contract was moved out of collections`;
										collectionStatus =  PaymentManagement.collectionsAccountStatusEnum.NOT_IN_COLLECTIONS;
									}
									if(!!collectionStatus) {
										sails.log.verbose(`CollectionsCronService#checkCollectionsCron Change found for ${pmdetail.id}.....${logMessage}`);
										await CollectionsService.logCollectionActivity(user, pmdetail.id, "Collections", logMessage);
									}
								}
						} else {
							paymentUpdateObj["payOffAmount"] = ledger.principalPayoff;
							await PaymentManagement.update({id: pmdetail.id}, paymentUpdateObj);
							sails.log.error(`CollectionsCronService#checkCollectionsCron: Loan ${ pmdetail.id} is not past due.`);
						}
						await CollectionsService.updatePastDuePaymentForContract( pmdetail, pastDuePayments );
					}else {
						sails.log.error(`WARNING:=================================Could not get ledger for this loan ${pmdetail.id}. Checking collections item cron will skip over this.`);
					}
				}else {
					sails.log.error(`WARNING:=================================Paymentmanagement ${pmdetail.id} does not have a payment schedule. This is an issue and needs to be removed or resolved.`);
				}
				// sails.log.error(`=================================${overallCount} - section item: ${itemCount} | payment item: ${pmdetail.id} - isInCollections: ${pmdetail.isInCollections === true}`);
				itemCount = itemCount +1;
				// overallCount = overallCount +1;
			}
			skip = skip + limit;
			paymentManagementSection = await PaymentManagement.find(criteria).limit(limit).skip(skip).populate("screentracking");
			sails.log.error(`${overallCount}=========================${sectionCount} test collection stuff: section start with ${paymentManagementSection.length}`)
			itemCount = 1;
			sectionCount = sectionCount +1;
			overallCount = overallCount+limit;
		}
		
		sails.log.error("END test collection stuff")
		return resolve(true);
	} );
}

function findOldestPastDue( missedPayments ) {
	let oldestDays = 0;
	let oldestDate = null;
	let oldestMissedPayment = null;
	const actualPastDueSchedule = [];
	if( missedPayments && missedPayments.length > 0 ) {
		_.forEach( missedPayments, ( missedPayment ) => {
			if( missedPayment.amountRemaining > 0 ) {
				actualPastDueSchedule.push( missedPayment );
			}
			if( missedPayment.numberOfDaysPastDue > oldestDays ) {
				oldestDays = missedPayment.numberOfDaysPastDue;
				oldestDate = missedPayment.scheduleItem.date;
				oldestMissedPayment = missedPayment;
			}
		} );
	}
	return { oldestDaysPastDue: oldestDays, oldestPastDueDate: oldestDate, actualPastDueSchedule: actualPastDueSchedule };
}

async function updateNextPaymentScheduleDate(paymentId) {
	const criteria = {
		$or: [{status: PaymentManagement.paymentManagementStatus.active}, {status: PaymentManagement.paymentManagementStatus.chargeOff}],
		$and: [{
			$or: [{moveToArchive: {$exists: false}}, {moveToArchive: {$eq: 0, $exists: true}}]
		}]
	}
	if(!!paymentId) {
		criteria["id"] = paymentId;
	}
	let skip = 0;
	let limit = 1000;
	return new Promise( async ( resolve, reject ) => {
		let sectionCount = 1;
		let overallCount = 1;
		const totalCollectionCount = await PaymentManagement.count(criteria);
		let paymentManagementSection = await PaymentManagement.find(criteria).limit(limit).skip(skip).populate("screentracking").populate("practicemanagement")
		sails.log.error(`total next payment schedule date update count ${totalCollectionCount} with current count ${paymentManagementSection.length}`);
		while( paymentManagementSection && paymentManagementSection.length > 0) {
			let itemCount = 1;
			const currentDateTime = moment().startOf( "day" );
			for(let pmdetail of paymentManagementSection) {
				if( pmdetail.paymentSchedule && pmdetail.paymentSchedule.length > 0 ) {
					const ledger = PlatformSpecificService.getPaymentLedger( pmdetail, currentDateTime.toDate() );
					if(ledger) {
						if(ledger.paidUpToDate && (!pmdetail.nextPaymentSchedule || !moment(pmdetail.nextPaymentSchedule).startOf("day").isSame(moment(ledger.paidUpToDate).startOf("day"), "day"))) {
							sails.log.error(`<<<<<<<<<<<<<<<<<<<<<<<<<<<Updating next payment schedule date for ${pmdetail.id} to ${moment(ledger.paidUpToDate).startOf("day").format("MM/DD/YYYY")}`);
							await PaymentManagement.update({id: pmdetail.id}, {nextPaymentSchedule: moment(ledger.paidUpToDate).startOf("day").toDate()})
						}
					}
				}
				itemCount = itemCount +1;
			}
			skip = skip + limit;
			paymentManagementSection = await PaymentManagement.find(criteria).limit(limit).skip(skip).populate("screentracking").populate("practicemanagement")
			sails.log.error(`${overallCount}=========================${sectionCount} test  next payment schedule date update stuff: section start with ${paymentManagementSection.length}`)
			itemCount = 1;
			sectionCount = sectionCount +1;
			overallCount = overallCount+limit;
		}
		
		sails.log.error("END test next payment schedule date update stuff")
		return resolve(true);
	} );
}


