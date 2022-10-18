"use strict";
const _ = require("lodash");
const path = require("path");
const moment = require("moment");
const ObjectID = require( "mongodb" ).ObjectID;
module.exports = {
	getCollectionsView: getCollectionsView,
	ajaxGetCollectionsData:ajaxGetCollectionsData,
	ajaxAssignToUser: ajaxAssignToUser,
	getPassDuePaymentsForDisplay:getPassDuePaymentsForDisplay,
	ajaxGetPassDuePayments:ajaxGetPassDuePayments,
	changePromiseToPaySchedule: changePromiseToPaySchedule,
	ajaxGetCollectionComments: ajaxGetCollectionComments,
	ajaxUpdatePaymentWorkFlow: ajaxUpdatePaymentWorkFlow,
	showSettledContacts:showSettledContacts,
	showChargedOffContacts:showChargedOffContacts,
	ajaxGetEndedContractsList: ajaxGetEndedContractsList,
	showLoanModificationPage:showLoanModificationPage,
	ajaxGetNewPaymentSchedulePreview:ajaxGetNewPaymentSchedulePreview,
	ajaxSaveNewLoanModifications:ajaxSaveNewLoanModifications,
	showModifiedLoans:showModifiedLoans,
	ajaxGetModifiedLoansList:ajaxGetModifiedLoansList,
	//TODO: DELETE ME WHEN VIKING PAYMENT IS DONE AND TESTED
	testProcessPayments:testProcessPayments2,
	testCheckPaymentStatus:testCheckPaymentStatus
};

