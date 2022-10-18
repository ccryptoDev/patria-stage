/* global PaymentManagement, CollectionComments, CubeListService, Adminuser, PlatformSpecificService, Five9Service, sails, User, Logactivity, CollectionLoanModifications, GeneralLedgerService */
"use strict";
const moment = require( "moment" );
const _ = require( "lodash" );

const collectionListTypes = {
	ALL: "all",
	PENDING:"pending",
	UNASSIGNED: "unassigned",
	PROMISE_TO_PAY: "promisetopay",
	ASSIGNED_TO_ME: "mycollections",
	CHARGE_OFF: "chargeoff",
	SETTLED: "settled"
};

module.exports = {
	collectionListTypes,
	lookupPaymentManagement,
	assignContractToUserOrRole,
	checkForCollectionItems,
	getPastDueFromPayments,
	changePromiseToPaySchedule,
	logCollectionActivity,
	addCollectionComment,
	getCollectionComments,
	moveCollectionsContractPaymentStatus,
	getEndedContracts,
	saveNewLoanModifications,
	updatePastDuePaymentForContracts,
	updatePastDuePaymentForContract,
	removeDaysPastDueFields
};

async function lookupPaymentManagement(
		columnTypeList,
		matchCriteria,
		searchValue = null,
		searchFilters = [],
		orderObj = null,
		offset = "1",
		limit = "100"
) {
	const columnsToShow = CubeListService.getColumnsToShow( columnTypeList );
	return await CubeListService.lookupDataWithAggregate(
			[
				{
					$lookup: {
						from: "user",
						localField: "user",
						foreignField: "_id",
						as: "userData"
					}
				},
				{
					$unwind: "$userData"
				},
				{
					$lookup: {
						from: "screentracking",
						localField: "screentracking",
						foreignField: "_id",
						as: "screenTrackingData"
					}
				},
				{
					$unwind: "$screenTrackingData"
				},
				{
					$lookup: {
						from: "adminuser",
						localField: "collectionAssignedUser",
						foreignField: "_id",
						as: "collectionAssignedUserData"
					}
				},
				{
					$unwind: {
						path: "$collectionAssignedUserData",
						preserveNullAndEmptyArrays: true
					}
				},
				{
					$lookup: {
						from: "adminuser",
						localField: "lastLoanModificationCreatedBy",
						foreignField: "_id",
						as: "lastLoanModificationCreatedByData"
					}
				},
				{
					$unwind: {
						path: "$lastLoanModificationCreatedByData",
						preserveNullAndEmptyArrays: true
					}
				},
				{
					$match: CubeListService.processFiltering( matchCriteria, searchFilters, searchValue, columnsToShow )
				},
				{
					$facet: {
						overallTotal: [ { $count: "overallTotalCount" } ],
						paymentData: [
							{ $sort: CubeListService.processListSort( orderObj, columnTypeList ) },
							{ $skip: parseInt( offset || "0" ) },
							{ $limit: parseInt( limit || "100" ) }
						]
					}
				}
			],
			columnTypeList,
			PaymentManagement
	);
}

async function assignContractToUserOrRole( assignRequestArray ) {
	if(
			assignRequestArray &&
			assignRequestArray.paymentIds &&
			assignRequestArray.paymentIds.length > 0 &&
			( !!assignRequestArray.assignToUser || assignRequestArray.isUnassigned )
	) {
		const paymentUpdateObj = { collectionAssignStatus: PaymentManagement.collectionAssignStatus.ASSIGNED };
		if( assignRequestArray.isUnassigned ) {
			paymentUpdateObj.collectionAssignStatus = PaymentManagement.collectionAssignStatus.UNASSIGNED;
			paymentUpdateObj[ "collectionAssignedUser" ] = null;
		} else {
			if( doesUserExist( assignRequestArray.assignToUser ) ) {
				paymentUpdateObj[ "collectionAssignedUser" ] = assignRequestArray.assignToUser;
			} else {
				throw new Error( `User does not exist for id ${assignRequestArray.assignToUser}` );
			}
		}
		const paymentUpdateResponse = await PaymentManagement.update(
				{ id: { $in: assignRequestArray.paymentIds } },
				paymentUpdateObj
		);
		if( paymentUpdateResponse && paymentUpdateResponse.length > 0 ) {
			return {
				allUpdated: paymentUpdateResponse.length === assignRequestArray.paymentIds.length,
				paymentUpdateResponse: paymentUpdateResponse
			};
		}
	}
	return null;
}