async function getCollectionsView( req, res ) {
	// await processPaymentSchedules();
	const collectionType = req.param( "collectionType" );
	if(req.user.collectionRoleName === CollectionRoles.collectionRolesEnum.COLLECTION_STAFF && (collectionType === CollectionsService.collectionListTypes.ALL || collectionType === CollectionsService.collectionListTypes.UNASSIGNED)) {
		return res.redirect( `/admin/collections/${CollectionsService.collectionListTypes.ASSIGNED_TO_ME}` );
	}
	const collectionTypes = _.values( CollectionsService.collectionListTypes );
	if(!collectionType || collectionTypes.indexOf( collectionType ) < 0) {
		const errorMessage = `Collection type is missing or it is an unknown collection type. Valid options are ${collectionTypes.join( ", " )}`;
		return res.view( "admin/error/400", { data: errorMessage } );
	}

	const collectionRoles = await CollectionRoles.getCollectionRoles();
	const collectionValues = Object.values(collectionRoles);
	const loggedInUser = req.user;
	const userCollectionRole = _.find(collectionValues, (collectionRole) => {
		return collectionRole.id === loggedInUser.collectionRole
	});


	const collectionRolesWithPermissions = _.reduce(collectionValues,(acc, collectionRole) => {
		if(collectionRole.rolename !== CollectionRoles.collectionRolesEnum.UNASSIGNED){
			acc.push(collectionRole.id);
		}
		return acc;
	},[]);
	const unassignedRole = collectionRoles[CollectionRoles.collectionRolesEnum.UNASSIGNED];
	const adminRole = await Roles.findOne({rolename: "Admin"});
	const adminUsers = await Adminuser.find({$or: [{collectionRole: {$in:collectionRolesWithPermissions}}, {role: adminRole.id}]});

	return res.view( "collections/collectionsList", {
		collectionType: collectionType,
		loggedInUser: loggedInUser,
		userCollectionRole: userCollectionRole,
		unassignedRole: unassignedRole,
		adminUsers: adminUsers
	} );
}
async function ajaxGetCollectionsData(req,res) {
	const collectionType = req.param("collectionType");
	const collectionTypes = _.values(CollectionsService.collectionListTypes);
	if(!collectionType || collectionTypes.indexOf(collectionType) < 0) {
		const errorMessage = `Collection type is missing or it is an unknown collection type. Valid options are ${collectionTypes.join(", ")}`;
		sails.log.error("CollectionsController#ajaxGetCollectionsData: Error: ", errorMessage);
		return res.status(400).json({message: errorMessage });
	}
	const matchCriteria = {$and:[], status:"ACTIVE"};

	const loggedInUser = req.user;
	if(collectionType === CollectionsService.collectionListTypes.ASSIGNED_TO_ME || (loggedInUser.collectionRoleName === CollectionRoles.collectionRolesEnum.COLLECTION_STAFF && (collectionType === CollectionsService.collectionListTypes.ALL || CollectionsService.collectionListTypes.PENDING || collectionType === CollectionsService.collectionListTypes.PROMISE_TO_PAY))) {
		matchCriteria["collectionAssignedUser"] = new ObjectID(loggedInUser.id);
	}else if(collectionType === CollectionsService.collectionListTypes.UNASSIGNED) {
		matchCriteria["$or"] = [
			{ collectionAssignedUser: { $eq: null } },
			{ collectionAssignedUser: { $exists: false } }
		];
	}
	if(collectionType === CollectionsService.collectionListTypes.PROMISE_TO_PAY){
		matchCriteria["collectionsAccountStatus"] = PaymentManagement.collectionsAccountStatusEnum.PROMISE_TO_PAY;
	}else {
		matchCriteria["collectionsAccountStatus"] = {$ne:PaymentManagement.collectionsAccountStatusEnum.PROMISE_TO_PAY};
	}
	if(!!req.query.dpdFilter) {
		switch(!!req.query.dpdFilter? parseInt(req.query.dpdFilter):-1) {
			case 1:
				matchCriteria["$and"].push({oldestDaysPastDue: {$lte: 30}});
				break;
			case 2:
				matchCriteria["$and"].push({oldestDaysPastDue: {$lte: 60, $gte:31}});
				break;
			case 3:
				matchCriteria["$and"].push({oldestDaysPastDue: {$lte: 90, $gte:61}});
				break;
			case 4:
				matchCriteria["$and"].push({oldestDaysPastDue: {$lte: 120, $gte:91}});
				break;
			case 5:
				matchCriteria["$and"].push({oldestDaysPastDue: {$gte:121}});
				break;
			default:
				break;
		}
	}
	if(collectionType === CollectionsService.collectionListTypes.PENDING) {
		matchCriteria["$and"].push({"isInPendingCollections": true});
	}else {
		matchCriteria["$and"].push({"isInCollections": true});
	}
	try{
		const responseJson =  await CollectionsService.lookupPaymentManagement(
			req.query.columns,
			matchCriteria,
			req.query.search?req.query.search.value:"",
			[],
			req.query.order,
			req.query.start, req.query.length);
		return res.json(responseJson)
	}catch (exc) {
		return res.json({error: exc.message});
	}
}

async function ajaxAssignToUser(req,res) {
	const requestBody = req.body;
	if(requestBody.isUnassigned !== null && requestBody.isUnassigned !== undefined ){
		requestBody.isUnassigned = requestBody.isUnassigned.toString().trim().toLowerCase() === "true";
	}
	if(!requestBody || !requestBody.paymentIds || requestBody.paymentIds === 0 || (!requestBody.assignToUser && !requestBody.isUnassigned)) {
		const errorMessage ="Unable to assign collection loan(s) to user. Missing or wrong request data.";
		sails.log.error("CollectionsController#ajaxAssignToUser: Error: ", errorMessage);
		return res.status(400).json({message: errorMessage });
	}
	try{
		let paymentUpdateResponse = await CollectionsService.assignContractToUserOrRole(requestBody);
		res.json({allUpdated: paymentUpdateResponse && paymentUpdateResponse.allUpdated});
	}catch(errorObj) {
		sails.log.error("CollectionsController#ajaxAssignToUser: Error: ", errorObj);
		return res.status(500).json({message: errorObj.message });
	}
}
async function ajaxGetPassDuePayments(req,res) {
	const paymentId = req.param("paymentId");
	if(!paymentId) {
		const errorMessage ="Unable to get past due payments. Missing required parameter";
		sails.log.error("CollectionsController#ajaxGetPassDuePayments: Error: ", errorMessage);
		return res.status(400).json({message: errorMessage });
	}
	try{
		const paymentManagement = await PaymentManagement.findOne( {id: paymentId} ).populate("screentracking");
		const payScheduleObj = await CollectionsService.getPastDueFromPayments(paymentManagement,req.query.order,req.query.columns,req.query.start,req.query.length);
		return res.json(payScheduleObj);
	}catch (exc) {
		return res.json({error: exc.message});
	}
}
async function getPassDuePaymentsForDisplay(req,res) {
	const paymentId = req.param("paymentId");
	if(!paymentId) {
		const errorMessage ="Unable to get past due payments. Missing required parameter";
		sails.log.error("CollectionsController#getPassDuePaymentsForDisplay: Error: ", errorMessage);
		return res.status(400).json({message: errorMessage });
	}
	const payScheduleObj = await CollectionsService.checkForCollectionItems(paymentId);
	if(payScheduleObj){
		return res.json(payScheduleObj);
	}else {
		const errorMessage ="No past due payments found.";
		sails.log.error("CollectionsController#getPassDuePaymentsForDisplay: Error: ", errorMessage);
		return res.status(404).json({message: errorMessage });
	}
}
async function ajaxGetCollectionComments( req, res ) {
	const paymentId = req.param( "paymentId" );
	const commentType = req.param("commentType");
	if(!paymentId) {
		const errorMessage = "Unable to get collection comments. Missing required parameter";
		sails.log.error( "CollectionsController#ajaxGetCollectionComments: Error: ", errorMessage );
		return res.status( 400 ).json( { message: errorMessage } );
	}
	let searchCriteria = _.assign({},{paymentmanagement: new ObjectID(paymentId)},CollectionComments.getQueryFromCollectionCommentType(commentType));
	if(!!req.query.commentTypeFilter) {
		searchCriteria["collectionsCommentType"] = req.query.commentTypeFilter;
	}
	const collectionComments = await CollectionsService.getCollectionComments(  req.query.columns,
		searchCriteria,
		req.query.search ? req.query.search.value : "",
		[],
		req.query.order,
		req.query.length,
		req.query.start );

	return res.json( collectionComments );
}
async function changePromiseToPaySchedule(req,res) {
	try{
		const requestBody = req.body;
		if(requestBody && !!requestBody.isRemovingSchedule) {
			requestBody.isRemovingSchedule = requestBody.isRemovingSchedule.toString().toLowerCase() === "true";
		}
		if(!requestBody.paymentId || !requestBody.promiseScheduleReason || (!requestBody.isRemovingSchedule && (!requestBody.promiseScheduleDate || !requestBody.promiseScheduleTime ))) {
			const errorMessage ="Unable to update promise to pay. Missing required data";
			sails.log.error("CollectionsController#changePromiseToPaySchedule: Error: ", errorMessage);
			return res.status(400).json({message: errorMessage });
		}
		const didPaymentUpdate = await CollectionsService.changePromiseToPaySchedule(req.user, requestBody.paymentId, requestBody.isRemovingSchedule, requestBody.promiseScheduleDate, requestBody.promiseScheduleTime,requestBody.promiseScheduleReason);
		if(didPaymentUpdate) {
			let logMessage = `A promise to pay was removed with comment: '${requestBody.promiseScheduleReason}'`;
			if(!requestBody.isRemovingSchedule) {
				logMessage = `A promise to pay was scheduled for ${requestBody.promiseScheduleDate} at ${requestBody.promiseScheduleTime} with comment: '${requestBody.promiseScheduleReason}'`;
			}
			await CollectionsService.logCollectionActivity(req.user,requestBody.paymentId, "Collections", logMessage);
			return res.json({success: true});
		}else {
			const errorMessage ="There was a problem updated this contract promise to pay. Unknown error";
			sails.log.error("CollectionsController#changePromiseToPaySchedule: Error: ", errorMessage);
			return res.status(500).json({message: errorMessage });
		}

	}catch(exc) {
		sails.log.error("CollectionsController#changePromiseToPaySchedule: Error: ", exc);
		return res.status(500).json({message: exc.message});
	}
}