async function doesUserExist( userId ) {
	if( userId ) {
		return !!( await Adminuser.findOne( { id: userId } ) );
	}
	return null;
}

async function checkForCollectionItems( paymentId ) {
	if( !paymentId ) {
		return null;
	}
	const paymentManagement = await PaymentManagement.findOne( { id: paymentId } )
	.populate( "screentracking" )
	.populate( "practicemanagement" );
	if( paymentManagement ) {
		const pastDuePaymentsResults = await getPastDueFromPayments( paymentManagement );
		return {
			loanReference: paymentManagement.loanReference,
			totalPastDue: pastDuePaymentsResults.totalAmountPastDue,
			paymentSchedule: pastDuePaymentsResults && pastDuePaymentsResults.data ? pastDuePaymentsResults.data : [],
			ledger: pastDuePaymentsResults.ledger
		};
	}
	return null;
}

function getPastDueFromPayments( paymentManagement, sortCriteria = {}, dataFields = [], offset = null, limit = null ) {
	if( paymentManagement) {
		const today = moment().startOf( "day" );
		
		let pastDuePayments = [];
		let lastPayment = null;
		let totalAmountPastDue = 0;
		let totalRecords = 0;
		let filteredRecords = 0;
		const ledger = PlatformSpecificService.getPaymentLedger( paymentManagement, today.toDate() );
		if(
				ledger &&
				!ledger.isCurrentEnoughToBeCollectionsFree &&
				ledger.missedPayments &&
				ledger.missedPayments.length > 0
		) {
			_.forEach( ledger.missedPayments, ( missedPayment, index ) => {
				if( missedPayment.amountRemaining > 0 ) {
					
					if(!lastPayment || moment(missedPayment.scheduleItem.date).startOf("day").isSameOrAfter(lastPayment)) {
						lastPayment = moment(missedPayment.scheduleItem.date).startOf("day").toDate();
					}
					const paySchedule = missedPayment.scheduleItem;
					paySchedule[ "date" ] = moment( paySchedule.date ).startOf( "day" ).format( "MM-DD-YYYY" );
					paySchedule[ "numberOfDaysPastDue" ] = missedPayment.numberOfDaysPastDue;
					paySchedule[ "appliedPastDueAmount" ] = missedPayment.appliedPastDueAmount || 0;
					paySchedule[ "indexOfPayment" ] = missedPayment.indexOfScheduleItem;
					const payAmount = parseFloat( paySchedule.amount );
					paySchedule[ "paymentRemainingBalance" ] = missedPayment.amountRemaining;
					totalAmountPastDue += payAmount;
					const loopId = missedPayment.indexOfScheduleItem + parseInt( offset || "1" );
					paySchedule[ "loopId" ] = loopId;
					pastDuePayments.push( paySchedule );
				}
			} );
			totalRecords = pastDuePayments.length;
			filteredRecords = pastDuePayments.length;
			if( pastDuePayments.length > 0 ) {
				// const orderObject = Utils.getFirstObjectFromArray( sortCriteria );
				// if(orderObject && !!orderObject.dir && !!orderObject.column && dataFields && dataFields.length > 0) {
				// 	const columnIndex = parseInt( orderObject.column );
				// 	const column = dataFields[columnIndex];
				// 	pastDuePayments = _.reverse(_.sortBy(pastDuePayments, ["numberOfDaysPastDue"] ));
				// }
				if( !!offset && !!limit ) {
					const offsetNumber = parseInt( offset || "0" );
					const limitNumber = parseInt( limit || "100" );
					totalRecords = pastDuePayments.length;
					const newPastDuePayments = _.slice( pastDuePayments, offsetNumber, limitNumber );
					filteredRecords = newPastDuePayments.length;
					pastDuePayments = [].concat( newPastDuePayments );
				}
			}
		}
		return {
			recordsTotal: totalRecords,
			recordsFiltered: filteredRecords,
			data: pastDuePayments,
			totalAmountPastDue: totalAmountPastDue,
			lastPayment: lastPayment,
			ledger: ledger
		};
	}
	return null;
}
async function changePromiseToPaySchedule(
		loggedInUser,
		paymentId,
		isPromiseRemoved,
		scheduleDate = null,
		scheduleTime = null,
		scheduleReason = null,
		promisedPayAmount = null,
		customerContacted = "false"
) {
	if( !paymentId || ( ( !isPromiseRemoved || !scheduleReason ) && ( !scheduleDate || !scheduleTime ) ) ) {
		return null;
	}
	const paymentManagement = await PaymentManagement.findOne( { id: paymentId } );
	if( !paymentManagement ) {
		throw new Error( `Unable to update promise to pay. Could not find payment with id ${paymentId}` );
	}
	const promiseToPayMoment = moment( `${scheduleDate} ${scheduleTime}`, "MM-DD-YYYY h:mm A" );
	const paymentUpdateObject = {};
	if( isPromiseRemoved ) {
		paymentUpdateObject[ "collectionsAccountStatus" ] = PaymentManagement.collectionsAccountStatusEnum.WAITING_TO_COLLECT;
		paymentUpdateObject[ "contactScheduleReminderDate" ] = null;
	} else {
		paymentUpdateObject[ "collectionsAccountStatus" ] = PaymentManagement.collectionsAccountStatusEnum.PROMISE_TO_PAY;
		paymentUpdateObject[ "contactScheduleReminderDate" ] = promiseToPayMoment.toDate();
		
		Five9Service.deleteFromList( { paymentManagement } );
	}
	const paymentUpdate = await PaymentManagement.update( { id: paymentId }, paymentUpdateObject );
	if( paymentUpdate && paymentUpdate.length > 0 ) {
		await addCollectionComment(
				loggedInUser,
				paymentId,
				scheduleReason,
				!isPromiseRemoved
						? CollectionComments.collectionCommentTypeEnum.PROMISE_TO_PAY
						: CollectionComments.collectionCommentTypeEnum.MOVING_BACK_TO_COLLECTING,
				customerContacted,
				promisedPayAmount,
		);
		return true;
	}
	return false;
}
async function addCollectionComment(
		loggedInUser,
		paymentId,
		message,
		commentType,
		customerContacted,
		promisedPayAmount = null,
		createdAt = new Date().toISOString()
) {
	const collectionCommentTypes = _.values( CollectionComments.collectionCommentTypeEnum );
	if(
			!loggedInUser ||
			!loggedInUser.id ||
			!paymentId ||
			!commentType ||
			!message ||
			collectionCommentTypes.indexOf( commentType ) < 0
	) {
		throw new Error( "Unable to create collection comment. Missing required parameters." );
	}
	sails.log.info( "CollectionService#addCollectionComment Logging with user", loggedInUser );
	if(customerContacted == 'true'){
		await PaymentManagement.update( { id: paymentId }, { lastContactedDate: moment.utc().toDate() } )
	}
	if (commentType == 'PROMISE_TO_PAY' && promisedPayAmount){
		const commentUpdate = await CollectionComments.create( {
			paymentmanagement: paymentId,
			lastModifiedBy: loggedInUser.id,
			collectionsCommentType: commentType,
			comment: message,
			promiseToPayAmount: promisedPayAmount,
			customerSuccesfullyContacted: customerContacted,
			createdAt
		} );
		return commentUpdate;
	} else {
		const commentUpdate = await CollectionComments.create( {
			paymentmanagement: paymentId,
			lastModifiedBy: loggedInUser.id,
			collectionsCommentType: commentType,
			comment: message,
			customerSuccesfullyContacted: customerContacted,
			createdAt
		} );
		return commentUpdate;
	}
}
async function logCollectionActivity( loggedInUser, paymentId, moduleName, message, additionalLogDataObject = null ) {
	if( !loggedInUser || !paymentId || !moduleName || !message ) {
		throw new Error( "Unable to log collection activity. Missing required parameters." );
	}
	// sails.log.info( "CollectionService#logColllectionActivity Logging with user", loggedInUser );
	const logReferenceData = await User.getNextSequenceValue( "logs" );
	// sails.log.info( "Collections logReferenceData", logReferenceData );
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
async function getCollectionComments(
		dataFields,
		matchCriteria,
		searchValue = null,
		searchFilters = [],
		orderObj = null,
		limit = "100",
		offset = "0"
) {
	return new Promise( ( resolve, reject ) => {
		const columnsToShow = CubeListService.getColumnsToShow( dataFields );
		CollectionComments.native( ( err, collection ) => {
			collection.aggregate(
					[
						{
							$lookup: {
								from: "adminuser",
								localField: "lastModifiedBy",
								foreignField: "_id",
								as: "lastModifiedBy"
							}
						},
						{
							$unwind: {
								path: "$lastModifiedBy",
								preserveNullAndEmptyArrays: true
							}
						},
						{
							$match: CubeListService.processFiltering( matchCriteria, searchFilters, searchValue, columnsToShow )
						},
						{
							$facet: {
								overallTotal: [ { $count: "overallTotalCount" } ],
								paymentData: [
									{ $sort: CubeListService.processListSort( orderObj, dataFields ) },
									{ $skip: parseInt( offset || "0" ) },
									{ $limit: parseInt( limit || "100" ) }
								]
							}
						}
					],
					( err, collectionCommentsResults ) => {
						if( err ) {
							sails.log.error( "CollectionsService#getCollectionComments Error: ", err );
							return reject( err.message );
						}
						
						let collectionCommentData = [];
						let totalRecords = 0;
						if( collectionCommentsResults && collectionCommentsResults.length > 0 ) {
							collectionCommentData = collectionCommentsResults[ 0 ].paymentData;
							if( collectionCommentsResults[ 0 ].overallTotal && collectionCommentsResults[ 0 ].overallTotal.length > 0 ) {
								totalRecords = collectionCommentsResults[ 0 ].overallTotal[ 0 ].overallTotalCount;
							}
						}
						
						const commentsResponse = [];
						_.forEach( collectionCommentData, ( collectionComment, index ) => {
							if( collectionComment.lastModifiedBy ) {
								collectionComment.lastModifiedBy[ "id" ] = collectionComment.lastModifiedBy._id.toString();
								// adding time zone to loacl user browser
								collectionComment.createdAt = moment( collectionComment.createdAt )
								.local()
								.format( "MM-DD-YYYY hh:mm:ss A" );
							}
							const newComments = CubeListService.getResponseObjectBasedOnConfiguredProperties(
									columnsToShow,
									collectionComment,
									index,
									offset
							);
							commentsResponse.push( newComments );
						} );
						
						const responseJson = {
							recordsTotal: totalRecords,
							recordsFiltered: totalRecords,
							data: commentsResponse
						};
						return resolve( responseJson );
					}
			);
		} );
	} );
}

async function moveCollectionsContractPaymentStatus(
		paymentId,
		collectionAccountStatusMovingTo,
		confirmReason,
		customerContacted = "false",
		loggedInUser
) {
	if( paymentId ) {
		const paymentManagement = await PaymentManagement.findOne( { id: paymentId, isInCollections: true } );
		if( paymentManagement && paymentManagement.status !== collectionAccountStatusMovingTo ) {
			const paymentManagementUpdateObj = {};
			let collectionCommentType = null;
			switch( collectionAccountStatusMovingTo ) {
				case PaymentManagement.collectionsAccountStatusEnum.SETTLED:
					paymentManagementUpdateObj[ "isSettled" ] = true;
					collectionCommentType = CollectionComments.collectionCommentTypeEnum.SETTLED;
					break;
				case PaymentManagement.collectionsAccountStatusEnum.CHARGEOFF:
					paymentManagementUpdateObj[ "isChargeOff" ] = true;
					paymentManagementUpdateObj[ "chargeOffDate" ] = moment.utc().toDate();
					collectionCommentType = CollectionComments.collectionCommentTypeEnum.CHARGEOFF;
					break;
				default:
					return null;
			}
			if( collectionCommentType ) {
				await addCollectionComment( loggedInUser, paymentId, confirmReason, collectionCommentType, customerContacted );
			}
			paymentManagementUpdateObj[ "status" ] = collectionAccountStatusMovingTo;
			const updatePaymentResponse = await PaymentManagement.update( { id: paymentId }, paymentManagementUpdateObj );
			await GeneralLedgerService.chargeOff( paymentId, GeneralLedgerService.saveGLRecords );
			if( updatePaymentResponse && updatePaymentResponse.length > 0 ) {
				await logCollectionActivity(
						loggedInUser,
						paymentId,
						"Collections",
						`This contract was moved to '${collectionAccountStatusMovingTo}' with comment '${confirmReason}'`
				);
				return updatePaymentResponse[ 0 ];
			}
		}
		return paymentManagement;
	}
	return null;
}
async function getEndedContracts(
		columnTypeList,
		matchCriteria,
		searchValue = null,
		searchFilters = [],
		orderObj = null,
		offset = "1",
		limit = "100"
) {
	const columnsToShow = CubeListService.getColumnsToShow( columnTypeList );
	return await CubeListService.lookupDataWithAggregate(
			[
				{
					$lookup: {
						from: "user",
						localField: "user",
						foreignField: "_id",
						as: "userData"
					}
				},
				{
					$unwind: "$userData"
				},
				{
					$lookup: {
						from: "screentracking",
						localField: "screentracking",
						foreignField: "_id",
						as: "screenTrackingData"
					}
				},
				{
					$unwind: "$screenTrackingData"
				},
				{
					$match: CubeListService.processFiltering( matchCriteria, searchFilters, searchValue, columnsToShow )
				},
				{
					$facet: {
						overallTotal: [ { $count: "overallTotalCount" } ],
						paymentData: [
							{ $sort: CubeListService.processListSort( orderObj, columnTypeList ) },
							{ $skip: parseInt( offset || "0" ) },
							{ $limit: parseInt( limit || "100" ) }
						]
					}
				}
			],
			columnTypeList,
			PaymentManagement
	);
}

async function saveNewLoanModifications( paymentId, confirmReason, newPaymentSchedulePreview, loggedInUser, customerContacted ) {
	if(
			!paymentId ||
			!confirmReason ||
			!newPaymentSchedulePreview ||
			!newPaymentSchedulePreview.paymentSchedule ||
			newPaymentSchedulePreview.paymentSchedule.length === 0 ||
			!loggedInUser ||
			!loggedInUser.id
	) {
		throw new Error( "Missing required parameters to save new loan modifications" );
	}
	const paymentManagement = await PaymentManagement.findOne( { id: paymentId } );
	if( !paymentManagement ) {
		// || !paymentManagement.isInCollections){
		throw new Error( `Unable to save new loan modification. Loan with id '${paymentId}' was not found in collections.` );
	}
	const nowDate = moment().toDate();
	const newPaymentManagementHistory = _.cloneDeep( paymentManagement );
	newPaymentManagementHistory[ "paymentmanagement" ] = newPaymentManagementHistory.id;
	delete newPaymentManagementHistory.id;
	
	if( !newPaymentManagementHistory.isInLoanModification ) {
		_.assign( newPaymentManagementHistory, newPaymentSchedulePreview );
		
		newPaymentManagementHistory[ "lastLoanModificationCreatedDate" ] = newPaymentManagementHistory.createdAt;
		newPaymentManagementHistory[ "isOriginalCreatedLoan" ] = true;
		newPaymentManagementHistory[ "isInLoanModification" ] = true;
	}
	newPaymentManagementHistory[ "createdAt" ] = moment( nowDate ).toDate();
	newPaymentManagementHistory[ "updatedAt" ] = moment( nowDate ).toDate();
	
	const newPaymentHistoryUpdateResponse = await CollectionLoanModifications.create( newPaymentManagementHistory );
	if( newPaymentHistoryUpdateResponse ) {
		const loanRefernceData = await User.getNextSequenceValue( "loan" );
		sails.log.info(
				"CollectionLoanModifications#saveNewLoanModifications: Creating new loan reference for a modified loan -",
				loanRefernceData
		);
		
		const loanModificationRevision = ( newPaymentHistoryUpdateResponse.loanModificationRevision || 0 ) + 1;
		const payOffAmount = parseFloat( ( newPaymentSchedulePreview.totalAmountOwedWithLateFees || 0 ).toFixed( 2 ) );
		
		for( let i = 0; i < newPaymentSchedulePreview.paymentSchedule.length; i++ ) {
			newPaymentSchedulePreview.paymentSchedule[ i ].date = moment(
					newPaymentSchedulePreview.paymentSchedule[ i ].date
			).toDate();
		}
		const paymentManagementUpdateResponse = await PaymentManagement.update(
				{ id: paymentId },
				{
					paymentSchedule: newPaymentSchedulePreview.paymentSchedule,
					payOffAmount: payOffAmount,
					finalpayoffAmount: payOffAmount,
					modifiedInterestAmount: newPaymentSchedulePreview.interestAmount,
					modifiedBeginningPrincipal: newPaymentSchedulePreview.principalAmount,
					accruedInterest: newPaymentSchedulePreview.accruedInterest,
					adjustedPayment: newPaymentSchedulePreview.adjustedPayment,
					nextPaymentSchedule: newPaymentSchedulePreview.firstScheduledDate,
					loanSetdate: newPaymentSchedulePreview.firstScheduledDate,
					estimatedAPR: newPaymentSchedulePreview.APR,
					isInLoanModification: true,
					loanModificationRevision: loanModificationRevision,
					lastLoanModificationCreatedDate: moment( nowDate ).toDate(),
					lastLoanModificationCreatedBy: loggedInUser.id,
					loanModificationComment: confirmReason,
					isInCollections: false,
					movedToCollectionsDate: null,
					collectionAssignStatus: null,
					collectionAssignedUser: null,
					collectionsAccountStatus: PaymentManagement.collectionsAccountStatusEnum.IN_LOAN_MODIFICATION,
					collectionAccountStatusReason: null,
					loanReference: "LN_" + loanRefernceData.sequence_value,
					forgiveAccruedInterest: newPaymentSchedulePreview.forgiveAccruedInterest,
					excludeInterest: newPaymentSchedulePreview.excludeInterest,
					paymentFrequency: newPaymentSchedulePreview.payCycle,
					isAfterHoliday: newPaymentSchedulePreview.isAfterHoliday,
					totalPaymentsFeeChargeAmount: newPaymentSchedulePreview.total_fee_charge,
					totalPaymentsPrincipalAmount: newPaymentSchedulePreview.total_principal_pay,
					totalPaymentsFinancedAmount: newPaymentSchedulePreview.total_finance_pay,
					
					interestPayoff: newPaymentSchedulePreview.interestPayoff,
					principalPayoff: newPaymentSchedulePreview.principalPayoff,
					remainingFees: newPaymentSchedulePreview.remainingFees,
					remainingLateFees: newPaymentSchedulePreview.remainingLateFees,
					pastDuePrincipal: newPaymentSchedulePreview.pastDuePrincipal,
					pastDueInterest: newPaymentSchedulePreview.pastDueInterest,
					pastDueFees: newPaymentSchedulePreview.pastDueFees,
					pastDueLateFees: newPaymentSchedulePreview.pastDueLateFees,
					totalAmountOwedWithLateFees: newPaymentSchedulePreview.totalAmountOwedWithLateFees,
					loanTerm: newPaymentSchedulePreview.loanTerm
				}
		);
		if( paymentManagementUpdateResponse && paymentManagementUpdateResponse.length > 0 ) {
			await addCollectionComment(
					loggedInUser,
					paymentId,
					confirmReason,
					CollectionComments.collectionCommentTypeEnum.MODIFY_LOAN,
					customerContacted
			);
			await logCollectionActivity(
					loggedInUser,
					paymentId,
					"Collections",
					`This contract has been modified with a new payment schedule with a comment of '${confirmReason}'. Loan Modification Revision: ${paymentManagementUpdateResponse[ 0 ].loanModificationRevision}`
			);
			return paymentManagementUpdateResponse[ 0 ];
		}
	}
	return null;
}
async function updatePastDuePaymentForContracts( criteria ) {
	if( criteria ) {
		const paymentManagements = await PaymentManagement.find( criteria )
		.populate( "practicemanagement" )
		.populate( "screentracking" );
		if( paymentManagements ) {
			for( const paymentManagement of paymentManagements ) {
				const pastDuePayments = getPastDueFromPayments( paymentManagement );
				await updatePastDuePaymentForContract( paymentManagement, pastDuePayments );
			}
		}
	}
}

async function updatePastDuePaymentForContract( paymentManagement, pastDuePayments ) {
	let paymentUpdateObj = {
		oldestDaysPastDue:0,
		totalNumberOfPastDue: 0,
		totalAmountPastDue: 0,
		payOffAmount:  pastDuePayments &&  pastDuePayments.ledger?pastDuePayments.ledger.payoff:0
	}
	if( pastDuePayments && pastDuePayments.data && pastDuePayments.data.length > 0 ) {
		paymentUpdateObj = {
			oldestDaysPastDue: pastDuePayments.data[ 0 ].numberOfDaysPastDue,
			totalNumberOfPastDue: pastDuePayments.data.length,
			totalAmountPastDue: pastDuePayments.totalAmountPastDue,
		};
		if( pastDuePayments.lastPayment ) {
			paymentUpdateObj["lastPaymentMadeDate"] = pastDuePayments.lastPayment.date;
			paymentUpdateObj["lastPaymentAmount"] = pastDuePayments.lastPayment.amount;
		}
		
		paymentUpdateObj = { ...paymentUpdateObj, ...generateDaysPastDueFields( pastDuePayments, paymentManagement ) };
	}else {
		_.assign(paymentUpdateObj, {uniquePastDueCounter:0, daysPastDueTracker: null})
	}
	if( pastDuePayments && pastDuePayments.data && pastDuePayments.data.length > 0 && pastDuePayments.data[ 0 ].date && !paymentManagement.dateOfFirstDelinquency ){
		paymentUpdateObj["dateOfFirstDelinquency"] = pastDuePayments.data[ 0 ].date;
	}
	await PaymentManagement.update( { id: paymentManagement.id }, paymentUpdateObj );
}

/**
 * Generate days past due properties
 * @param {Object} pastDuePayments
 * @param {Object} paymentManagement
 * @return {Object}
 */
function generateDaysPastDueFields( pastDuePayments, paymentManagement ) {
	let { uniquePastDueCounter, daysPastDueTracker } = paymentManagement;
	const { data } = pastDuePayments;
	
	if( data && data.length > 0 ) {
		// generate days past due object
		if( !daysPastDueTracker ) {
			daysPastDueTracker = {
				thirtyDaysPastDue: {
					paymentsDate: [],
					total: 0
				},
				sixtyDaysPastDue: {
					paymentsDate: [],
					total: 0
				},
				ninetyDaysPastDue: {
					paymentsDate: [],
					total: 0
				},
				oneHundredTwentyDaysPastDue: {
					paymentsDate: [],
					total: 0
				}
			};
		}
		const { thirtyDaysPastDue, sixtyDaysPastDue, ninetyDaysPastDue, oneHundredTwentyDaysPastDue } = daysPastDueTracker;
		
		// first time past due
		if( !uniquePastDueCounter ) {
			uniquePastDueCounter = 1;
		} else if( uniquePastDueCounter && thirtyDaysPastDue.paymentsDate.length === 0 && thirtyDaysPastDue.total === 0 ) {
			// new past due after payments being up to date
			uniquePastDueCounter++;
		}
		
		// add payment date to slots
		data.forEach( ( { date, numberOfDaysPastDue } ) => {
			if( !thirtyDaysPastDue.paymentsDate.includes( date ) &&
					numberOfDaysPastDue >= 30 &&
					numberOfDaysPastDue <= 59
			) {
				daysPastDueTracker = addPaymentToSlot( daysPastDueTracker, 30, date );
			} else if(
					!sixtyDaysPastDue.paymentsDate.includes( date ) &&
					numberOfDaysPastDue >= 60 &&
					numberOfDaysPastDue <= 89
			) {
				daysPastDueTracker = addPaymentToSlot( daysPastDueTracker, 60, date );
				
				// check if payment is not in the previous slots
				if( !thirtyDaysPastDue.paymentsDate.includes( date ) ) {
					daysPastDueTracker = addPaymentToSlot( daysPastDueTracker, 30, date );
				}
			} else if(
					!ninetyDaysPastDue.paymentsDate.includes( date ) &&
					numberOfDaysPastDue >= 90 &&
					numberOfDaysPastDue <= 119
			) {
				daysPastDueTracker = addPaymentToSlot( daysPastDueTracker, 90, date );
				
				// check if payment is not in the previous slots
				if( !sixtyDaysPastDue.paymentsDate.includes( date ) ) {
					daysPastDueTracker = addPaymentToSlot( daysPastDueTracker, 60, date );
				}
				if( !thirtyDaysPastDue.paymentsDate.includes( date ) ) {
					daysPastDueTracker = addPaymentToSlot( daysPastDueTracker, 30, date );
				}
			} else if( !oneHundredTwentyDaysPastDue.paymentsDate.includes( date ) &&
					numberOfDaysPastDue >= 120
			) {
				daysPastDueTracker = addPaymentToSlot( daysPastDueTracker, 120, date );
				
				// check if payment is not in the previous slots
				if( !ninetyDaysPastDue.paymentsDate.includes( date ) ) {
					daysPastDueTracker = addPaymentToSlot( daysPastDueTracker, 90, date );
				}
				if( !sixtyDaysPastDue.paymentsDate.includes( date ) ) {
					daysPastDueTracker = addPaymentToSlot( daysPastDueTracker, 60, date );
				}
				if( !thirtyDaysPastDue.paymentsDate.includes( date ) ) {
					daysPastDueTracker = addPaymentToSlot( daysPastDueTracker, 30, date );
				}
			}
		} );
		
		//sails.log.verbose( "Days past due object generated: ", daysPastDueTracker );
		return { uniquePastDueCounter, daysPastDueTracker };
	}
}

/**
 * Push a payment date to the given slot
 * @param {Object} daysPastDueTracker
 * @param {Number} slot
 * @param {String} date
 * @return {Object}
 */
function addPaymentToSlot( daysPastDueTracker, slot, date ) {
	const { thirtyDaysPastDue, sixtyDaysPastDue, ninetyDaysPastDue, oneHundredTwentyDaysPastDue } = daysPastDueTracker;
	switch( slot ) {
		case 30:
			thirtyDaysPastDue.paymentsDate.push( date );
			thirtyDaysPastDue.total++;
			break;
		case 60:
			sixtyDaysPastDue.paymentsDate.push( date );
			sixtyDaysPastDue.total++;
			break;
		case 90:
			ninetyDaysPastDue.paymentsDate.push( date );
			ninetyDaysPastDue.total++;
			break;
		case 120:
			oneHundredTwentyDaysPastDue.paymentsDate.push( date );
			oneHundredTwentyDaysPastDue.total++;
			break;
		default:
			break;
	}
	
	return daysPastDueTracker;
}

/**
 * Remove the payment date from daysPastDueTracker slots and decreases the total payments in slots that the payment is when the payment is made
 * @param {Boolean} isPayOff
 * @param {Object} paymentManagement
 * @param {Function} paymentManagementUpdateFunc
 */
async function removeDaysPastDueFields( isPayOff, paymentManagement, paymentManagementUpdateFunc ) {
	const { id } = paymentManagement;
	let { daysPastDueTracker } = paymentManagement;
	if( !daysPastDueTracker ) {
		return;
	}
	
	// clear all past due payments
	if( isPayOff ) {
		daysPastDueTracker = {
			thirtyDaysPastDue: {
				paymentsDate: [],
				total: 0
			},
			sixtyDaysPastDue: {
				paymentsDate: [],
				total: 0
			},
			ninetyDaysPastDue: {
				paymentsDate: [],
				total: 0
			},
			oneHundredTwentyDaysPastDue: {
				paymentsDate: [],
				total: 0
			}
		};
	} else {
		for( const property in daysPastDueTracker ) {
			if(
					daysPastDueTracker.hasOwnProperty( "thirtyDaysPastDue" ) ||
					daysPastDueTracker.hasOwnProperty( "sixtyDaysPastDue" ) ||
					daysPastDueTracker.hasOwnProperty( "ninetyDaysPastDue" ) ||
					daysPastDueTracker.hasOwnProperty( "oneHundredTwentyDaysPastDue" )
			) {
				if( daysPastDueTracker[ property ].paymentsDate.length > 0 && daysPastDueTracker[ property ].total > 0 ) {
					daysPastDueTracker[ property ].paymentsDate.pop();
					daysPastDueTracker[ property ].total--;
				}
			}
		}
	}
	
	try {
		await paymentManagementUpdateFunc( { id }, { daysPastDueTracker } );
		//sails.log.verbose( "Past due fields removed successfully, new object: ", daysPastDueTracker );
	} catch ( error ) {
		sails.log.error( "CollectionsService#removeDaysPastDueFields Error: ", error );
	}
}