async function ajaxUpdatePaymentWorkFlow(req,res) {
	try {
		const requestBody = req.body;
		const collectionAccountStatuses = PaymentManagement.collectionsAccountStatusEnum;
		if(!validateFieldsExist(["workflow", "confirmReason","paymentId"], requestBody) || [collectionAccountStatuses.CHARGEOFF,collectionAccountStatuses.SETTLED,collectionAccountStatuses.BANKRUPTCY].indexOf(requestBody.workflow) < 0) {
			const errorMessage =`Unable to move this contract from collections. Missing required data`;
			sails.log.error("CollectionsController#ajaxUpdatePaymentWorkFlow: Error: ", errorMessage);
			return res.status(400).json({message: errorMessage });
		}
		if(requestBody.workflow === collectionAccountStatuses.BANKRUPTCY){
			return
		}

		const paymentUpdate = await CollectionsService.moveCollectionsContractPaymentStatus(requestBody.paymentId, requestBody.workflow, requestBody.confirmReason, req.user);
		if(paymentUpdate) {
			return res.json({success: true});
		}else {
			const errorMessage ="There was a problem moving this contract from collections. Unknown error";
			sails.log.error("CollectionsController#ajaxUpdatePaymentWorkFlow: Error: ", errorMessage);
			return res.status(500).json({message: errorMessage });
		}
	}catch(exc) {
		sails.log.error("CollectionsController#ajaxUpdatePaymentWorkFlow: Error: ", exc);
		return res.status(500).json({message: exc.message});
	}
}

async function showSettledContacts(req,res) {
	return res.view( "collections/endedContractsList", {endedListType: "settled"});
}
async function showChargedOffContacts(req,res) {
	return res.view( "collections/endedContractsList",{endedListType: "chargeOff"});
}
async function ajaxGetEndedContractsList(req,res) {
	try{
		const endedListType = req.param("endedListType");
		if(!endedListType || ["settled","chargeOff"].indexOf(endedListType) < 0) {
			const errorMessage = `Unable to retrieve ended contracts. Missing the list type}`;
			sails.log.error("CollectionsController#ajaxGetEndedContractsList: Error: ", errorMessage);
			return res.status(400).json({message: errorMessage });
		}

		const collectionComments = await CollectionsService.getEndedContracts(  req.query.columns,
			{status: (endedListType === "settled")?PaymentManagement.paymentManagementStatus.settled:PaymentManagement.paymentManagementStatus.chargeOff},
			req.query.search ? req.query.search.value : "",
			[],
			req.query.order,
			req.query.start,
			req.query.length
		);

		return res.json( collectionComments );

	}catch(exc) {
		sails.log.error( "CollectionsController#ajaxGetSettledList: Error: ", exc );
		return res.json({error: exc.message});
	}
}
async function showLoanModificationPage(req,res){
	const paymentId = req.param("paymentId");
	if(!paymentId) {
		const errorMessage ="Loan modification is missing the required payment id parameter.";
		sails.log.error("CollectionsController#showLoanModificationPage: Error: ", errorMessage);
		return  res.view( "admin/error/400", {
			data: errorMessage,
			layout: "layout"
		} );
	}
	const paymentManagement = await PaymentManagement.findOne({id: paymentId}).populate("screentracking").populate("user");
	if(!paymentManagement) {
		const errorMessage ="The contract to modify a loan was not found in collections.";
		sails.log.error("CollectionsController#showLoanModificationPage: Error: ", errorMessage);
		return  res.view( "admin/error/404", {
			data: errorMessage,
			layout: "layout"
		} );
	}
	// if( !paymentManagement.isInCollections) {
	// 	return res.redirect(`/admin/getAchUserDetails/${paymentManagement.id}`);
	// }
	const payrollFrequencies = await EmploymentHistory.getPayrollDatesFromEmploymentHistory(paymentManagement.user.id);
	const holidayDates = SmoothPaymentService.getHolidayDates();
	const periodicityTextData = PaymentManagement.convertedPeriodicityToText;

	const ledger = await PlatformSpecificService.getPaymentLedger(paymentManagement,new Date());

	ledger.lateAccruedInterest = parseFloat((ledger.lateAccruedInterest + ledger.remainingDeferredAmount + ledger.remainingForgivenInterestAmount).toFixed(2));
	// ledger.accruedInterest = 339.35;
	sails.log.error(JSON.stringify(ledger));
	return res.view("collections/collectionsLoanModificationPage", {paymentmanagementdata: paymentManagement, ledger: ledger, 	payrollFrequencies: payrollFrequencies, holidayDates:holidayDates,periodicityTextData: periodicityTextData, isPayCalendarForLoanModification: true});
}

async function ajaxGetNewPaymentSchedulePreview(req,res) {
	try{
		// "totalFinancedAmount": {required: "Please enter a modified finance amount."},
		// "newPrincipalAmount": { required: "Please enter a new principal amount."},
		// "newInterestAmount": { required:  "Please enter a new interest amount." },
		// "adjustedPaymentAmount": { required: "Please enter an adjusted amount." },
		// "requiredNumberOfPayments": {required:  "Please enter an adjusted amount."}
		if(!validateFieldsExist(["firstPaymentDate","paymentId", "bankHolidayDirection", "payFrequency","newPrincipalAmount","adjustedPaymentAmount","totalFinancedAmount","adjustedPaymentAmount", "requiredNumberOfPayments"],req.body) ){
			const errorMessage = "Missing required data to get new payment schedule preview.";
			sails.log.error("CollectionsController#ajaxGetNewPaymentSchedulePreview :: err - ", errorMessage);
			return res.status(400).json({
				message: errorMessage
			});
		}
		const requestBody = req.body;
		const firstPaymentDateString = requestBody.firstPaymentDate;
		const payID = requestBody.paymentId;
		const bankHolidayDirection = parseInt(requestBody.bankHolidayDirection || "0");
		const frequency = requestBody.payFrequency;
		const newPrincipalAmount = parseFloat(requestBody.newPrincipalAmount);
		let newInterestAmount = parseFloat(requestBody.newInterestAmount || "0");
		const adjustedPaymentAmount = parseFloat(requestBody.adjustedPaymentAmount);
		const totalFinancedAmount = parseFloat(requestBody.totalFinancedAmount);
		const loanTerm = parseInt(requestBody.requiredNumberOfPayments);

		const forgiveAccruedInterest = !!requestBody.forgiveAccruedInterest && requestBody.forgiveAccruedInterest.toLocaleString() === "true";
		const excludeInterest = !!requestBody.excludeInterest && requestBody.excludeInterest.toLocaleString() === "true";

		const paymentManagement = await PaymentManagement.findOne({id: payID}).populate("screentracking");
		const newStartDate = moment(firstPaymentDateString,"MMMM D, YYYY").toDate();
		paymentManagement.nextPaymentSchedule = moment(newStartDate).toDate();

		const ledger = await PlatformSpecificService.getPaymentLedger(paymentManagement,new Date());
		ledger.lateAccruedInterest = parseFloat((ledger.lateAccruedInterest + ledger.remainingDeferredAmount + ledger.remainingForgivenInterestAmount).toFixed(2));
		let currentAccruedInterest = ledger.totalInterestOwed;
		if(!excludeInterest) {
			if(forgiveAccruedInterest){
				newInterestAmount = parseFloat((ledger.totalChargedAccruedInterest + ledger.unpaidInterest));
			}else {
				newInterestAmount = currentAccruedInterest;
			}
		}
		const newPaymentSchedule = SmoothPaymentService.generatePaymentScheduleAdjustedPayment( newStartDate, moment(newStartDate).toDate(), frequency, newInterestAmount, newPrincipalAmount, adjustedPaymentAmount,bankHolidayDirection === 1);
		if(newPaymentSchedule && newPaymentSchedule.paymentSchedule && newPaymentSchedule.paymentSchedule.length > 0) {
			newPaymentSchedule["forgiveAccruedInterest"] = forgiveAccruedInterest;
			newPaymentSchedule["excludeInterest"] = excludeInterest;
			newPaymentSchedule["originalAccruedInterest"] = ledger.accruedInterest;
			req.session["newPaymentSchedulePreview"] = newPaymentSchedule;
			return res.json(newPaymentSchedule)
		}else {
			delete req.session.newPaymentSchedulePreview;
			return res.status(500).json({message: "Unknown error: No new payment schedule was generated."});
		}
	}catch(exc) {
		sails.log.error( "CollectionsController#ajaxGetNewPaymentSchedulePreview: Error: ", exc );
		return res.json({error: exc.message});
	}
}

async function ajaxSaveNewLoanModifications(req,res) {
	try{
		const paymentId = req.param("paymentId");
		const confirmReason = req.param("confirmReason");
		const newPaymentSchedulePreview = req.session.newPaymentSchedulePreview;
		let errorMessage = null;
		if(!paymentId ||! confirmReason){
			errorMessage = "Missing required data to save this new loan modification.";
		}

		if(!newPaymentSchedulePreview || !newPaymentSchedulePreview.paymentSchedule || newPaymentSchedulePreview.paymentSchedule.length === 0) {
			errorMessage = "We were unable to retrieve the new payment schedule preview that was generated. Please go back and click 'Preview' to generate a new payment schedule";
		}
		if(!!errorMessage) {
			sails.log.error( "CollectionsController#ajaxSaveNewLoanModifications :: err - ", errorMessage );
			return res.status( 400 ).json( {
				message: errorMessage
			} );
		}
		const modifyLoanResponse = await CollectionsService.saveNewLoanModifications(paymentId,confirmReason,newPaymentSchedulePreview,req.user);
		if(!modifyLoanResponse){
			errorMessage = "There was an unknown error. Loan modification was not updated for this contract."
			sails.log.error( "CollectionsController#ajaxSaveNewLoanModifications :: err - ", errorMessage );
			return res.status( 500 ).json( {
				message: errorMessage
			} );
		}else {
			delete req.session.newPaymentSchedulePreview;
			req.session["loadPaymentSheduleTab"] = true;
			return res.json({success: modifyLoanResponse});
		}
	}catch(exc) {
		sails.log.error( "CollectionsController#ajaxGetNewPaymentSchedulePreview: Error: ", exc );
		return res.json({error: exc.message});
	}
}
async function showModifiedLoans(req,res) {
	return res.view( "collections/modifiedLoansList");
}
async function ajaxGetModifiedLoansList(req,res) {
	try{
		const responseJson =  await CollectionsService.lookupPaymentManagement(
			req.query.columns,
			{isInLoanModification: true},
			req.query.search?req.query.search.value:"",
			[],
			req.query.order,
			req.query.start, req.query.length);

		return res.json( responseJson );

	}catch(exc) {
		sails.log.error( "CollectionsController#ajaxGetModifiedLoansList: Error: ", exc );
		return res.json({error: exc.message});
	}
}

function validateFieldsExist(fieldArray, requestBody) {
	return !_.some(fieldArray, (field) => {
		return !requestBody[field]
	});
}

async function processPaymentSchedules() {
	await CollectionsCronService.checkForNewCollectionItems();
}

async function testProcessPayments2 (req,res) {

	// const contractPayments = await PaymentManagement.findOne({id: "5e17bbc58468e0deac4f0e4b"}).populate("practicemanagement").populate("user");
	// contractPayments.paymentScheduleItem = contractPayments.paymentSchedule[0];
	// contractPayments.paymentScheduleItem.date = moment().startOf("day").format(	"YYYY-MM-DDTHH:mm:ss[Z]");
	//

	res.json({done:"yes"});
	// const today =  moment().add(-8,"hour").startOf("day");
	// const contractPayments = await PaymentManagement.find({nextPaymentSchedule: today.toDate(), loanReference: {$in: ["LN_40015","LN_40016","LN_40017","LN_40018","LN_40019"]}}).populate("user");
	// if(contractPayments && contractPayments.length > 0) {
	// 	const schedContractPayments = [];
	// 	for(let contractPayment of contractPayments) {
	//
	// 		contractPayment.paymentScheduleItem  = _.find(contractPayment.paymentSchedule,(paySched) => {
	// 				return moment(paySched.date).startOf("day").diff(today,"days") === 0;
	// 		});
	//
	// 		const account = await Account.findOne({user: contractPayment.user.id});
	// 		const contractPaymentObj = {
	// 			paymentmanagement: contractPayment,
	// 			practicemanagement: contractPayment.practicemanagement,
	// 			user: contractPayment.user,
	// 			account: account,
	// 			paymentScheduleItem:contractPayment.paymentScheduleItem
	// 		};
	// 		schedContractPayments.push(contractPaymentObj)
	// 	}
	// 	sails.log.info("==============================================Start processing contract payments");
	// 	await PaymentService.processContractPayments(schedContractPayments,"30.30.30.30");
	// }
	//  await ReportingService.sendInsightDataToSFTP();
	//  await CollectionsCronService.checkForLastPaymentCompletion();
	//  await CollectionsCronService.checkForFirstPaymentPerforming();
	//  await CollectionsCronService.latePaymentCollectionCheck();
	//  await CollectionsCronService.checkForNewCollectionItems();
	// await CronService.getAllVikingDebitPayment("127.0.0.1");
	// await CronService.checkVikingPaymentStatuses("127.0.0.1");

	return;
}
async function testProcessPayments (req,res) {

	// const contractPayments = await PaymentManagement.findOne({id: "5e17bbc58468e0deac4f0e4b"}).populate("practicemanagement").populate("user");
	// contractPayments.paymentScheduleItem = contractPayments.paymentSchedule[0];
	// contractPayments.paymentScheduleItem.date = moment().startOf("day").format(	"YYYY-MM-DDTHH:mm:ss[Z]");
	//

	 res.json({done:"yes"});
	 // const pms = await PaymentManagement.findOne({id: "5deea8c75861e36ca9e6fe1c"}).populate("practicemanagement").populate("user");//  await PaymentManagement.find({isInCollections: true}).populate("practicemanagement").populate("user");
	 // const paymentManagements = [pms];
	 // for(let pm of paymentManagements) {
	 // 	const screenTracking = await Screentracking.findOne({id: pm.screentracking});
		//  await Screentracking.update({id: pm.screentracking},{applicationDate: moment("10/25/2019","MM/DD/YYYY").startOf("day").toDate(),loanEffectiveDate:  moment("11/08/2019","MM/DD/YYYY").startOf("day").toDate()});
	 //
		//  await PaymentManagement.update({id: pm.id}, {loanSetdate:  moment("10/25/2019","MM/DD/YYYY").startOf("day").toDate(), nextPaymentSchedule:  moment("11/08/2019","MM/DD/YYYY").startOf("day").toDate()});
	 //
		//  const employmentHistory = await EmploymentHistory.getLatestEmploymentHistoryForUser( "5e5819c2b7259bb4db76c897" );
		//  if(employmentHistory) {
		// 	 const newEmploymentHistory = _.cloneDeep(employmentHistory);
		// 	 newEmploymentHistory.practicemanagement = pm.practicemanagement.id;
		// 	 newEmploymentHistory.user = pm.user.id;
		// 	 newEmploymentHistory.screentracking = pm.screentracking;
		// 	 delete newEmploymentHistory.id;
		// 	 delete newEmploymentHistory._id;
		// 	 await EmploymentHistory.createNewEmployeeHistoryIfNotChanged(newEmploymentHistory);
		//  }
		//  const paymentDetails = await PaymentService.updatePaymentSchedule( pm.id );
		//    if(paymentDetails && paymentDetails.paymentSchedule && paymentDetails.paymentSchedule.length > 0) {
		// 	   for (let i = 0; i < paymentDetails.paymentSchedule.length; i++) {
		// 		   const schedItem = paymentDetails.paymentSchedule[i];
		// 		   if (moment(schedItem.date).toDate() < moment("02/12/2020", "MM/DD/YYYY").toDate()) {
		// 			   paymentDetails.paymentSchedule[i].status = "PAID"
		// 		   }
		// 	   }
		//    }else {
		//    	 sails.log.error("No smooth payment schedule============================");
		//    }
	 // }

	const pm = await PaymentManagement.findOne({id: "5dd81a4a5821c21fbf1ab9de"}).populate("practicemanagement").populate("user");
	let newpm = [pm];


	const paymentDetails = await PaymentService.updatePaymentSchedule( pm.id );
		// for(let i=0; i< paymentDetails.paymentSchedule.length; i++) {
		// 	const schedItem = paymentDetails.paymentSchedule[i];
		// 	if(moment(schedItem.date).toDate() < moment("02/12/2020","MM/DD/YYYY").toDate()) {
		// 		paymentDetails.paymentSchedule[i].status = "PAID"
		// 	}
		// }
		 newpm = await PaymentManagement.update({id: pm.id}, {paymentSchedule: paymentDetails.paymentSchedule});

	// //check ledger
	// const ledger = PlatformSpecificService.getPaymentLedger(newpm[0],moment().startOf("day"));
	// let paymentAmount = ledger.regularPayment;
	// const dialogState = {
	// 	isRegularPayment: true,
	// 	isPayoffPayment: false,
	// };
	// if(ledger.unpaidInterest > 0 || ledger.totalChargedAccruedInterest > 0 ) {
	// 	// const totalInterestOwed = parseFloat(ledger.unpaidInterest.toFixed(2));
	// 	const  totalInterestOwed = parseFloat((ledger.unpaidInterest + ledger.totalChargedAccruedInterest).toFixed(2));
	// 	const totalAmountOwed = parseFloat((ledger.payoff + totalInterestOwed).toFixed(2));
	// 	if(paymentAmount >= totalAmountOwed) {
	// 		paymentAmount = totalAmountOwed;
	// 		dialogState.isRegularPayment = false;
	// 		dialogState.isPayoffPayment = true;
	// 	}
	// }else if( paymentAmount >= ledger.payoff ) {
	// 	paymentAmount = ledger.payoff;
	// 	dialogState.isRegularPayment = false;
	// 	dialogState.isPayoffPayment = true;
	// }
	// const templateData = PlatformSpecificService.previewPayment( newpm[0], moment().startOf("day"), paymentAmount, dialogState,null,false );
	//
	// reject payment
	// const rejectSchedItem =	_.find(newpm[0].paymentSchedule, (paySchedItem) => {return paySchedItem.pmtRef === "PMT_TEST2"});
	// rejectSchedItem.status = "RETURNED";
	// const smearGoods = await PlatformSpecificService.processSmearRipples(rejectSchedItem, pm.id);

	//return res.json(smearGoods);
	return;
}
async function testCheckPaymentStatus(req,res) {
	sails.log.verbose("CronService#checkVikingPaymentStatuses: Starting viking statuses check cron.");
	res.json({checkStatus: true});
	const payments = await Payment.find({status: Payment.STATUS_PENDING}).populate("vikingAchBatch");

	const vikingBatchToProcess = [];
	if(payments && payments.length > 0) {
		_.forEach(payments, (payment) => {
			if(vikingBatchToProcess.indexOf(payment.vikingAchBatch.id) < 0) {
				vikingBatchToProcess.push(payment.vikingAchBatch.id);
			}
		});

		if(vikingBatchToProcess.length > 0) {
			for(let vikingBatchId of vikingBatchToProcess) {
				const vikingBatchObj = await VikingACHBatch.findOne({id: vikingBatchId});
				if(vikingBatchObj) {
					sails.log.verbose(`CronService#checkVikingPaymentStatuses: Checking payment status of batch ${vikingBatchObj.batchId}.`);
					await PaymentService.checkPaymentStatus(vikingBatchObj)
				}
			}
		}
	}



	return;
}
