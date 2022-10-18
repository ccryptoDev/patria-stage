/**
 * AchController
 *
 * @description :: Server-side logic for managing Ach details
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
*/

var request = require('request'),
	moment = require('moment'),
	_ = require('lodash'),
	Q = require('q');
var in_array = require('in_array');
var ObjectId = require('mongodb').ObjectID;

var fs = require('fs');
var mailerConfig = sails.config.mailer;

module.exports = {
	showAllPendingAch: showAllPendingAchAction,
	ajaxPendingAch: ajaxPendingAchAction,
	ajaxPaymentHistory: ajaxPaymentHistoryAction,
	getAchUserDetails: getAchUserDetailsAction,
	denyUserLoan: denyUserLoanAction,
	addAchComments: addAchCommentsAction,
	addnewCustomer: addnewCustomerAction,
	addnewBankaccount: addnewBankaccountAction,
	loanproCreditPayment: loanproCreditPaymentAction,
	checkAchTransactionDetails: checkAchTransactionDetailsAction,
	ajaxAchComments: ajaxAchCommentsAction,
	uploadDocumentProof: uploadDocumentProofAction,
	defaultUsers: defaultUsersAction,
	ajaxDefaultUsersList: ajaxDefaultUsersListAction,
	viewDefaultUser: viewDefaultUserAction,
	showAllComplete: showAllCompleteAction,
	completeApplication: completeApplication,
	addchargeoff: addchargeoffAction,
	showAllBlocked: showAllBlockedAction,
	ajaxBlockedAch: ajaxBlockedAchAction,
	releaseApp: releaseAppAction,
	approveUserLoan: approveUserLoanAction,
	sendAddBankInvite: sendAddBankInvite,
	manageReconciliation: manageReconciliationAction,
	ajaxReconciliationList: ajaxReconciliationList,
	showAllDenied: showAllDeniedAction,
	ajaxDeniedApplication: ajaxDeniedApplicationAction,
	viewreconciliationDetails: viewreconciliationDetails,
	storyUserviewinfo: storyUserviewinfo,
	incompleteUploadDocumentProof: incompleteUploadDocumentProofAction,
	userPaymentHistory: userPaymentHistoryAction,
	cancelAch: cancelAchAction,
	repullPayment: repullPayment,
	showPotentialDefaultusers: showPotentialDefaultusers,
	ajaxPotentialDefaultusers: ajaxPotentialDefaultusers,
	approvePatientloan: approvePatientloanAction,
	updateSetDate: updateSetDateAction,
	updatePatientloanstartdate: updatePatientloanstartdateAction,
	showAllPerforming: showAllPerforming,
	showAllCompleted: showAllCompleted,
	showAllChargeOff: showAllChargeOff,
	showAllArchivedDenied: showAllArchivedDeniedAction,
	showAllArchivedPendingAch: showAllArchivedPendingAchAction,
	movetoopenupdate: movetoopenupdateAction,
	showAllToDoItemsPendingAch: showAllToDoItemsPendingAchAction,
	showAllToDoItemsDenied: showAllToDoItemsDeniedAction,
	showProcedureDateSet: showProcedureDateSetAction,
	markAsReviewed: markAsReviewedAction,
	showAllToDoItemsOpenApplication: showAllToDoItemsOpenApplicationAction,
	showAllArchivedOpenAch: showAllArchivedOpenAchAction,
	showAllOpenApplicationAch: showAllOpenApplicationAchAction,
	showInCompleteApplicationAch: showInCompleteApplicationAch,
	showLeadAch: showLeadAchAction,
	ajaxOpenApplicationAch: ajaxOpenApplicationAch,
	movetoUnarchive: movetoUnarchiveAction,
	providerlist: providerlistAction,
	ajaxProvider: ajaxProviderAction,
	confirmProcedure: confirmProcedure,
	reGeneratePaymentScheduleCalendar: reGeneratePaymentScheduleCalendar,
	savePaymentScheduleChanges: savePaymentScheduleChanges,
	confirmProcedure: confirmProcedure,
	saveProgramDates: saveProgramDates,
	approveISA: approveISA,
	ajaxUpdatePaymentBankruptcy: ajaxUpdatePaymentBankruptcy,
	showAllBankruptcies: showAllBankruptcies,
	ajaxGetBankruptcyList: ajaxGetBankruptcyList,
	laterAchNeedsReview: laterAchNeedsReviewAction,
	resolveAchComments: resolveAchCommentsAction,
	waivePaymentItem: waivePaymentItem,
	deferPaymentItem: deferPaymentItem,
	waiveEntireLoan: waiveEntireLoan,
	ajaxFreshLeadList: ajaxFreshLeadList,
	showFreshLeadsList: showFreshLeadsList,
	ajaxOriginateLoan: ajaxOriginateLoan,
	changeFundingPaymentType: changeFundingPaymentType,
	ajaxOriginateOrApproveAndFundLoan: ajaxOriginateOrApproveAndFundLoan,
	ajaxChangeLoanDetails: ajaxChangeLoanDetails,
	ajaxUpdateUserTabInformation: ajaxUpdateUserTabInformation,
	ajaxUpdateEmployerTabInformation: ajaxUpdateEmployerTabInformation,
	ajaxUpdateBankAccountInformation: ajaxUpdateBankAccountInformation,
	changeIncompleteFundingPaymentType: changeIncompleteFundingPaymentType,
	ajaxUpdatePaymentStatus: ajaxUpdatePaymentStatus,
	ajaxToggleAutoAch: ajaxToggleAutoAch,
};

function setupRequestDataForDataTableList(req) {
	var errorval = '';
	var successval = '';
	var newLoanupdateSuccessMsg = '';
	var newLoanupdateMsg = '';
	if (req.session.approveerror !== '') {
		errorval = req.session.approveerror;
		req.session.approveerror = '';
	}
	if (req.session.successmsg !== '') {
		successval = req.session.successmsg;
		req.session.successmsg = '';
	}
	if ("undefined" !== typeof req.session.newLoanupdateSuccessMsg && req.session.newLoanupdateSuccessMsg !== '' && req.session.newLoanupdateSuccessMsg != null) {
		newLoanupdateSuccessMsg = req.session.newLoanupdateSuccessMsg;
		req.session.newLoanupdateSuccessMsg = '';
	}
	if ("undefined" !== typeof req.session.newLoanupdateMsg && req.session.newLoanupdateMsg !== '' && req.session.newLoanupdateMsg != null) {
		newLoanupdateMsg = req.session.newLoanupdateMsg;
		req.session.newLoanupdateMsg = '';
	}

	//req.session.viewType = 'open';
	return responsedata = {
		approveerror: errorval,
		approvesuccess: successval,
		newLoanupdateMsg: newLoanupdateMsg,
		newLoanupdateSuccessMsg: newLoanupdateSuccessMsg
	};
}
function showAllPendingAchAction(req, res) {
	res.view("admin/pendingach/pendingachList", setupRequestDataForDataTableList(req));
}

function showAllOpenApplicationAchAction(req, res) {
	const responseData = _.assign({}, setupRequestDataForDataTableList(req), { viewStatus: "Pending" });
	res.view("admin/pendingach/approveachlist", responseData);
}
function showInCompleteApplicationAch(req, res) {
	const responseData = _.assign({}, setupRequestDataForDataTableList(req), { viewStatus: "Incomplete" });
	res.view("admin/pendingach/OpenAchList", responseData);
}

function showAllArchivedPendingAchAction(req, res) {
	res.view("admin/pendingach/pendingArchivedachList", setupRequestDataForDataTableList(req));
}

function showAllArchivedOpenAchAction(req, res) {
	res.view("admin/pendingach/openApplicationArchivedList", setupRequestDataForDataTableList(req));
}

function showAllToDoItemsPendingAchAction(req, res) {
	res.view("admin/pendingach/pendingToDoItemachList", setupRequestDataForDataTableList(req));
}


function showAllToDoItemsOpenApplicationAction(req, res) {
	res.view("admin/pendingach/openApplicationToDoItemList", setupRequestDataForDataTableList(req));
}

function ajaxPaymentHistoryAction(req, res) {
	//add(1, 'days')
	var startDate = moment().tz("America/los_angeles").format('YYYY-MM-DD');


	//Sorting
	var colS = "";

	if (req.query.sSortDir_0 == 'desc') {
		sorttype = -1;
	}
	else {
		sorttype = 1;
	}
	switch (req.query.iSortCol_0) {
		case '0': var sorttypevalue = { '_id': sorttype }; break;
		case '1': var sorttypevalue = { 'uniqueID': sorttype }; break;
		case '2': var sorttypevalue = { 'consumerName': sorttype }; break;
		case '3': var sorttypevalue = { 'amount': sorttype }; break;
		case '4': var sorttypevalue = { 'scheduleDate': sorttype }; break;
		case '5': var sorttypevalue = { 'lenderType': sorttype }; break;
		case '6': var sorttypevalue = { 'status': sorttype }; break;
		case '7': var sorttypevalue = { 'rejectReason': sorttype }; break;
		default: break;
	};


	//Search

	var criteria = new Array();
	var whereConditionAnd = new Array();
	var whereConditionOr = new Array();
	if ((req.query.scheduleStartDate != '') && (typeof (req.query.scheduleStartDate) != 'undefined')) {
		var scheduleStartDate = moment(req.query.scheduleStartDate).format('YYYY-MM-DD');
	}
	if ((req.query.scheduleEndDate != '') && (typeof (req.query.scheduleEndDate) != 'undefined')) {
		var scheduleEndDate = moment(req.query.scheduleEndDate).format('YYYY-MM-DD');
	}


	if (((req.query.scheduleStartDate != '') && (typeof (req.query.scheduleStartDate) != 'undefined')) && ((req.query.scheduleEndDate != '') && (typeof (req.query.scheduleEndDate) != 'undefined'))) {
		whereConditionAnd.push({ scheduleDate: { "$gte": new Date(scheduleStartDate) } });
		whereConditionAnd.push({ scheduleDate: { "$lte": new Date(scheduleEndDate) } });
	} else if ((req.query.scheduleStartDate != '') && (typeof (req.query.scheduleStartDate) != 'undefined')) {
		whereConditionAnd.push({ scheduleDate: { "$gte": new Date(scheduleStartDate) } });
	} else if ((req.query.scheduleEndDate != '') && (typeof (req.query.scheduleEndDate) != 'undefined')) {
		whereConditionAnd.push({ scheduleDate: { "$lte": new Date(scheduleEndDate) } });
	} else {
		whereConditionAnd.push({ scheduleDate: { "$lte": new Date(startDate) } });
	}

	if ((req.query.processTypeVal != '') && (typeof (req.query.processTypeVal) != 'undefined')) {
		whereConditionAnd.push({ "processType": req.query.processTypeVal });
	}/*else{
		whereConditionAnd.push({"processType":  1});
	}*/

	if ((req.query.lenderTypeVal != '') && (typeof (req.query.lenderTypeVal) != 'undefined')) {
		whereConditionAnd.push({ "lenderType": req.query.lenderTypeVal });
	}
	if (req.query.sSearch) {
		whereConditionOr.push({ uniqueID: { 'contains': req.query.sSearch } });
		whereConditionOr.push({ consumerName: { 'contains': req.query.sSearch } });
		whereConditionOr.push({ amount: { 'contains': req.query.sSearch } });
		whereConditionOr.push({ lenderType: { 'contains': req.query.sSearch } });
		whereConditionOr.push({ scheduleDate: { 'contains': req.query.sSearch } });
		whereConditionOr.push({ status: { 'contains': req.query.sSearch } });
	}
	if (whereConditionOr.length > 0) {
		criteria.push({ $and: whereConditionAnd, $or: whereConditionOr });
	} else {
		criteria.push({ $and: whereConditionAnd });
	}
	criteria = criteria[0];
	console.log("Condition", JSON.stringify(criteria));

	skiprecord = parseInt(req.query.iDisplayStart);
	iDisplayLength = parseInt(req.query.iDisplayLength);
	var vikingConfig = sails.config.vikingConfig;
	VikingRequest
		.find(criteria)
		.sort(sorttypevalue)
		.skip(skiprecord)
		.limit(iDisplayLength)
		.then(function (vikingData) {

			VikingRequest.count(criteria).exec(function countCB(error, totalrecords) {
				paymentHistory = [];
				vikingData.forEach(function (vikingInfo, loopvalue) {
					loopid = loopvalue + skiprecord + 1;
					var consumerName = '<a target=\"_blank\" href=\"getAchUserDetails\/' + vikingInfo.payment_id + '\">' + vikingInfo.consumerName + '</a>';
					var rejectReasonTxt = "-";
					if (vikingInfo.rejectCode) {
						if (vikingInfo.rejectCode != '') {
							rejectReasonTxt = vikingInfo.rejectCode + '-' + sails.config.vikingConfig.rejectReason[vikingInfo.rejectCode];
						}
					}
					var status = vikingInfo.status;
					if (vikingInfo.lenderType == 'credit') {
						if (vikingInfo.status == '1') {
							status = 'File sent to Viking';
						}
					}
					paymentHistory.push({
						loopid: loopid,
						uniqueID: vikingInfo.uniqueID,
						consumerName: consumerName,
						amount: '$' + vikingInfo.amount,
						scheduleDate: moment(vikingInfo.scheduleDate).format('ddd, MMM Do YYYY'),
						lenderType: vikingInfo.lenderType,
						status: status,
						rejectReason: rejectReasonTxt,
					});
				});
				var json = {
					sEcho: req.query.sEcho,
					iTotalRecords: totalrecords,
					iTotalDisplayRecords: totalrecords,
					aaData: paymentHistory
				};
				//sails.log.info("json data", json);
				//res.contentType('application/json');
				res.json(json);
			});
		});
}

function ajaxPendingAchAction(req, res) {

	var checktodaysDate = moment().tz("America/Los_Angeles").startOf('day').format('MM-DD-YYYY');
	var checkCreatedDate = moment().startOf('day').subtract(60, "days").format('MM-DD-YYYY');
	checkCreatedDate = moment(checkCreatedDate).tz("America/Los_Angeles").startOf('day').format('MM-DD-YYYY');

	if ("undefined" !== req.param("viewtype") && req.param("viewtype") != '' && req.param("viewtype") != null) {
		var viewtype = req.param("viewtype");
	}
	else {
		var viewtype = 'pending';
	}
	sails.log.info("viewtype:", viewtype);


	if ("undefined" !== typeof req.session.adminpracticeID && req.session.adminpracticeID != '' && req.session.adminpracticeID != null) {
		if (viewtype == 'pending') {
			var options = {
				status: 'OPENED',
				isPaymentActive: true,
				achstatus: { $eq: 0, $exists: true },
				practicemanagement: req.session.adminpracticeID,
				$and: [
					{
						$or: [{ moveToOpen: { $eq: 1, $exists: true } },
						{
							$and: [
								{ moveToOpen: { $exists: false } },
								{ createdAt: { $gte: new Date(checkCreatedDate), $exists: true } }
							]
						}
						]
					},
					{ $or: [{ appverified: { $eq: 1, $exists: true } }, { appverified: { $exists: false } }] }
				]
			};
		}
		else if (viewtype == 'archived') {
			var options = {
				status: 'OPENED',
				isPaymentActive: true,
				achstatus: { $eq: 0, $exists: true },
				practicemanagement: req.session.adminpracticeID,
				$and: [
					{
						$or: [{ moveToOpen: { $eq: 0, $exists: true } },
						{
							$and: [
								{ moveToOpen: { $exists: false } },
								{ createdAt: { $lt: new Date(checkCreatedDate), $exists: true } }
							]
						}
						]
					},
					{ $or: [{ appverified: { $eq: 1, $exists: true } }, { appverified: { $exists: false } }] }
				]
			};
		}
		else if (viewtype == 'toDoItems') {
			var options = {
				status: 'OPENED',
				isPaymentActive: true,
				achstatus: { $eq: 0, $exists: true },
				practicemanagement: req.session.adminpracticeID,
				appverified: { $eq: 0, $exists: true }
			};
		}
		else if (viewtype == 'proceduredate') {
			var options = {
				status: 'OPENED',
				isPaymentActive: true,
				achstatus: { $eq: 0, $exists: true },
				practicemanagement: req.session.adminpracticeID,
				loanSetdate: { $eq: new Date(checktodaysDate), $exists: true }
			};
		}
		else {
			var options = {
				status: 'OPENED',
				isPaymentActive: true,
				achstatus: { $eq: 0, $exists: true },
				practicemanagement: req.session.adminpracticeID,
				$and: [
					{
						$or: [{ moveToOpen: { $eq: 1, $exists: true } },
						{
							$and: [
								{ moveToOpen: { $exists: false } },
								{ createdAt: { $gte: new Date(checkCreatedDate), $exists: true } }
							]
						}
						]
					},
					{ $or: [{ appverified: { $eq: 1, $exists: true } }, { appverified: { $exists: false } }] }
				]
			};
		}
	}
	else {
		if (viewtype == 'pending') {
			var options = {
				status: 'OPENED',
				isPaymentActive: true,
				achstatus: { $eq: 0, $exists: true },
				$and: [
					{
						$or: [{ moveToOpen: { $eq: 1, $exists: true } },
						{
							$and: [
								{ moveToOpen: { $exists: false } },
								{ createdAt: { $gte: new Date(checkCreatedDate), $exists: true } }
							]
						}
						]
					},
					{ $or: [{ appverified: { $eq: 1, $exists: true } }, { appverified: { $exists: false } }] }
				]
				//$or : [ { blockedList: { $eq: false, $exists: true } }, { blockedList:{ $exists: false }}  ],
				//createdAt : { $gte : new Date(checkCreatedDate), $exists: true }
				/*$or : [ { moveToOpen:{ $eq: 1, $exists: true } },
							{ $and: [
								 { moveToOpen:{ $exists: false }},
								 { createdAt:{ $gte : new Date(checkCreatedDate), $exists: true } }
								]
						}
						],*/
				//$or : [ { appverified: { $eq: 1, $exists: true } }, { appverified:{ $exists: false }}  ]
			};
		}
		else if (viewtype == 'archived') {
			var options = {
				status: 'OPENED',
				isPaymentActive: true,
				achstatus: { $eq: 0, $exists: true },
				$and: [
					{
						$or: [{ moveToOpen: { $eq: 0, $exists: true } },
						{
							$and: [
								{ moveToOpen: { $exists: false } },
								{ createdAt: { $lt: new Date(checkCreatedDate), $exists: true } }
							]
						}
						]
					},
					{ $or: [{ appverified: { $eq: 1, $exists: true } }, { appverified: { $exists: false } }] }
				]
			};
		}
		else if (viewtype == 'toDoItems') {
			var options = {
				status: 'OPENED',
				isPaymentActive: true,
				achstatus: { $eq: 0, $exists: true },
				appverified: { $eq: 0, $exists: true }
			};
		}
		else if (viewtype == 'proceduredate') {
			var options = {
				status: 'OPENED',
				isPaymentActive: true,
				achstatus: { $eq: 0, $exists: true },
				loanSetdate: { $eq: new Date(checktodaysDate), $exists: true }
			};
		}
		else {
			var options = {
				status: 'OPENED',
				isPaymentActive: true,
				achstatus: { $eq: 0, $exists: true },
				$and: [
					{
						$or: [{ moveToOpen: { $eq: 1, $exists: true } },
						{
							$and: [
								{ moveToOpen: { $exists: false } },
								{ createdAt: { $gte: new Date(checkCreatedDate), $exists: true } }
							]
						}
						]
					},
					{ $or: [{ appverified: { $eq: 1, $exists: true } }, { appverified: { $exists: false } }] }
				]
			};
		}
	}

	PaymentManagement.find(options)
		.populate('user')
		.populate('account')
		.populate('practicemanagement')
		.populate('screentracking')
		.exec(function (err,) {
			if (err) {
				res.send(500, { error: 'DB error' });
			} else {

				paymentmanagementdata = Screentracking.getFundingTierFromPaymentManagementList(paymentmanagementdata);

				if (req.query.sSortDir_0 == 'desc') {
					switch (req.query.iSortCol_0) {
						case '0': paymentmanagementdata = _.sortBy(paymentmanagementdata, '_id').reverse(); break;
						case '1': paymentmanagementdata = _.sortBy(paymentmanagementdata, 'loanReference').reverse(); break;
						case '2': paymentmanagementdata = _.sortBy(paymentmanagementdata, 'user.name').reverse(); break;
						//case '3': paymentmanagementdata = _.sortBy(paymentmanagementdata, 'user.directMail').reverse(); break;
						//case '4': paymentmanagementdata = _.sortBy(paymentmanagementdata, 'user.badList').reverse(); break;
						case '3': paymentmanagementdata = _.sortBy(paymentmanagementdata, 'user.email').reverse(); break;
						case '4': paymentmanagementdata = _.sortBy(paymentmanagementdata, 'user.phoneNumber').reverse(); break;
						case '5': paymentmanagementdata = _.sortBy(paymentmanagementdata, 'practicemanagement.PracticeName').reverse(); break;
						case '6': paymentmanagementdata = _.sortBy(paymentmanagementdata, 'fundingTier').reverse(); break;
						case '7': paymentmanagementdata = _.sortBy(paymentmanagementdata, 'payOffAmount').reverse(); break;
						case '10': paymentmanagementdata = _.sortBy(paymentmanagementdata, 'maturityDate').reverse(); break;
						case '11': paymentmanagementdata = _.sortBy(paymentmanagementdata, 'createdAt').reverse(); break;
						case '12': paymentmanagementdata = _.sortBy(paymentmanagementdata, 'status').reverse(); break;
						case '13': paymentmanagementdata = _.sortBy(paymentmanagementdata, 'paymenttype').reverse(); break;
						case '15': paymentmanagementdata = _.sortBy(paymentmanagementdata, 'apr').reverse(); break;
						default: break;
					};

				}
				else {
					switch (req.query.iSortCol_0) {
						case '0': paymentmanagementdata = _.sortBy(paymentmanagementdata, '_id'); break;
						case '1': paymentmanagementdata = _.sortBy(paymentmanagementdata, 'loanReference'); break;
						case '2': paymentmanagementdata = _.sortBy(paymentmanagementdata, 'user.name'); break;
						//case '3': paymentmanagementdata = _.sortBy(paymentmanagementdata, 'user.directMail'); break;
						//case '4': paymentmanagementdata = _.sortBy(paymentmanagementdata, 'user.badList'); break;
						case '3': paymentmanagementdata = _.sortBy(paymentmanagementdata, 'user.email'); break;
						case '4': paymentmanagementdata = _.sortBy(paymentmanagementdata, 'user.phoneNumber'); break;
						case '5': paymentmanagementdata = _.sortBy(paymentmanagementdata, 'practicemanagement.PracticeName'); break;
						case '6': paymentmanagementdata = _.sortBy(paymentmanagementdata, 'fundingTier'); break;
						case '7': paymentmanagementdata = _.sortBy(paymentmanagementdata, 'payOffAmount'); break;
						case '10': paymentmanagementdata = _.sortBy(paymentmanagementdata, 'maturityDate'); break;
						case '11': paymentmanagementdata = _.sortBy(paymentmanagementdata, 'createdAt'); break;
						case '12': paymentmanagementdata = _.sortBy(paymentmanagementdata, 'status'); break;
						case '13': paymentmanagementdata = _.sortBy(paymentmanagementdata, 'paymenttype'); break;
						case '15': paymentmanagementdata = _.sortBy(paymentmanagementdata, 'apr'); break;
						default: break;
					};
				}

				//Filter user details not available
				paymentmanagementdata = _.filter(paymentmanagementdata, function (item) {
					if (item.user) {
						return true;
					}
				});

				//Filter using search data
				if (req.query.sSearch) {
					var search = req.query.sSearch.toLowerCase();

					paymentmanagementdata = _.filter(paymentmanagementdata, function (item) {
						if (item.loanReference != null) {
							if (item.loanReference.toLowerCase().indexOf(search) > -1) {
								return true;
							}
						}

						if (item.user.firstName != null) {
							if (item.user.firstName.toLowerCase().indexOf(search) > -1) {
								return true;
							}
						}

						/* if(item.user.screenName!=null)
						 {
								 if(item.user.screenName.toLowerCase().indexOf(search)>-1 )
							 {
								 return true;
							 }
						 }*/
						if (item.user.email != null) {
							if (item.user.email.toLowerCase().indexOf(search) > -1) {
								return true;
							}
						}
						if (item.user.phoneNumber != null) {
							if (item.user.phoneNumber.indexOf(search) > -1) {
								return true;
							}
						}

						if (item.payOffAmount != null) {
							if (parseInt(item.payOffAmount) == parseInt(search)) {
								return true;
							}
						}

						if (item.maturityDate != null) {
							if (moment(item.maturityDate).format('MM-DD-YYYY') == search) {
								return true;
							}
						}


						if (item.createdAt != null) {
							if (moment(item.createdAt).format('MM-DD-YYYY') == search) {
								return true;
							}
						}

						if (item.paymenttype != null) {
							if (item.paymenttype.toLowerCase().indexOf(search) > -1) {
								return true;
							}
						}

						if (item.apr != null) {
							if (parseInt(item.apr) == parseInt(search)) {
								return true;
							}
						}

						if (item.practicemanagement) {
							if (item.practicemanagement.PracticeName != null) {
								if (item.practicemanagement.PracticeName.indexOf(search) > -1) {
									return true;
								}
							}
						}
						if (!!item.fundingTier) {
							if (item.fundingTier.indexOf(search) > -1) {
								return true;
							}
						}
						return false;
					});
				}

				//total records count
				totalrecords = paymentmanagementdata.length;

				//Filter by limit records
				var p = parseInt(req.query.iDisplayStart) + 1;
				skiprecord = parseInt(req.query.iDisplayStart);
				checklimitrecords = skiprecord + parseInt(req.query.iDisplayLength);
				if (checklimitrecords > totalrecords) {
					iDisplayLengthvalue = totalrecords;
				}
				else {
					//iDisplayLengthvalue=req.query.iDisplayLength;
					iDisplayLengthvalue = parseInt(req.query.iDisplayLength) + parseInt(skiprecord);
				}
				paymentmanagementdata = paymentmanagementdata.slice(skiprecord, iDisplayLengthvalue);


				//Final output starts here
				var creditScore = 0;
				var availableBalance = 0;
				var pendinguser = [];

				var forlength = paymentmanagementdata.length,
					i = 0;

				if (totalrecords == 0) {
					var json = {
						sEcho: req.query.sEcho,
						iTotalRecords: totalrecords,
						iTotalDisplayRecords: totalrecords,
						aaData: pendinguser
					};
					res.contentType('application/json');
					res.json(json);
				}
				else {

					_.forEach(paymentmanagementdata, function (payDetails) {

						var createdAtDate = moment(payDetails.createdAt).startOf('day').format('MM-DD-YYYY');
						var transcriteria = {
							createdAt: { "<": new Date(createdAtDate) },
							user: payDetails.user.id
						};


						if (payDetails.creditScore) {
							paymentmanagementdata.creditScore = payDetails.creditScore;
						}
						else {
							paymentmanagementdata.creditScore = 0;
						}



						i++;
						if (i == forlength) {


							paymentmanagementdata.forEach(function (paydata, loopvalue) {




								loopid = loopvalue + skiprecord + 1;

								var payuserName = '';
								var payuserscreenName = '';
								var payuserEmail = '';
								var payuserphoneNumber = '';

								var practicename = '--';
								if (paydata.practicemanagement) {
									if (paydata.practicemanagement.PracticeName != '' && paydata.practicemanagement.PracticeName != null) {
										var practicename = paydata.practicemanagement.PracticeName;
									}
								}

								if (paydata.user) {
									if (paydata.user.firstName != '' && paydata.user.firstName != null) {
										var payuserName = paydata.user.firstName + ' ' + paydata.user.lastname;
									}
									/*if(paydata.user.screenName!='' && paydata.user.screenName!=null)
									{
										var payuserscreenName=paydata.user.screenName;
									}*/
									if (paydata.user.email != '' && paydata.user.email != null) {
										var payuserEmail = paydata.user.email;
									}
									if (paydata.user.phoneNumber != '' && paydata.user.phoneNumber != null) {
										var payuserphoneNumber = paydata.user.phoneNumber;
									}
								}

								systemUniqueKeyURL = 'getAchUserDetails/' + paydata.id;

								if (paydata.loanReference != '' && paydata.loanReference != null) {
									var payloanReference = '<a href=\'' + systemUniqueKeyURL + '\'>' + paydata.loanReference + '</a>';
								} else {
									//var payloanReference='--';
									var payloanReference = '<a href=\'' + systemUniqueKeyURL + '\'> -- </a>';
								}
								paydata.maturityDate = moment(paydata.maturityDate).format('MM-DD-YYYY');
								//paydata.createdAt = moment(paydata.createdAt).format('MM-DD-YYYY hh:mm:ss');

								paydata.createdAt = moment(paydata.createdAt).tz("America/los_angeles").format('MM-DD-YYYY hh:mm:ss');

								//systemUniqueKeyURL = 'getAchUserDetails/'+paydata.user.systemUniqueKey;
								//systemUniqueKeyURL = 'getAchUserDetails/'+paydata.user.id;


								var payuserNameLink = '<a href=\'' + systemUniqueKeyURL + '\'>' + payuserName + '</a>';

								if (paydata.achstatus == 0) {
									var statusicon = '<i class=\'fa fa-circle text-warning\' aria-hidden=\'true\' ></i> Pending';
								}

								if (paydata.achstatus == 1) {
									var statusicon = '<i class=\'fa fa-circle text-success\' aria-hidden=\'true\' ></i> Approved';
								}

								if (paydata.achstatus == 2) {
									var statusicon = '<i class=\'fa fa-circle text-danger\' aria-hidden=\'true\' ></i> Denied';
								}
								//var statusicon ='Pending';

								if (payuserEmail) {
									var emillnk = '<a href="mailto:' + payuserEmail + '">' + payuserEmail + '</a>';
								}

								if (paydata.account) {
									if (paydata.account.balance) {
										//var availableBalance = paydata.account.balance.available;
										var availableBalance = paydata.account.balance.current;
									}
								}
								if (paydata.productname == 'State License') {
									var paytype = 'ACH';
								}
								else {
									var paytype = 'ACH';
								}

								if (paydata.payOffAmount) {
									var payOffAmountValue = '$' + parseFloat(paydata.payOffAmount);
								}
								else {
									var payOffAmountValue = '$0.00';
								}

								if (paydata.hasOwnProperty("apr")) {
									var apr = parseFloat(paydata.apr) + '%';
								}
								else {
									var apr = '--';
								}

								// if(paydata.user.directMail == 1)
								// {
								// 	var directMailUser= 'Yes';
								// }
								// else if(paydata.user.directMail == 2)
								// {
								// 	var directMailUser= 'No';
								// }
								// else {
								// 	var directMailUser= '--';
								// }

								//badList
								if (paydata.user.badList == 1) {
									var badListUser = 'Yes';
								}
								else if (paydata.user.badList == 2) {
									var badListUser = 'No';
								}
								else {
									var badListUser = '--';
								}
								var fundingTier = "--";
								if (!!paydata.fundingTier) {
									fundingTier = paydata.fundingTier;
								} else {
									paydata["fundingTier"] = "";
								}
								var registeredType = paydata.user.registeredtype;


								/*pendinguser.push({ loopid:loopid,loanReference: payloanReference, name: payuserName,directMail: directMailUser, badList: badListUser, email: payuserEmail,phoneNumber: payuserphoneNumber,payOffAmount:payOffAmountValue,creditScore:paydata.creditScore, availableBalance:availableBalance ,maturityDate:paydata.maturityDate, createdAt:paydata.createdAt, status: statusicon, paymenttype: paytype,registeredType:registeredType,apr:apr});*/


								pendinguser.push({ loopid: loopid, loanReference: payloanReference, name: payuserName, email: payuserEmail, phoneNumber: payuserphoneNumber, practicename: practicename, payOffAmount: payOffAmountValue, creditScore: paydata.creditScore, availableBalance: availableBalance, maturityDate: paydata.maturityDate, createdAt: paydata.createdAt, status: statusicon, paymenttype: paytype, registeredType: registeredType, apr: apr, fundingTier: fundingTier });
							});


							var json = {
								sEcho: req.query.sEcho,
								iTotalRecords: totalrecords,
								iTotalDisplayRecords: totalrecords,
								aaData: pendinguser
							};
							res.contentType('application/json');
							res.json(json);
						}

					});
				}
			}
		});
}

function getAchUserDetailsAction(req, res) {

	var payID = req.param('id');

	if (!payID) {
		var errors = {
			"code": 500,
			"message": "Invalid Data"
		};
		sails.log.error('AchController#getAchUserDetailsAction :: errors', errors);
		res.view("admin/error/500", {
			data: errors.message,
			layout: 'layout'
		});
	}

	var options = {
		id: payID
	}
	var screenTracking;

	PaymentManagement.findOne(options)
		// .populate('story')
		//.populate('consolidateaccount')
		.populate('screentracking')
		.then(function (paymentmanagementdata) {
			//user criteria
			var criteria = {
				id: paymentmanagementdata.user,
			};

			User
				.findOne(criteria)
				//.populate('state')
				//.populate('profilePicture')
				.then(async function (user) {
					if (!user) {
						var errors = {
							"code": 404,
							"message": "User not found"
						};
						sails.log.error('AchController#getAchUserDetailsAction :: errors', errors);
						res.view("admin/error/404", {
							data: errors.message,
							layout: 'layout'
						});
					}
					else {
						// -- Added for Tracking Lead Data.
						let leadData;
						if (user.isFromLeadApi) {
							const leadId = user.lead
							lead = await Lead.findOne({ id: leadId });
							const leadSource = _.get(lead, "source", false);
							if (!leadSource) {
								leadData = leadSource;
							} else {
								const channelId = _.get(lead, "lead.referral.channelId", "UNDEFINED");
								const affSubId = _.get(lead, "lead.referral.affSubId", "UNDEFINED");
								leadData = `${leadSource} (${channelId}: ${affSubId})`;
							}
						}

						Screentracking
							.findOne({ id: paymentmanagementdata.screentracking.id })
							.then(function (screentracking) {
								//-- Added for back button redirect from detail page starts here
								var checkCreatedDate = moment().startOf('day').subtract(60, "days").format('MM-DD-YYYY');
								checkCreatedDate = moment(checkCreatedDate).tz("America/Los_Angeles").startOf('day').toDate()//.getTime();
								var loanCreartedDate = moment(paymentmanagementdata.createdAt).tz("America/Los_Angeles").startOf('day').toDate()//.getTime();
								var loanSetDateTime = '';
								var currentDateTime = '';

								var redirectArchive = 0;
								var backviewType;

								if (screentracking.moveToArchive) {
									if (screentracking.moveToArchive == 1) {
										redirectArchive = 1;
									}
								} else {
									if (loanCreartedDate < checkCreatedDate) {
										redirectArchive = 1;
									}
								}

								if (redirectArchive == 1) {
									backviewType = "/admin/getArchivedOpenDetails";
								} else {
									if (paymentmanagementdata.status === "PENDING") {
										backviewType = '/admin/getOpenApplicationDetails';
									} else if (paymentmanagementdata.status === "INCOMPLETE") {
										backviewType = '/admin/getIncompleteApplicationDetails';
									} else if (paymentmanagementdata.status === "DENIED") {
										backviewType = "/admin/showAllDenied";
									} else if (paymentmanagementdata.status === "ACTIVE" || paymentmanagementdata.status === "PERFORMING") {
										backviewType = '/admin/showAllApproved';
									} else if (paymentmanagementdata.status === "COMPLETED") {
										backviewType = "/admin/showAllComplete";
									} else {
										backviewType = '/admin/getOpenApplicationDetails';
									}
								}
								// if(paymentmanagementdata.achstatus == 0)
								// {
								// 	backviewType ='/admin/getOpenApplicationDetails';

								// 	// // To separate incomplete and pending tabs
								// 	// if(screentracking.iscompleted==0)
								// 	// {
								// 	// 	backviewType ='/admin/getIncompleteApplicationDetails';
								// 	// }
								// }

								// else if(paymentmanagementdata.achstatus == 2)
								// {
								// 	backviewType ='/admin/showAllDenied';
								// }
								// else if(paymentmanagementdata.achstatus == 1)
								// {
								// 	if(paymentmanagementdata.status=='PAID OFF' || paymentmanagementdata.status=='CLOSED' )
								// 	{
								// 		backviewType ='/admin/getArchivedOpenDetails';
								// 	}
								// 	else
								// 	{
								// 	if(paymentmanagementdata.firstpaymentcompleted==1)
								// 	{
								// 		backviewType ='/admin/showAllPerforming';
								// 	}
								// 	else
								// 	{
								// 		backviewType ='/admin/showAllApproved';
								// 	}
								// 	}
								// }
								// else
								// {
								// 	backviewType ='/admin/getOpenApplicationDetails';
								// }

								// if(screentracking.moveToArchive)
								// {
								// 	if(screentracking.moveToArchive==1)
								// 	{
								// 		redirectArchive =1;
								// 	}
								// }
								// else
								// {
								// 	if(loanCreartedDate < checkCreatedDate)
								// 	{
								// 		redirectArchive =1;
								// 	}
								// }






								/*var backviewType='';
								if(paymentmanagementdata.achstatus == 0)
								{
									backviewType ='/admin/getArchivedOpenDetails';
	
									if(loanCreartedDate > checkCreatedDate)
									{
											backviewType ='/admin/getOpenApplicationDetails';
									}
									else
									{
										if(screentracking.moveToIncomplete)
										{
											if(screentracking.moveToIncomplete==1)
											{
												backviewType ='/admin/getOpenApplicationDetails';
											}
										}
									}
								}
	
								if(paymentmanagementdata.achstatus == 1)
								{
									backviewType ='/admin/showAllApproved';
									if(paymentmanagementdata.status=='PAID OFF' || paymentmanagementdata.status=='CLOSED' )
									{
										backviewType ='/admin/showAllCompleted';
									}
									else
									{
										if(paymentmanagementdata.loanSetdate)
										{
											var loanSetDateTime = moment(paymentmanagementdata.loanSetdate).tz("America/Los_Angeles").startOf('day').toDate().getTime();
											var currentDateTime = moment().tz("America/Los_Angeles").startOf('day').toDate().getTime();
	
											if(currentDateTime > loanSetDateTime)
											{
													backviewType ='/admin/showAllPerforming';
											}
										}
									}
								}
	
								if(paymentmanagementdata.achstatus == 2)
								{
									backviewType ='/admin/showAllArchivedDenied';
	
									if(loanCreartedDate > checkCreatedDate)
									{
											backviewType ='/admin/showAllDenied';
									}
									else
									{
										if(screentracking.moveToIncomplete)
										{
											if(screentracking.moveToIncomplete==1)
											{
												backviewType ='/admin/showAllDenied';
											}
										}
									}
								}	*/
								//-- Added for back button redirect from detail page ends here
								UserBankAccount.getBankData(screentracking.id, user.id, paymentmanagementdata)
									.then(accountDetail => {

										var doccriteria = {
											user: user.id
										};
										Achdocuments
											.find(doccriteria)
											.populate('proofdocument')
											.then(function (documentdata) {
												_.forEach(documentdata, function (documentvalue) {
													if (documentvalue.proofdocument.isImageProcessed) {
														if (documentvalue.proofdocument.standardResolution) {
															documentvalue.proofdocument.standardResolution = Utils.getS3Url(documentvalue.proofdocument.standardResolution);
														}
													}

												});

												var pdfCriteria = { user: user.id };


												sails.log.info('pdfCriteria: ', pdfCriteria);

												UserConsent.getLatestConsentsForUser({ user: user.id, documentKey: '200' }).then(function (pdfdocument) {
													if (pdfdocument) {
														_.each(pdfdocument, function (documemts) {
															if (documemts.agreementpath) {
																documemts.agreementpath = Utils.getS3Url(documemts.agreementpath);
																if (documemts.documentName === 'Consent') documemts.documentName = `Contract signed ${documemts.signedAt.toLocaleString()}`
															}
														})
													}


													PaymentManagement.count({ user: user.id })
														.then(async function (loancount) {


															var paydata = [];
															setcurrent = 0;
															//var todaysDate = moment().add(15, 'days').startOf('day').toDate().getTime();
															var todaysDate = moment().startOf('day').toDate().getTime();

															//var todaysDatevalue = moment().add(15, 'days').format("YYYY-MM-DD");

															var nextpaymentDate = '--';
															var pendingSchedule = [];
															var paidSchedule = [];
															var amount;
															var interestAmount = '0';
															var interestAmount1 = '0';

															const paymentLedger = PlatformSpecificService.getPaymentLedger(paymentmanagementdata, moment().startOf("day").toDate())
															const scrapPaymentSchedule = AchService.scrapePaymentsScheduleActionEligibility(paymentmanagementdata.paymentSchedule, paymentLedger, paymentmanagementdata.hasWaivedLoan);
															paymentmanagementdata.paymentSchedule = scrapPaymentSchedule;

															// _.forEach(paymentmanagementdata.paymentSchedule, function(payDetails) {
															// 	amount = parseFloat(payDetails.amount).toFixed(2);
															// 	payDetails.statusForDisplay = payDetails.status;
															// 	if(amount > 0){
															// 		payDetails.amount = amount.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");
															// 		payDetails.amount = '$'+payDetails.amount;
															// 	}
															//
															// 	//var scheduleDate = moment(payDetails.date).startOf('day').toDate().getTime();
															// 	var scheduleDate = moment(payDetails.date).startOf('day').toDate().getTime();
															//
															//
															// 	if(payDetails.status == "PAID OFF" )
															// 	{
															// 		paidSchedule.push(payDetails);
															// 	}
															// 	else
															// 	{
															// 		pendingSchedule.push(payDetails);
															// 	}
															//
															// 	if(payDetails.chargeoff==1)
															// 	{
															// 		payDetails.statusForDisplay = "Charge Off";
															// 	}
															// 	else
															// 	{
															// 		const isMakePayment = payDetails.initiator === "makepayment";
															// 		let isCurrent = false;
															//
															// 		if( scheduleDate < todaysDate && payDetails.status==='OPENED' && !isMakePayment)
															// 		{
															// 			payDetails.statusForDisplay = "Unpaid";
															// 		}
															// 		else if(payDetails.status === "OPENED" && setcurrent===0 && !isMakePayment)
															// 		{
															// 			isCurrent = true;
															// 			nextpaymentDate=moment(payDetails.date).format('LL');
															// 			setcurrent= setcurrent+1;
															// 		}
															//
															// 		if(payDetails.status === "PAID OFF" )
															// 		{
															// 			payDetails.statusForDisplay = "Paid Off";
															// 		}
															// 		else if(payDetails.status === "CLOSED" )
															// 		{
															// 			payDetails.statusForDisplay = "Closed";
															// 		}
															// 		else if(payDetails.status === "OPENED" && !isMakePayment)
															// 		{
															// 			payDetails.statusForDisplay = "Schedule";
															// 		}else if(payDetails.status === "PENDING" || (isMakePayment && payDetails.status === "OPENED")) {
															// 			payDetails.statusForDisplay = "Pending";
															// 		}else if(payDetails.status === "DECLINED") {
															// 			payDetails.statusForDisplay = "Declined";
															// 		}else if(payDetails.status === "RETURNED") {
															// 			payDetails.statusForDisplay = "Returned";
															// 		}else if(payDetails.status === "REPLACED") {
															// 			payDetails.statusForDisplay = "Replaced";
															// 		}else if(payDetails.status === "PAID") {
															// 			payDetails.statusForDisplay = "Paid";
															// 		}else if(payDetails.status === "WAIVED") {
															// 			payDetails.statusForDisplay = "WAIVED";
															// 		}else if(payDetails.status === "DEFERRED") {
															// 			payDetails.statusForDisplay = "DEFERRED";
															// 		}
															// 		// if(payDetails.isAmendPayment) {
															// 		// 	payDetails.statusForDisplay = "AMENDED";
															// 		// }
															// 		// if(isCurrent) {
															// 		// 	  payDetails.status = `Next`;// (${payDetails.status}${isMakePayment?" - Manual Payment":""})`
															// 		// }else {
															// 		// 	payDetails.statusForDisplay = `${payDetails.status}`;//${isMakePayment?" (Manual Payment)":""}`
															// 		// }
															// 	}
															//
															// 	payDetails.orgdate = payDetails.date;
															// 	// payDetails.date = moment(payDetails.date).format('LL');
															//
															// 	paydata.push(payDetails);
															//
															// 	interestOrginalAmount = parseFloat(payDetails.interestAmount).toFixed(2);
															// 	interestAmount = parseFloat(interestAmount) + parseFloat(interestOrginalAmount);
															// 	interestAmount = parseFloat(interestAmount).toFixed(2);
															//
															// });
															// paymentmanagementdata.paymentSchedule = paydata;
															paymentmanagementdata.maturityDate = moment(paymentmanagementdata.maturityDate).format('LL');
															paymentmanagementdata.nextPaymentSchedule = moment(paymentmanagementdata.nextPaymentSchedule).format('LL');


															if (paymentmanagementdata.loanStartdate) {
																paymentmanagementdata.loanStartdate = moment(paymentmanagementdata.loanStartdate).format('LL');
															}


															var counterOfferdecline = paymentmanagementdata.counterOfferDecline;
															if (counterOfferdecline == undefined || counterOfferdecline == '' || counterOfferdecline == null) {
																var counterOfferdecline = '--';
															}
															else {
																var counterOfferdecline = paymentmanagementdata.counterOfferDecline + ' At ' + moment(paymentmanagementdata.createdAt).tz("America/los_angeles").format('MM-DD-YYYY hh:mm:ss');

															}


															var objectdatas = {
																creditcost: paymentmanagementdata.payOffAmount,
																amount: interestAmount
															}

															if (paymentmanagementdata.productname == 'State License') {
																var paytype = 'ACH';
															}
															else {
																var paytype = 'ACH';
															}
															var loanPaymentType = paytype;

															if (paymentmanagementdata.transactionStatus) {
																var transactionStatus = paymentmanagementdata.transactionStatus;
															} else {
																var transactionStatus = '';
															}

															// setcurrent=0;
															// _.forEach(paymentmanagementdata.paymentSchedule, function(payDetails) {
															//
															// 	var todaysDate = moment().startOf('day').toDate().getTime();
															// 	var scheduleDate = moment(payDetails.date).add(2, 'days').startOf('day').toDate().getTime();
															//
															// 	if(setcurrent==0)
															// 	{
															// 		if( scheduleDate < todaysDate && (payDetails.status=='OPENED' || payDetails.initiator === "makepayment"))
															// 		{
															// 			paymentmanagementdata.status = "Late";
															// 			setcurrent=1;
															// 		}
															// 		else if(paymentmanagementdata.status == "OPENED" || paymentmanagementdata.status == "CURRENT")
															// 		{
															//
															// 			paymentmanagementdata.status = "Next";
															// 		}
															// 	}
															//
															// });


															if (paymentmanagementdata.achstatus == 0) {
																var statusicon = 'Pending';
															}

															if (paymentmanagementdata.achstatus == 1) {
																var statusicon = 'Funded';
															}

															/*new fields */


															var manualpaymentdata = [];
															_.forEach(paymentmanagementdata.manualPayment, function (manualpay) {
																manualpay.message = 'Loan repayment for $' + manualpay.amount + ' ';
																manualpay.date = moment(manualpay.date).format('LL');
																manualpaymentdata.push(manualpay);
															});
															paymentmanagementdata.manualPayment = manualpaymentdata;
															_.forEach(paymentmanagementdata.usertransactions, function (reapayment) {
																reapayment.amount = parseFloat(reapayment.amount).toFixed(2);
																reapayment.date = moment(reapayment.date).format('LL');
															});

															Logactivity
																.find({ paymentManagement: payID })
																.sort({ 'createdAt': -1 })
																.then(function (logDetails) {

																	var logArrayDetails = [];
																	_.forEach(logDetails, function (logdata) {
																		logdata.createdAt = moment(logdata.createdAt).tz("America/los_angeles").format('MM-DD-YYYY hh:mm:ss');
																		logArrayDetails.push(logdata);
																	});

																	user.createdAt = moment(user.createdAt).format('LL');
																	user.updatedAt = moment(user.updatedAt).format('LL');

																	Useractivity
																		.find({ user_id: user.id })
																		.sort({ 'createdAt': -1 })
																		.then(function (communicationLogDetails) {
																			var responseArr = [];

																			_.forEach(communicationLogDetails, function (communicationLogData) {
																				communicationLogData.subject = communicationLogData.subject;
																				communicationLogData.logdata = communicationLogData.logdata;
																				communicationLogData.createdAt = moment(communicationLogData.createdAt).tz("America/los_angeles").format('MM-DD-YYYY hh:mm:ss');
																				responseArr.push(communicationLogData);
																			});
																			var errorval = '';
																			var successmsg = '';
																			var schudlesmsg = '';
																			var banksuccessmsg = '';
																			var bankerror = '';
																			var changeincomemsg = '';
																			var uploaddocmsg = '';
																			var loadPaymentSheduleTab = false;
																			let bankAccountInfoTab = false;
																			let employmentInfoTab = false;

																			if (req.session.bankAccountInfoTab) {
																				bankAccountInfoTab = true;
																				req.session.bankAccountInfoTab = false;
																			}
																			if (req.session.employmentInfoTab) {
																				employmentInfoTab = true;
																				req.session.employmentInfoTab = false;
																			}
																			if (req.session.bankerror != '') {
																				errorval = req.session.bankerror;
																				bankerror = req.session.bankerror;
																				req.session.bankerror = '';
																			}
																			if (req.session.banksuccessmsg != '') {
																				banksuccessmsg = req.session.banksuccessmsg;
																				req.session.banksuccessmsg = '';
																			}
																			if (req.session.successmsg != '') {
																				successmsg = req.session.successmsg;
																				req.session.successmsg = '';
																			}
																			if (req.session.schudlesmsg != '') {
																				schudlesmsg = req.session.schudlesmsg;
																				req.session.schudlesmsg = '';
																			}
																			if (req.session.loadPaymentSheduleTab) {
																				loadPaymentSheduleTab = true;
																				req.session.loadPaymentSheduleTab = false;
																			}
																			if ("undefined" !== typeof req.session.uploaddocmsg && req.session.uploaddocmsg != '' && req.session.uploaddocmsg != null) {
																				uploaddocmsg = req.session.uploaddocmsg;
																				req.session.uploaddocmsg = '';
																			}

																			if (req.session.changeincometab != '') {
																				changeincomemsg = req.session.changeincometab;
																				req.session.changeincometab = '';
																			}

																			if (pendingSchedule.length > 0) {
																				//pendingSchedule = _.orderBy(pendingSchedule, ['date'], ['asc']);
																			}

																			if (paidSchedule.length > 0) {
																				//paidSchedule = _.orderBy(paidSchedule, ['date'], ['asc']);
																			}

																			var transcriteria = { id: screentracking.transunion };


																			Transunions
																				.findOne(transcriteria)
																				.sort("createdAt DESC")
																				.then(function (transData) {

																					if ("undefined" === typeof transData || transData == '' || transData == null) {
																						var showtransData = 0;
																					}
																					else {
																						var showtransData = 1;

																						if (transData.credit_collection.subscriber) {
																							var transcreditArray = transData.credit_collection;
																							transData.credit_collection = [];
																							transData.credit_collection.push(transcreditArray);
																						}

																						if (transData.inquiry.subscriber) {
																							var transinquiryArray = transData.inquiry;
																							transData.inquiry = [];
																							transData.inquiry.push(transinquiryArray);
																						}

																						if (transData.addOnProduct.status) {
																							var transproductArray = transData.addOnProduct;
																							transData.addOnProduct = [];
																							transData.addOnProduct.push(transproductArray);
																						}

																						if (transData.house_number.status) {
																							var transhouseArray = transData.house_number;
																							transData.house_number = [];
																							transData.house_number.push(transhouseArray);
																						}

																						if (transData.trade.subscriber) {
																							var transtradeArray = transData.trade;
																							transData.trade = [];
																							transData.trade.push(transtradeArray);
																						}


																						if (transData.response.product.subject.subjectRecord && transData.response.product.subject.subjectRecord.custom && transData.response.product.subject.subjectRecord.custom.credit) {
																							if (!Array.isArray(transData.response.product.subject.subjectRecord.custom.credit.publicRecord)) {
																								var transpublicrecordArray = transData.response.product.subject.subjectRecord.custom.credit.publicRecord;
																								transData.publicrecord = [];
																								transData.publicrecord.push(transpublicrecordArray);
																							} else {
																								transData.publicrecord = transData.response.product.subject.subjectRecord.custom.credit.publicRecord;
																							}
																						}

																					}

																					var userAccount = '';
																					if (transData) {
																						if (transData.response) {
																							userAccount = transData.response;
																						}
																					}
																					var totalbalance = 0;
																					var sum = 0;

																					/* if(userAccount.product.subject.subjectRecord.custom.credit.trade)
																						{
																							var userAccountlist = userAccount.product.subject.subjectRecord.custom.credit.trade;
																							var currentBalance ='';
																							var totalbalance = 0;
																							var numformt = 0;
																							var selectedaccount = [];
																							var selectedamount = [];
																							var sum =0;
						
						
																							if ("undefined" !== typeof paymentmanagementdata.consolidateaccount && paymentmanagementdata.consolidateaccount!='' && paymentmanagementdata.consolidateaccount!=null)
																							{
																								var consoldateaccount = paymentmanagementdata.consolidateaccount.trade;
																								var selectBalance ='';
																								_.forEach(consoldateaccount, function (selaccount) {
																									var accountnumber = selaccount.accountNumber;
																									selectBalance = parseFloat(selaccount.currentBalance);
																									selectedaccount.push(accountnumber);
																									selectedamount.push(selectBalance);
																								});
																								sum = selectedamount.reduce((a, b) => a + b, 0);
																							}
						
																							_.forEach(userAccountlist, function (account) {
																								if(account.subscriber){
																									var industryCode = account.subscriber.industryCode;
																								}else{
																									var industryCode = 0;
																								}
																								var accountNumber = account.accountNumber;
																								if ((industryCode === 'B' || industryCode === 'R' || industryCode === 'F') && account.currentBalance > 0 && account.currentBalance < 75000) {
																									currentBalance = parseFloat(account.currentBalance);
																									account.currentBalance = currentBalance.toFixed(2);
																									totalbalance = totalbalance+currentBalance;
																									numformt = account.currentBalance;
																									account.currentBalance = numformt.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");
																									if (in_array(accountNumber, selectedaccount)) {
																									account.selectstatus = 'checked';
																									}
																									subTypeArray.push(account);
																								}
																							});
																						}*/

																					if (screentracking.offerdata && screentracking.offerdata.length > 0) {
																						if (screentracking.offerdata[0].financedAmount) {
																							var totalbalance = parseFloat(screentracking.offerdata[0].financedAmount ? screentracking.offerdata[0].financedAmount.toString() : "0"),
																								totalbalance = totalbalance.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");
																						}
																					}
																					//sum =parseFloat(sum).toFixed(2);

																					var screentrackingres = screentracking;


																					screentrackingres.consolidateaccount = paymentmanagementdata.consolidateaccount;

																					Screentracking
																						.getDTIoffers(userAccount, screentrackingres)
																						.then(function (dtiandoffers) {

																							var documenttype1 = sails.config.loanDetails.loanDetails.doctype1;
																							var documenttype2 = sails.config.loanDetails.loanDetails.doctype2;
																							var documenttype3 = sails.config.loanDetails.loanDetails.doctype3;

																							var documenttype = {

																								documenttype1: documenttype1,
																								documenttype2: documenttype2,
																								documenttype3: documenttype3,
																							};

																							//****Bank account start******//

																							var income_amt = '-----';


																							var payroll_detected = dtiandoffers.payroll_detected;
																							sails.log.info(' payroll_detected', dtiandoffers);
																							if (payroll_detected === undefined || payroll_detected === '' || payroll_detected === null) {
																								payroll_detected = '-----';
																							}

																							//****Bank account end******//

																							var userid = user.id;

																							/*gets only application denied, due to low income*/

																							if ("undefined" !== screentracking.lastlevel && screentracking.lastlevel != '' && screentracking.lastlevel != null) {
																								var lastlevel = screentracking.lastlevel;
																							} else {
																								var lastlevel = 0;
																							}
																							/*gets only application denied, due to low income*/
																							Makepayment
																								.getFullpayment(paymentmanagementdata.id)
																								.then(function (makePaymentForStory) {


																									var makebuttonshow = 'no';
																									if (makePaymentForStory.code == 200) {

																										var todayDate = moment().startOf('day').format();
																										if ("undefined" !== typeof paymentmanagementdata.makepaymentdate && paymentmanagementdata.makepaymentdate != '' && paymentmanagementdata.makepaymentdate != null) {
																											var lastpaiddate = paymentmanagementdata.makepaymentdate;
																										} else {
																											var lastpaiddate = paymentmanagementdata.paymentSchedule[0].lastpaiddate;
																										}
																										var makepaymentDate = moment(lastpaiddate).startOf('day').format();

																										sails.log.info("makepaymentDate", makepaymentDate);
																										sails.log.info("todayDate", todayDate);

																										if (todayDate >= makepaymentDate) {
																											makebuttonshow = 'yes';
																										}
																									}

																									//-- blocked viking
																									var vikingCreditAmt = 0;
																									var totalrecords = 0;
																									var vikingResult = [];
																									var creditFileStatus = 'sent';
																									var IPFromRequest = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
																									var indexOfColon = IPFromRequest.lastIndexOf(':');
																									var ip = IPFromRequest.substring(indexOfColon + 1, IPFromRequest.length);

																									//For move to open
																									var currentDate = moment().tz("America/Los_Angeles").startOf('day');
																									var paymentDate = moment(paymentmanagementdata.createdAt).startOf('day');
																									var paymentDatediff = currentDate.diff(paymentDate, 'days');

																									//Document
																									var creditfilefound = 0;
																									var creditfilename = '';
																									//if(paymentmanagementdata.localcreditfilepath!='')
																									if (paymentmanagementdata.localcreditfilepath != '' && paymentmanagementdata.localcreditfilepath != null && "undefined" !== typeof paymentmanagementdata.localcreditfilepath) {
																										creditfilefound = 1;

																										creditfilename = sails.config.siteBaseUrl + 'ActumCredit/' + paymentmanagementdata.localcreditfilepath;
																									}

																									//-- Loan set date
																									var loanSetDateExist = 0;
																									var showApproveButton = 0;

																									if (paymentmanagementdata.loanSetdate) {
																										loanSetDateExist = 1;

																										const loanSetDateMoment = moment(paymentmanagementdata.loanSetdate);
																										if (moment().add(1, "day").startOf("day").diff(loanSetDateMoment) > 0) {
																											showApproveButton = 1;
																										}

																										// paymentmanagementdata.loanSetdate= loanSetDateMoment.format('L');

																									}
																									var practcriteria = {
																										practicemanagement: paymentmanagementdata.practicemanagement
																									};

																									//sails.log.info("practcriteria::::::::::",practcriteria);

																									PracticeUser
																										.find(practcriteria)
																										.then(function (practiceResults) {
																											var practiceDocResults = [];
																											var practiceAllResults = [];
																											var practiceids = [];

																											var linkedstaffArr = [];
																											var linkedDoctorArr = [];

																											if (practiceResults) {
																												if (paymentmanagementdata.linkedstaff) {
																													linkedstaffArr = paymentmanagementdata.linkedstaff;
																												}

																												if (paymentmanagementdata.linkeddoctor) {
																													linkedDoctorArr = paymentmanagementdata.linkeddoctor;
																												}
																												_.forEach(practiceResults, function (practice) {

																													var staffexist = 0;
																													var doctorexist = 0;
																													if (linkedstaffArr.length > 0) {
																														if (in_array(practice.id, linkedstaffArr)) {
																															staffexist = 1;
																														}
																													}

																													if (linkedDoctorArr.length > 0) {
																														if (in_array(practice.id, linkedDoctorArr)) {
																															doctorexist = 1;
																														}
																													}

																													var practiceinfo = {
																														id: practice.id,
																														fullname: practice.firstname + ' ' + practice.lastname,
																														staffexist: staffexist,
																														doctorexist: doctorexist
																													}
																													// if(practice.role=='PracticeDoctor')
																													// {
																													// 	practiceDocResults.push(practiceinfo);
																													// }
																													practiceAllResults.push(practiceinfo);
																												});
																											}
																											//sails.log.info("loooppppppppp::::::::::");

																											PracticeUser
																												.getPracticeDetails(linkedstaffArr, linkedDoctorArr)
																												.then(function (linkedpracticeRes) {

																													var linkedpractices = [];
																													if (linkedpracticeRes.code == 200) {
																														var linkedpractices = linkedpracticeRes.result;
																													}
																													var incompleteCrieteria = { user: user.id, iscompleted: [0, 2] };
																													Screentracking.find(incompleteCrieteria)
																														.then(function (incompleteloanRes) {
																															var scriteria = { id: paymentmanagementdata.screentracking.id };
																															sails.log.info('scriteria', scriteria);
																															Screentracking
																																.findOne(scriteria)
																																.populate('practicemanagement')
																																.then(async function (screenPracticeRes) {
																																	if (!screenPracticeRes.practicemanagement) {
																																		screenPracticeRes.practicemanagement = (await PracticeManagement.find().limit(1))[0];
																																	}
																																	var stateCode = screenPracticeRes.practicemanagement.StateCode;
																																	var checkLAState = sails.config.plaid.checkLAState;
																																	var loanAmntarr = [];
																																	loanAmntarr.push(sails.config.plaid.basicLoanamount);
																																	if (stateCode == checkLAState) {
																																		loanAmntarr.push(sails.config.plaid.LAminLoanamount);
																																	}
																																	Screentracking.getGradeLoanamount(screenPracticeRes, loanAmntarr)
																																		.then(function (gradeResults) {
																																			sails.log.info('gradeResults', gradeResults);
																																			var loansettingcriteria = {
																																				loanactivestatus: 1,
																																				practicemanagement: screenPracticeRes.practicemanagement.id
																																			};
																																			LoanSettings.find(loansettingcriteria)
																																				.then(function (loansettingData) {
																																					Paymentcomissionhistory
																																						.find({ "paymentmanagement": payID })
																																						.then(function (comissionDetails) {
																																							References.find({ user: screentracking.user })
																																								.then(function (references) {
																																									EmploymentHistory.find({ user: paymentmanagementdata.user })
																																										.sort({ 'createdAt': -1 })
																																										.then(function (employmentHistories) {
																																											EmploymentHistory.getPayrollDatesFromEmploymentHistory(user.id)
																																												.then(async (payrollFrequencies) => {
																																													const holidayDates = SmoothPaymentService.getHolidayDates();

																																													// const nowDate = moment();
																																													let origDateToUse = moment(paymentmanagementdata.loanSetdate).startOf("day");
																																													let originDateToUseForTomorrow = null;
																																													let nextPossibleFirstPaymentDate = null;
																																													let nextPossibleFirstPaymentDateOrigTomorrow = null;
																																													if ([PaymentManagement.paymentManagementStatus.origination, PaymentManagement.paymentManagementStatus.pending].indexOf(paymentmanagementdata.status) >= 0) {
																																														origDateToUse = SmoothPaymentService.getBusinessDateBasedOnBankDays(origDateToUse.toDate(), true);

																																														nextPossibleFirstPaymentDate = SmoothPaymentService.determineFirstPaymentScheduleFromEmploymentPayDates(employmentHistories[0], origDateToUse, screentracking.paymentFrequency);
																																														if (moment(origDateToUse).startOf("day").isSameOrBefore(moment().startOf("day"))) {
																																															origDateToUse = SmoothPaymentService.getBusinessDateBasedOnBankDays(moment().startOf("day").add(1, "day").toDate(), true);
																																														}
																																														originDateToUseForTomorrow = SmoothPaymentService.getBusinessDateBasedOnBankDays(moment().startOf("day").toDate(), true);

																																														// if(moment(origDateToUse).startOf("day").isSameOrBefore(moment().startOf("day"))) {
																																														// 	originDateToUseForTomorrow = SmoothPaymentService.getBusinessDateBasedOnBankDays(origDateToUse,true);
																																														// }else {
																																														// 	originDateToUseForTomorrow = SmoothPaymentService.getBusinessDateBasedOnBankDays(moment(origDateToUse).add(1, "day").toDate(),true);
																																														// }
																																														nextPossibleFirstPaymentDateOrigTomorrow = SmoothPaymentService.determineFirstPaymentScheduleFromEmploymentPayDates(employmentHistories[0], originDateToUseForTomorrow, screentracking.paymentFrequency);
																																														// origDateToUse = SmoothPaymentService.getBusinessDateBasedOnBankDays(origDateToUse.toDate());
																																													}
																																													const isEligibleToReApply = await ApplicationService.isUserEligibleToReApply(user);
																																													UserBankAccount.find({ screentracking: screentracking.id })
																																														.then(function (bankDetails) {

																																															let adminUserPromise = Promise.resolve(null);
																																															if (paymentmanagementdata.isInLoanModification && !!paymentmanagementdata.lastLoanModificationCreatedBy) {
																																																adminUserPromise = Adminuser.findOne({ id: paymentmanagementdata.lastLoanModificationCreatedBy })
																																															}
																																															adminUserPromise.then((lastLoanModificationCreatedByUser) => {
																																																paymentmanagementdata.lastLoanModificationCreatedBy = lastLoanModificationCreatedByUser;
																																																CollectionLoanModifications.getLoanModificationHistory(paymentmanagementdata.id).then(async (paymentLoanModifyHistory) => {
																																																	const transactions = await Payment.getTransactionForLoan(paymentmanagementdata.id);
																																																	sails.log(bankDetails);

																																																	// let paymentScheduleCalendarStartDate = moment(paymentLedger.firstPastDuePaymentDate).startOf("day");
																																																	// if(paymentScheduleCalendarStartDate.isSameOrBefore(moment().startOf("day"))){
																																																	//
																																																	// 	paymentScheduleCalendarStartDate = moment().startOf("day");
																																																	// }
																																																	//canSendLeadInviteUrl
																																																	if (!paymentmanagementdata.screentracking.offers || paymentmanagementdata.screentracking.offers.length === 0) {
																																																		const potentialOffers = OffersService.generateOffersArray(paymentmanagementdata.screentracking.requestedLoanAmount, paymentmanagementdata.screentracking.paymentFrequency);
																																																		paymentmanagementdata.screentracking.offers = potentialOffers;
																																																	}
																																																	const states = await State.getExistingState();
																																																	let annualIncomeAmount = 0;
																																																	const monthlyIncomeAmount = employmentHistories[0].monthlyIncome;
																																																	if (monthlyIncomeAmount > 0) {
																																																		annualIncomeAmount = parseFloat((monthlyIncomeAmount * 12).toFixed(2));
																																																	}
																																																	console.log(`Monthly = ${monthlyIncomeAmount}, Annual = ${annualIncomeAmount}`);
																																																	var responsedata = {
																																																		states: states,
																																																		canSendLeadInviteUrl: false,
																																																		isEligibleToReApply: isEligibleToReApply,
																																																		isEligibleForOriginate: moment(paymentmanagementdata.loanSetdate).startOf("day").isSameOrAfter(moment().startOf("day")) && !!paymentmanagementdata.fundingPaymentType,
																																																		paymentLedger: paymentLedger,
																																																		paymentScheduleCalendarStartDate: moment().startOf("day").toISOString(),
																																																		user: user,
																																																		references: references[0],
																																																		isReferencesAdded: (references ? true : false),
																																																		employmentHistories: employmentHistories.slice(1),
																																																		currentEmploymentHistory: employmentHistories[0],
																																																		nextPossibleFirstPaymentDate: moment(nextPossibleFirstPaymentDate).format("MM/DD/YYYY"),
																																																		nextPossibleFirstPaymentDateOrigTomorrow: moment(nextPossibleFirstPaymentDateOrigTomorrow).format("MM/DD/YYYY"),
																																																		nextOriginDate: moment(origDateToUse).format("MM/DD/YYYY"),
																																																		nextOriginDateForTomorrow: moment(originDateToUseForTomorrow).format("MM/DD/YYYY"),
																																																		correctLoanSetDate: moment(paymentmanagementdata.loanSetdate).format("MM/DD/YYYY"),
																																																		repulldata: bankDetails[0],
																																																		profileImage: "",
																																																		paymentmanagementdata: paymentmanagementdata,
																																																		achdocumentDetails: documentdata,
																																																		pdfdocument: pdfdocument,
																																																		documenttype: documenttype,
																																																		loancount: loancount,
																																																		logDetails: logArrayDetails,
																																																		communicationDetails: responseArr,
																																																		errorval: errorval,
																																																		successmsg: successmsg,
																																																		loadPaymentSheduleTab: loadPaymentSheduleTab,
																																																		nextpaymentDate: nextpaymentDate,
																																																		loanPaymentType: loanPaymentType,
																																																		transactionStatus: transactionStatus,
																																																		PaymentScheduleStatus: paymentmanagementdata.status,
																																																		statusicon: statusicon,
																																																		pendingSchedule: pendingSchedule,
																																																		paidSchedule: paidSchedule,
																																																		likersCount: paymentmanagementdata.story && paymentmanagementdata.story.likers ? paymentmanagementdata.story.likers.length : 0,
																																																		dislikersCount: paymentmanagementdata.story && paymentmanagementdata.story.dislikers ? paymentmanagementdata.story.dislikers.length : 0,
																																																		transData: transData,
																																																		shwotransData: showtransData,
																																																		accountDetail: accountDetail,
																																																		annualIncome: annualIncomeAmount,
																																																		monthlyIncomeAmount: monthlyIncomeAmount,
																																																		totalbalance: totalbalance,
																																																		selecttotal: sum,
																																																		//obj:objectdatas,F
																																																		obj: objectdatas,
																																																		dtiandoffers: dtiandoffers,
																																																		schudlesmsg: schudlesmsg,
																																																		makePaymentForStory: makePaymentForStory,
																																																		makebuttonshow: makebuttonshow,
																																																		momentDate: moment,
																																																		vikingData: vikingResult,
																																																		ipaddress: ip,
																																																		lastlevel: lastlevel,
																																																		vikingConfig: sails.config.vikingConfig,
																																																		deniedfromapp: paymentmanagementdata.deniedfromapp,
																																																		uploaddocmsg: uploaddocmsg,
																																																		banksuccessmsg: banksuccessmsg,
																																																		bankerror: bankerror,
																																																		creditFileStatus: creditFileStatus,
																																																		vikingPendingCount: totalrecords,
																																																		changeincomemsg: changeincomemsg,
																																																		payroll_detected: payroll_detected,
																																																		vikingCreditAmt: vikingCreditAmt,
																																																		ounterOfferdecline: counterOfferdecline,
																																																		creditfilefound: creditfilefound,
																																																		creditfilename: creditfilename,
																																																		minloanamount: sails.config.plaid.minrequestedamount,
																																																		maxloanamount: sails.config.loanDetails.maximumRequestedLoanAmount,
																																																		minincomeamount: sails.config.plaid.minincomeamount,
																																																		maxaprrate: sails.config.plaid.maxApr,
																																																		loanSetDateExist: loanSetDateExist,
																																																		showApproveButton: showApproveButton,
																																																		practiceDocResults: practiceDocResults,
																																																		practiceAllResults: practiceAllResults,
																																																		linkedpractices: linkedpractices,
																																																		linkedstaffArr: linkedstaffArr,
																																																		linkedDoctorArr: linkedDoctorArr,
																																																		paymentdebitCount: paymentmanagementdata.usertransactions ? paymentmanagementdata.usertransactions.length : 0,
																																																		incompleteloanCount: incompleteloanRes.length,
																																																		loantermdetails: gradeResults,
																																																		loansettingData: loansettingData,
																																																		paymentDatediff: paymentDatediff,
																																																		backviewType: backviewType,
																																																		creditReports: comissionDetails,
																																																		loanSetDateTime: loanSetDateTime,
																																																		currentDateTime: currentDateTime,
																																																		payrollFrequencies: payrollFrequencies,
																																																		holidayDates: holidayDates,
																																																		periodicityTextData: PaymentManagement.convertedPeriodicityToText,
																																																		loanModificationHistory: paymentLoanModifyHistory,
																																																		employmentInfoTab: employmentInfoTab,
																																																		bankAccountInfoTab: bankAccountInfoTab,
																																																		screentracking: paymentmanagementdata.screentracking,
																																																		paymentTransactions: transactions,
																																																		achCutOffHour: sails.config.paymentService.achCutOffHour,
																																																		isAfterAchCutOff: moment().isSameOrAfter(moment().hour(sails.config.paymentService.achCutOffHour || 15)),
																																																		leadData: leadData
																																																	};
																																																	res.view("admin/pendingach/achuserDetails", responsedata);
																																																});
																																															});
																																														});

																																												});
																																										});

																																								});
																																						});
																																				});
																																		});
																																});
																														});

																												});
																										})

																								})
																								.catch(function (err) {
																									sails.log.error('AchController#getAchUserDetailsAction :: Error :: ', err);
																									res.view("admin/error/404", {
																										data: err.message,
																										layout: 'layout'
																									});
																								})


																						})
																						.catch(function (err) {
																							sails.log.error('AchController#getAchUserDetailsAction :: Error :: ', err);
																							res.view("admin/error/404", {
																								data: err.message,
																								layout: 'layout'
																							});
																						});

																				})
																				.catch(function (err) {
																					sails.log.error('AchController#getAchUserDetailsAction :: Error :: ', err);
																					res.view("admin/error/404", {
																						data: err.message,
																						layout: 'layout'
																					});
																				});

																		})
																		.catch(function (err) {
																			sails.log.error('AchController#getAchUserDetailsAction :: Error :: ', err);
																			res.view("admin/error/404", {
																				data: err.message,
																				layout: 'layout'
																			});
																		});
																})
																.catch(function (err) {
																	sails.log.error('AchController#getAchUserDetailsAction :: Error :: ', err);
																	res.view("admin/error/404", {
																		data: err.message,
																		layout: 'layout'
																	});
																});

														})
														.catch(function (err) {
															sails.log.error('AchController#getAchUserDetailsAction :: Error :: ', err);
															res.view("admin/error/404", {
																data: err.message,
																layout: 'layout'
															});
														});
												});
											})
											.catch(function (err) {
												sails.log.error('AchController#getAchUserDetailsAction :: Error :: ', err);
												res.view("admin/error/404", {
													data: err.message,
													layout: 'layout'
												});
											});
									})
									.catch(function (err) {
										sails.log.error('AchController#getAchUserDetailsAction :: Error :: ', err);
										res.view("admin/error/404", {
											data: err.message,
											layout: 'layout'
										});
									});
							}).catch(function (err) {
								sails.log.error('AchController#getAchUserDetailsAction :: err', err);
								res.view("admin/error/404", {
									data: err.message,
									layout: 'layout'
								});
							});
					}
				})
				.catch(function (err) {
					sails.log.error('AchController#getAchUserDetailsAction :: err', err);
					res.view("admin/error/404", {
						data: err.message,
						layout: 'layout'
					});
				});
		})
		.catch(function (err) {
			sails.log.error('AchController#getAchUserDetailsAction :: err', err);
			res.view("admin/error/404", {
				data: err.message,
				layout: 'layout'
			});
		});
}


function denyUserLoanAction(req, res) {

	var payID = req.param('paymentID');
	var eligireply = req.param('eligiblereapply');
	var decline = req.param('decline');
	var declinereason = req.param('declinereason');
	let eligibility;
	// Set eligiblereapply as a bool instead of string.
	switch (eligireply) {
		case "0": {
			eligibility = false;
			break;
		}
		case "1": {
			eligibility = true;
			break;
		}
		default: {
			eligibility = (!!eligireply);
			break;
		}
	}

	if (payID) {

		var options = {
			id: payID
		};

		PaymentManagement.findOne(options)
			.populate('user')
			.then(function (paymentmanagementdata) {


				var userObjectData = paymentmanagementdata.user;

				paymentmanagementdata.achstatus = 2;
				paymentmanagementdata.isPaymentActive = false;
				paymentmanagementdata.eligiblereapply = eligibility;
				paymentmanagementdata.declineemail = decline;
				paymentmanagementdata.declinereason = declinereason;
				paymentmanagementdata.appverified = 1;
				paymentmanagementdata.status = "DENIED";

				paymentmanagementdata.save(async function (err) {
					if (err) {
						var json = {
							status: 400,
							message: "Unable to decline loan. Try again!"
						};
						res.contentType('application/json');
						res.json(json);
					}
					else {
						await Screentracking.update({ id: paymentmanagementdata.screentracking }, { isDenied: true, deniedReason: declinereason })
						var usercriteria = {
							id: paymentmanagementdata.user
						};

						User.findOne(usercriteria)
							.then(function (userdata) {

								/*userdata.isExistingLoan = false;*/
								//-- Added to choose new bank in front end
								/*userdata.isBankAdded = false;*/
								userdata.isUserProfileUpdated = false;

								userdata.save(function (err) {
									if (err) {
										var json = {
											status: 400,
											message: "Unable to decline loan. Try again!"
										};
										res.contentType('application/json');
										res.json(json);
									}

									//Log Activity
									var modulename = 'Loan denied';
									var modulemessage = 'Loan denied successfully';
									req.achlog = 1;
									req.payID = payID;
									req.logdata = paymentmanagementdata;

									// Comment section Start
									/*var allParams={
																		subject : modulename,
																		comments : modulemessage
																}
																var adminemail = req.user.email;
																Achcomments
																.createAchComments(allParams,payID,adminemail)
																.then(function (achcomments) {
																}).catch(function (err) {
																		sails.log.error("Loan denied createAchComments error::", err);
																});*/
									//Comment section end
									EmailService.processSendingStatusEmail(EmailService.emailSendType.customerKo, paymentmanagementdata);
									Logactivity.registerLogActivity(req, modulename, modulemessage);

									EmailService.sendDenyLoanMail(userObjectData, paymentmanagementdata);
									var json = {
										status: 200,
										message: "Loan denied successfully"
									};
									res.contentType('application/json');
									res.json(json);
								});

							});
					}
				});

			})
			.catch(function (err) {
				var json = {
					status: 400,
					message: err.message
				};
				sails.log.error("json data", json);
				res.contentType('application/json');
				res.json(json);
			});
	}
	else {

		var json = {
			status: 400
		};
		sails.log.error("json data", json);
		res.contentType('application/json');
		res.json(json);
	}
}

function addAchCommentsAction(req, res) {

	var payID = req.param('paymentID');
	if (!req.form.isValid) {
		var validationErrors = ValidationService
			.getValidationErrors(req.form.getErrors());
		return res.failed(validationErrors);
	}
	var adminemail = req.user.email;
	Achcomments
		.createAchComments(req.form, payID, adminemail)
		.then(function (achcomments) {

			var modulename = 'Add pending applications Comment';
			var modulemessage = 'Pending applications comment added successfully';
			req.achlog = 1;
			req.logdata = req.form;
			req.payID = payID;
			Logactivity.registerLogActivity(req, modulename, modulemessage);

			var json = {
				status: 200,
				message: "Commente Added successfully"
			};
			res.contentType('application/json');
			res.json(json);

		})
		.catch(function (err) {
			sails.log.error('UniversityController#createUniversity :: err :', err);
			return res.handleError(err);
		});

}

/* Loan payment pro starts here */
function addnewCustomerAction(req, res) {
	/*var userData = {
				'FirstName' : 'Ram',
				'LastName' : 'Kumar',
				'Address1' : 'First lane,Chula Vista',
				'Address2' : '',
				'City' : 'San Diego',
				'State' : 'CA',
				'Zip' : '91910',
				'Country' : 'US',
				'Email' : 'itramkumar.78@gmail.com',
				'Phone' : '619-543-6222',
				'Mobile' : '619-543-6222'
			};*/

	var userData = {
		'FirstName': 'Bob',
		'LastName': 'Yakuza',
		'Address1': '893 Ginza',
		'Address2': '',
		'City': 'Austin',
		'State': 'TX',
		'Zip': '00893',
		'Country': 'US',
		'Email': 'rajrajan26@gmail.com',
		'Phone': '893-555-0893',
		'Mobile': '893-555-0893'
	};

	LoanProService.addCustomer(userData)
		.then(function (customerDetails) {
			if (customerDetails) {
				return res.success(customerDetails);
			}
		})
		.catch(function (err) {
			sails.log.error('AchController#addnewCustomerAction :: err :', err);
			return res.handleError(err);
		});
}

function addnewBankaccountAction(req, res) {

	var bankObject = {
		'AccountNumber': '1002587425',
		//'BankName' : 'chase',
		'NameOnAccount': 'Bob Yakuza',
		'RoutingNumber': '999999999'
	};
	//var customerToken="a68c2979-7426-4c29-9e99-abc27fb2d900";
	//var customerToken="4327a5f0-6087-417a-b38b-af0b16fd473a";
	//var customerToken="bb4e6290-77bb-4a1c-a875-40fc09d3760d";
	//var customerToken="2e0cbd9b-c628-4237-aa5c-8a1f58c01898";
	var customerToken = "1b2e41ea-6dc5-4621-aa4c-03f146900f6a";
	LoanProService.addNewBankPayment(customerToken, bankObject)
		.then(function (bankDetails) {
			if (bankDetails) {
				return res.success(bankDetails);
			}
		})
		.catch(function (err) {
			sails.log.error('AchController#addnewBankaccountAction :: err :', err);
			return res.handleError(err);
		});
}

function loanproCreditPaymentAction(req, res) {

	var userData = {
		'FirstName': 'Bob',
		'LastName': 'Yakuza',
		'Address1': '893 Ginza',
		'Address2': '',
		'City': 'Austin',
		'State': 'TX',
		'Zip': '00893',
		'Country': 'US',
		'Email': 'rajrajan26@gmail.com',
		'Phone': '893-555-0893',
		'Mobile': '893-555-0893'
	};

	var customerToken = "1b2e41ea-6dc5-4621-aa4c-03f146900f6a";
	var paymentToken = "30908738-c588-4bed-830c-d2c5ef025f92";

	var payObject = {
		'Amount': '5',
		'InvoiceId': 'FL1000',
		'TransactionDescription': 'ACH Loan Approval'
	};

	/*var payObject = {
						'Amount' : '5',
						'RoutingNumber': '999999999',
						'AccountNumber' : '1002587425',
						'Customer' : userData
					};*/

	LoanProService.processDebitPayment(customerToken, paymentToken, payObject)
		.then(function (paymentdata) {
			if (paymentdata) {
				return res.success(paymentdata);
			}
		})
		.catch(function (err) {
			sails.log.error('AchController#loanproCreditPaymentAction :: err :', err);
			return res.handleError(err);
		});
}


function checkAchTransactionDetailsAction(req, res) {

	var transId = '17400823';
	LoanProService.checkAchTransaction(transId)
		.then(function (transData) {
			if (transData) {
				return res.success(transData);
			}
		})
		.catch(function (err) {
			sails.log.error('AchController#checkAchTransactionDetailsAction :: err :', err);
			return res.handleError(err);
		});
}

/* Loan payment pro ends here */

function ajaxAchCommentsAction(req, res) {

	//var payID = req.param('id');
	var userId = req.param('id');

	//Sorting
	var colS = "";

	if (req.query.sSortDir_0 == 'desc') {
		sorttype = -1;
	}
	else {
		sorttype = 1;
	}
	switch (req.query.iSortCol_0) {
		case '0': var sorttypevalue = { '_id': sorttype }; break;
		case '1': var sorttypevalue = { 'subject': sorttype }; break;
		case '2': var sorttypevalue = { 'comments': sorttype }; break;
		case '3': var sorttypevalue = { 'adminemail': sorttype }; break;
		case '4': var sorttypevalue = { 'createdAt': sorttype }; break;
		default: break;
	};

	//Search
	if (req.query.sSearch) {
		var criteria = {
			//isDeleted: false,
			user: userId,
			or: [{ subject: { 'contains': req.query.sSearch } }, { comments: { 'contains': req.query.sSearch } }]
		};

	}
	else {
		var criteria = {
			user: userId,
			//isDeleted: false,
		};
	}


	Achcomments
		.find(criteria)
		.sort(sorttypevalue)
		.then(function (achcomments) {

			totalrecords = achcomments.length;
			//Filter by limit records
			skiprecord = parseInt(req.query.iDisplayStart);
			checklimitrecords = skiprecord + parseInt(req.query.iDisplayLength);
			if (checklimitrecords > totalrecords) {
				iDisplayLengthvalue = parseInt(totalrecords);
			}
			else {
				iDisplayLengthvalue = parseInt(req.query.iDisplayLength) + parseInt(skiprecord);
			}


			achcomments = achcomments.slice(skiprecord, iDisplayLengthvalue);

			var achcommentsDetails = [];
			achcomments.forEach(function (achcommentsdata, loopvalue) {
				let loopid = loopvalue + skiprecord + 1;
				let id = achcommentsdata.id
				const isReminder = !!Date.parse(achcommentsdata.reminder)
				if (isReminder) achcommentsdata.reminder = moment(achcommentsdata.reminder).format('MM-DD-YYYY')
				const dueDate = isReminder ? achcommentsdata.reminder : '--'
				let disabled = (
					achcommentsdata.resolved ||
					(isReminder && achcommentsdata.reminder != moment().format('MM-DD-YYYY'))) ?
					'disabled' : ''

				let buttonText = achcommentsdata.resolved ? 'Resolved' : (isReminder ? 'Remind later' : 'resolve')
				achcommentsdata.createdAt = moment(achcommentsdata.createdAt).tz("America/los_angeles").format('MM-DD-YYYY hh:mm:ss');
				const resolveBtn = `<button type="button" class="btn btn-primary" ${disabled} id="${id}" onclick="resolveHandler(id)">${buttonText}</button>`;

				achcommentsDetails.push({
					loopid: loopid,
					subject: achcommentsdata.subject,
					comments: achcommentsdata.comments,
					adminemail: achcommentsdata.adminemail,
					createdAt: achcommentsdata.createdAt,
					dueDate,
					resolveBtn
				});
			});
			var json = {
				sEcho: req.query.sEcho,
				iTotalRecords: totalrecords,
				iTotalDisplayRecords: totalrecords,
				aaData: achcommentsDetails
			};
			res.contentType('application/json');
			res.json(json);
		});

}

function uploadDocumentProofAction(req, res) {

	var userId = req.param('userId');
	var screenId = req.param('screenId');
	var paymentID = req.param('paymentID');
	var category = req.param('category');
	var docutype = req.param('docutype');
	var localPath = req.localPath;

	if (userId != '' && userId != null && "undefined" !== typeof userId) {
		if (docutype == 'Others') {
			var documentName = req.param('documentname');
			sails.log.info('documentName', documentName);
			if (!req.form.isValid) {

				var validationErrors = ValidationService.getValidationErrors(req.form.getErrors());
				return res.failed(validationErrors);
			}
		}
		else {
			var documentName = req.param('docutype');
			sails.log.info('documentName1111', documentName);
		}

		var underwriter = req.user.name;
		var formdata = {
			docname: documentName,
			user: userId,
			screenTracking: screenId,
			underwriter: underwriter
		};

		Achdocuments
			.createAchDocuments(formdata)
			.then(function (achdocuments) {

				var screenCriteria = { user: userId };

				Screentracking
					.findOne(screenCriteria)
					.sort("createdAt DESC")
					.populate('user')
					.then(function (ScreentrackingData) {

						var applicationReference = ScreentrackingData.applicationReference;
						var userReference = ScreentrackingData.user.userReference;

						Asset
							.createAssetForAchDocuments(achdocuments, localPath, userReference, applicationReference, Asset.ASSET_TYPE_USER_DOCUMENT)
							.then(function (asset) {

								var docdetals = asset;
								docdetals.docs = achdocuments;
								req.achlog = 1;
								req.payID = paymentID;
								req.logdata = docdetals;

								var userCriteria = { id: userId };

								if (achdocuments.docname == sails.config.loanDetails.doctype1) {

									User.update(userCriteria, { isGovernmentIssued: true }).exec(function afterwards(err, updated) { });
								}

								else if (achdocuments.docname == sails.config.loanDetails.doctype2) {

									User.update(userCriteria, { isPayroll: true }).exec(function afterwards(err, updated) { });
								}

								Achdocuments
									.updateDocumentProof(achdocuments, asset)
									.then(function (value) {

										Screentracking
											.checktodolistcount(userId)
											.then(function (todo) {

												req.session.uploaddocmsg = '';
												req.session.uploaddocmsg = 'Documents updated successfully';

												Logactivity.registerLogActivity(req, 'Upload  Documents', 'Applications Documents updated successfully');

												var achDocCriteria = { id: achdocuments.id };

												if (paymentID != '' && paymentID != null && "undefined" !== typeof paymentID) {
													Achdocuments.update(achDocCriteria, { paymentManagement: paymentID }).exec(function afterwards(err, updated) { });
												}

												if (category == 'manageusers') {

													var redirectpath = "/admin/viewUserDetails/" + userId;
												}
												else if (category == 'incompleteusers') {

													var redirectpath = "/admin/viewIncomplete/" + ScreentrackingData.id;
												}
												else {

													var redirectpath = "/admin/getAchUserDetails/" + paymentID;
												}
												return res.status(200).redirect(redirectpath);
											})
											.catch(function (err) {
												sails.log.error("Ach#uploadAchDocuments  :: Error :: ", err);
												return reject({
													code: 500,
													message: 'INTERNAL_SERVER_ERROR'
												});
											});
									})
									.catch(function (err) {
										sails.log.error("Ach#uploadAchDocuments  :: Error :: ", err);
										return reject({
											code: 500,
											message: 'INTERNAL_SERVER_ERROR'
										});
									});
							})
							.catch(function (err) {
								sails.log.error("Ach#uploadAchDocuments  :: Error :: ", err);
								return reject({
									code: 500,
									message: 'INTERNAL_SERVER_ERROR'
								});
							});
					})
					.catch(function (err) {
						sails.log.error("Ach#uploadAchDocuments  :: Error :: ", err);
						return reject({
							code: 500,
							message: 'INTERNAL_SERVER_ERROR'
						});
					});


			})
			.catch(function (err) {
				sails.log.error("Ach#uploadAchDocuments  :: Error :: ", err);
				return reject({
					code: 500,
					message: 'INTERNAL_SERVER_ERROR'
				});
			});
	}
	else {

		req.session.uploaddocmsg = '';
		req.session.uploaddocmsg = 'Error in Uploading Document';

		if (category == 'manageusers') {

			var redirectpath = "/admin/viewUserDetails/" + userId;
		}
		else if (category == 'incompleteusers') {

			var redirectpath = "/admin/viewIncomplete/" + ScreentrackingData.id;
		}
		else {

			var redirectpath = "/admin/getAchUserDetails/" + paymentID;
		}
		return res.status(200).redirect(redirectpath);

	}
}




function defaultUsersAction(req, res) {

	res.view("admin/pendingach/defaultusers");

}

function ajaxDefaultUsersListAction(req, res) {


	var options = {
		status: 'OPENED',
		isPaymentActive: true,
		//achstatus: { $exists: true },
		achstatus: { $eq: 1, $exists: true },
	};

	PaymentManagement.find(options)
		.populate('user')
		.exec(function (err, paymentmanagementdata) {
			if (err) {
				res.send(500, { error: 'DB error' });
			} else {

				if (req.query.sSortDir_0 == 'desc') {

					switch (req.query.iSortCol_0) {
						case '0': paymentmanagementdata = _.sortBy(paymentmanagementdata, '_id').reverse(); break;
						case '1': paymentmanagementdata = _.sortBy(paymentmanagementdata, 'loanReference').reverse(); break;
						case '2': paymentmanagementdata = _.sortBy(paymentmanagementdata, 'user.name').reverse(); break;
						case '3': paymentmanagementdata = _.sortBy(paymentmanagementdata, 'user.email').reverse(); break;
						case '4': paymentmanagementdata = _.sortBy(paymentmanagementdata, 'user.phoneNumber').reverse(); break;
						case '5': paymentmanagementdata = _.sortBy(paymentmanagementdata, 'payOffAmount').reverse(); break;
						case '6': paymentmanagementdata = _.sortBy(paymentmanagementdata, 'maturityDate').reverse(); break;
						case '7': paymentmanagementdata = _.sortBy(paymentmanagementdata, 'createdAt').reverse(); break;
						default: break;
					};

				}
				else {
					switch (req.query.iSortCol_0) {
						case '0': paymentmanagementdata = _.sortBy(paymentmanagementdata, '_id'); break;
						case '1': paymentmanagementdata = _.sortBy(paymentmanagementdata, 'loanReference'); break;
						case '2': paymentmanagementdata = _.sortBy(paymentmanagementdata, 'user.name'); break;
						case '4': paymentmanagementdata = _.sortBy(paymentmanagementdata, 'user.email'); break;
						case '5': paymentmanagementdata = _.sortBy(paymentmanagementdata, 'user.phoneNumber'); break;
						case '6': paymentmanagementdata = _.sortBy(paymentmanagementdata, 'payOffAmount'); break;
						case '7': paymentmanagementdata = _.sortBy(paymentmanagementdata, 'maturityDate'); break;
						case '8': paymentmanagementdata = _.sortBy(paymentmanagementdata, 'createdAt'); break;
						default: break;
					};
				}




				paymentmanagementdata = _.filter(paymentmanagementdata, function (item) {
					var paydate = item.paymentSchedule;
					if (paydate.length > 0) {
						var paystatusvalue = 0;
						paydate.forEach(function (paymentdate, datevalue) {
							var todaysDate = moment().startOf('day').toDate().getTime();
							//var scheduleDate = moment(paymentdate.date).startOf('day').toDate().getTime();
							var scheduleDate = moment(paymentdate.date).add(2, 'days').startOf('day').toDate().getTime();
							//sails.log.info("todaysDate",todaysDate);
							//sails.log.info("scheduleDate",scheduleDate);
							if (scheduleDate <= todaysDate && paymentdate.status == 'OPENED') {
								paystatusvalue = 1;
							}
						});
						if (paystatusvalue == 1) {
							return true;
						}

					}

				});



				//Filter user details not available
				paymentmanagementdata = _.filter(paymentmanagementdata, function (item) {
					if (item.user) {
						return true;
					}
				});

				//Filter using search data
				if (req.query.sSearch) {
					var search = req.query.sSearch.toLowerCase();
					paymentmanagementdata = _.filter(paymentmanagementdata, function (item) {

						if (item.loanReference != null) {
							if (item.loanReference.toLowerCase().indexOf(search) > -1) {
								return true;
							}
						}

						if (item.user.name != null) {
							if (item.user.name.toLowerCase().indexOf(search) > -1) {
								return true;
							}
						}

						/* if(item.user.screenName!=null)
						 {
								 if(item.user.screenName.toLowerCase().indexOf(search)>-1 )
							 {
								 return true;
							 }
						 }*/
						if (item.user.email != null) {
							if (item.user.email.toLowerCase().indexOf(search) > -1) {
								return true;
							}
						}
						if (item.user.phoneNumber != null) {
							if (item.user.phoneNumber.indexOf(search) > -1) {
								return true;
							}
						}

						if (item.payOffAmount != null) {
							if (parseInt(item.payOffAmount) == parseInt(search)) {
								return true;
							}
						}

						if (item.maturityDate != null) {
							if (moment(item.maturityDate).format('MM-DD-YYYY') == search) {
								return true;
							}
						}


						if (item.createdAt != null) {
							if (moment(item.createdAt).format('MM-DD-YYYY') == search) {
								return true;
							}
						}


						return false;
					});
				}

				//total records count
				totalrecords = paymentmanagementdata.length;

				//Filter by limit records
				var p = parseInt(req.query.iDisplayStart) + 1;
				skiprecord = parseInt(req.query.iDisplayStart);
				checklimitrecords = skiprecord + parseInt(req.query.iDisplayLength);
				if (checklimitrecords > totalrecords) {
					iDisplayLengthvalue = totalrecords;
				}
				else {
					//iDisplayLengthvalue=req.query.iDisplayLength;
					iDisplayLengthvalue = parseInt(req.query.iDisplayLength) + parseInt(skiprecord);
				}
				paymentmanagementdata = paymentmanagementdata.slice(skiprecord, iDisplayLengthvalue);


				//Final output starts here
				var pendinguser = [];
				paymentmanagementdata.forEach(function (paydata, loopvalue) {



					loopid = loopvalue + skiprecord + 1;

					var payuserName = '';
					var payuserscreenName = '';
					var payuserEmail = '';
					var payuserphoneNumber = '';
					if (paydata.user) {
						if (paydata.user.firstName != '' && paydata.user.firstName != null) {
							var payuserName = paydata.user.firstName + " " + paydata.user.lastname;
						}
						/*if(paydata.user.screenName!='' && paydata.user.screenName!=null)
						{
							var payuserscreenName=paydata.user.screenName;
						}*/
						if (paydata.user.email != '' && paydata.user.email != null) {
							var payuserEmail = paydata.user.email;
						}
						if (paydata.user.phoneNumber != '' && paydata.user.phoneNumber != null) {
							var payuserphoneNumber = paydata.user.phoneNumber;
						}
					}
					if ("undefined" === typeof paydata.loanReference || paydata.loanReference == '' || paydata.loanReference == null) {
						paydata.loanReference = '--';
					}

					if ("undefined" === typeof paydata.user.firstName || paydata.user.firstName == '' || paydata.user.firstName == null) {
						paydata.user.name = '--';
					}
					if ("undefined" === typeof paydata.user.email || paydata.user.email == '' || paydata.user.email == null) {
						paydata.user.email = '--';
					}

					paydata.maturityDate = moment(paydata.maturityDate).format('MM-DD-YYYY');
					paydata.createdAt = moment(paydata.createdAt).tz("America/los_angeles").format('MM-DD-YYYY hh:mm:ss');

					systemUniqueKeyURL = 'getAchUserDetails/' + paydata.id;

					var payuserNameLink = payuserName;

					if (payuserEmail) {
						var emillnk = '<a href="mailto:' + payuserEmail + '">' + payuserEmail + '</a>';
					}
					statusicon = ' <a href="/admin/viewDefaultUser/' + paydata.id + '"><i class="fa fa-eye" aria-hidden="true" style="cursor:pointer;color:#337ab7;"></i></a>';

					var paymentSchedulearray = paydata.paymentSchedule;
					if (paymentSchedulearray.length > 0) {
						var applicationstatus = '';
						var lateloanstatus = '';
						var todaysDate = moment().startOf('day').toDate().getTime();
						paymentSchedulearray.forEach(function (payschedule, loopvalue1) {
							var loopid = loopvalue1 + 1;
							var financedAmount = payschedule.amount;
							var loandate = payschedule.date;
							var loanstatus = payschedule.status;
							var scheduleDate = moment(payschedule.date).add(2, 'days').startOf('day').toDate().getTime();
							//Need to update in Defaulteduserconroller for late payment date

							if (scheduleDate < todaysDate && loanstatus == 'OPENED') {
								applicationstatus = "Schedule" + loopid + " <br> Late";
								lateloanstatus = "<b>" + financedAmount + "</b> " + moment(loandate).format('MM-DD-YYYY');
							}

						});
					} else {
						var applicationstatus = "--";
						var lateloanstatus = "--";
					}

					systemDefaultURL = 'viewDefaultUser/' + paydata.id;
					if (paydata.loanReference != '' && paydata.loanReference != null) {
						var payloanReference = '<a href=\'' + systemDefaultURL + '\'>' + paydata.loanReference + '</a>';
					} else {
						var payloanReference = '--';
					}

					remainderbtn = '<button type="button" class="btn btn-primary" onclick="senddefaultuserremainder(\'' + paydata.id + '\',\'' + paydata.user.id + '\');">Send</button>';

					/*remainderbtn =' <a href="/admin/loanofferinfo/'+screentrackingdata.id+'"><i class="fa fa-money" aria-hidden="true" style="cursor:pointer;color:#337ab7;"></i></a> &nbsp;&nbsp;<input type="checkbox" id="screenlist" name="screenlist[]" value="'+screentrackingdata.id+'">';	*/


					pendinguser.push({ loopid: loopid, loanReference: payloanReference, name: payuserNameLink, email: payuserEmail, phoneNumber: payuserphoneNumber, payOffAmount: paydata.payOffAmount, maturityDate: paydata.maturityDate, createdAt: paydata.createdAt, loanstatus: lateloanstatus, appstatus: applicationstatus, remainderbtn: remainderbtn, status: statusicon, });
				});

				var json = {
					sEcho: req.query.sEcho,
					iTotalRecords: totalrecords,
					iTotalDisplayRecords: totalrecords,
					aaData: pendinguser
				};
				res.contentType('application/json');
				res.json(json);
			}
		});
}

function viewDefaultUserAction(req, res) {

	var payID = req.param('id');
	console.log("payID:", payID);

	if (!payID) {
		var errors = {
			"code": 500,
			"message": "Invalid Data"
		};
		sails.log.error('AchController#viewDefaultUserAction :: errors', errors);
		res.view("admin/error/500", {
			data: errors.message,
			layout: 'layout'
		});
	}

	var options = {
		id: payID
	};

	PaymentManagement.findOne(options)
		.populate('story')
		.then(function (paymentmanagementdata) {

			//sails.log.info('paymentmanagementdata Details: ', paymentmanagementdata);

			var checkpaymentSchedule = _.orderBy(paymentmanagementdata.paymentSchedule, ['date'], ['asc']);

			//-- loan full amount
			var payOffAmount = 0;
			var totalAmountDue = 0;
			_.forEach(paymentmanagementdata.paymentSchedule, function (newschedulerdata) {
				if (newschedulerdata.status == "OPENED" || newschedulerdata.status == 'CURRENT') {
					totalAmountDue = paymentmanagementdata.paymentSchedule[0].amount;
					payOffAmount = parseFloat(payOffAmount) + parseFloat(newschedulerdata.amount);
				}

			})

			if (paymentmanagementdata.amount) {
				var financedAmount = paymentmanagementdata.amount;
			}
			else {
				var financedAmount = paymentmanagementdata.payOffAmount;
			}

			if (paymentmanagementdata.interestapplied) {
				var interestRate = paymentmanagementdata.interestapplied;
			}
			else {
				var interestRate = 0;
			}

			var todaysDateFormat = moment().startOf('day').format('MM-DD-YYYY');
			var todaysMonth = moment().startOf('day').format('M');
			var currentDay = moment().startOf('day').format('D');
			var maturityDate = moment(paymentmanagementdata.maturityDate).startOf('day').toDate().getTime();
			fullPayoffAmount = 0;
			fullPayoffMonth = 0;
			finalinterestAmount = 0;
			totalinterestDays = 0;
			paidterms = 0;
			interestApplied = 0;
			chargeinterestDays = 0;
			minimumAmount = 0;

			var actualStartBalanceAmount = 0;
			var latePrincipalAmount = 0;

			if (interestRate > 0) {
				//sails.log.info("checkpaymentSchedule:: ", checkpaymentSchedule);

				_.forEach(checkpaymentSchedule, function (scheduler) {

					if (minimumAmount == 0) {
						minimumAmount = scheduler.interestAmount;
					}
					if (scheduler.status == "OPENED" || scheduler.status == 'CURRENT' || scheduler.status == 'LATE') {
						if (scheduler.amount > 0) {
							interestAmount = scheduler.interestAmount;
							startBalanceAmount = scheduler.startBalanceAmount;
							var nextMonthDate = moment(scheduler.date).startOf('day').toDate();
							var nextMonthDateValue = moment(nextMonthDate).startOf('day').toDate().getTime();
							var todaysDate = moment(new Date());
							var todaysDateValue = moment().startOf('day').toDate().getTime();
							var schedulerDate = moment(scheduler.date).startOf('day').toDate();
							var lastpaidDate = moment(scheduler.lastpaiddate).startOf('day').toDate();
							var lastpaidDateValue = moment(scheduler.lastpaiddate).startOf('day').toDate().getTime();

							if (todaysDateValue >= nextMonthDateValue && todaysDateValue <= maturityDate) {
								finalinterestAmount = parseFloat(finalinterestAmount) + parseFloat(interestAmount);
								latePrincipalAmount = parseFloat(latePrincipalAmount) + parseFloat(scheduler.principalAmount);
							}
							else {
								if (nextMonthDateValue > todaysDateValue && todaysDateValue <= maturityDate) {
									if (interestApplied == 0) {
										actualStartBalanceAmount = parseFloat(startBalanceAmount);

										oDate = moment(lastpaidDate);
										diffDays = oDate.diff(todaysDate, 'days');
										totalinterestDays = Math.abs(diffDays);

										sDate = moment(schedulerDate);
										sdiffDays = sDate.diff(lastpaidDate, 'days');
										sdiffDays = Math.abs(sdiffDays);
										sdiffDays = 14;

										//	sails.log.info("interestAmount: info: ",interestAmount);
										//	sails.log.info("sdiffDays: info: ",sdiffDays);

										dayinterestAmount = interestAmount / sdiffDays;
										chargeinterestDays = totalinterestDays;

										//sails.log.info("dayinterestAmount: info: ",dayinterestAmount);

										if (todaysDateValue < lastpaidDateValue) {
											chargeinterestDays = 0;
										}
										else {
											if (chargeinterestDays <= 0) {
												if (scheduler.lastpaidcount == 1 && todaysDateValue == lastpaidDateValue) {
													chargeinterestDays = 0;
												}
												else {
													chargeinterestDays = 1;
												}
											}
											else {
												if (scheduler.lastpaidcount == 1) {
													chargeinterestDays = parseInt(chargeinterestDays);
												}
												else {
													chargeinterestDays = parseInt(chargeinterestDays) + 1;
												}
											}
										}

										totalinterestDaysAmount = dayinterestAmount * chargeinterestDays;
										finalinterestAmount = parseFloat(finalinterestAmount) + parseFloat(totalinterestDaysAmount);
										interestApplied = 1;

									}
								}
							}
						}
					}

					if (scheduler.status == "PAID OFF") {
						paidterms = parseInt(paidterms) + 1;
					}
				});

				//-- Sum interest amount and late prinicpal
				if (parseFloat(fullPayoffAmount) >= 0) {
					fullPayoffAmount = parseFloat(actualStartBalanceAmount) + parseFloat(latePrincipalAmount);
				}

				if (parseFloat(fullPayoffAmount) > 0) {
					fullPayoffAmount = parseFloat(fullPayoffAmount);

					if (parseFloat(finalinterestAmount) > 0) {
						fullPayoffAmount = parseFloat(fullPayoffAmount) + parseFloat(finalinterestAmount);
					}
				}

				fullPayoffAmount = parseFloat(fullPayoffAmount.toFixed(2));
			}
			else {
				fullPayoffAmount = parseFloat(paymentmanagementdata.payOffAmount);
			}

			//user criteria
			var criteria = {
				id: paymentmanagementdata.user,
			};

			User
				.findOne(criteria)
				.then(function (user) {
					if (!user) {
						var errors = {
							"code": 404,
							"message": "User not found"
						};
						sails.log.error('AchController#viewDefaultUserAction :: errors', errors);
						res.view("admin/error/404", {
							data: errors.message,
							layout: 'layout'
						});
					}
					else {
						var profileImage;

						if (user.profilePicture) {
							profileImage = user.profilePicture.toApi();
						} else {
							profileImage = "";
						}

						//--Account criteria updated
						var criteria = {
							user: user.id,
							id: paymentmanagementdata.account
						};
						Account
							.find(criteria)
							.populate('userBankAccount')
							.then(function (accountDetail) {

								var accountuserbank = accountDetail[0].userBankAccount.id;
								var institutionTypeId = accountDetail[0].institutionType;
								var linkedaccountName = accountDetail[0].accountName;
								var linkedaccountNumber = accountDetail[0].accountNumber;

								_.forEach(accountDetail, function (accountvalue) {

									if (accountvalue.accountNumber) {
										var str = accountvalue.accountNumber;
										accountvalue.accountNumber = str.replace(/\d(?=\d{4})/g, "X");
										var otheraccounts = accountvalue.userBankAccount.accounts;
										_.forEach(otheraccounts, function (otheraccountvalue) {
											if (otheraccountvalue.numbers) {
												var str1 = otheraccountvalue.numbers.account;
												if ("undefined" !== typeof str1 && str1 != '' && str1 != null) {
													otheraccountvalue.numbers.account = str1.replace(/\d(?=\d{4})/g, "X");
												}
											}
										})
									}
								})

								Achdocuments
									.find({ paymentManagement: payID })
									.populate('proofdocument')
									.then(function (documentdata) {

										_.forEach(documentdata, function (documentvalue) {
											//sails.log.info("documentvalue: ",documentvalue.proofdocument);
											if (documentvalue.proofdocument.isImageProcessed) {
												documentvalue.proofdocument.standardResolution = Utils.getS3Url(documentvalue.proofdocument.standardResolution);
											}
										})

										var todaysDate = moment().startOf('day').toDate().getTime();
										setcurrent = 0;
										var nextpaymentDate = '--';
										var pendingSchedule = [];
										var paidSchedule = [];

										_.forEach(paymentmanagementdata.paymentSchedule, function (chargeoffvalue) {

											var paydate = moment(chargeoffvalue.date).add(1, 'days').startOf('day').toDate().getTime();
											var chargeoffdate = moment(chargeoffvalue.date).add(1, 'days').startOf('day').toDate().getTime();


											if (chargeoffvalue.status == "PAID OFF") {
												paidSchedule.push(chargeoffvalue);
											}
											else {
												pendingSchedule.push(chargeoffvalue);
											}

											if (chargeoffvalue.chargeoff == 1) {
												chargeoffvalue.status = "Charge Off";
											}
											else {
												if (paydate < todaysDate && chargeoffvalue.status == 'OPENED') {
													chargeoffvalue.status = "Late";
													if (chargeoffdate < todaysDate) {
														chargeoffvalue.chargeoffres = "Yes";
													}
													else {
														chargeoffvalue.chargeoffres = "No";
													}
												}
												else if (chargeoffvalue.status == "OPENED" && setcurrent == 0) {
													chargeoffvalue.status = "Current";
													setcurrent = setcurrent + 1;
													chargeoffvalue.chargeoffres = "No";
													nextpaymentDate = moment(chargeoffvalue.date).format('LL');
												}
												else if (chargeoffvalue.status == "PAID OFF") {
													chargeoffvalue.status = "Paid Off";
													chargeoffvalue.chargeoffres = "No";
												}
												else {
													chargeoffvalue.status = "Schedule";
													chargeoffvalue.chargeoffres = "No";
												}
											}
											chargeoffvalue.date = moment(chargeoffvalue.date).format('LL');
										})

										paymentmanagementdata.maturityDate = moment(paymentmanagementdata.maturityDate).format('LL');
										paymentmanagementdata.nextPaymentSchedule = moment(paymentmanagementdata.nextPaymentSchedule).format('LL');

										if (!paymentmanagementdata.interestapplied) {
											paymentmanagementdata.interestapplied = feeManagement.interestRate;
										}

										if (!paymentmanagementdata.loantermcount) {
											paymentmanagementdata.loantermcount = feeManagement.loanTerm;
										}

										_.forEach(paymentmanagementdata.usertransactions, function (reapayment) {
											reapayment.amount = parseFloat(reapayment.amount).toFixed(2);
											reapayment.date = moment(reapayment.date).format('LL');
										});

										//--Actual timestamp
										user.createdAt = moment(user.createdAt).format('LLL');
										user.updatedAt = moment(user.updatedAt).format('LLL');


										//sails.log.info("paymentschulde: ",paymentmanagementdata.paymentSchedule);
										var errorval = '';
										var successval = '';
										if (req.session.chargeerror != '') {
											errorval = req.session.chargeerror;
											req.session.chargeerror = '';
										}

										if (req.session.chargesuccess != '') {
											successval = req.session.chargesuccess;
											req.session.chargesuccess = '';
										}

										var repullpayerrorval = '';
										var repullpaysuccessval = '';

										if (req.session.repullpayerrormsg != '') {
											repullpayerrorval = req.session.repullpayerrormsg;
											req.session.repullpayerrormsg = '';
										}

										if (req.session.repullpaysucessmsg != '') {
											repullpaysuccessval = req.session.repullpaysucessmsg;
											req.session.repullpaysucessmsg = '';
										}

										var defaultschudleerrormsg = '';
										var defaultschudlesucessmsg = '';

										if (req.session.defaultschudleerrormsg != '') {
											defaultschudleerrormsg = req.session.defaultschudleerrormsg;
											req.session.defaultschudleerrormsg = '';
										}

										if (req.session.defaultschudlesucessmsg != '') {
											defaultschudlesucessmsg = req.session.defaultschudlesucessmsg;
											req.session.defaultschudlesucessmsg = '';
										}

										var schudlesmsg = '';
										var schudleerrormsg = '';
										var defaultmakepaymentsuccessmsg = '';
										var defaultmakepaymenterrormsg = '';

										if (req.session.schudlesmsg != '') {
											defaultmakepaymentsuccessmsg = req.session.schudlesmsg;
											req.session.schudlesmsg = '';
										}

										if (req.session.schudleerrormsg != '') {
											defaultmakepaymenterrormsg = req.session.schudleerrormsg;
											req.session.schudleerrormsg = '';
										}

										PlaidUser
											.find({ userBankAccount: accountuserbank })
											.then(function (plaidDetails) {

												var institutionName = '';
												Institution
													.findOne({ institutionType: institutionTypeId })
													.then(function (institutionData) {

														if (institutionData) {
															var institutionName = institutionData.institutionName;
														}

														var repullcriteria = {
															user: user.id,
															userBankAccount: accountuserbank,
														};

														Repullbankaccount
															.find(repullcriteria)
															.populate('userBankAccount')
															.sort({ 'createdAt': -1 })
															.then(function (repullDetails) {


																_.forEach(repullDetails, function (repullaccountvalue) {

																	delete repullaccountvalue.userBankAccount;

																	repullaccountvalue.createdAt = moment(repullaccountvalue.createdAt).format("LL");

																	//sails.log.info("repullaccountvalue::",repullaccountvalue);


																	if (repullaccountvalue.accountNumber) {
																		var repullstr = repullaccountvalue.accountNumber;

																		//sails.log.info("repullstr::",repullstr);
																		repullaccountvalue.accountNumber = repullstr.replace(/\d(?=\d{4})/g, "X");

																		//sails.log.info("repullaccountvalue.accountNumber::",repullaccountvalue.accountNumber);
																	}

																	_.forEach(repullaccountvalue.accountsData, function (subrepullaccountvalue) {
																		if (subrepullaccountvalue.numbers) {
																			var subrepullstr = subrepullaccountvalue.numbers.account;
																			if ("undefined" !== typeof subrepullstr && subrepullstr != '' && subrepullstr != null) {
																				subrepullaccountvalue.numbers.account = subrepullstr.replace(/\d(?=\d{4})/g, "X");
																			}
																		}
																	});

																	// sails.log.info("===========================================");
																});


																var accountNumberArray = [];
																var accountDataArray = [];
																var accountcriteria = {
																	user: paymentmanagementdata.user,
																};

																Account
																	.find(accountcriteria)
																	.sort('createdAt DESC')
																	.then(function (accountDetailInfo) {

																		_.forEach(accountDetailInfo, function (accountData) {

																			var accountNumberData = accountData.accountNumber;
																			var arrayres = accountNumberArray.indexOf(accountNumberData);
																			var accountStatus = 0;

																			if (arrayres == '-1') {

																				accountNumberArray.push(accountNumberData);

																				if (accountNumberData == paymentmanagementdata.account.accountNumber) {
																					accountStatus = '1';
																				}

																				//-- Added for ticket no 920
																				var allowBank = 0;
																				if (accountData.achprocessType == 'card') {
																					accountData.institutionType = accountData.accountName;

																					var customertoken = accountData.customertoken;
																					var paymenttoken = accountData.paymenttoken;

																					if ("undefined" !== typeof customertoken && customertoken != '' && customertoken != null && "undefined" !== typeof paymenttoken && paymenttoken != '' && paymenttoken != null) {
																						allowBank = 1;
																					}
																				}
																				else {
																					allowBank = 1;
																				}

																				if (allowBank == 1) {
																					var accountObject = {
																						accountID: accountData.id,
																						accountName: accountData.accountName,
																						accountNumberLastFour: accountData.accountNumberLastFour,
																						institutionType: accountData.institutionType,
																						accountStatus: accountStatus,
																						achprocessType: accountData.achprocessType
																					};
																					accountDataArray.push(accountObject);
																				}
																			}
																		});


																		PaymentManagement
																			.userAccountInfoDetail(accountDataArray)
																			.then(function (accountDataArray) {

																				accountDataArray = _.orderBy(accountDataArray, ['accountStatus'], ['desc']);

																				Makepayment
																					.getFullpayment(paymentmanagementdata.id)
																					.then(function (makePaymentForStory) {


																						var makebuttonshow = 'no';
																						if (makePaymentForStory.code == 200) {

																							var todayDate = moment().startOf('day').format();
																							if ("undefined" !== typeof paymentmanagementdata.makepaymentdate && paymentmanagementdata.makepaymentdate != '' && paymentmanagementdata.makepaymentdate != null) {
																								var lastpaiddate = paymentmanagementdata.makepaymentdate;
																							} else {
																								var lastpaiddate = paymentmanagementdata.paymentSchedule[0].lastpaiddate;
																							}
																							var makepaymentDate = moment(lastpaiddate).startOf('day').format();

																							sails.log.error("makepaymentDate", makepaymentDate);
																							sails.log.error("todayDate", todayDate);

																							if (todayDate >= makepaymentDate) {
																								makebuttonshow = 'yes';
																							}
																						}
																						var vikingCriteria = { payment_id: paymentmanagementdata.id, userId: paymentmanagementdata.user, processType: 4 };
																						VikingRequest.find(vikingCriteria).sort("scheduleDate").then(function (vikingData) {
																							//sails.log.info("----",vikingData);


																							var responsedata = {
																								user: user,
																								profileImage: profileImage,
																								accountDetail: accountDetail,
																								paymentmanagementdata: paymentmanagementdata,
																								achdocumentDetails: documentdata,
																								todaysDate: todaysDate,
																								chargeerror: errorval,
																								chargesuccess: successval,
																								nextpaymentDate: nextpaymentDate,
																								pendingSchedule: pendingSchedule,
																								paidSchedule: paidSchedule,
																								plaidDetails: plaidDetails,
																								institutionTypeId: institutionTypeId,
																								institutionName: institutionName,
																								userbankaccountID: accountuserbank,
																								repullDetails: repullDetails,
																								repullCount: repullDetails.length,
																								repullpayerrorval: repullpayerrorval,
																								repullpaysuccessval: repullpaysuccessval,
																								defaultschudlesucessmsg: defaultschudlesucessmsg,
																								defaultschudleerrormsg: defaultschudleerrormsg,
																								fullPayoffAmount: fullPayoffAmount,
																								minimumAmount: minimumAmount,
																								accountDataArray: accountDataArray,
																								defaultmakepaymentsuccessmsg: defaultmakepaymentsuccessmsg,
																								defaultmakepaymenterrormsg: defaultmakepaymenterrormsg,
																								moment: moment,
																								makePaymentForStory: makePaymentForStory,
																								makebuttonshow: makebuttonshow,
																								vikingConfig: sails.config.vikingConfig,
																								momentDate: moment,
																								vikingData, vikingData
																							};

																							//sails.log.info('AchController#getAchUserDetailsAction :: responsedata', responsedata);
																							res.view("admin/pendingach/viewDefaultUser", responsedata);
																						})
																							.catch(function (err) {
																								sails.log.error('AchController#fetchVikingData :: Error :: ', err);
																								var errors = err.message;
																								sails.log.error('AchController#fetchVikingData :: err', errors);
																								res.view("admin/error/404", {
																									data: err.message,
																									layout: 'layout'
																								});
																							});
																					})
																					.catch(function (err) {
																						sails.log.error('AchController#viewDefaultUserAction :: Error :: ', err);
																						var errors = err.message;
																						sails.log.error('AchController#viewDefaultUserAction :: err', errors);
																						res.view("admin/error/404", {
																							data: err.message,
																							layout: 'layout'
																						});
																					});

																			})
																			.catch(function (err) {
																				sails.log.error('AchController#viewDefaultUserAction :: Error :: ', err);
																				var errors = err.message;
																				sails.log.error('AchController#viewDefaultUserAction :: err', errors);
																				res.view("admin/error/404", {
																					data: err.message,
																					layout: 'layout'
																				});

																			});
																	})
																	.catch(function (err) {
																		sails.log.error('AchController#viewDefaultUserAction :: Error :: ', err);
																		var errors = err.message;
																		sails.log.error('AchController#viewDefaultUserAction :: err', errors);
																		res.view("admin/error/404", {
																			data: err.message,
																			layout: 'layout'
																		});
																	});
															})
															.catch(function (err) {
																sails.log.error('AchController#viewDefaultUserAction :: Error :: ', err);
																var errors = err.message;
																sails.log.error('AchController#viewDefaultUserAction :: err', errors);
																res.view("admin/error/404", {
																	data: err.message,
																	layout: 'layout'
																});
															});
													})
													.catch(function (err) {
														sails.log.error('AchController#viewDefaultUserAction :: Error :: ', err);
														var errors = err.message;
														sails.log.error('AchController#viewDefaultUserAction :: err', errors);
														res.view("admin/error/404", {
															data: err.message,
															layout: 'layout'
														});
													});
											})
											.catch(function (err) {
												sails.log.error('AchController#viewDefaultUserAction :: Error :: ', err);
												var errors = err.message;
												sails.log.error('AchController#viewDefaultUserAction :: err', errors);
												res.view("admin/error/404", {
													data: err.message,
													layout: 'layout'
												});
											});
									})
									.catch(function (err) {
										sails.log.error('AchController#viewDefaultUserAction :: Error :: ', err);
										var errors = err.message;
										sails.log.error('AchController#viewDefaultUserAction :: err', errors);
										res.view("admin/error/404", {
											data: err.message,
											layout: 'layout'
										});
									});
							})
							.catch(function (err) {
								sails.log.error('AchController#viewDefaultUserAction :: Error :: ', err);
								var errors = err.message;
								sails.log.error('AchController#viewDefaultUserAction :: err', errors);
								res.view("admin/error/404", {
									data: err.message,
									layout: 'layout'
								});
							});
					}
				})
				.catch(function (err) {
					var errors = err.message;
					sails.log.error('AchController#viewDefaultUserAction :: err', errors);
					res.view("admin/error/404", {
						data: err.message,
						layout: 'layout'
					});
				});


		})
		.catch(function (err) {
			var errors = err.message;
			sails.log.error('AchController#viewDefaultUserAction :: err', errors);
			res.view("admin/error/404", {
				data: err.message,
				layout: 'layout'
			});
		});
}

function showAllCompleteAction(req, res) {
	var errorval = '';
	var successval = '';
	var newLoanupdateSuccessMsg = '';
	var newLoanupdateMsg = '';
	if (req.session.approveerror != '') {
		errorval = req.session.approveerror;
		req.session.approveerror = '';
	}
	if (req.session.successmsg != '') {
		successval = req.session.successmsg;
		req.session.successmsg = '';
	}
	if ("undefined" !== typeof req.session.newLoanupdateSuccessMsg && req.session.newLoanupdateSuccessMsg != '' && req.session.newLoanupdateSuccessMsg != null) {
		newLoanupdateSuccessMsg = req.session.newLoanupdateSuccessMsg;
		req.session.newLoanupdateSuccessMsg = '';
	}
	if ("undefined" !== typeof req.session.newLoanupdateMsg && req.session.newLoanupdateMsg != '' && req.session.newLoanupdateMsg != null) {
		newLoanupdateMsg = req.session.newLoanupdateMsg;
		req.session.newLoanupdateMsg = '';
	}
	//req.session.viewType="approvedContract"
	var responsedata = {
		approveerror: errorval,
		approvesuccess: successval,
		newLoanupdateMsg: newLoanupdateMsg,
		newLoanupdateSuccessMsg: newLoanupdateSuccessMsg,
		viewStatus: "Approved"
	};
	res.view("admin/pendingach/approveachlist", responsedata);
}

function showAllPerforming(req, res) {
	var errorval = '';
	var successval = '';
	var newLoanupdateSuccessMsg = '';
	var newLoanupdateMsg = '';

	if (req.session.approveerror != '') {
		errorval = req.session.approveerror;
		req.session.approveerror = '';
	}
	if (req.session.successmsg != '') {
		successval = req.session.successmsg;
		req.session.successmsg = '';
	}

	if ("undefined" !== typeof req.session.newLoanupdateSuccessMsg && req.session.newLoanupdateSuccessMsg != '' && req.session.newLoanupdateSuccessMsg != null) {
		newLoanupdateSuccessMsg = req.session.newLoanupdateSuccessMsg;
		req.session.newLoanupdateSuccessMsg = '';
	}
	if ("undefined" !== typeof req.session.newLoanupdateMsg && req.session.newLoanupdateMsg != '' && req.session.newLoanupdateMsg != null) {
		newLoanupdateMsg = req.session.newLoanupdateMsg;
		req.session.newLoanupdateMsg = '';
	}

	var responsedata = {
		approveerror: errorval,
		approvesuccess: successval,
		newLoanupdateMsg: newLoanupdateMsg,
		newLoanupdateSuccessMsg: newLoanupdateSuccessMsg
	};
	res.view("admin/pendingach/performingachlist", responsedata);
}
function showAllCompleted(req, res) {
	var errorval = '';
	var successval = '';
	var newLoanupdateSuccessMsg = '';
	var newLoanupdateMsg = '';

	if (req.session.approveerror != '') {
		errorval = req.session.approveerror;
		req.session.approveerror = '';
	}
	if (req.session.successmsg != '') {
		successval = req.session.successmsg;
		req.session.successmsg = '';
	}
	if ("undefined" !== typeof req.session.newLoanupdateSuccessMsg && req.session.newLoanupdateSuccessMsg != '' && req.session.newLoanupdateSuccessMsg != null) {
		newLoanupdateSuccessMsg = req.session.newLoanupdateSuccessMsg;
		req.session.newLoanupdateSuccessMsg = '';
	}
	if ("undefined" !== typeof req.session.newLoanupdateMsg && req.session.newLoanupdateMsg != '' && req.session.newLoanupdateMsg != null) {
		newLoanupdateMsg = req.session.newLoanupdateMsg;
		req.session.newLoanupdateMsg = '';
	}
	var responsedata = {
		approveerror: errorval,
		approvesuccess: successval,
		newLoanupdateMsg: newLoanupdateMsg,
		newLoanupdateSuccessMsg: newLoanupdateSuccessMsg
	};
	res.view("admin/pendingach/completedachlist", responsedata);
}

function showAllChargeOff(req, res) {
	var errorval = '';
	var successval = '';
	var newLoanupdateSuccessMsg = '';
	var newLoanupdateMsg = '';

	if (req.session.approveerror != '') {
		errorval = req.session.approveerror;
		req.session.approveerror = '';
	}
	if (req.session.successmsg != '') {
		successval = req.session.successmsg;
		req.session.successmsg = '';
	}
	if ("undefined" !== typeof req.session.newLoanupdateSuccessMsg && req.session.newLoanupdateSuccessMsg != '' && req.session.newLoanupdateSuccessMsg != null) {
		newLoanupdateSuccessMsg = req.session.newLoanupdateSuccessMsg;
		req.session.newLoanupdateSuccessMsg = '';
	}
	if ("undefined" !== typeof req.session.newLoanupdateMsg && req.session.newLoanupdateMsg != '' && req.session.newLoanupdateMsg != null) {
		newLoanupdateMsg = req.session.newLoanupdateMsg;
		req.session.newLoanupdateMsg = '';
	}
	var responsedata = {
		approveerror: errorval,
		approvesuccess: successval,
		newLoanupdateMsg: newLoanupdateMsg,
		newLoanupdateSuccessMsg: newLoanupdateSuccessMsg
	};
	res.view("admin/pendingach/chargeoffachlist", responsedata);
}

function showProcedureDateSetAction(req, res) {
	var errorval = '';
	var successval = '';
	if (req.session.approveerror != '') {
		errorval = req.session.approveerror;
		req.session.approveerror = '';
	}
	if (req.session.successmsg != '') {
		successval = req.session.successmsg;
		req.session.successmsg = '';
	}
	//req.session.viewType='procedureDateSet';
	var responsedata = {
		approveerror: errorval,
		approvesuccess: successval
	};
	res.view("admin/pendingach/procedureDateSetachlist", responsedata);
}


function completeApplication(req, res) {
	let viewtype = "approved";
	let checktodaysDate = moment().tz("America/Los_Angeles").startOf('day').format('MM-DD-YYYY');
	if (!!req.param("viewtype")) {
		viewtype = req.param("viewtype");
	}

	let options = { status: 'PENDING' };

	if (viewtype == 'approved') {
		options = { status: "ACTIVE" };
	} else if (viewtype == 'progress') { //performing
		options = {
			status: 'ACTIVE',
			// isPaymentActive: true,
		};
	} else if (viewtype == "completed") {
		options = { status: "COMPLETED" };
	} else if (viewtype == "chargeoff") {
		options = { status: "CHARGEOFF" };
	}
	options["$or"] = [{ moveToArchive: { $exists: false } }, { moveToArchive: { $eq: 0, $exists: true } }];
	// APPROVED / COMPLETE APPLICATION LIST

	PaymentManagement.native(function (err, collection) {
		collection.aggregate([
			// {	$lookup: {
			// 		from: "user",
			// 		localField: "user",
			// 		foreignField: "_id",
			// 		as: "userdata"
			// 	}},
			// 	{
			// 		$unwind: "$userdata"
			// 	},
			{
				$lookup: {
					from: "screentracking",
					localField: "screentracking",
					foreignField: "_id",
					as: "screentracking"
				}
			},
			{
				$unwind: "$screentracking"
			},
			// {	$lookup: {
			// 	from: "achcomments",
			// 	localField: "user",
			// 	foreignField: "user",
			// 	as: "achcomments"
			// }},
			{ $match: options }
		], async function (err, paymentManagementList) {
			if (err) {
				sails.log.error("AchController#completeApplication Err: ", err)
				return res.status(500).json({ error: 'DB error', message: err.message });
			} else {
				let paymentmanagementdata = [];
				// THIS CODE FIXES _.sortBy sorting issue (if a string starts with "C" the sorting doesnt work right)
				for (let item of paymentManagementList) {
					if (item && !!item.user) {
						item["userdata"] = await User.findOne({ id: item.user.toString() });
						item["achcomments"] = await Achcomments.find({ id: item.user.toString() })

						if (item.userdata) {
							if (item.userdata.state) {
								item.userdata.state = item.userdata.state.toLowerCase()
							}
							if (item.achcomments.length > 0) {
								const validDates = item.achcomments.filter(comment => !!Date.parse(comment.reminder))
								const dates = validDates.map(comment => comment.reminder)
								dates.sort((a, b) => new Date(b) - new Date(a));
								item.reminder = moment(dates[0]).format('MM-DD-YYYY')
							} else {
								item.reminder = 'no date'
							}
							paymentmanagementdata.push(item);
						}
					}
				}
				// -----

				if (req.query.sSortDir_0 == 'desc') {
					switch (req.query.iSortCol_0) {
						case '0': paymentmanagementdata = _.sortBy(paymentmanagementdata, '_id').reverse(); break;
						case '1': paymentmanagementdata = _.sortBy(paymentmanagementdata, 'userdata.userReference').reverse(); break;
						case '2': paymentmanagementdata = _.sortBy(paymentmanagementdata, 'loanReference').reverse(); break;
						case '3': paymentmanagementdata = _.sortBy(paymentmanagementdata, 'userdata.firstName').reverse(); break;
						case '4': paymentmanagementdata = _.sortBy(paymentmanagementdata, 'userdata.email').reverse(); break;
						case '5': paymentmanagementdata = _.sortBy(paymentmanagementdata, 'userdata.phoneNumber').reverse(); break;
						case '6': paymentmanagementdata = _.sortBy(paymentmanagementdata, 'payOffAmount').reverse(); break;
						case '7': paymentmanagementdata = _.sortBy(paymentmanagementdata, 'maturityDate').reverse(); break;
						case '8': paymentmanagementdata = _.sortBy(paymentmanagementdata, 'createdAt').reverse(); break;
						case '9': paymentmanagementdata = _.sortBy(paymentmanagementdata, 'reminder').reverse(); break;
						default: break;
					};
				} else {
					switch (req.query.iSortCol_0) {
						case '0': paymentmanagementdata = _.sortBy(paymentmanagementdata, '_id'); break;
						case '1': paymentmanagementdata = _.sortBy(paymentmanagementdata, 'userdata.userReference'); break;
						case '2': paymentmanagementdata = _.sortBy(paymentmanagementdata, 'loanReference'); break;
						case '3': paymentmanagementdata = _.sortBy(paymentmanagementdata, 'userdata.firstName'); break;
						case '4': paymentmanagementdata = _.sortBy(paymentmanagementdata, 'userdata.email'); break;
						case '5': paymentmanagementdata = _.sortBy(paymentmanagementdata, 'userdata.phoneNumber'); break;
						case '6': paymentmanagementdata = _.sortBy(paymentmanagementdata, 'payOffAmount'); break;
						case '7': paymentmanagementdata = _.sortBy(paymentmanagementdata, 'maturityDate'); break;
						case '8': paymentmanagementdata = _.sortBy(paymentmanagementdata, 'createdAt'); break;
						case '9': paymentmanagementdata = _.sortBy(paymentmanagementdata, 'reminder'); break;
						default: break;
					};
				}



				//Filter using search data
				if (req.query.sSearch) {
					let search = req.query.sSearch.toLowerCase();

					paymentmanagementdata = _.filter(paymentmanagementdata, function (item) {
						paymentmanagementdata = _.filter(paymentmanagementdata, function (item) {
							if (item.user && !_.some(pendinguser, (resultList) => { return resultList.id === item._id.toString() })) {
								return true;
							}
						});
						if (!item.userdata) {
							item["userdata"] = {};
						}
						if (item.userdata.userReference != null) {
							if (item.loanReference.toLowerCase().indexOf(search) > -1) {
								return true;
							}
						}
						if (item.loanReference != null) {
							if (item.loanReference.toLowerCase().indexOf(search) > -1) {
								return true;
							}
						}
						if (item.userdata.firstName != null) {
							if (item.userdata.firstName.toLowerCase().indexOf(search) > -1) {
								return true;
							}
						}
						if (item.userdata.email != null) {
							if (item.userdata.email.toLowerCase().indexOf(search) > -1) {
								return true;
							}
						}
						if (item.userdata.phoneNumber != null) {
							if (item.userdata.phoneNumber.indexOf(search) > -1) {
								return true;
							}
						}

						if (item.payOffAmount != null) {
							if (parseInt(item.payOffAmount) == parseInt(search)) {
								return true;
							}
						}
						if (item.maturityDate != null) {
							if (moment(item.maturityDate).format('MM-DD-YYYY') == search) {
								return true;
							}
						}
						if (item.createdAt != null) {
							if (moment(item.createdAt).format('MM-DD-YYYY') == search) {
								return true;
							}
						}
						return false;
					});
				}

				//total records count
				totalrecords = paymentmanagementdata.length;

				//Filter by limit records
				let skiprecord = parseInt(req.query.iDisplayStart);
				let checklimitrecords = skiprecord + parseInt(req.query.iDisplayLength);
				let iDisplayLengthvalue = parseInt(req.query.iDisplayLength) + parseInt(skiprecord);
				if (checklimitrecords > totalrecords) {
					iDisplayLengthvalue = totalrecords;
				}
				paymentmanagementdata = paymentmanagementdata.slice(skiprecord, iDisplayLengthvalue);

				//Final output starts here
				let pendinguser = [];
				paymentmanagementdata.forEach(function (paydata, loopvalue) {
					//Filter user details not available and filter applications that are not archived.

					let userInfo = { id: paydata._id.toString() }
					userInfo.loopid = loopvalue + skiprecord + 1;
					let systemUniqueKeyURL = 'getAchUserDetails/' + paydata._id;

					if (!!paydata.userdata.userReference) {
						userInfo.userReference = paydata.userdata.userReference;
					} else {
						userInfo.userReference = ''
					}
					if (!!paydata.loanReference) {
						userInfo.loanReference = '<a href=\'' + systemUniqueKeyURL + '\'>' + paydata.loanReference + '</a>';
					}
					if (!!paydata.userdata.firstName && !!paydata.userdata.lastname) {
						userInfo.name = paydata.userdata.firstName + " " + paydata.userdata.lastname;
					}
					if (!!paydata.userdata.email) {
						userInfo.email = paydata.userdata.email;
					}
					if (!!paydata.screentracking.origin) {
						userInfo.origin = paydata.screentracking.origin
					} else {
						userInfo.origin = '--'
					}
					if (!!paydata.userdata.phoneNumber) {
						userInfo.phoneNumber = paydata.userdata.phoneNumber;
					}
					if (!!paydata.userdata.state) {
						userInfo.state = paydata.userdata.state.toUpperCase();
					}
					if (!!paydata.screentracking.requestedLoanAmount) {
						userInfo.payOffAmount = paydata.screentracking.requestedLoanAmount;
					} else {
						userInfo.payOffAmount = "--";
					}
					if (!!paydata.maturityDate) {
						userInfo.maturityDate = moment(paydata.maturityDate).format("MM-DD-YYYY");
					}
					if (!!paydata.createdAt) {
						userInfo.createdAt = moment(paydata.createdAt).tz("America/los_angeles").format("MM-DD-YYYY");
					}
					userInfo.reminder = paydata.reminder == 'no date' ? '--' : paydata.reminder;

					pendinguser.push(userInfo);
				});

				var json = {
					sEcho: req.query.sEcho,
					iTotalRecords: totalrecords,
					iTotalDisplayRecords: totalrecords,
					aaData: pendinguser
				};
				res.contentType('application/json');
				res.json(json);
			}
		})
	})
}

function addchargeoffAction(req, res) {

	var payID = req.param('id');
	var rowID = req.param('rowid');

	if (payID) {
		var options = {
			id: payID
		};



		PaymentManagement.findOne(options)
			.then(function (paymentmanagementdata) {

				chargeoffAmount = 0;
				var statusPaidLength = 0;
				//var scheduleData = _.filter(initialschedulelist, {  'uniqueScheduleId': uniqueScheduleId });
				_.forEach(paymentmanagementdata.paymentSchedule, function (schedule, key) {
					if (rowID == key) {

						var userid = paymentmanagementdata.user;
						var amount = schedule.amount;
						schedule.status = 'PAID OFF';
						schedule.chargeoff = 1;
						schedule.amount = 0;
						/*var uniqueScheduleId = schedule.uniqueScheduleId;
						var intialschedule = schedule;
						VikingRequest
						.createchrageoffSchedule(userid,paymentmanagementdata,amount,uniqueScheduleId,intialschedule)
						.then(function(chargeoffres){
								 sails.log.info("chargeoffres",chargeoffres);
								if(chargeoffres.code==200)
								{
								chargeoffAmount =amount;
								paymentmanagementdata.logs.push({
									 message: 'Charge off for '+amount,
									 date: new Date()
								 });
								}
						});*/
					}

					if (schedule.status == 'PAID OFF') {
						statusPaidLength = statusPaidLength + 1
					}
				})
				if (statusPaidLength === paymentmanagementdata.paymentSchedule.length) {
					paymentmanagementdata.status = 'PAID OFF';
				}
				paymentmanagementdata.paymentSchedule = _.orderBy(paymentmanagementdata.paymentSchedule, ['status'], ['asc']);
				paymentmanagementdata.save(function (err) {

					if (err) {
						req.session.chargeerror = '';
						req.session.chargeerror = 'Unable to update charge off. Try again!';
						return res.redirect("/admin/viewDefaultUser/" + payID);
					}
					else {
						//Log Activity
						var modulename = 'Charge off update';
						var modulemessage = 'Charge off updated successfully for $ ' + chargeoffAmount;
						req.achlog = 1;
						req.payID = payID;
						req.logdata = paymentmanagementdata;
						Logactivity.registerLogActivity(req, modulename, modulemessage);

						var allParams = {
							subject: modulename,
							comments: modulemessage
						}

						Achcomments
							.createAchComments(allParams, payID)
							.then(function (achcomments) {

								req.session.chargesuccess = '';
								req.session.chargesuccess = 'Charge off updated successfully';
								return res.redirect("/admin/viewDefaultUser/" + payID);

							}).catch(function (err) {

								req.session.chargesuccess = '';
								req.session.chargesuccess = 'Unable to update charge off. Try again!';
								return res.redirect("/admin/viewDefaultUser/" + payID);

							});
					}
				});
			})
			.catch(function (err) {
				req.session.chargeerror = '';
				req.session.chargeerror = 'Unable to update charge off. Try again!';
				return res.redirect("/admin/viewDefaultUser/" + payID);
			});
	}
	else {
		req.session.chargeerror = '';
		req.session.chargeerror = 'Unable to update charge off. Try again!';
		return res.redirect("/admin/viewDefaultUser/" + payID);
	}

}

function showAllBlockedAction(req, res) {

	var errorval = '';
	var successval = '';
	if (req.session.releaseerror != '') {
		errorval = req.session.releaseerror;
		req.session.releaseerror = '';
	}

	if (req.session.releasesuccess != '') {
		successval = req.session.releasesuccess;
		req.session.releasesuccess = '';
	}

	var responsedata = {
		releaseerror: errorval,
		releasesuccess: successval
	};

	res.view("admin/pendingach/blockedachList", responsedata);
}

function ajaxBlockedAchAction_old(req, res) {

	var options = {
		status: 'OPENED',
		isPaymentActive: true,
		achstatus: { $eq: 3, $exists: true },
	};

	PaymentManagement.find(options)
		.populate('user')
		.exec(function (err, paymentmanagementdata) {
			if (err) {
				res.send(500, { error: 'DB error' });
			} else {

				if (req.query.sSortDir_0 == 'desc') {

					switch (req.query.iSortCol_0) {
						case '0': paymentmanagementdata = _.sortBy(paymentmanagementdata, '_id').reverse(); break;
						case '1': paymentmanagementdata = _.sortBy(paymentmanagementdata, 'loanReference').reverse(); break;
						case '2': paymentmanagementdata = _.sortBy(paymentmanagementdata, 'user.name').reverse(); break;
						case '3': paymentmanagementdata = _.sortBy(paymentmanagementdata, 'user.screenName').reverse(); break;
						case '4': paymentmanagementdata = _.sortBy(paymentmanagementdata, 'user.email').reverse(); break;
						case '5': paymentmanagementdata = _.sortBy(paymentmanagementdata, 'user.phoneNumber').reverse(); break;
						case '6': paymentmanagementdata = _.sortBy(paymentmanagementdata, 'payOffAmount').reverse(); break;
						case '7': paymentmanagementdata = _.sortBy(paymentmanagementdata, 'maturityDate').reverse(); break;
						case '8': paymentmanagementdata = _.sortBy(paymentmanagementdata, 'createdAt').reverse(); break;
						default: break;
					};

				}
				else {
					switch (req.query.iSortCol_0) {
						case '0': paymentmanagementdata = _.sortBy(paymentmanagementdata, '_id'); break;
						case '1': paymentmanagementdata = _.sortBy(paymentmanagementdata, 'loanReference'); break;
						case '2': paymentmanagementdata = _.sortBy(paymentmanagementdata, 'user.name'); break;
						case '3': paymentmanagementdata = _.sortBy(paymentmanagementdata, 'user.screenName'); break;
						case '4': paymentmanagementdata = _.sortBy(paymentmanagementdata, 'user.email'); break;
						case '5': paymentmanagementdata = _.sortBy(paymentmanagementdata, 'user.phoneNumber'); break;
						case '6': paymentmanagementdata = _.sortBy(paymentmanagementdata, 'payOffAmount'); break;
						case '7': paymentmanagementdata = _.sortBy(paymentmanagementdata, 'maturityDate'); break;
						case '8': paymentmanagementdata = _.sortBy(paymentmanagementdata, 'createdAt'); break;
						default: break;
					};
				}

				//Filter user details not available
				paymentmanagementdata = _.filter(paymentmanagementdata, function (item) {
					if (item.user) {
						return true;
					}
				});

				//Filter using search data
				if (req.query.sSearch) {
					var search = req.query.sSearch.toLowerCase();

					paymentmanagementdata = _.filter(paymentmanagementdata, function (item) {
						if (item.loanReference != null) {
							if (item.loanReference.toLowerCase().indexOf(search) > -1) {
								return true;
							}
						}

						if (item.user.name != null) {
							if (item.user.name.toLowerCase().indexOf(search) > -1) {
								return true;
							}
						}

						if (item.user.screenName != null) {
							if (item.user.screenName.toLowerCase().indexOf(search) > -1) {
								return true;
							}
						}
						if (item.user.email != null) {
							if (item.user.email.toLowerCase().indexOf(search) > -1) {
								return true;
							}
						}
						if (item.user.phoneNumber != null) {
							if (item.user.phoneNumber.indexOf(search) > -1) {
								return true;
							}
						}

						if (item.payOffAmount != null) {
							if (parseInt(item.payOffAmount) == parseInt(search)) {
								return true;
							}
						}

						if (item.maturityDate != null) {
							if (moment(item.maturityDate).format('MM-DD-YYYY') == search) {
								return true;
							}
						}


						if (item.createdAt != null) {
							if (moment(item.createdAt).format('MM-DD-YYYY') == search) {
								return true;
							}
						}


						return false;
					});
				}

				//total records count
				totalrecords = paymentmanagementdata.length;

				//Filter by limit records
				var p = parseInt(req.query.iDisplayStart) + 1;
				skiprecord = parseInt(req.query.iDisplayStart);
				checklimitrecords = skiprecord + parseInt(req.query.iDisplayLength);
				if (checklimitrecords > totalrecords) {
					iDisplayLengthvalue = totalrecords;
				}
				else {
					//iDisplayLengthvalue=req.query.iDisplayLength;
					iDisplayLengthvalue = parseInt(req.query.iDisplayLength) + parseInt(skiprecord);
				}
				paymentmanagementdata = paymentmanagementdata.slice(skiprecord, iDisplayLengthvalue);


				//Final output starts here
				var pendinguser = [];
				paymentmanagementdata.forEach(function (paydata, loopvalue) {

					loopid = loopvalue + skiprecord + 1;

					var payuserName = '';
					var payuserscreenName = '';
					var payuserEmail = '';
					var payuserphoneNumber = '';
					if (paydata.user) {
						if (paydata.user.name != '' && paydata.user.name != null) {
							var payuserName = paydata.user.name;
						}
						if (paydata.user.screenName != '' && paydata.user.screenName != null) {
							var payuserscreenName = paydata.user.screenName;
						}
						if (paydata.user.email != '' && paydata.user.email != null) {
							var payuserEmail = paydata.user.email;
						}
						if (paydata.user.phoneNumber != '' && paydata.user.phoneNumber != null) {
							var payuserphoneNumber = paydata.user.phoneNumber;
						}
					}

					systemUniqueKeyURL = 'getAchUserDetails/' + paydata.id;

					if (paydata.loanReference != '' && paydata.loanReference != null) {
						var payloanReference = '<a href=\'' + systemUniqueKeyURL + '\'>' + paydata.loanReference + '</a>';
					} else {
						var payloanReference = '--';
					}
					paydata.maturityDate = moment(paydata.maturityDate).format('MM-DD-YYYY');
					paydata.createdAt = moment(paydata.createdAt).tz("America/los_angeles").format('MM-DD-YYYY hh:mm:ss');

					//systemUniqueKeyURL = 'getAchUserDetails/'+paydata.user.systemUniqueKey;
					//systemUniqueKeyURL = 'getAchUserDetails/'+paydata.user.id;


					var payuserNameLink = '<a href=\'' + systemUniqueKeyURL + '\'>' + payuserName + '</a>';

					var statusicon = '<a href="/admin/getAchUserDetails/' + paydata.id + '"><i class="fa fa-eye" aria-hidden="true" style="cursor:pointer;color:#337ab7;"></i></a>';

					if (payuserEmail) {
						var emillnk = '<a href="mailto:' + payuserEmail + '">' + payuserEmail + '</a>';
					}

					pendinguser.push({ loopid: loopid, loanReference: payloanReference, name: payuserNameLink, screenName: payuserscreenName, email: payuserEmail, phoneNumber: payuserphoneNumber, payOffAmount: paydata.payOffAmount, maturityDate: paydata.maturityDate, createdAt: paydata.createdAt, status: statusicon });
				});

				var json = {
					sEcho: req.query.sEcho,
					iTotalRecords: totalrecords,
					iTotalDisplayRecords: totalrecords,
					aaData: pendinguser
				};
				res.contentType('application/json');
				res.json(json);
			}
		});

}

function ajaxBlockedAchAction(req, res) {

	//Sorting
	var colS = "";

	if (req.query.sSortDir_0 == 'desc') {
		sorttype = -1;
	}
	else {
		sorttype = 1;
	}
	if (req.query.sSearch) {
		var criteria = {
			iscompleted: [0, 2],
		};

	}
	else {
		var criteria = {
			iscompleted: [0, 2]
		};
	}

	if ("undefined" !== typeof req.session.adminpracticeID && req.session.adminpracticeID != '' && req.session.adminpracticeID != null) {
		var options = {
			blockedList: true,
			practicemanagement: req.session.adminpracticeID
		};
	}
	else {
		var options = {
			blockedList: true
		};
	}


	Screentracking
		.find(options)
		.populate('user')
		.then(function (screentracking) {

			if (req.query.sSortDir_0 == 'desc') {
				switch (req.query.iSortCol_0) {
					case '0': screentracking = _.sortBy(screentracking, '_id').reverse(); break;
					case '1': screentracking = _.sortBy(screentracking, 'applicationReference').reverse(); break;
					case '2': screentracking = _.sortBy(screentracking, 'user.firstName').reverse(); break;
					//case '3': screentracking = _.sortBy(screentracking, 'user.directMail').reverse(); break;
					//case '4': screentracking = _.sortBy(screentracking, 'user.badList').reverse(); break;
					case '3': screentracking = _.sortBy(screentracking, 'user.email').reverse(); break;
					case '4': screentracking = _.sortBy(screentracking, 'user.phoneNumber').reverse(); break;
					case '5': screentracking = _.sortBy(screentracking, 'practicemanagement.PracticeName').reverse(); break;
					case '6': screentracking = _.sortBy(screentracking, 'user.registeredtype').reverse(); break;
					case '7': screentracking = _.sortBy(screentracking, 'createdAt').reverse(); break;
					case '11': screentracking = _.sortBy(screentracking, 'lastScreenName').reverse(); break;
					case '12': screentracking = _.sortBy(screentracking, 'user.underwriter').reverse(); break;
					//case '11': screentracking = _.sortBy(screentracking, 'user.lastname').reverse(); break;
					default: break;
				};
			}
			else {
				switch (req.query.iSortCol_0) {
					case '0': screentracking = _.sortBy(screentracking, '_id'); break;
					case '1': screentracking = _.sortBy(screentracking, 'applicationReference'); break;
					case '2': screentracking = _.sortBy(screentracking, 'user.firstName'); break;
					//case '3': screentracking = _.sortBy(screentracking, 'user.directMail').reverse(); break;
					//case '4': screentracking = _.sortBy(screentracking, 'user.badList').reverse(); break;
					case '3': screentracking = _.sortBy(screentracking, 'user.email').reverse(); break;
					case '4': screentracking = _.sortBy(screentracking, 'user.phoneNumber').reverse(); break;
					case '5': screentracking = _.sortBy(screentracking, 'practicemanagement.PracticeName').reverse(); break;
					case '6': screentracking = _.sortBy(screentracking, 'user.registeredtype').reverse(); break;
					case '7': screentracking = _.sortBy(screentracking, 'createdAt').reverse(); break;
					case '11': screentracking = _.sortBy(screentracking, 'lastScreenName').reverse(); break;
					case '12': screentracking = _.sortBy(screentracking, 'user.underwriter').reverse(); break;
					//case '11': screentracking = _.sortBy(screentracking, 'user.lastname').reverse(); break;
					default: break;
				};
			}

			//Filter user details not available
			screentracking = _.filter(screentracking, function (item) {
				if (item.user) {
					return true;
				}
			});

			screentracking = _.filter(screentracking, function (item) {
				if (item.user.email != '' && item.user.email != null) {
					return true;
				}
			});

			//Filter using search data
			if (req.query.sSearch) {
				var search = req.query.sSearch.toLowerCase();
				screentracking = _.filter(screentracking, function (item) {
					if (item.applicationReference != null) {
						if (item.applicationReference.toLowerCase().indexOf(search) > -1) {
							return true;
						}
					}

					if (item.user.firstName != null) {
						if (item.user.firstName.toLowerCase().indexOf(search) > -1) {
							return true;
						}
					}

					if (item.user.lastname != null) {
						if (item.user.lastname.toLowerCase().indexOf(search) > -1) {
							return true;
						}
					}

					if (item.user.underwriter != null) {
						if (item.user.underwriter.toLowerCase().indexOf(search) > -1) {
							return true;
						}
					}

					/*if(item.user.screenName!=null)
					{
						if(item.user.screenName.toLowerCase().indexOf(search)>-1 )
						{
							return true;
						}
					}*/

					if (item.user.email != null) {
						if (item.user.email.toLowerCase().indexOf(search) > -1) {
							return true;
						}
					}

					if (item.user.phoneNumber != null) {
						if (item.user.phoneNumber.indexOf(search) > -1) {
							return true;
						}
					}

					if (item.lastScreenName != null) {
						if (item.lastScreenName.toLowerCase().indexOf(search) > -1) {
							return true;
						}
					}

					if (item.createdAt != null) {
						if (moment(item.createdAt).format('MM-DD-YYYY') == search) {
							return true;
						}
					}

					if (item.practicemanagement) {
						if (item.practicemanagement.PracticeName != null) {
							if (item.practicemanagement.PracticeName.indexOf(search) > -1) {
								return true;
							}
						}
					}
					return false;

				});
			}


			totalrecords = screentracking.length;


			//Filter by limit records
			skiprecord = parseInt(req.query.iDisplayStart);
			checklimitrecords = skiprecord + parseInt(req.query.iDisplayLength);
			if (checklimitrecords > totalrecords) {
				iDisplayLengthvalue = parseInt(totalrecords);
			}
			else {
				iDisplayLengthvalue = parseInt(req.query.iDisplayLength) + parseInt(skiprecord);
			}



			screentracking = screentracking.slice(skiprecord, iDisplayLengthvalue);

			var screentrackingDetails = [];

			screentracking.forEach(function (screentrackingdata, loopvalue) {
				loopid = loopvalue + skiprecord + 1;
				screentrackingdata.createdAt = moment(screentrackingdata.createdAt).tz("america/los_angeles").format('MM-DD-YYYY hh:mm:ss');
				if ("undefined" === typeof screentrackingdata.applicationReference || screentrackingdata.applicationReference == '' || screentrackingdata.applicationReference == null) {
					screentrackingdata.applicationReference = '--';
				}
				if ("undefined" === typeof screentrackingdata.user.firstName || screentrackingdata.user.firstName == '' || screentrackingdata.user.firstName == null) {
					screentrackingdata.user.firstName = '--';
				}
				else {

					var fullname = screentrackingdata.user.firstName + ' ' + screentrackingdata.user.lastname;
				}


				/*if ("undefined" === typeof screentrackingdata.lastScreenName || screentrackingdata.lastScreenName=='' || screentrackingdata.lastScreenName==null)
				{
					screentrackingdata.user.screenName= '--';
				}*/

				if ("undefined" === typeof screentrackingdata.user.email || screentrackingdata.user.email == '' || screentrackingdata.user.email == null) {
					screentrackingdata.user.email = '--';
				}

				if ("undefined" === typeof screentrackingdata.user.phoneNumber || screentrackingdata.user.phoneNumber == '' || screentrackingdata.user.phoneNumber == null) {
					screentrackingdata.user.phoneNumber = '--';
				}
				if (screentrackingdata.user.email) {
					var emillnk = '<a href="mailto:' + screentrackingdata.user.email + '">' + screentrackingdata.user.email + '</a>';
				}
				if (screentrackingdata.applicationReference) {
					var appReference = ' <a href="/admin/viewBlocked/' + screentrackingdata.id + '">' + screentrackingdata.applicationReference + '</a>';
				}


				if ("undefined" === typeof screentrackingdata.user.underwriter || screentrackingdata.user.underwriter == '' || screentrackingdata.user.underwriter == null) {
					screentrackingdata.user.underwriter = '--';
				}

				/*&nbsp;&nbsp; <a href="/admin/deleteScreenDetails/'+screentrackingdata.id+'" onclick="return confirm(\'Are you sure?\')"><i class="fa fa-trash" aria-hidden="true" style="cursor:pointer;color:#FF0000;"></i></a> */


				if (screentrackingdata.user.registeredtype != 'signup') {
					statusicon = ' <a href="/admin/loanofferinfo/' + screentrackingdata.id + '"><i class="fa fa-money" aria-hidden="true" style="cursor:pointer;color:#337ab7;"></i></a> &nbsp;&nbsp;<input type="checkbox" id="screenlist" name="screenlist[]" value="' + screentrackingdata.id + '">';
				} else {
					statusicon = '<input type="checkbox" id="screenlist" name="screenlist[]" value="' + screentrackingdata.id + '">';
				}



				if (screentrackingdata.user.isBankAdded == true) {
					var plaidLink = 'Yes';
				}
				else {
					var plaidLink = 'No';
				}



				// if(screentrackingdata.user.directMail == 1)
				// {
				// 	var directMailUser= 'Yes';
				// }
				// else if(screentrackingdata.user.directMail == 2)
				// {
				// 	var directMailUser= 'No';
				// }
				// else {
				// 	var directMailUser= '--';
				// }

				//badList
				if (screentrackingdata.user.badList == 1) {
					var badListUser = 'Yes';
				}
				else if (screentrackingdata.user.badList == 2) {
					var badListUser = 'No';
				}
				else {
					var badListUser = '--';
				}



				if (screentrackingdata.iscompleted == 2) {
					var promissoryNoteSign = 'Yes';
				}
				else {
					var promissoryNoteSign = 'No';
				}


				var isEmailVerified = screentrackingdata.user.isEmailVerified;
				var isBankAdded = screentrackingdata.user.isBankAdded;
				var isGovernmentIssued = screentrackingdata.user.isGovernmentIssued;
				var isPayroll = screentrackingdata.user.isPayroll;
				var totdocount = 0;
				if (!isEmailVerified) {
					totdocount++;
				}

				if (!isBankAdded) {

					totdocount++;
				}

				if (!isGovernmentIssued) {
					totdocount++;
				}

				if (!isPayroll) {
					totdocount++;
				}

				var practicename = '--';
				if (paydata.practicemanagement) {
					if (paydata.practicemanagement.PracticeName != '' && paydata.practicemanagement.PracticeName != null) {
						var practicename = paydata.practicemanagement.PracticeName;
					}
				}

				screentrackingDetails.push({
					loopid: loopid,
					applicationReference: appReference,
					name: fullname,
					//directMail: directMailUser,
					//badList: badListUser,
					email: screentrackingdata.user.email,
					phoneNumber: screentrackingdata.user.phoneNumber,
					practicename: practicename,
					registeredtype: screentrackingdata.user.registeredtype,
					createdAt: screentrackingdata.createdAt,
					promissoryNoteSign: promissoryNoteSign,
					plaidLink: plaidLink,
					toDoList: totdocount,
					lastScreenName: screentrackingdata.lastScreenName,
					underwriter: screentrackingdata.user.underwriter,
					status: statusicon
				});

			});

			//console.log("screentrackingDetails----",screentrackingDetails)

			var json = {
				sEcho: req.query.sEcho,
				iTotalRecords: totalrecords,
				iTotalDisplayRecords: totalrecords,
				aaData: screentrackingDetails
			};

			res.contentType('application/json');
			res.json(json);
		});

}

function releaseAppAction(req, res) {

	var payID = req.param('paymentID');
	var allParams = req.allParams();
	if (payID) {
		var options = {
			id: payID
		};

		PaymentManagement.findOne(options)
			.then(function (paymentmanagementdata) {

				paymentmanagementdata.achstatus = 0;
				paymentmanagementdata.save(function (err) {
					if (err) {
						req.session.releaseerror = '';
						req.session.releaseerror = 'Unable to Release the Application. Try again!';
						return res.redirect("/admin/showAllBlocked");
					}
					else {
						//Log Activity
						var modulename = 'Release Blocked Application';
						var modulemessage = 'Released successfully';
						req.achlog = 1;
						req.payID = payID;
						req.logdata = paymentmanagementdata;
						Logactivity.registerLogActivity(req, modulename, modulemessage);


						Achcomments
							.createAchComments(allParams, payID)
							.then(function (achcomments) {

								req.session.releasesuccess = '';
								req.session.releasesuccess = 'Application Released successfully';
								return res.redirect("/admin/showAllBlocked");

							}).catch(function (err) {
								req.session.releaseerror = '';
								req.session.releaseerror = 'Unable to Release the Application. Try again!';
								return res.redirect("/admin/showAllBlocked/");
							});



					}
				});

			})
			.catch(function (err) {
				req.session.releaseerror = '';
				req.session.releaseerror = 'Unable to Release the Application. Try again!';
				return res.redirect("/admin/showAllBlocked/");
			});
	}
	else {
		req.session.releaseerror = '';
		req.session.releaseerror = 'Unable to Release the Application. Try again!';
		return res.redirect("/admin/showAllBlocked/");
	}

}

/* Approve loan from admin panel and process ACH starts here*/
function approveUserLoanAction(req, res) {

	var payID = req.param('paymentID');
	var allParams = req.allParams();
	if (payID) {
		/*var initialData ='checkUserTransferStatus cron called \n';
		fs.appendFile('checktransferlog.txt', initialData , function (err) {

				if (err) txthrow err;
		});*/

		var options = { id: payID, achstatus: 0 };
		PaymentManagement.findOne(options)
			.populate('user')
			.populate('account')
			.then(function (paymentmanagementdata) {

				var accountid = paymentmanagementdata.account.id;
				var acccriteria = { accounts: accountid };

				Screentracking
					.findOne(acccriteria)
					.sort("createdAt DESC")
					.then(function (userscreenres) {
						var plaiduserid = userscreenres.plaiduser;
						var plaidcriteria = { id: plaiduserid };


						PlaidUser
							.find(plaidcriteria)
							.then(function (plaidUsers) {


								//var customerToken = paymentmanagementdata.user.customertoken;
								//var customerToken = paymentmanagementdata.account.customertoken;
								//var paymentToken = paymentmanagementdata.account.paymenttoken;
								/*var statename = plaidUsers[0].addresses[0].data.state;
								var username = plaidUsers[0].names[0];
								var cityname =plaidUsers[0].addresses[0].data.city;
								var zipcode = plaidUsers[0].addresses[0].data.zip;
								var streetname = plaidUsers[0].addresses[0].data.street;
								//Fetch user first name and last name
								if(username!='')
								{
									var mystring  = username.split(" ");
									var size = mystring.length;
									if(size==1){
										var FirstName = mystring[0];
										var LastName = mystring[0];
									}else if(size == 2){
		
										var FirstName = mystring[0];
										var LastName = mystring[1];
									}
									else if(size == 3){
										var FirstName = mystring[0];
										var LastName = mystring[1]+" "+mystring[2];
									}
		
		
									//Fetch state details
									if(statename){
										var statecode	= statename;
									}else{
										var statecode	='CA';
									}*/

								//process.exit(1);
								AchService.createViking(paymentmanagementdata, req, res)
									.then(function (result) {

										//return 1;

										ApplicationService
											.reGeneratepromissorypdf(paymentmanagementdata.id, paymentmanagementdata.user.id, req, res)
											.then(function (generatedResponse) {
												/*req.session.successmsg='';
												req.session.successmsg = 'Loan has been approved successfully';
												return res.redirect("admin/getAchDetails");*/

												//sails.log(generatedResponse);

												//process.exit(1);
												//return 1;

												//if(result)
												if (result.code == 200) {

													/*var nextPaymentSchedule ='';
													var maturityDate ='';
													counter = 1;
													var lastdayscounter = 0;
													var addDaysvalue =14;
													var lastaddDaysvalue =14;
			
													_.forEach(paymentmanagementdata.paymentSchedule, function(schedule) {
														addDaysvalue = parseInt(counter)*14;
														 var startdate = moment().startOf('day').add(addDaysvalue, 'days').toDate();
														 var formatedate = moment().startOf('day').add(addDaysvalue, 'days').format('ddd, MMM Do YYYY');
			
														 if(parseInt(lastdayscounter)>0)
														 {
															lastaddDaysvalue = parseInt(lastdayscounter)*14;
															var lastpaiddate = moment().startOf('day').add(lastaddDaysvalue, 'days').toDate();
														 }
														 else
														 {
																var lastpaiddate = moment().startOf('day').toDate();
														 }
														 schedule.date = startdate;
														 schedule.formatedate = formatedate;
														 schedule.lastpaiddate = lastpaiddate;
			
														 if(counter==1)
														 {
															nextPaymentSchedule = startdate;
														 }
														 maturityDate = startdate;
														 counter++;
														 lastdayscounter++;
													});*/

													/*paymentmanagementdata.achstatus =1;
													paymentmanagementdata.transferstatus =1;
													paymentmanagementdata.nextPaymentSchedule = nextPaymentSchedule;
													paymentmanagementdata.maturityDate = maturityDate;
													paymentmanagementdata.loanPaymentType = "Viking";
													paymentmanagementdata.transactionStatus = "Sent";
													paymentmanagementdata.transfertransactionid = result.uniqueReferenceID;
													paymentmanagementdata.approvedunderwriter  = req.user.name;*/

													//paymentmanagementdata.transfertransactionid = achresponseData.achID;
													//paymentmanagementdata.achId = achresponseData.achID;

													//paymentmanagementdata.save();

													//Comments Section Start
													/*var modulename    = 'Loan Approved';
													var modulemessage = 'Loan has been approved successfully';
													 var allParams={
														 subject : modulename,
														 comments : modulemessage
														}
													var adminemail = req.user.email;
													Achcomments
													 .createAchComments(allParams,payID,adminemail)
													 .then(function (achcomments) {
													 }).catch(function (err) {
													 });*/
													//Comments Section end




													User.callFundedEmail(paymentmanagementdata.id)
														.then(function (userObjectData) {

															/*var modulename = 'Add pending applications Comment';
															var modulemessage = 'Pending applications comment added successfully';
															req.achlog = 1;
															req.logdata=req.form;
															req.payID= payID;
															Logactivity.registerLogActivity(req,modulename,modulemessage);*/

															var modulename = 'Loan Funded';
															var modulemessage = 'Pending applications move funded successfully';
															req.achlog = 1;
															req.payID = payID;
															Logactivity.registerLogActivity(req, modulename, modulemessage);


														})
														.catch(function (err) {
															sails.log.error('#AchController:approveUserLoanAction:callFundedEmail :: err :', err);
															return res.handleError(err);
														});

													req.session.successmsg = '';
													req.session.successmsg = 'Loan has been approved successfully';
													return res.redirect("admin/getAchDetails");
												}
												else {
													req.session.approveerror = '';
													req.session.approveerror = 'Unable to approve the loan. Try again!';
													return res.redirect("admin/getAchDetails");
												}

											}).catch(function (err) {
												sails.log.error('AchService#originateTransactionForStory :: Error in Authorizarion :: ', err);
												return reject({
													code: 500,
													message: 'INTERNAL_SERVER_ERROR'
												});
											});
									})
									.catch(function (err) {
										req.session.approveerror = '';
										req.session.approveerror = 'Unable to approve the loan. Try again!';
										return res.redirect("admin/getAchDetails");
									});
								/*}
								else
								{
									req.session.approveerror='';
									req.session.approveerror = 'Invalid user details. Try again!';
									return res.redirect("admin/getAchDetails");
								}*/


							})
							.catch(function (err) {
								req.session.approveerror = '';
								req.session.approveerror = 'Unable to Approve the loan. Try again!';
								return res.redirect("admin/getAchDetails");
							});
					})
					.catch(function (err) {
						req.session.approveerror = '';
						req.session.approveerror = 'Unable to Approve the loan. Try again!';
						return res.redirect("admin/getAchDetails");
					});
			}).catch(function (err) {
				req.session.approveerror = '';
				req.session.approveerror = 'Unable to Approve the loan. Try again!';
				return res.redirect("admin/getAchDetails");
			});
	}
	else {
		req.session.approveerror = '';
		req.session.approveerror = 'Unable to Approve the loan. Try again!';
		return res.redirect("admin/getAchDetails");
	}
}


async function sendAddBankInvite(req, res) {
	const id = req.param('id');
	let payID;
	let screenID;
	let redirect = "/admin/dashboard";
	try {
		if (!id) {
			throw new Error("Contract id required");
		}
		let userData;
		if (id.startsWith("p")) {
			payID = id.slice(1);
			redirect = "/admin/getAchUserDetails/" + payID;
			const payData = await PaymentManagement.findOne({ id: payID }).populate("user");
			if (!payData || !payData.user) {
				throw new Error("Contract not found");
			}
			userData = payData.user;
		} else {
			screenID = id.slice(1);
			redirect = "/admin/viewIncomplete/" + screenID;
			const screenData = await Screentracking.findOne({ id: screenID }).populate("user");
			if (!screenData || !screenData.user) {
				throw new Error("Application not found");
			}
			userData = screenData.user;
		}

		await EmailService.sendAddBankInvitation(userData);
		var userreq = {
			userid: userData.id,
			logdata: userData.email + ` - Admin: Sent 'Add Another Bank' request.`
		};
		Useractivity.createUserActivity(userreq, 'Add Another Bank', 'Add Another Bank email');

		req.session.successmsg = '';
		req.session.successmsg = 'Add bank invitation email has been sent successfully.';
		req.session.banksuccessmsg = '';
		req.session.banksuccessmsg = 'success';
		return res.redirect(redirect);
	} catch (err) {
		req.session.bankerror = '';
		req.session.bankerror = 'Unable to send change bank link. Try again!';
		return res.redirect(redirect);
	}
}

function manageReconciliationAction(req, res) {
	var responsedata = {};
	res.view("admin/reconciliation/managereconciliationList", responsedata);
}

function ajaxReconciliationList(req, res) {
	var options = {
		methodtype: [3, 4, 5],
		//achType:[ "creditscore", "creditscorerenewal", "loan" ]
		achType: 'loan'
		//achType: { $eq: 'loan', $exists: true }
		//$or : [ { achType: { $eq: 'loan', $exists: true } }, { achType:{ $exists: false }}  ] ,
		//achType:'loan'
		//appfailure: 1,
		//apiresponsestatus:3
	};

	Achhistory.find(options)
		.populate('user')
		.populate('paymentManagement')
		.exec(function (err, achhistoryData) {
			if (err) {
				res.send(500, { error: 'DB error' });
			}
			else {
				if (req.query.sSortDir_0 == 'desc') {

					switch (req.query.iSortCol_0) {
						case '0': achhistoryData = _.sortBy(achhistoryData, '_id').reverse(); break;
						case '1': achhistoryData = _.sortBy(achhistoryData, 'loanID').reverse(); break;
						case '2': achhistoryData = _.sortBy(achhistoryData, 'user.name').reverse(); break;
						case '3': achhistoryData = _.sortBy(achhistoryData, 'user.screenName').reverse(); break;
						case '4': achhistoryData = _.sortBy(achhistoryData, 'user.email').reverse(); break;
						case '5': achhistoryData = _.sortBy(achhistoryData, 'user.phoneNumber').reverse(); break;
						case '6': achhistoryData = _.sortBy(achhistoryData, 'achAmount').reverse(); break;
						case '7': achhistoryData = _.sortBy(achhistoryData, 'methodtype').reverse(); break;
						case '8': achhistoryData = _.sortBy(achhistoryData, 'apiresponsestatus').reverse(); break;
						case '9': achhistoryData = _.sortBy(achhistoryData, 'status').reverse(); break;
						case '10': achhistoryData = _.sortBy(achhistoryData, 'appfailure').reverse(); break;
						case '11': achhistoryData = _.sortBy(achhistoryData, 'appfailuremessage').reverse(); break;
						case '12': achhistoryData = _.sortBy(achhistoryData, 'createdAt').reverse(); break;
						default: break;
					};

				}
				else {
					switch (req.query.iSortCol_0) {
						case '0': achhistoryData = _.sortBy(achhistoryData, '_id'); break;
						case '1': achhistoryData = _.sortBy(achhistoryData, 'loanID'); break;
						case '2': achhistoryData = _.sortBy(achhistoryData, 'user.name'); break;
						case '3': achhistoryData = _.sortBy(achhistoryData, 'user.screenName'); break;
						case '4': achhistoryData = _.sortBy(achhistoryData, 'user.email'); break;
						case '5': achhistoryData = _.sortBy(achhistoryData, 'user.phoneNumber'); break;
						case '6': achhistoryData = _.sortBy(achhistoryData, 'achAmount'); break;
						case '7': achhistoryData = _.sortBy(achhistoryData, 'methodtype'); break;
						case '8': achhistoryData = _.sortBy(achhistoryData, 'apiresponsestatus'); break;
						case '9': achhistoryData = _.sortBy(achhistoryData, 'status'); break;
						case '10': achhistoryData = _.sortBy(achhistoryData, 'appfailure'); break;
						case '11': achhistoryData = _.sortBy(achhistoryData, 'appfailuremessage'); break;
						case '12': achhistoryData = _.sortBy(achhistoryData, 'createdAt'); break;
						default: break;
					};
				}

				achhistoryData = _.filter(achhistoryData, function (item) {
					if (item.user) {
						return true;
					}
				});

				if (req.query.sSearch) {
					var search = req.query.sSearch.toLowerCase();

					achhistoryData = _.filter(achhistoryData, function (item) {
						if (item.loanID != null) {
							if (item.loanID.toLowerCase().indexOf(search) > -1) {
								return true;
							}
						}

						if (item.user.name != null) {
							if (item.user.name.toLowerCase().indexOf(search) > -1) {
								return true;
							}
						}

						if (item.user.screenName != null) {
							if (item.user.screenName.toLowerCase().indexOf(search) > -1) {
								return true;
							}
						}
						if (item.user.email != null) {
							if (item.user.email.toLowerCase().indexOf(search) > -1) {
								return true;
							}
						}
						if (item.user.phoneNumber != null) {
							if (item.user.phoneNumber.indexOf(search) > -1) {
								return true;
							}
						}
						if (item.achAmount != null) {
							if (parseInt(item.achAmount) == parseInt(search)) {
								return true;
							}
						}
						if (item.methodtype != null) {
							var searchdata = '';
							if (search.toLowerCase() == 'achdebit') {
								var searchdata = 4;
							}
							else if (search.toLowerCase() == 'achcredit') {
								var searchdata = 3;
							}
							else {
								var searchdata = search;
							}

							if (parseInt(item.methodtype) == parseInt(searchdata)) {
								return true;
							}
						}
						if (item.apiresponsestatus != null) {
							var searchapistatus = '';
							if (search.toLowerCase() == 'processed') {
								var searchapistatus = 1;
							}
							else if (search.toLowerCase() == 'failed') {
								var searchapistatus = 0;
							}
							else if (search.toLowerCase() == 'processing') {
								var searchapistatus = 3;
							}
							else {
								var searchapistatus = search;
							}

							if (parseInt(item.apiresponsestatus) == parseInt(searchapistatus)) {
								return true;
							}
						}
						if (item.appfailure != null) {
							var searchappfailure = '';
							if (search.toLowerCase() == 'success') {
								var searchappfailure = 0;
							}
							else if (search.toLowerCase() == 'failure') {
								var searchappfailure = 1;
							}
							else {
								var searchappfailure = search;
							}

							if (parseInt(item.appfailure) == parseInt(searchappfailure)) {
								return true;
							}
						}
						if (item.appfailuremessage != null) {
							if (item.appfailuremessage.toLowerCase().indexOf(search) > -1) {
								return true;
							}
						}
						if (item.createdAt != null) {
							if (moment(item.createdAt).format('MM-DD-YYYY') == search) {
								return true;
							}
						}
						return false;
					});
				}

				totalrecords = achhistoryData.length;

				var p = parseInt(req.query.iDisplayStart) + 1;
				skiprecord = parseInt(req.query.iDisplayStart);
				checklimitrecords = skiprecord + parseInt(req.query.iDisplayLength);
				if (checklimitrecords > totalrecords) {
					iDisplayLengthvalue = totalrecords;
				}
				else {
					//iDisplayLengthvalue=req.query.iDisplayLength;
					iDisplayLengthvalue = parseInt(req.query.iDisplayLength) + parseInt(skiprecord);
				}
				achhistoryData = achhistoryData.slice(skiprecord, iDisplayLengthvalue);

				var achreconuser = [];
				achhistoryData.forEach(function (achdata, loopvalue) {

					loopid = loopvalue + skiprecord + 1;

					var payuserName = '';
					var payuserscreenName = '';
					var payuserEmail = '';
					var payuserphoneNumber = '';
					if (achdata.user) {
						if (achdata.user.name != '' && achdata.user.name != null) {
							var payuserName = achdata.user.name;
						}
						if (achdata.user.screenName != '' && achdata.user.screenName != null) {
							var payuserscreenName = achdata.user.screenName;
						}
						if (achdata.user.email != '' && achdata.user.email != null) {
							var payuserEmail = achdata.user.email;
						}
						if (achdata.user.phoneNumber != '' && achdata.user.phoneNumber != null) {
							var payuserphoneNumber = achdata.user.phoneNumber;
						}
					}

					achdata.createdAt = moment(achdata.createdAt).format('MM-DD-YYYY');

					var achmethodType = '';
					var achapiStatus = '';
					var achappStatus = '';
					var achapiresponseStatus = '';
					if (achdata.methodtype == 3) {
						var achmethodType = 'ACHCredit';
					}

					if (achdata.methodtype == 4) {
						var achmethodType = 'ACHDebit';
					}

					if (achdata.methodtype == 5) {
						var achmethodType = 'ACHFailure';
					}

					if (achdata.apistatus == 1) {
						var achapiStatus = 'Success';
					}
					if (achdata.apistatus == 0) {
						var achapiStatus = 'Failure';
					}

					if (achdata.appfailure == 1) {
						var achappStatus = 'Failure';
					}
					if (achdata.appfailure == 0) {
						var achappStatus = 'Success';
					}

					if (achdata.apiresponsestatus == 1) {
						var achapiresponseStatus = 'Success';
					}
					if (achdata.apiresponsestatus == 0) {
						var achapiresponseStatus = 'Failed';
					}
					if (achdata.apiresponsestatus == 3) {
						var achapiresponseStatus = 'Processing';
					}

					systemUniqueKeyURL = 'viewreconciliationDetails/' + achdata.id;

					if (achdata.loanID != '' && achdata.loanID != null) {
						var payloanID = '<a href=\'' + systemUniqueKeyURL + '\'>' + achdata.loanID + '</a>';
					} else {
						var payloanID = '--';
					}

					var actiondata = '<a href="/admin/viewreconciliationDetails/' + achdata.id + '"><i class="fa fa-eye" aria-hidden="true" style="cursor:pointer;color:#337ab7;"></i></a>';


					if (achdata.methodtype == 3) {
						if (achdata.paymentManagement.transferstatus == 0) {
							var apitransactiontatus = '--';
						}

						if (achdata.paymentManagement.transferstatus == 1) {
							var apitransactiontatus = 'Pending';
						}

						if (achdata.paymentManagement.transferstatus == 2) {
							var apitransactiontatus = 'Settled';
						}
					}
					else if (achdata.methodtype == 4) {

						if (achdata.apiresponse && achdata.apiresponsestatus == 1) {
							var loanID = achdata.loanID;
							var achType = achdata.achType;


							if (achType == 'loan') {
								var filteredTransactions = _.filter(achdata.paymentManagement.usertransactions, { "loanID": loanID });

								if (filteredTransactions.length == 1) {
									var transactionToCheck = filteredTransactions[0];

									if (transactionToCheck.status == 2) {
										var apitransactiontatus = 'Settled';
									}
									else if (transactionToCheck.status == 1) {
										var apitransactiontatus = 'Pending';
									}
									else {
										var apitransactiontatus = 'Failed';
									}
								}
								else {
									var apitransactiontatus = 'Failed';
								}
								//var apitransactiontatus ='Settled';
							}
							else if (achType == 'creditscore' || achType == 'creditscorerenewal' || achType == 'creditscoremanualrenewal') {
								var achcriteria = {
									user: achdata.user.id
								};

								var apitransactiontatus = 'Settled';

								/*Creditusers
									.findOne(achcriteria)
									.then(function(credituserDetails) {
	
	
												if(credituserDetails.userpayments)
												{
	
													var filteredTransactions = _.filter(credituserDetails.userpayments, {"loanID": loanID});
	
													if (filteredTransactions.length == 1) {
															var transactionToCheck = filteredTransactions[0];
	
															if(transactionToCheck.status==2)
															{
																var apitransactiontatus ='Settled';
															}
															else if(transactionToCheck.status==1)
															{
																var apitransactiontatus ='Pending';
															}
															else
															{
																var apitransactiontatus ='Failed';
															}
													}
													else
													{
														var apitransactiontatus ='Failed';
													}
	
												}
												else
												{
													var apitransactiontatus ='Settled';
												}
									});*/
							}
							else {
								var apitransactiontatus = 'Failed';
							}
						}
						else {
							var apitransactiontatus = 'Failed';
						}
					}
					else {
						var apitransactiontatus = 'Failed';
					}

					achreconuser.push({ loopid: loopid, loanID: payloanID, name: payuserName, screenName: payuserscreenName, email: payuserEmail, phoneNumber: payuserphoneNumber, achAmount: achdata.achAmount, methodtype: achmethodType, apiresponsestatus: achapiresponseStatus, apitransactiontatus: apitransactiontatus, appfailure: achappStatus, appfailuremessage: achdata.appfailuremessage, createdAt: achdata.createdAt, actiondata: actiondata });
				});

				var json = {
					sEcho: req.query.sEcho,
					iTotalRecords: totalrecords,
					iTotalDisplayRecords: totalrecords,
					aaData: achreconuser
				};
				res.contentType('application/json');
				res.json(json);
			}
		});
}


function showAllDeniedAction(req, res) {

	var newLoanupdateSuccessMsg = '';
	var newLoanupdateMsg = '';
	if ("undefined" !== typeof req.session.newLoanupdateSuccessMsg && req.session.newLoanupdateSuccessMsg != '' && req.session.newLoanupdateSuccessMsg != null) {
		newLoanupdateSuccessMsg = req.session.newLoanupdateSuccessMsg;
		req.session.newLoanupdateSuccessMsg = '';
	}
	if ("undefined" !== typeof req.session.newLoanupdateMsg && req.session.newLoanupdateMsg != '' && req.session.newLoanupdateMsg != null) {
		newLoanupdateMsg = req.session.newLoanupdateMsg;
		req.session.newLoanupdateMsg = '';
	}
	//req.session.viewType= 'denied';
	var responsedata = {
		newLoanupdateSuccessMsg: newLoanupdateSuccessMsg,
		newLoanupdateMsg: newLoanupdateMsg
	};
	res.view("admin/pendingach/deniedachlist", responsedata);
}

function showAllArchivedDeniedAction(req, res) {

	var newLoanupdateSuccessMsg = '';
	var newLoanupdateMsg = '';
	if ("undefined" !== typeof req.session.newLoanupdateSuccessMsg && req.session.newLoanupdateSuccessMsg != '' && req.session.newLoanupdateSuccessMsg != null) {
		newLoanupdateSuccessMsg = req.session.newLoanupdateSuccessMsg;
		req.session.newLoanupdateSuccessMsg = '';
	}
	if ("undefined" !== typeof req.session.newLoanupdateMsg && req.session.newLoanupdateMsg != '' && req.session.newLoanupdateMsg != null) {
		newLoanupdateMsg = req.session.newLoanupdateMsg;
		req.session.newLoanupdateMsg = '';
	}
	//req.session.viewType= 'deniedArchive';
	var responsedata = {
		newLoanupdateSuccessMsg: newLoanupdateSuccessMsg,
		newLoanupdateMsg: newLoanupdateMsg
	};
	res.view("admin/pendingach/deniedArchivedachlist", responsedata);
}

function showAllToDoItemsDeniedAction(req, res) {

	var newLoanupdateSuccessMsg = '';
	var newLoanupdateMsg = '';
	if ("undefined" !== typeof req.session.newLoanupdateSuccessMsg && req.session.newLoanupdateSuccessMsg != '' && req.session.newLoanupdateSuccessMsg != null) {
		newLoanupdateSuccessMsg = req.session.newLoanupdateSuccessMsg;
		req.session.newLoanupdateSuccessMsg = '';
	}
	if ("undefined" !== typeof req.session.newLoanupdateMsg && req.session.newLoanupdateMsg != '' && req.session.newLoanupdateMsg != null) {
		newLoanupdateMsg = req.session.newLoanupdateMsg;
		req.session.newLoanupdateMsg = '';
	}
	//req.session.viewType= 'deniedTodo';
	var responsedata = {
		newLoanupdateSuccessMsg: newLoanupdateSuccessMsg,
		newLoanupdateMsg: newLoanupdateMsg
	};
	res.view("admin/pendingach/deniedToDoItemachlist", responsedata);
}

function ajaxDeniedApplicationAction(req, res) {

	var checkCreatedDate = moment().startOf('day').subtract(60, "days").format('MM-DD-YYYY');
	checkCreatedDate = moment(checkCreatedDate).tz("America/Los_Angeles").startOf('day').format('MM-DD-YYYY');

	if ("undefined" !== req.param("viewtype") && req.param("viewtype") != '' && req.param("viewtype") != null) {
		var viewtype = req.param("viewtype");
	}
	else {
		var viewtype = 'denied';
	}
	sails.log.info("viewtype:", viewtype);

	if ("undefined" !== typeof req.session.adminpracticeID && req.session.adminpracticeID != '' && req.session.adminpracticeID != null) {
		if (viewtype == 'denied') {
			var options = {
				status: ['OPENED', 'DENIED'],
				achstatus: { $eq: 2, $exists: true },
				practicemanagement: req.session.adminpracticeID,
				$and: [
					{
						$or: [{ moveToArchive: { $eq: 0, $exists: true } },
						{
							$and: [
								{ moveToArchive: { $exists: false } },
								{ createdAt: { $gte: new Date(checkCreatedDate), $exists: true } }
							]
						}
						]
					},
					//{$or : [ { appverified: { $eq: 1, $exists: true } }, { appverified:{ $exists: false }}  ]}
				]
			};
		}
		else if (viewtype == 'archived') {
			var options = {
				status: ['OPENED', 'DENIED'],
				achstatus: { $eq: 2, $exists: true },
				practicemanagement: req.session.adminpracticeID,
				$and: [
					{
						$or: [{ moveToArchive: { $eq: 1, $exists: true } },
						{
							$and: [
								{ moveToArchive: { $exists: false } },
								{ createdAt: { $lt: new Date(checkCreatedDate), $exists: true } }
							]
						}
						]
					},
					//{$or : [ { appverified: { $eq: 1, $exists: true } }, { appverified:{ $exists: false }}  ]}
				]
			};
		}
		else if (viewtype == 'toDoItems') {
			var options = {
				status: ['OPENED', 'DENIED'],
				achstatus: { $eq: 2, $exists: true },
				practicemanagement: req.session.adminpracticeID,
				appverified: { $eq: 0, $exists: true }
			};
		}
		else {
			var options = {
				status: ['OPENED', 'DENIED'],
				achstatus: { $eq: 2, $exists: true },
				practicemanagement: req.session.adminpracticeID,
				$and: [
					{
						$or: [{ moveToArchive: { $eq: 0, $exists: true } },
						{
							$and: [
								{ moveToArchive: { $exists: false } },
								{ createdAt: { $gte: new Date(checkCreatedDate), $exists: true } }
							]
						}
						]
					},
					//{$or : [ { appverified: { $eq: 1, $exists: true } }, { appverified:{ $exists: false }}  ]}
				]
			};
		}
	}
	else {
		if (viewtype == 'denied') {
			var options = {
				status: ['OPENED', 'DENIED'],
				achstatus: { $eq: 2, $exists: true },
				$and: [
					{
						$or: [{ moveToArchive: { $eq: 0, $exists: true } },
						{
							$and: [
								{ moveToArchive: { $exists: false } },
								{ createdAt: { $gte: new Date(checkCreatedDate), $exists: true } }
							]
						}
						]
					},
					//{$or : [ { appverified: { $eq: 1, $exists: true } }, { appverified:{ $exists: false }}  ]}
				]
			};
		}
		else if (viewtype == 'archived') {
			var options = {
				status: ['OPENED', 'DENIED'],
				achstatus: { $eq: 2, $exists: true },
				$and: [
					{
						$or: [{ moveToArchive: { $eq: 1, $exists: true } },
						{
							$and: [
								{ moveToArchive: { $exists: false } },
								{ createdAt: { $lt: new Date(checkCreatedDate), $exists: true } }
							]
						}
						]
					},
					//{$or : [ { appverified: { $eq: 1, $exists: true } }, { appverified:{ $exists: false }}  ]}
				]
			};
		}
		else if (viewtype == 'toDoItems') {
			var options = {
				status: ['OPENED', 'DENIED'],
				achstatus: { $eq: 2, $exists: true },
				appverified: { $eq: 0, $exists: true }
			};
		}
		else {
			var options = {
				status: ['OPENED', 'DENIED'],
				achstatus: { $eq: 2, $exists: true },
				$and: [
					{
						$or: [{ moveToArchive: { $eq: 0, $exists: true } },
						{
							$and: [
								{ moveToArchive: { $exists: false } },
								{ createdAt: { $gte: new Date(checkCreatedDate), $exists: true } }
							]
						}
						]
					},
					//{$or : [ { appverified: { $eq: 1, $exists: true } }, { appverified:{ $exists: false }}  ]}
				]
			};
		}
	}

	PaymentManagement.find(options)
		.populate('user')
		.populate('practicemanagement')
		.populate('screentracking')
		.exec(function (err, paymentmanagementdata) {
			if (err) {
				res.send(500, { error: 'DB error' });
			} else {
				paymentmanagementdata = Screentracking.getFundingTierFromPaymentManagementList(paymentmanagementdata);

				if (req.query.sSortDir_0 == 'desc') {
					switch (req.query.iSortCol_0) {
						case '0': paymentmanagementdata = _.sortBy(paymentmanagementdata, '_id').reverse(); break;
						case '1': paymentmanagementdata = _.sortBy(paymentmanagementdata, 'loanReference').reverse(); break;
						case '2': paymentmanagementdata = _.sortBy(paymentmanagementdata, 'user.name').reverse(); break;
						//case '3': paymentmanagementdata = _.sortBy(paymentmanagementdata, 'user.directMail').reverse(); break;
						//case '4': paymentmanagementdata = _.sortBy(paymentmanagementdata, 'user.badList').reverse(); break;
						case '3': paymentmanagementdata = _.sortBy(paymentmanagementdata, 'user.email').reverse(); break;
						case '4': paymentmanagementdata = _.sortBy(paymentmanagementdata, 'user.phoneNumber').reverse(); break;
						//case '5': paymentmanagementdata = _.sortBy(paymentmanagementdata, 'practicemanagement.PracticeName').reverse(); break;
						case '5': paymentmanagementdata = _.sortBy(paymentmanagementdata, 'fundingTier').reverse(); break;
						case '6': paymentmanagementdata = _.sortBy(paymentmanagementdata, 'payOffAmount').reverse(); break;
						case '7': paymentmanagementdata = _.sortBy(paymentmanagementdata, 'maturityDate').reverse(); break;
						case '8': paymentmanagementdata = _.sortBy(paymentmanagementdata, 'createdAt').reverse(); break;
						case '9': paymentmanagementdata = _.sortBy(paymentmanagementdata, 'status').reverse(); break;
						case '10': paymentmanagementdata = _.sortBy(paymentmanagementdata, 'status').reverse(); break;
						//case '10': paymentmanagementdata = _.sortBy(paymentmanagementdata, 'user.lastname').reverse(); break;
						default: break;
					};

				}
				else {
					switch (req.query.iSortCol_0) {
						case '0': paymentmanagementdata = _.sortBy(paymentmanagementdata, '_id'); break;
						case '1': paymentmanagementdata = _.sortBy(paymentmanagementdata, 'loanReference'); break;
						case '2': paymentmanagementdata = _.sortBy(paymentmanagementdata, 'user.name'); break;
						case '3': paymentmanagementdata = _.sortBy(paymentmanagementdata, 'user.email'); break;
						case '4': paymentmanagementdata = _.sortBy(paymentmanagementdata, 'user.phoneNumber'); break;
						//case '5': paymentmanagementdata = _.sortBy(paymentmanagementdata, 'practicemanagement.PracticeName'); break;
						case '5': paymentmanagementdata = _.sortBy(paymentmanagementdata, 'fundingTier'); break;
						case '6': paymentmanagementdata = _.sortBy(paymentmanagementdata, 'payOffAmount'); break;
						case '7': paymentmanagementdata = _.sortBy(paymentmanagementdata, 'maturityDate'); break;
						case '8': paymentmanagementdata = _.sortBy(paymentmanagementdata, 'createdAt'); break;
						case '9': paymentmanagementdata = _.sortBy(paymentmanagementdata, 'status'); break;
						case '10': paymentmanagementdata = _.sortBy(paymentmanagementdata, 'status'); break;
						default: break;
					};
				}

				//Filter user details not available
				paymentmanagementdata = _.filter(paymentmanagementdata, function (item) {
					if (item.user) {
						return true;
					}
				});

				//Filter archived user
				// paymentmanagementdata=_.filter(paymentmanagementdata,function(item){
				// 	if(item.screentracking.movedToArchive)
				// 	{
				// 		return false;
				// 	}
				// });

				//Filter using search data
				if (req.query.sSearch) {
					var search = req.query.sSearch.toLowerCase();

					paymentmanagementdata = _.filter(paymentmanagementdata, function (item) {
						if (item.loanReference != null) {
							if (item.loanReference.toLowerCase().indexOf(search) > -1) {
								return true;
							}
						}

						if (item.user.firstName != null) {
							if (item.user.firstName.toLowerCase().indexOf(search) > -1) {
								return true;
							}
						}

						if (item.user.lastname != null) {
							if (item.user.lastname.toLowerCase().indexOf(search) > -1) {
								return true;
							}
						}

						/* if(item.user.screenName!=null)
						 {
								 if(item.user.screenName.toLowerCase().indexOf(search)>-1 )
							 {
								 return true;
							 }
						 }*/
						if (item.user.email != null) {
							if (item.user.email.toLowerCase().indexOf(search) > -1) {
								return true;
							}
						}
						if (item.user.phoneNumber != null) {
							if (item.user.phoneNumber.indexOf(search) > -1) {
								return true;
							}
						}

						if (item.payOffAmount != null) {
							if (parseInt(item.payOffAmount) == parseInt(search)) {
								return true;
							}
						}

						if (item.maturityDate != null) {
							if (moment(item.maturityDate).format('MM-DD-YYYY') == search) {
								return true;
							}
						}


						if (item.createdAt != null) {
							if (moment(item.createdAt).format('MM-DD-YYYY') == search) {
								return true;
							}
						}

						//  if(item.practicemanagement)
						//  {
						// 	 if(item.practicemanagement.PracticeName!=null)
						// 	 {
						// 		 if(item.practicemanagement.PracticeName.indexOf(search)>-1 )
						// 		 {
						// 			 return true;
						// 		 }
						// 	 }
						//  }
						if (!!item.fundingTier) {
							if (item.fundingTier.indexOf(search) > -1) {
								return true;
							}
						}
						return false;
					});
				}

				//total records count
				totalrecords = paymentmanagementdata.length;

				//Filter by limit records
				var p = parseInt(req.query.iDisplayStart) + 1;
				skiprecord = parseInt(req.query.iDisplayStart);
				checklimitrecords = skiprecord + parseInt(req.query.iDisplayLength);
				if (checklimitrecords > totalrecords) {
					iDisplayLengthvalue = totalrecords;
				}
				else {
					iDisplayLengthvalue = parseInt(req.query.iDisplayLength) + parseInt(skiprecord);
				}
				paymentmanagementdata = paymentmanagementdata.slice(skiprecord, iDisplayLengthvalue);


				//Final output starts here
				var pendinguser = [];
				paymentmanagementdata.forEach(function (paydata, loopvalue) {


					loopid = loopvalue + skiprecord + 1;

					var payuserName = '';
					var payuserscreenName = '';
					var payuserEmail = '';
					var payuserphoneNumber = '';
					var payOffAmount = 0;

					if (paydata.payOffAmount) {
						payOffAmount = paydata.payOffAmount;
					}

					if (paydata.user) {
						if (paydata.user.firstName != '' && paydata.user.firstName != null) {
							var payuserName = paydata.user.firstName + ' ' + paydata.user.lastname;
						}
						/*if(paydata.user.screenName!='' && paydata.user.screenName!=null)
						{
							var payuserscreenName=paydata.user.screenName;
						}*/
						if (paydata.user.email != '' && paydata.user.email != null) {
							var payuserEmail = paydata.user.email;
						}
						if (paydata.user.phoneNumber != '' && paydata.user.phoneNumber != null) {
							var payuserphoneNumber = paydata.user.phoneNumber;
						}
					}
					var userOrigin = '--';
					if (paydata.screentracking) {
						if (paydata.screentracking.origin != null) {
							userOrigin = paydata.screentracking.origin;
						}
					}

					systemUniqueKeyURL = 'getAchUserDetails/' + paydata.id;
					if (paydata.loanReference != '' && paydata.loanReference != null) {
						var payloanReference = paydata.loanReference; // Changed to prevent errors in loading user page
						//var payloanReference='<a href=\''+systemUniqueKeyURL+'\'>'+paydata.loanReference+'</a>';
					} else {
						var payloanReference = '--';
					}

					paydata.maturityDate = moment(paydata.maturityDate).format('MM-DD-YYYY');
					paydata.createdAt = moment(paydata.createdAt).tz("America/los_angeles").format('MM-DD-YYYY hh:mm:ss');

					//systemUniqueKeyURL = 'getAchUserDetails/'+paydata.user.systemUniqueKey;
					//systemUniqueKeyURL = 'getAchUserDetails/'+paydata.user.id;
					//systemUniqueKeyURL = 'getAchUserDetails/'+paydata.id;
					var payuserNameLink = payuserName; //Changed to prevent errors in loading user page.
					//var payuserNameLink ='<a href=\''+systemUniqueKeyURL+'\'>'+payuserName+'</a>';

					if (paydata.achstatus == 0) {
						var statusicon = '<i class=\'fa fa-circle text-warning\' aria-hidden=\'true\' ></i> Pending';
					}

					if (paydata.achstatus == 1) {
						var statusicon = '<i class=\'fa fa-circle text-success\' aria-hidden=\'true\' ></i> Approved';
					}

					if (paydata.achstatus == 2) {
						if (paydata.deniedfromapp == 1) {
							var statusicon = '<i class=\'fa fa-circle text-danger\' aria-hidden=\'true\' ></i> Denied (from app)';
						} else {
							var statusicon = '<i class=\'fa fa-circle text-danger\' aria-hidden=\'true\' ></i> Denied';
						}
					}

					if (payuserEmail) {
						var emillnk = '<a href="mailto:' + payuserEmail + '">' + payuserEmail.replace(/(.{10})/g, "$1<br>") + '</a>';
					}

					if (paydata.user.directMail == 1) {
						var directMailUser = 'Yes';
					}
					else if (paydata.user.directMail == 2) {
						var directMailUser = 'No';
					}
					else {
						var directMailUser = '--';
					}

					//badList
					if (paydata.user.badList == 1) {
						var badListUser = 'Yes';
					}
					else if (paydata.user.badList == 2) {
						var badListUser = 'No';
					}
					else {
						var badListUser = '--';
					}


					setcurrent = 0;
					_.forEach(paydata.paymentSchedule, function (payDetails) {

						var todaysDate = moment().startOf('day').toDate().getTime();
						var scheduleDate = moment(payDetails.date).add(15, 'days').startOf('day').toDate().getTime();

						if (setcurrent == 0) {
							if (scheduleDate < todaysDate && payDetails.status == 'OPENED') {
								paydata.status = "Late";
								setcurrent = 1;
							}
							else if (paydata.status == "OPENED" || paydata.status == "CURRENT") {

								paydata.status = "Current";
							}
						}
					});

					var registeredType = paydata.user.registeredtype;

					var practicename = '--';
					if (paydata.practicemanagement) {
						if (paydata.practicemanagement.PracticeName != '' && paydata.practicemanagement.PracticeName != null) {
							var practicename = paydata.practicemanagement.PracticeName;
						}
					}
					var fundingTier = "--";
					if (!!paydata.fundingTier) {
						fundingTier = paydata.fundingTier;
					} else {
						paydata["fundingTier"] = "";
					}
					/*pendinguser.push({ loopid:loopid, loanReference: payloanReference, name: payuserNameLink,directMail: directMailUser,badList: badListUser, email: payuserEmail,phoneNumber: payuserphoneNumber,payOffAmount:paydata.payOffAmount,maturityDate:paydata.maturityDate,createdAt:paydata.createdAt, status: statusicon, paymentstatus: paydata.status,registeredType:registeredType });*/

					pendinguser.push({ loopid: loopid, loanReference: payloanReference, name: payuserNameLink, email: payuserEmail, origin: userOrigin, phoneNumber: payuserphoneNumber, practicename: practicename, payOffAmount: payOffAmount, maturityDate: paydata.maturityDate, createdAt: paydata.createdAt, status: statusicon, paymentstatus: paydata.status, registeredType: registeredType, fundingTier: fundingTier });

				});

				var json = {
					sEcho: req.query.sEcho,
					iTotalRecords: totalrecords,
					iTotalDisplayRecords: totalrecords,
					aaData: pendinguser
				};
				res.contentType('application/json');
				res.json(json);
			}
		});
}

function viewreconciliationDetails(req, res) {

	var achhistoryID = req.param('id');

	if (!achhistoryID) {
		var errors = {
			"code": 500,
			"message": "Invalid Data"
		};
		sails.log.error('AchController#viewreconciliationDetails :: errors', errors);
		res.view("admin/error/500", {
			data: errors.message,
			layout: 'layout'
		});
	}

	var options = {
		id: achhistoryID
	};

	Achhistory.findOne(options)
		.populateAll()
		.then(function (achhistoryData) {

			var apiresponse = '';
			var apirequest = '';
			if (achhistoryData.apiresponse) {
				apiresponse = JSON.stringify(achhistoryData.apiresponse, null, 4);
			}

			if (achhistoryData.apirequest) {
				apirequest = JSON.stringify(achhistoryData.apirequest, null, 4);
			}
			achhistoryData.createdAt = moment(achhistoryData.createdAt).format('MM-DD-YYYY');

			var achmethodType = '';
			var achapiStatus = '';
			var achappStatus = '';
			var achapiresponseStatus = '';
			if (achhistoryData.methodtype == 3) {
				var achmethodType = 'ACHCredit';
			}

			if (achhistoryData.methodtype == 4) {
				var achmethodType = 'ACHDebit';
			}

			if (achhistoryData.methodtype == 5) {
				var achmethodType = 'ACHFailure';
			}

			if (achhistoryData.apistatus == 1) {
				var achapiStatus = 'Success';
			}
			if (achhistoryData.apistatus == 0) {
				var achapiStatus = 'Failure';
			}

			if (achhistoryData.appfailure == 1) {
				var achappStatus = 'Failure';
			}
			if (achhistoryData.appfailure == 0) {
				var achappStatus = 'Success';
			}


			if (achhistoryData.apiresponsestatus == 1) {
				var achapiresponseStatus = 'Success';
			}
			if (achhistoryData.apiresponsestatus == 0) {
				var achapiresponseStatus = 'Failed';
			}
			if (achhistoryData.apiresponsestatus == 3) {
				var achapiresponseStatus = 'Processing';
			}

			var achType = achhistoryData.achType;
			if (achhistoryData.methodtype == 3) {

				if (achType == 'creditscore' || achType == 'creditscorerenewal' || achType == 'creditscoremanualrenewal') {
					var apitransactiontatus = 'Settled';
				}

				if (achType == 'loan') {
					if (achhistoryData.paymentManagement.transferstatus == 0) {
						var apitransactiontatus = '--';
					}

					if (achhistoryData.paymentManagement.transferstatus == 1) {
						var apitransactiontatus = 'Pending';
					}

					if (achhistoryData.paymentManagement.transferstatus == 2) {
						var apitransactiontatus = 'Settled';
					}
				}
			}
			else if (achhistoryData.methodtype == 4) {
				if (achhistoryData.apiresponse && achhistoryData.apiresponsestatus == 1) {
					if (achType == 'creditscore' || achType == 'creditscorerenewal' || achType == 'creditscoremanualrenewal') {
						var apitransactiontatus = 'Settled';
					}
					if (achType == 'loan') {
						var loanID = achhistoryData.loanID;

						var filteredTransactions = _.filter(achhistoryData.paymentManagement.usertransactions, { "loanID": loanID });

						if (filteredTransactions.length == 1) {
							var transactionToCheck = filteredTransactions[0];

							if (transactionToCheck.status == 2) {
								var apitransactiontatus = 'Settled';
							}
							else if (transactionToCheck.status == 1) {
								var apitransactiontatus = 'Pending';
							}
							else {
								var apitransactiontatus = 'Failed';
							}
						}
						else {
							var apitransactiontatus = 'Failed';
						}
					}
				}
				else {
					var apitransactiontatus = 'Failed';
				}
			}
			else {
				var apitransactiontatus = 'Failed';
			}

			var responsedata = {
				achhistoryData: achhistoryData,
				apirequest: apirequest,
				apiresponse: apiresponse,
				achmethodType: achmethodType,
				achapiStatus: achapiStatus,
				achappStatus: achappStatus,
				achapiresponseStatus: achapiresponseStatus,
				apitransactiontatus: apitransactiontatus,
			}
			res.view("admin/reconciliation/viewReconciliationDetails", responsedata);
		})
		.catch(function (err) {
			var errors = err.message;
			sails.log.error('AchController#viewreconciliationDetails :: err', errors);
			res.view("admin/error/404", {
				data: err.message,
				layout: 'layout'
			});
		});
}

function storyUserviewinfo(req, res) {

	var payID = req.param('paymentID');
	var type = req.param('type');
	var typecount = req.param('typecount');

	if (payID) {
		var options = {
			id: payID
		};

		PaymentManagement.findOne(options)
			.populate('user')
			.populate('story')
			.then(function (paymentmanagementdata) {


				var userviewData = [];
				var userinfoData = [];
				if (type == 'like') {
					var userviewData = paymentmanagementdata.story.likers;
				}
				if (type == 'dislike') {
					var userviewData = paymentmanagementdata.story.dislikers;
				}

				if (typecount > 0) {
					var forlength = userviewData.length,
						i = 0;
					var userIds = [];
					_.forEach(userviewData, function (userData) {
						userData.userdate = moment(userData.timeStamp).format('MM-DD-YYYY');
						userIds.push(userData.userId);
					});


					var criteria = {
						id: userIds
					};

					User
						.find(criteria)
						.then(function (users) {


							var json = {
								status: 200,
								message: "Information found",
								data: users
							};
							res.contentType('application/json');
							res.json(json);


						})
						.catch(function (err) {

						})
				}
				else {
					var json = {
						status: 400,
						message: 'No information found'
					};
					//sails.log.error("json data", json);
					res.contentType('application/json');
					res.json(json);
				}

			})
			.catch(function (err) {
				var json = {
					status: 400,
					message: err.message
				};
				//sails.log.error("json data", json);
				res.contentType('application/json');
				res.json(json);
			});
	}
	else {
		var json = {
			status: 400,
			message: 'No information found'
		};
		//sails.log.error("json data", json);
		res.contentType('application/json');
		res.json(json);
	}
}

function incompleteUploadDocumentProofAction(req, res) {

	var localPath = req.localPath;
	var screenID = req.param('paymentID');

	var docutype = req.param('docutype');
	if (docutype == 'Others') {
		if (!req.form.isValid) {
			var validationErrors = ValidationService
				.getValidationErrors(req.form.getErrors());
			return res.failed(validationErrors);
		}
		var document_name = req.param('documentname');
		if (screenID) {
			var payid = {
				id: screenID
			};

			PaymentManagement.findOne(payid).then(function (userdetails) {
				var user_id = userdetails.user;
				var formdata = {
					docname: document_name,
					user: user_id,
					paymentManagement: screenID
				};

				Achdocuments
					.createAchDocuments(formdata, screenID)
					.then(function (achdocuments) {
						User.findOne(user_id).then(function (data) {

							var userReference = data.userReference;
							var userid = {
								user: user_id
							};
							Screentracking.findOne(userid).then(function (value) {
								var applicationReference = value.applicationReference;
								Asset
									.createAssetForAchDocuments(achdocuments, localPath, userReference, applicationReference, Asset.ASSET_TYPE_USER_DOCUMENT)
									.then(function (asset) {
										var docdetals = asset;
										docdetals.docs = achdocuments;
										var modulename = 'Upload  Documents';
										var modulemessage = 'Applications Documents updated successfully';
										req.achlog = 1;
										req.payID = screenID;
										req.logdata = docdetals;

										Logactivity.registerLogActivity(req, modulename, modulemessage);

										Achdocuments
											.updateDocumentProof(achdocuments, asset).then(function (value) {
												var json = {
													status: 200,
													message: "Documents updated successfully"
												};

												var redirectpath = "/admin/getAchUserDetails/" + screenID;
												return res.status(200).redirect(redirectpath);
											})
									})
							})
						})
					})
					.catch(function (err) {
						sails.log.error("Ach#uploadAchDocuments  :: Error :: ", err);
						return reject({
							code: 500,
							message: 'INTERNAL_SERVER_ERROR'
						});
					});
			})
				.catch(function (err) {
					sails.log.error('AchController#createAchDocuments :: err :', err);
					return res.handleError(err);
				});
		}
	} else {
		if (screenID) {
			var payid = {
				id: screenID
			};

			Screentracking.findOne(payid).then(function (userdetails) {
				var user_id = userdetails.user;
				var formdata = {
					docname: docutype,
					user: user_id,
					screentracking: screenID
				};


				Achdocuments
					.createAchDocuments(formdata, screenID)
					.then(function (achdocuments) {
						User.findOne(user_id).then(function (data) {
							var userReference = data.userReference;
							var userid = {
								user: user_id
							};
							Screentracking.findOne(userid).then(function (value) {
								var applicationReference = value.applicationReference;
								Asset
									.createAssetForAchDocuments(achdocuments, localPath, userReference, applicationReference, Asset.ASSET_TYPE_USER_DOCUMENT)
									.then(function (asset) {
										var docdetals = asset;
										docdetals.docs = achdocuments;
										var modulename = 'Upload Pending Applications Documents';
										var modulemessage = 'Pending Applications Documents updated successfully';
										req.achlog = 1;
										req.payID = screenID;
										req.logdata = docdetals;
										Logactivity.registerLogActivity(req, modulename, modulemessage);

										Achdocuments
											.updateDocumentProof(achdocuments, asset).then(function (value) {
												var json = {
													status: 200,
													message: "Documents updated successfully"
												};
												var redirectpath = "/admin/getAchUserDetails/" + screenID;

												return res.status(200).redirect(redirectpath);
											})
									})
							})
						})
					})
					.catch(function (err) {
						sails.log.error("Ach#uploadAchDocuments  :: Error :: ", err);
						return reject({
							code: 500,
							message: 'INTERNAL_SERVER_ERROR'
						});
					});
			})
				.catch(function (err) {
					sails.log.error('AchController#createAchDocuments :: err :', err);
					return res.handleError(err);
				});
		}
	}
}

function userPaymentHistoryAction(req, res) {
	res.view("admin/pendingach/paymenthistorylist");

}


function cancelAchAction(req, res) {
	var scheduleStatus = req.param('scheduleStatus');
	var userId = req.param('userID');
	var paymentId = req.param('paymentID');
	var status = req.param('reasoncomment');
	var processType = req.param('scheduleStatus');
	var reversalAmount = "";

	if (processType == 5) {
		var scheduleStatus = 'PAID OFF'
	} else {
		var scheduleStatus = 'CLOSED'
	}

	VikingRequest.update({ payment_id: paymentId, userId: userId, processType: 1 }, { status: status, processType: parseInt(processType) })
		.exec(function afterwards(err, updated) {
			if (err) {
				req.session.approveerror = '';
				req.session.approveerror = 'Unable to update the status.';
				return res.redirect("admin/getAchDetails");
			} else {
				sails.log.info("UPDATED", updated);
				if (req.param('reversalApprove') == "yes") {
					VikingRequest.findOne({ payment_id: paymentId, userId: userId, lenderType: 'credit' })
						.then(function (vikingData) {
							sails.log.info("vikingData", vikingData);
							var uniqueReferenceID = 'VK_' + Math.random().toString(10).slice(10);
							var randomToken = "VIKING_" + Math.random().toString(32).substr(6) + Math.random().toString(32).substr(6);
							var feildDataWithLabel = ({ consumerName: vikingData.consumerName, uniqueID: uniqueReferenceID, routingNumber: vikingData.routingNumber, consumersBankAccount: vikingData.consumersBankAccount, amount: vikingData.amount, scheduleDate: moment().format(), streetAddress: vikingData.streetAddress, city: vikingData.city, state: vikingData.state, zip: vikingData.zip, SSN: vikingData.SSN, userId: userId, payment_id: paymentId, uniqueScheduleId: randomToken, status: 'pending', processType: 1, lenderType: 'debit', entryType: 'reversal' });
							VikingRequest.createRequestData(feildDataWithLabel)
								.then(function (vikingDataResult) {
									User.findOne({ id: userId })
										.then(function (userdata) {
											var modulename = 'Vikng Reversal';
											var modulemessage = 'Viking reversed $' + vikingDataResult.amount + '(dr) successfully for user reference: ' + userdata.userReference;
											req.logdata = {
												userdata: userdata,
												changetype: "Viking Cancel",
												userID: userId,
												paydetailID: paymentId
											};
											req.payID = paymentId;
											Logactivity.registerLogActivity(req, modulename, modulemessage);
										});
								});

						});
				}
				PaymentManagement.findOne({ id: paymentId })
					.then(function (paymentDet) {

						if (paymentDet) {
							sails.log.info("paymentDet", paymentDet);
							var i = 1;
							paymentDet.finalpayoffAmount = 0.00;
							paymentDet.finalpayoffAmount = 0.00;
							paymentDet.status = scheduleStatus;
							_.forEach(paymentDet.paymentSchedule, function (payDetails) {
								if (payDetails.status != 'PAID OFF') {
									payDetails.status = scheduleStatus;
								}
								//payDetails.amount = 0.00;
								if (i == paymentDet.paymentSchedule.length) {
									paymentDet.save(function (err, updated) {
										sails.log.info("updated-2", updated);
										if (err) {
											req.session.approveerror = '';
											req.session.approveerror = 'Status Updated in viking, Failed to update in Frontend status.';
											return res.redirect("admin/getAchDetails");
										} else {
											User.findOne({ id: userId })
												.then(function (userdata) {
													var modulename = 'Payment Schedule updated';
													var modulemessage = 'Changed Payment Schedule Status to ' + scheduleStatus + ' successfully for user reference: ' + userdata.userReference;
													req.logdata = {
														userdata: userdata,
														changetype: "Viking Cancel",
														userID: userId,
														paydetailID: paymentId
													};
													req.payID = paymentId;
													Logactivity.registerLogActivity(req, modulename, modulemessage);
												});

											req.session.approveerror = '';
											req.session.approveerror = 'Status Updated Successfully.';
											return res.redirect("admin/getAchDetails");
										}
									});
								}
								i++;
							});
						} else {
							req.session.approveerror = '';
							req.session.approveerror = 'Status Updated in viking, Failed to update in Frontend status.';
							return res.redirect("admin/getAchDetails");
						}
					}).catch(function (err) {
						req.session.approveerror = '';
						req.session.approveerror = 'Status Updated in viking, Failed to update in Frontend status.';
						return res.redirect("admin/getAchDetails");
					});
			}
		});

}




function repullPayment(req, res) {

	var paymentId = req.param('paymentId');
	var scheduleId = req.param('scheduleId');
	var uniqueScheduleId = req.param('uniqueScheduleId');

	sails.log.info("uniqueScheduleId0000000000: ", uniqueScheduleId);

	if (paymentId && ("undefined" !== typeof uniqueScheduleId && uniqueScheduleId != '' && uniqueScheduleId != null)) {
		PaymentManagement
			.adminrepullpayment(paymentId, scheduleId, req, uniqueScheduleId)
			.then(function (responsedetails) {

				sails.log.info("responsedetails: ", responsedetails);

				if (responsedetails.status == 200) {
					req.session.repullpaysucessmsg = '';
					req.session.repullpaysucessmsg = 'Manual repull payment processed successfully from admin';
					var json = {
						status: 200,
						message: 'Successfully repull payment from admin'
					};
					res.contentType('application/json');
					return res.json(json);
				}
				else if (responsedetails.status == 402) {
					//--pull plaid before payment
					req.session.repullpaysucessmsg = '';
					req.session.repullpaysucessmsg = responsedetails.message;
					var json = {
						status: 400,
						message: schudledetails.message
					};
					res.contentType('application/json');
					return res.json(json);
				}
				else {
					req.session.repullpayerrormsg = '';
					req.session.repullpayerrormsg = 'Unable to repull payment from admin';
					var json = {
						status: 400,
						message: 'Unable to repull payment from admin'
					};
					res.contentType('application/json');
					return res.json(json);
				}
			})
			.catch(function (err) {
				var json = {
					status: 400,
					message: 'Unable to repull payment from admin'
				};
				res.contentType('application/json');
				return res.json(json);
			});
	}
	else {
		var json = {
			status: 400,
			message: 'Unable to repull payment from admin'
		};
		res.contentType('application/json');
		return res.json(json);
	}
}

function showPotentialDefaultusers(req, res) {

	var errorval = '';
	var successmsg = '';
	if (req.session.errorval != '') {
		errorval = req.session.errorval;
		req.session.errorval = '';
	}
	if (req.session.successmsg != '') {
		successmsg = req.session.successmsg;
		req.session.successmsg = '';
	}
	var responsedata = {
		errorval: errorval,
		successmsg: successmsg
	};

	res.view("admin/pendingach/potentialdefaultuser", responsedata);
}

function ajaxPotentialDefaultusers(req, res) {

	//Sorting
	if (req.query.sSortDir_0 == 'desc') {
		sorttype = -1;
	}
	else {
		sorttype = 1;
	}
	switch (req.query.iSortCol_0) {
		case '0': var sorttypevalue = { '_id': sorttype }; break;
		case '1': var sorttypevalue = { 'loanReference': sorttype }; break;
		case '2': var sorttypevalue = { 'storydata.storyReference': sorttype }; break;
		case '3': var sorttypevalue = { 'user.userReference': sorttype }; break;
		case '4': var sorttypevalue = { 'user.name': sorttype }; break;
		case '6': var sorttypevalue = { 'user.email': sorttype }; break;
		case '7': var sorttypevalue = { 'user.phoneNumber': sorttype }; break;
		case '8': var sorttypevalue = { 'payOffAmount': sorttype }; break;
		case '11': var sorttypevalue = { 'maturityDate': sorttype }; break;
		case '12': var sorttypevalue = { 'createdAt': sorttype }; break;
		default: break;
	};

	var matchcriteria;
	var whereConditionAnd = new Array();
	var whereConditionOr = new Array();
	if (req.query.sSearch) {
		whereConditionOr.push({ "loanReference": { '$regex': req.query.sSearch, $options: 'i' } });
		whereConditionOr.push({ "storydata.storyReference": { '$regex': req.query.sSearch, $options: 'i' } });
		whereConditionOr.push({ "userdata.userReference": { '$regex': req.query.sSearch, $options: 'i' } });
		whereConditionOr.push({ "userdata.name": { '$regex': req.query.sSearch, $options: 'i' } });
		whereConditionOr.push({ "userdata.email": { '$regex': req.query.sSearch, $options: 'i' } });
		whereConditionOr.push({ "userdata.phoneNumber": { '$regex': req.query.sSearch, $options: 'i' } });
		whereConditionOr.push({ "payOffAmount": { '$regex': req.query.sSearch, $options: 'i' } });
	}

	if (whereConditionOr.length > 0) {
		matchcriteria = {
			"userdata": { $ne: [] },
			"storydata": { $ne: [] },
			"accountdata": { $ne: [] },
			$or: [{ status: 'OPENED' }, { status: 'PAID OFF' }],
			achstatus: { $eq: 1, $exists: true },
			potentialdefaultexist: { $eq: 1, $exists: true },
			$or: whereConditionOr
		};
	}
	else {
		matchcriteria = {
			"userdata": { $ne: [] },
			"storydata": { $ne: [] },
			"accountdata": { $ne: [] },
			$or: [{ status: 'OPENED' }, { status: 'PAID OFF' }],
			achstatus: { $eq: 1, $exists: true },
			potentialdefaultexist: { $eq: 1, $exists: true }
		};
	}

	//sails.log.info("Match criteria",JSON.stringify(matchcriteria));

	skiprecord = parseInt(req.query.iDisplayStart);
	iDisplayLength = parseInt(req.query.iDisplayLength);

	var potentialData = [];
	totalrecords = 0;

	//-- Total records count
	PaymentManagement.native(function (err, collection) {

		collection.aggregate(
			[
				{
					$lookup: {
						from: "user",
						localField: "user",
						foreignField: "_id",
						as: "userdata"
					}
				},
				{
					$lookup: {
						from: "story",
						localField: "story",
						foreignField: "_id",
						as: "storydata"
					}
				},
				{
					$lookup: {
						from: "account",
						localField: "account",
						foreignField: "_id",
						as: "accountdata"
					}
				},
				{
					$match: matchcriteria
				},
				{
					$count: "potentialcount"
				}
			],
			function (err, result) {

				if (err) {
					return res.serverError(err);
				}
				sails.log.info("potentialcount result: ", result);

				if (result.length > 0) {
					totalrecords = result[0].potentialcount;

					PaymentManagement.native(function (err, collection) {

						collection.aggregate(
							[
								{
									$lookup: {
										from: "user",
										localField: "user",
										foreignField: "_id",
										as: "userdata"
									}
								},
								{
									$lookup: {
										from: "story",
										localField: "story",
										foreignField: "_id",
										as: "storydata"
									}
								},
								{
									$lookup: {
										from: "account",
										localField: "account",
										foreignField: "_id",
										as: "accountdata"
									}
								},
								{
									$match: matchcriteria
								},
								{
									$sort: sorttypevalue
								},
								{
									$skip: skiprecord
								},
								{
									$limit: iDisplayLength
								}
							],
							function (err, result) {
								if (err) {
									return res.serverError(err);
								}

								if (result.length > 0) {
									potentialDetails = result;
									potentialDetails.forEach(function (potentialinfo, loopvalue) {

										var payuserName = '';
										var payuserscreenName = '';
										var payuserEmail = '';
										var payuserphoneNumber = '';
										var userReference = '--';
										var storyReference = '--';
										var payuserNameLink = '--';
										var availableBalance = 0;
										var creditScore = 0;
										var userblocked = 0;
										var payuserLink = '--';

										loopid = loopvalue + skiprecord + 1;

										var userinfo = potentialinfo.userdata[0];
										var storyinfo = potentialinfo.storydata[0];
										var accountinfo = potentialinfo.accountdata[0];

										if ("undefined" !== typeof userinfo.userReference && userinfo.userReference != '' && userinfo.userReference != null) {
											var userReference = userinfo.userReference;
										}

										if ("undefined" !== typeof userinfo.firstName && userinfo.firstName != '' && userinfo.firstName != null) {
											var payuserName = userinfo.firstName + ' ' + userinfo.lastname;
										}

										if ("undefined" !== typeof userinfo.email && userinfo.email != '' && userinfo.email != null) {
											var payuserEmail = userinfo.email;
										}

										if ("undefined" !== typeof userinfo.phoneNumber && userinfo.phoneNumber != '' && userinfo.phoneNumber != null) {
											var payuserphoneNumber = userinfo.phoneNumber;
										}

										if ("undefined" !== typeof storyinfo.storyReference && storyinfo.storyReference != '' && storyinfo.storyReference != null) {
											var storyReference = storyinfo.storyReference;
										}



										potentialinfo.createdAt = moment(potentialinfo.createdAt).tz("America/los_angeles").format('MM-DD-YYYY hh:mm:ss');
										potentialinfo.maturityDate = moment(potentialinfo.maturityDate).format('MM-DD-YYYY');

										systemUniqueKeyURL = 'getAchUserDetails/' + potentialinfo._id;
										systemUserUniqueKeyURL = 'viewUserDetails/' + userinfo._id;

										if (potentialinfo.loanReference != '' && potentialinfo.loanReference != null) {
											var payloanReference = '<a href=\'' + systemUniqueKeyURL + '\'>' + potentialinfo.loanReference + '</a>';
										}
										else {
											var payloanReference = '--';
										}

										if ("undefined" !== typeof userinfo.userReference && userinfo.userReference != '' && userinfo.userReference != null) {
											var payuserLink = '<a href=\'' + systemUserUniqueKeyURL + '\'>' + userinfo.userReference + '</a>';
										}

										if (potentialinfo.achstatus == 0) {
											var statusicon = '<i class=\'fa fa-circle text-warning\' aria-hidden=\'true\' ></i> Pending';
										}
										else if (potentialinfo.achstatus == 1) {
											var statusicon = '<i class=\'fa fa-circle text-success\' aria-hidden=\'true\' ></i> Funded';
										}
										else if (potentialinfo.achstatus == 2) {
											if (potentialinfo.deniedfromapp == 1) {
												var statusicon = '<i class=\'fa fa-circle text-danger\' aria-hidden=\'true\' ></i> Denied (from app)';
											}
											else {
												var statusicon = '<i class=\'fa fa-circle text-danger\' aria-hidden=\'true\' ></i> Denied';
											}
										}

										if ("undefined" !== typeof userinfo.email && userinfo.email != '' && userinfo.email != null) {
											var emillnk = '<a href="mailto:' + userinfo.email + '">' + userinfo.email.replace(/(.{10})/g, "$1<br>") + '</a>';
										}

										setcurrent = 0;
										_.forEach(potentialinfo.paymentSchedule, function (payDetails) {

											var todaysDate = moment().startOf('day').toDate().getTime();
											var scheduleDate = moment(payDetails.date).add(1, 'days').startOf('day').toDate().getTime();

											if (setcurrent == 0) {
												if (scheduleDate < todaysDate && payDetails.status == 'OPENED') {
													potentialinfo.status = "Late";
													setcurrent = 1;
												}
												else if (potentialinfo.status == "OPENED" || potentialinfo.status == "CURRENT") {
													potentialinfo.status = "Current";
												}
											}
										});

										if (accountinfo) {
											if (accountinfo.balance) {
												var availableBalance = accountinfo.balance.available;
											}
										}



										potentialData.push({ loopid: loopid, loanReference: payloanReference, storyReference: storyReference, userReference: payuserLink, name: payuserName, email: payuserEmail, phoneNumber: payuserphoneNumber, payOffAmount: potentialinfo.payOffAmount, availableBalance: availableBalance, maturityDate: potentialinfo.maturityDate, createdAt: potentialinfo.createdAt, status: statusicon, paymentstatus: potentialinfo.status });

									});

									var json = {
										sEcho: req.query.sEcho,
										iTotalRecords: totalrecords,
										iTotalDisplayRecords: totalrecords,
										aaData: potentialData
									};
									res.contentType('application/json');
									res.json(json);
								}
								else {
									var json = {
										sEcho: req.query.sEcho,
										iTotalRecords: totalrecords,
										iTotalDisplayRecords: totalrecords,
										aaData: potentialData
									};
									res.contentType('application/json');
									res.json(json);
								}
							})
					});

					/*var json = {
						sEcho:req.query.sEcho,
						iTotalRecords: totalrecords,
						iTotalDisplayRecords: totalrecords,
						aaData: potentialData
					};
					res.contentType('application/json');
					res.json(json);*/
				}
				else {
					var json = {
						sEcho: req.query.sEcho,
						iTotalRecords: totalrecords,
						iTotalDisplayRecords: totalrecords,
						aaData: potentialData
					};
					res.contentType('application/json');
					res.json(json);
				}
			})
	});
}
function saveProgramDates(req, res) {
	var payID = req.param('paymentID');
	var programStart = req.param('programstartdate');
	var programEnd = req.param('programenddate');

	return Promise.resolve()
		.then(() => {
			if (!payID) {
				throw new ControllerError("paymentmanagement id is required", "saveProgramDates", 400);
			}
			if (!programStart) {
				throw new ControllerError("program start is required", "saveProgramDates", 400);
			}
			if (!programEnd) {
				throw new ControllerError("program end is required", "saveProgramDates", 400);
			}

			const payoptions = { id: payID };
			const changes = {
				programStart: moment(programStart, "MM/DD/YYYY").toDate(),
				programEnd: moment(programEnd, "MM/DD/YYYY").toDate()
			};
			sails.log.error("ERROR TRACKING: before return PaymentManagement.update()");
			return PaymentManagement.update(payoptions, changes);
		})
		.then(() => {
			return new Promise((resolve, reject) => {
				sails.log.error("ERROR TRACKING: before EmploymentHistory.getCurrentEmployment()");
				EmploymentHistory.getCurrentEmployment(payID).then((employmentHistory) => {
					if (employmentHistory && employmentHistory.currentIncome > 0) {
						AchService.markContractNeedingReview(payID, sails.config.needsReviewReasonEnum.needsReviewReason.incomeChanged, req.user);
					}
					resolve(true);
				}).catch((errorObj) => {
					sails.log.error("ERROR TRACKING: before EmploymentHistory.getCurrentEmployment()", errorObj);
					//don't care about error- just checking if exists
					resolve(true);
				})
			})
		})
		.then(() => {
			sails.log.error("ERROR TRACKING: before Logactivity.registerLogActivity()");
			var modulename = 'Program Dates Update';
			var modulemessage = 'Program dates updated successfully in Pending Contracts.';
			req.achlog = 1;
			req.payID = payID;
			Logactivity.registerLogActivity(req, modulename, modulemessage);

			var json = {
				status: 200,
				message: 'Program dates updated successfully',
			};

			res.contentType('application/json');
			res.json(json, 200);
		})
		.catch((err) => {
			if (err.endpoint == "saveProgramDates") {
				var json = {
					error: err.message
				};
				res.contentType('application/json');
				res.json(json, err.httpcode);
				return;
			}
			return res.handleError({
				code: 500,
				message: 'An error has occurred when the system attempted to save dates to the program.'
			});
			return;
		});
}

//-- Approve patient pending loan from admin to funded
function approvePatientloanAction(req, res) {
	var payID = req.param('paymentID');
	var loanstartdate = req.param('loanstartdate');
	var allParams = req.allParams();
	if (payID) {
		var payoptions = { id: payID, achstatus: 0 };

		PaymentManagement.findOne(payoptions)
			.populate('user')
			.populate('account')
			.then(function (paymentmanagementdata) {

				if (paymentmanagementdata) {
					//-- Loan set date
					var allowApproveOption = 0;
					var loanSetDateExist = 0;

					if (paymentmanagementdata.loanSetdate) {
						var loanSetDateExist = 1;
						if (moment().startOf('day').toDate().getTime() == moment(paymentmanagementdata.loanSetdate).startOf('day').toDate().getTime()) {
							allowApproveOption = 1;
						}
					}


					if (!paymentmanagementdata.blockachcredit) {
						paymentmanagementdata.blockachcredit = 0;
					}

					/*if(allowApproveOption==0)
					{
						req.session.approveerror='';
						if(loanSetDateExist==1)
						{
							req.session.approveerror = 'Error: Application set date and today date differ!';
						}
						else
						{
							req.session.approveerror = 'Error: Application set date is not set!';
						}
						return res.redirect("admin/getAchDetails");
					}
					else
					{*/

					//remove me after test
					paymentmanagementdata.blockachcredit = 0;

					if (paymentmanagementdata.blockachcredit == 1) {
						if (paymentmanagementdata.account == null) {
							req.session.approveerror = `Could not set procedure date. Possibly missing bank account information. Please call ${sails.config.lender.shortName} for assistance at ${sails.config.lender.phone}`;
						}
						else {
							req.session.approveerror = 'Could not set proceedure date. Applicant may already have an existing loan';
						}
						return res.redirect("admin/getOpenApplicationDetails");
					}
					else {

						PaymentManagement.update({ id: payID }, { blockachcredit: 1 })
							.exec(function afterwards(err, paymentupdated) {

								ActumService.createActumCreditFile(paymentmanagementdata, req, res)
									.then(function (responseData) {

										//sails.log.info("responseData:",responseData);
										if (responseData.code == 200) {
											var creditfilepath = responseData.creditfilepath;

											PaymentManagement.findOne(payoptions)
												.then(function (paymentManagement) {

													var nextPaymentSchedule = '';
													var maturityDate = '';
													var counter = 1;
													var datecounter = 0;
													_.forEach(paymentManagement.paymentSchedule, function (schedule) {
														var paydate = moment(loanstartdate).startOf('day').add(counter, 'months').toDate();
														var lastpaydate = moment(loanstartdate).startOf('day').add(datecounter, 'months').toDate();

														//schedule.transaction = transactionDetails.TransactionId;
														schedule.date = paydate;
														schedule.lastpaiddate = lastpaydate;

														if (counter == 1) {
															nextPaymentSchedule = paydate;
														}
														maturityDate = paydate;

														counter++;
														datecounter++;
													});

													var loanTerm = paymentManagement.loantermcount
													var maturityDate = moment(loanstartdate).startOf('day').add(loanTerm, 'months');

													paymentManagement.achstatus = 1;
													paymentManagement.transferstatus = 1;
													//paymentManagement.transfertransactionid =transactionDetails.TransactionId;
													paymentManagement.nextPaymentSchedule = nextPaymentSchedule;
													paymentManagement.maturityDate = maturityDate;
													paymentManagement.localcreditfilepath = creditfilepath;

													paymentManagement.loanStartdate = moment(loanstartdate).format('YYYY-MM-DD');
													paymentManagement.loanApprovedDate = moment().startOf('day').format('YYYY-MM-DD');
													paymentmanagementdata.appverified = 1;
													paymentManagement.status = "OPENED";

													//sails.log.info("paymentManagement:",paymentManagement);

													paymentManagement.save(function (err) {
														if (err) {
															sails.log.error('AchController#approvePatientloanAction :: err', err);
															req.session.approveerror = '';
															req.session.approveerror = 'Unable to approve the loan. Try again!';
															return res.redirect("admin/getOpenApplicationDetails");
														}

														ApplicationService
															.reGeneratepromissorypdf(paymentManagement.id, paymentManagement.user, req, res)
															.then(function (generatedResponse) {

																if (generatedResponse) {

																	//-- Genreating shorter version of promissory pdf
																	UserConsent
																		.reGenerateLendingDisclosureAgreement(paymentManagement.id, res, req)
																		.then(function (lendingreponse) {

																			var loanData = {
																				'loanReference': paymentmanagementdata.loanReference,
																				'email': paymentmanagementdata.user.email,
																				'firstname': paymentmanagementdata.user.firstname,
																				'lastname': paymentmanagementdata.user.lastname,
																				'user': paymentmanagementdata.user
																			};

																			sails.log.info("loanData:", loanData);

																			EmailService.sendFundedLoanMail(loanData);


																			var modulename = 'Loan Funded';
																			var modulemessage = 'Pending applications moved to funded successfully';
																			req.achlog = 1;
																			req.payID = payID;
																			Logactivity.registerLogActivity(req, modulename, modulemessage);

																			req.session.successmsg = '';
																			req.session.successmsg = 'Loan has been approved successfully';

																			FirstAssociatesService.processAndUploadFirstAssociatesLoanDocument(paymentManagement.id).then((results) => {
																				return res.redirect("admin/getOpenApplicationDetails");
																			}).catch((errorObj) => {
																				sails.log.error("AchController#confirmProcedureAction :: first associates csv err", errorObj);
																				return res.redirect("admin/getOpenApplicationDetails");
																			});
																		})
																		.catch(function (err) {
																			req.session.approveerror = '';
																			req.session.approveerror = 'Unable to approve the loan. Try again!';

																			req.session.successmsg = '';
																			req.session.successmsg = '';
																			sails.log.error('AchController#getAchUserDetailsAction :: err', err);
																			return res.redirect("admin/getOpenApplicationDetails");
																		});
																}
																else {
																	req.session.approveerror = '';
																	req.session.approveerror = 'Unable to approve the loan. Try again!';
																	sails.log.error('AchController#getAchUserDetailsAction :: err', err);
																	return res.redirect("admin/getOpenApplicationDetails");
																}
															}).catch(function (err) {
																sails.log.error('AchController#approvePatientloanAction :: err', err);
																req.session.approveerror = '';
																req.session.approveerror = 'Unable to approve the loan. Try again!';
																return res.redirect("admin/getOpenApplicationDetails");
															});
													});
												})
												.catch(function (err) {
													sails.log.error('AchController#approvePatientloanAction :: err', err);
													req.session.approveerror = '';
													req.session.approveerror = 'Unable to approve the loan. Try again!';
													return res.redirect("admin/getOpenApplicationDetails");
												});
										}
										else {
											var failedcreditcount = 1;
											if (paymentmanagementdata.failedcreditcount) {
												var failedcreditcount = parseInt(paymentmanagementdata.failedcreditcount) + 1;
											}
											PaymentManagement.update({ id: payID }, { blockachcredit: 0, failedcreditcount: failedcreditcount })
												.exec(function afterwards(err, userupdated) {
													sails.log.error('AchController#approvePatientloanAction :: err', responseData.responseMsg);
													req.session.approveerror = '';
													req.session.approveerror = 'Unable to approve the loan. Try again!';
													return res.redirect("admin/getOpenApplicationDetails");
												});
										}
									})
									.catch(function (err) {
										sails.log.error('AchController#approvePatientloanAction :: err', err);
										req.session.approveerror = '';
										req.session.approveerror = 'Unable to approve the loan. Try again!';
										return res.redirect("admin/getOpenApplicationDetails");
									});
							});
					}
					/*}*/
				}
				else {
					sails.log.error('AchController#approvePatientloanAction :: missing paymentmanagement');
					req.session.approveerror = '';
					req.session.approveerror = 'Unable to Approve the loan. Try again!';
					return res.redirect("admin/getOpenApplicationDetails");
				}

			}).catch(function (err) {
				sails.log.error('AchController#approvePatientloanAction :: err', err);
				req.session.approveerror = '';
				req.session.approveerror = 'Unable to Approve the loan. Try again!';
				return res.redirect("admin/getOpenApplicationDetails");
			});
	}
	else {
		sails.log.error('AchController#approvePatientloanAction :: missing paymentID');
		req.session.approveerror = '';
		req.session.approveerror = 'Unable to Approve the loan. Try again!';
		return res.redirect("admin/getOpenApplicationDetails");
	}
}



function updateSetDateAction(req, res) {

	var payID = req.param('paymentID');
	var loanSetdate = req.param('loanSetdate');

	if (payID) {
		var payoptions = { id: payID };

		PaymentManagement
			.findOne(payoptions)
			.then(function (paymentmanagementdata) {

				if (paymentmanagementdata) {
					paymentmanagementdata.loanSetdate = moment(loanSetdate).format('YYYY-MM-DD');
					paymentmanagementdata.appverified = 1;
					paymentmanagementdata.save(function (err) {
						if (err) {
							var json = {
								status: 400,
								message: `Unable to update set date ${err}`
							};
							res.contentType('application/json');
							res.json(json);
						}
						else {

							var modulename = 'Set Date Update';
							var modulemessage = 'Set Date Update in Pending Applications successfully.';
							req.achlog = 1;
							req.payID = payID;
							//req.logdata=paymentmanagementdata;
							Logactivity.registerLogActivity(req, modulename, modulemessage);
							//-- Loan set date
							var loanSetDateExist = 0;
							var showApproveButton = 0;

							if (paymentmanagementdata.loanSetdate) {
								loanSetDateExist = 1;

								if (moment().startOf('day').toDate().getTime() == moment(paymentmanagementdata.loanSetdate).startOf('day').toDate().getTime()) {
									showApproveButton = 1;
								}
							}

							var json = {
								status: 200,
								message: 'Set date updated successfully',
								loanSetDateExist: loanSetDateExist,
								showApproveButton: showApproveButton
							};
							res.contentType('application/json');
							res.json(json);
						}
					});
				}
				else {
					var json = {
						status: 400,
						message: 'Invalid payment details'
					};
					res.contentType('application/json');
					res.json(json);
				}
			}).catch(function (err) {
				var json = {
					status: 400,
					message: 'Unable to fetch payment details'
				};
				res.contentType('application/json');
				res.json(json);
			});
	}
	else {
		var json = {
			status: 400,
			message: 'Unable to update set date'
		};
		res.contentType('application/json');
		res.json(json);
	}
}
function updatePatientloanstartdateAction(req, res) {
	var payID = req.param('paymentID');
	var loanstartdate = req.param('updateloanstartdate');
	var allParams = req.allParams();
	if (payID) {
		var payoptions = { id: payID, achstatus: 1 };
		PaymentManagement.findOne(payoptions)
			.populate('user')
			.populate('account')
			.then(function (paymentmanagementdata) {
				if (paymentmanagementdata) {
					PaymentManagement
						.findOne(payoptions)
						.then(function (paymentManagement) {
							var existingstartDatetime = moment(paymentManagement.loanStartdate).startOf('day').toDate().getTime();
							var loanstartdatetime = moment(loanstartdate).startOf('day').toDate().getTime();
/*					sails.log.info("existingstartDatetime:",existingstartDatetime);
					sails.log.info("loanstartdatetime:",loanstartdatetime);
*/					if (existingstartDatetime == loanstartdatetime) {
								req.session.successmsg = '';
								req.session.successmsg = 'Application procedure date updated successfully.';
								return res.redirect("admin/showAllComplete");
							}
							else {
								var nextPaymentSchedule = '';
								var maturityDate = '';
								var counter = 1;
								var datecounter = 0;
								_.forEach(paymentManagement.paymentSchedule, function (schedule) {
									var paydate = moment(loanstartdate).startOf('day').add(counter, 'months').toDate();
									var lastpaydate = moment(loanstartdate).startOf('day').add(datecounter, 'months').toDate();
									schedule.date = paydate;
									schedule.lastpaiddate = lastpaydate;

									if (counter == 1) {
										nextPaymentSchedule = paydate;
									}
									maturityDate = paydate;

									counter++;
									datecounter++;
								});

								var loanTerm = paymentManagement.loantermcount
								var maturityDate = moment(loanstartdate).startOf('day').add(loanTerm, 'months');

								paymentManagement.achstatus = 1;
								paymentManagement.transferstatus = 1;
								paymentManagement.nextPaymentSchedule = nextPaymentSchedule;
								paymentManagement.maturityDate = maturityDate;
								paymentManagement.loanStartdate = moment(loanstartdate).format('YYYY-MM-DD');
								paymentManagement.loanSetdate = moment(loanstartdate).format('YYYY-MM-DD');
								paymentManagement.loanApprovedDate = moment().startOf('day').format('YYYY-MM-DD');

								paymentManagement.save(function (err) {
									if (err) {
										req.session.approveerror = '';
										req.session.approveerror = 'Unable to set the procedure date. Try again!';
										return res.redirect("admin/showAllComplete");
									}
									ApplicationService
										.reGeneratepromissorypdf(paymentManagement.id, paymentManagement.user, req, res)
										.then(function (generatedResponse) {
											if (generatedResponse) {
												UserConsent
													.reGenerateLendingDisclosureAgreement(paymentManagement.id, res, req)
													.then(function (lendingreponse) {
														var loanData = {
															'loanReference': paymentmanagementdata.loanReference,
															'email': paymentmanagementdata.user.email,
															'firstname': paymentmanagementdata.user.firstname,
															'lastname': paymentmanagementdata.user.lastname
														};

														sails.log.info("loanData:", loanData);

														var modulename = 'Update procedure start date from funded';
														var modulemessage = 'Update procedure start date updated successfully';
														req.achlog = 1;
														req.payID = payID;
														Logactivity.registerLogActivity(req, modulename, modulemessage);

														req.session.successmsg = '';
														req.session.successmsg = 'Application procedure date updated successfully.';
														return res.redirect("admin/showAllComplete");
													})
													.catch(function (err) {
														req.session.approveerror = '';
														req.session.approveerror = 'Unable to set the procedure date. Try again!';
														sails.log.error('AchController#updatePatientloanstartdateAction :: err', err);
														return res.redirect("admin/showAllComplete");
													});
											}
										}).catch(function (err) {
											sails.log.error('AchController#updatePatientloanstartdateAction :: err', err);
											req.session.approveerror = '';
											req.session.approveerror = 'Unable to procedure date. Try again!';
											return res.redirect("admin/showAllComplete");
										});
								});
							}
						}).catch(function (err) {
							req.session.approveerror = '';
							req.session.approveerror = 'Unable to set the procedure date. Try again. Try again!';
							return res.redirect("admin/showAllComplete");
						});
				}
				else {
					req.session.approveerror = '';
					req.session.approveerror = 'Unable to set the procedure date. Try again!';
					return res.redirect("admin/showAllComplete");
				}
			}).catch(function (err) {
				req.session.approveerror = '';
				req.session.approveerror = 'Unable to set the procedure date. Try again!';
				return res.redirect("admin/showAllComplete");
			});
	}
	else {
		req.session.approveerror = '';
		req.session.approveerror = 'Unable to set the procedure date. Try again!';
		return res.redirect("admin/showAllComplete");
	}
}

function movetoopenupdateAction(req, res) {
	var paymentID = req.param('paymentID');
	var payCriteria = { id: paymentID };

	PaymentManagement.findOne(payCriteria)
		.then(function (paymentmanagementdata) {

			paymentmanagementdata.moveToOpen = 1;
			paymentmanagementdata.save(function (err) {
				if (err) {
					var json = {
						status: 400,
						message: "Unable to Update Pending loan. Try again!"
					};
					res.contentType('application/json');
					res.json(json);
				} else {
					Screentracking.findOne({ id: paymentmanagementdata.screentracking })
						.then(function (screenData) {
							screenData.moveToIncomplete = 1;
							screenData.save(function (err1) {
								if (err1) {
									var json = {
										status: 400,
										message: "Unable to Update Pending loan. Try again!"
									};
									res.contentType('application/json');
									res.json(json);
								}
								else {
									var modulename = 'Application moved from archive to open.';
									var modulemessage = 'Application moved from archive to open.';
									req.achlog = 1;
									req.payID = paymentID;
									//req.logdata=paymentmanagementdata;
									Logactivity.registerLogActivity(req, modulename, modulemessage);
									var json = {
										status: 200,
										message: 'Application moved to open successfully.'
									};
									res.contentType('application/json');
									res.json(json);
								}
							});
						});
				}
			})
		})
}

function markAsReviewedAction(req, res) {
	var paymentID = req.param('paymentID');
	var payCriteria = { id: paymentID };

	PaymentManagement.findOne(payCriteria)
		.then(function (paymentmanagementdata) {

			paymentmanagementdata.appverified = 1;
			paymentmanagementdata.save(function (err) {
				if (err) {
					var json = {
						status: 400,
						message: "Unable to Update Denied loan. Try again!"
					};
					res.contentType('application/json');
					res.json(json);
				}
				else {
					var modulename = 'Mark As Reviewed';
					var modulemessage = 'Denied applications marked as reviewed successfully.';
					req.achlog = 1;
					req.payID = paymentID;
					//req.logdata=paymentmanagementdata;
					Logactivity.registerLogActivity(req, modulename, modulemessage);
					var json = {
						status: 200,
						message: 'Application marked as complete successfully.'
					};
					res.contentType('application/json');
					res.json(json);
				}
			})
		})
}


function ajaxOpenApplicationAch(req, res) {
	let viewtype = "open";
	if (!!req.param("viewtype")) {
		viewtype = req.param("viewtype");
	}
	let colS = "";
	let totalrecords = 0;
	let screenResdata = [];
	let matchcriteria = {};
	let whereConditionAnd = new Array();
	let whereConditionOr = new Array();
	let sorttype = 1;
	if (req.query.sSortDir_0 == 'desc') {
		sorttype = -1;
	}

	if (viewtype == "open") {
		payFilterData = [{ paymentdata: { $ne: [] }, iscompleted: 1, "paymentdata.achstatus": 0 }];
	} else if (viewtype == "openPending") {
		payFilterData = [{
			$and: [
				{ iscompleted: 1 },
				{ paymentdata: { $ne: [] } },
				{ "paymentdata.status": "PENDING" }
			]
		}];
	} else if (viewtype === "openIncomplete") {
		payFilterData = [{
			$and: [
				{ iscompleted: 0 },
				{ "paymentdata.achstatus": 4 },
				{ "paymentdata.status": "INCOMPLETE" },
				{ $or: [{ moveToArchive: { $exist: false }, moveToArchive: { $ne: 1 } }] }
			]
		}];
	} else if (viewtype == "archived") {
		payFilterData = [
			// { $and: [ { moveToArchive: { $eq: 1 } }, { iscompleted: 0 } ] }
			{ $and: [{ moveToArchive: { $eq: 1 } }] } // FHC-125, be able to see all archived application whether they're open or not.
		];
	} else if (viewtype == "toDoItems") {
		payFilterData = [
			{ paymentdata: { $eq: [] }, iscompleted: 0 },
			{ paymentdata: { $ne: [] }, iscompleted: 1, "paymentdata.achstatus": 0 }
		];
	} else {
		payFilterData = [
			{ paymentdata: { $eq: [] }, iscompleted: 0 },
			{ paymentdata: { $ne: [] }, iscompleted: 1, "paymentdata.achstatus": 0 }
		];
	}

	let andCriteria = [
		// { userdata : { $ne: [] } },
		{ $or: payFilterData }
	]

	if (req.query.sSearch) {
		whereConditionOr.push({ "userdata.userReference": { '$regex': req.query.sSearch, $options: 'i' } });
		whereConditionOr.push({ "applicationReference": { '$regex': req.query.sSearch, $options: 'i' } });
		whereConditionOr.push({ "paymentdata.loanReference": { '$regex': req.query.sSearch, $options: 'i' } });
		whereConditionOr.push({ "userdata.firstname": { '$regex': req.query.sSearch, $options: 'i' } });
		whereConditionOr.push({ "userdata.lastname": { '$regex': req.query.sSearch, $options: 'i' } });
		whereConditionOr.push({ "userdata.email": { '$regex': req.query.sSearch, $options: 'i' } });
		whereConditionOr.push({ "userdata.phoneNumber": { '$regex': req.query.sSearch, $options: 'i' } });


		//-- for search filter for application type
		var searchstring = req.query.sSearch;
		if (searchstring.toLowerCase() == 'pending') {
			whereConditionOr.push({ "paymentdata.achstatus": 0 });
		}
		if (searchstring.toLowerCase() == 'denied') {
			whereConditionOr.push({ "paymentdata.achstatus": 2 });
		}
		if (searchstring.toLowerCase() == 'incomplete') {
			whereConditionOr.push({ "iscompleted": 0 });
		}
		andCriteria.push({ $or: whereConditionOr });
	}

	matchcriteria = { $and: andCriteria }

	if (!!req.session.adminpracticeID) {
		matchcriteria.practicemanagement = new ObjectId(req.session.adminpracticeID);
	}
	console.log(JSON.stringify(matchcriteria, null, 4));
	Screentracking.native(function (err, collection) {
		collection.aggregate([
			{
				$lookup: {
					from: "paymentmanagement",
					localField: "_id",
					foreignField: "screentracking",
					as: "paymentdata"
				},
			},
			{
				$match: matchcriteria
			},
			{
				$count: "screentrackingcount"
			}
		],
			function (err, result) {
				sails.log.info("screen tracking result--->: ", result);
				if (err) {
					return res.serverError(err);
				}
				iDisplayLengthvalue = parseInt(req.query.iDisplayLength);
				skiprecord = parseInt(req.query.iDisplayStart);
				if (result.length > 0) {
					totalrecords = result[0].screentrackingcount;
					sails.log.info("totalrecords:", totalrecords);



					Screentracking.native(function (err, collection) {
						collection.aggregate([
							{
								$lookup: {
									from: "user",
									localField: "user",
									foreignField: "_id",
									as: "userdata"
								}
							},
							{
								$lookup: {
									from: "achcomments",
									localField: "user",
									foreignField: "user",
									as: "achcomments"
								},
							},
							{
								$unwind: "$userdata"
							},
							{
								$lookup: {
									from: "paymentmanagement",
									localField: "_id",
									foreignField: "screentracking",
									as: "paymentdata"
								}
							},
							{
								$match: matchcriteria
							}
						],
							function (err, screenDetails) {
								if (err) {
									return res.serverError(err);
								}

								// THIS CODE FIXES _.sortBy sorting issue (if a string starts with "C" the sorting doesnt work right)
								screenDetails.forEach(function (item, index) {
									item.userdata.state = item.userdata.state.toLowerCase()
									if (item.achcomments.length > 0) {
										const validDates = item.achcomments.filter(comment => !!Date.parse(comment.reminder))
										const dates = validDates.map(comment => comment.reminder)
										dates.sort((a, b) => new Date(a) - new Date(b));
										item.reminder = moment(dates[0]).format('MM-DD-YYYY')
									} else {
										item.reminder = 'no date'
									}
								})
								// -----

								if (screenDetails.length <= 0) {
									var json = {
										sEcho: req.query.sEcho,
										iTotalRecords: totalrecords,
										iTotalDisplayRecords: totalrecords,
										aaData: screenResdata
									};
									res.contentType('application/json');
									res.json(json);
								}

								if (req.query.sSortDir_0 == 'desc') {
									switch (req.query.iSortCol_0) {
										case '0': screenDetails = _.sortBy(screenDetails, '_id').reverse(); break;
										case '1': screenDetails = _.sortBy(screenDetails, 'userdata.userReference').reverse(); break;
										case '2': screenDetails = _.sortBy(screenDetails, 'applicationReference').reverse(); break;
										case '3': screenDetails = _.sortBy(screenDetails, 'userdata.firstname').reverse(); break;
										case '4': screenDetails = _.sortBy(screenDetails, 'userdata.email').reverse(); break;
										case '5': screenDetails = _.sortBy(screenDetails, 'userdata.phoneNumber').reverse(); break;
										case '7': screenDetails = _.sortBy(screenDetails, 'createdAt').reverse(); break;
										case '8': screenDetails = _.sortBy(screenDetails, 'reminder').reverse(); break;
										default: break;
									};
								} else {
									switch (req.query.iSortCol_0) {
										case '0': screenDetails = _.sortBy(screenDetails, '_id'); break;
										case '1': screenDetails = _.sortBy(screenDetails, 'userdata.userReference'); break;
										case '2': screenDetails = _.sortBy(screenDetails, 'applicationReference'); break;
										case '3': screenDetails = _.sortBy(screenDetails, 'userdata.firstname'); break;
										case '4': screenDetails = _.sortBy(screenDetails, 'userdata.email'); break;
										case '5': screenDetails = _.sortBy(screenDetails, 'userdata.phoneNumber'); break;
										case '7': screenDetails = _.sortBy(screenDetails, 'createdAt'); break;
										case '8': screenDetails = _.sortBy(screenDetails, 'reminder'); break;
										default: break;
									};
								}
								screenDetails = screenDetails.splice(skiprecord, iDisplayLengthvalue + skiprecord);
								screenDetails.forEach(function (screentrackingdata, loopvalue) {

									loopid = loopvalue + skiprecord + 1;
									let userReference = "--"
									let appReference = "--";
									let fullname = "--";
									let useremail = "--";
									let origin = '--';
									let userphoneNumber = "--";
									let payOffAmountValue = "$0.00";

									let userinfo = screentrackingdata.userdata;

									let paymentdetails = screentrackingdata.paymentdata;
									if (paymentdetails && paymentdetails.length > 0) {
										paymentdetails = paymentdetails[0];
									}

									if (!!userinfo.userReference) {
										userReference = userinfo.userReference;
									}
									if (!!screentrackingdata.applicationReference) {
										appReference = '<a href="/admin/viewIncomplete/' + screentrackingdata._id + '">' + screentrackingdata.applicationReference + '</a>';
									}


									if (!!userinfo.firstname) {
										fullname = userinfo.firstname + " " + userinfo.lastname;
									}

									if (!!userinfo.email) {
										useremail = userinfo.email;
									}

									if (!!screentrackingdata.origin) {
										origin = screentrackingdata.origin;
									}

									if (!!userinfo.phoneNumber) {
										userphoneNumber = userinfo.phoneNumber;
									}

									if (!!screentrackingdata.requestedLoanAmount) {
										payOffAmountValue = new Number(screentrackingdata.requestedLoanAmount).toLocaleString("en-US", { style: "currency", currency: "USD" });
									}

									screentrackingdata.createdAt = moment(screentrackingdata.createdAt).tz("america/los_angeles").format('MM-DD-YYYY hh:mm:ss');
									screentrackingdata.reminder = screentrackingdata.reminder == 'no date' ? '--' : screentrackingdata.reminder
									// ARCHIVED / INCOMPLETE APPLICATIONS LIST
									screenResdata.push({
										loopid: loopid,
										userReference: userReference,
										applicationReference: appReference,
										name: fullname,
										email: useremail,
										origin: origin,
										phoneNumber: userphoneNumber,
										payOffAmount: payOffAmountValue,
										createdAt: screentrackingdata.createdAt,
										reminder: screentrackingdata.reminder || ''
									});
								});

								var json = {
									sEcho: req.query.sEcho,
									iTotalRecords: totalrecords,
									iTotalDisplayRecords: totalrecords,
									aaData: screenResdata
								};
								res.contentType('application/json');
								res.json(json);
							});
					});
				} else {
					var json = {
						sEcho: req.query.sEcho,
						iTotalRecords: totalrecords,
						iTotalDisplayRecords: totalrecords,
						aaData: screenResdata
					};
					res.contentType("application/json");
					res.json(json);

				}
			});
	});
}

function movetoUnarchiveAction(req, res) {
	var paymentID = req.param('paymentid');
	var payCriteria = { id: paymentID };
	PaymentManagement.findOne(payCriteria)
		.then(function (paymentmanagementdata) {
			//-- modified on nov 29, 2018
			paymentmanagementdata.moveToArchive = 0;
			paymentmanagementdata.status = "OPENED";
			paymentmanagementdata.save(function (err) {
				if (err) {
					req.session.approveerror = 'Unable to unarchive the application. Try again!';
					var json = {
						status: 400,
						message: "Unable to unarchive the application. Try again!"
					};
					res.contentType('application/json');
					res.json(json);
				}
				else {
					req.session.successmsg = 'Application unarchived successfully';
					var modulename = 'Application moved from archived to in progress contracts.';
					var modulemessage = 'Unarchived approved contracts.';
					req.achlog = 1;
					req.payID = paymentID;
					//req.logdata=paymentmanagementdata;
					Logactivity.registerLogActivity(req, modulename, modulemessage);
					var json = {
						status: 200,
						message: 'Application unarchived successfully.'
					};
					res.contentType('application/json');
					res.json(json);
				}
			})
		})
}

function providerlistAction(req, res) {

	return res.view("admin/practice/providerList");

}

function ajaxProviderAction(req, res) {

	var colS = "";
	var sorttype = 1;
	if (req.query.sSortDir_0 == 'desc') {
		var sorttype = -1;
	}

	switch (req.query.iSortCol_0) {
		case '0': var sorttypevalue = { '_id': sorttype }; break;
		case '1': var sorttypevalue = { 'providername': sorttype }; break;
		case '2': var sorttypevalue = { 'firstname': sorttype }; break;
		case '3': var sorttypevalue = { 'lastname': sorttype }; break;
		case '4': var sorttypevalue = { 'email': sorttype }; break;
		case '5': var sorttypevalue = { 'phonenumber': sorttype }; break;
		case '6': var sorttypevalue = { 'city': sorttype }; break;
		case '7': var sorttypevalue = { 'state': sorttype }; break;
		case '8': var sorttypevalue = { 'createdAt': sorttype }; break;
		default: break;
	};

	//Search
	if (req.query.sSearch) {
		sails.log.info("search value: ", req.query.sSearch);
		var criteria = {
			or: [{ providerName: { 'contains': req.query.sSearch } }, { firstName: { 'contains': req.query.sSearch } }, { lastName: { 'contains': req.query.sSearch } }, { emailAddress: { 'contains': req.query.sSearch } }, { city: { 'contains': req.query.sSearch } }, { state: { 'contains': req.query.sSearch } }, { createdAt: { 'contains': req.query.sSearch } }]
		};

	}
	else {
		var criteria = {};
	}


	var skiprecord = parseInt(req.query.iDisplayStart);
	var iDisplayLength = parseInt(req.query.iDisplayLength);
	var providerData = [];
	var totalrecords = 0;
	var loopid;
	Provider.count(criteria).exec(function countCB(error, totalrecords) {

		if (totalrecords > 0) {
			Provider
				.find(criteria)
				.sort(sorttypevalue)
				.skip(skiprecord)
				.limit(iDisplayLength)
				.then(function (providerDetails) {

					providerDetails.forEach(function (providerinfo, loopvalue) {
						loopid = loopvalue + skiprecord + 1;
						providerinfo.createdAt = moment(providerinfo.createdAt).format('MM-DD-YYYY');
						if ("undefined" === typeof providerinfo.providername || providerinfo.providername == '' || providerinfo.providername == null) {
							providerinfo.providername = '--';
						}

						if ("undefined" === typeof providerinfo.firstname || providerinfo.firstname == '' || providerinfo.firstname == null) {
							providerinfo.firstname = '--';
						}
						if ("undefined" === typeof providerinfo.lastname || providerinfo.lastname == '' || providerinfo.lastname == null) {
							providerinfo.lastname = '--';
						}
						if ("undefined" === typeof providerinfo.email || providerinfo.email == '' || providerinfo.email == null) {
							providerinfo.email = '--';
						}
						if ("undefined" === typeof providerinfo.city || providerinfo.city == '' || providerinfo.city == null) {
							providerinfo.city = '--';
						}
						if ("undefined" === typeof providerinfo.phonenumber || providerinfo.phonenumber == '' || providerinfo.phonenumber == null) {
							providerinfo.phonenumber = '--';
						}
						if ("undefined" === typeof providerinfo.state || providerinfo.state == '' || providerinfo.state == null) {
							providerinfo.state = '--';
						}
						if ("undefined" === typeof providerinfo.createdAt || providerinfo.createdAt == '' || providerinfo.createdAt == null) {
							providerinfo.createdAt = '--';
						}

						var actiondata = '<a href="/admin/createpractice/' + providerinfo.id + '"><i class="fa fa-eye" aria-hidden="true"></i></a>';

						providerData.push({ loopid: loopid, providerName: providerinfo.providername, firstName: providerinfo.firstname, lastName: providerinfo.lastname, emailAddress: providerinfo.email, city: providerinfo.city, phoneNumber: providerinfo.phonenumber, state: providerinfo.state, createdAt: providerinfo.createdAt, actiondata: actiondata });
					});

					var json = {
						sEcho: req.query.sEcho,
						iTotalRecords: totalrecords,
						iTotalDisplayRecords: totalrecords,
						aaData: providerData
					};
					res.contentType('application/json');
					res.json(json);
				});
		}
		else {
			var json = {
				sEcho: req.query.sEcho,
				iTotalRecords: totalrecords,
				iTotalDisplayRecords: totalrecords,
				aaData: providerData
			};
			res.contentType('application/json');
			res.json(json);
		}
	});
}

function confirmProcedure(req, res) {

	const payID = req.param("id");
	res.contentType("application/json");
	if (!payID) {
		res.json({
			message: "Invalid Data"
		}, 400);
		return;
	}

	PaymentManagement.findOne({
		id: payID
	}).then((paymentmanagementdata) => {
		if (paymentmanagementdata && paymentmanagementdata.procedureWasConfirmed !== 1) {
			PaymentManagement.update({ id: payID }, { procedureWasConfirmed: 1, procedureConfirmedDate: moment().toDate() }).exec(function afterwards(err, paymentUpdated) {

				if (err) {
					sails.log.error("AchController#confirmProcedureAction :: err", err);
					res.json({
						message: "Unable to confirm this procedure."
					}, 500);
					return;
				} else {
					//uplodate first associate document
					FirstAssociatesService.processAndUploadFirstAssociatesLoanDocument(payID).then((results) => {
						res.json({
							message: "success"
						});
					}).catch((errorObj) => {
						sails.log.error("AchController#confirmProcedureAction :: err", errorObj);
						res.json({
							message: "Unable to generate first associate csv file"
						}, 500);
					});
				}
			});
		} else {
			sails.log.error("AchController#confirmProcedureAction :: err - This procedure was already confirmed");
			res.json({
				message: "success"
			});
		}

	}).catch((errorObj) => {
		sails.log.error("AchController#confirmProcedureAction :: Error :: ", errorObj);
		const errors = errorObj.message;
		sails.log.error("AchController#confirmProcedureAction :: err", errors);
		res.json({ errors });
	});
}

function reGeneratePaymentScheduleCalendar(req, res) {
	const firstPaymentDateString = req.param("firstPaymentDate");
	const payID = req.param("paymentId");
	const bankHolidayDirection = parseInt(req.param("bankHolidayDirection") || "0");
	const frequency = req.param("payFrequency");
	if (!firstPaymentDateString || !payID) {
		const errorMessage = "Missing required data to regenerate payment schedule calendar.";
		sails.log.error("AchController#refreshPaymentScheduleCalendar :: err - ", errorMessage);
		return res.status(400).json({
			message: errorMessage
		});
	}
	const newFirstPaymentDate = SmoothPaymentService.getNextPaymentDateScheduleByMonths(moment(firstPaymentDateString, "MMMM D, YYYY").toDate(), frequency, 3, bankHolidayDirection === EmploymentHistory.decisionCloudIsAfterHoliday.AFTER_HOLIDAY);
	return res.json(newFirstPaymentDate)
}

function createCounterSignedPdf(paymentId, req, res) {
	const ip = (req.headers["x-forwarded-for"] || req.headers["x-real-ip"] || req.connection.remoteAddress).replace("::ffff:", "").replace(/^::1$/, "127.0.0.1");
	let userId;
	let practiceId;
	let programId;
	let consentId = "";
	let userconsentdetails = {};
	const eftaCheckbox = "checked";

	return PaymentManagement.findOne({ id: paymentId })
		.then((paydata) => {
			if (!paydata) {
				throw new Error("paymentmanagement id is required");
			}
			userId = paydata.user;
			practiceId = paydata.practicemanagement;
			sails.log.info("JH AchController.js createCounterSignedPdf userId", userId);
			return Screentracking.findOne({ id: paydata.screentracking }).populate("user");
		})
		.then((screentrackingdetails) => {
			const applicationReference = screentrackingdetails.applicationReference;
			const userReference = screentrackingdetails.user.userReference;
			req.session.applicationReference = applicationReference;
			req.session.userReference = userReference;
			const screenId = screentrackingdetails.id;
			programId = screentrackingdetails.schoolprogram;
			/* ============== Promissory Note save ========================== */
			return Agreement.findOne({ documentKey: "131", practicemanagement: practiceId })
				.then((agreement) => {
					//sails.log.info( "agreement:", agreement );
					return UserConsent.createConsent(agreement, screentrackingdetails.user, ip, screenId, paymentId)
				})
				.then((_userconsentdetails) => {
					userconsentdetails = _userconsentdetails;
					consentId = userconsentdetails.id;
					// sails.log.info( "userconsentdetails----------:", userconsentdetails );

					// return UserConsent.objectdataforpromissory( userId, req, res )
					return ApplicationService.getContractData(userId, programId, practiceId, screenId, ip, eftaCheckbox, req.user.name, true);
				})
				.then((isaInfomation) => {
					sails.log.info("isaInfomation----------:", isaInfomation);
					userconsentdetails.applicationReference = applicationReference;
					req.session.applicationReference = applicationReference;
					userconsentdetails.userReference = userReference;

					return UserConsent.createPromissoryAgreementPdf(consentId, userId, userconsentdetails, isaInfomation, eftaCheckbox, res, req);
				});
		})
		.catch((err) => {
			sails.log.error("ApplicationController#createpromissorypdfAction :: err:", err);
			return res.handleError(err);
		});
}

function _approveISA(payID, req, res) {
	let pdfPath = null;
	const options = { id: payID };
	// return PaymentManagement.findOne( options ).populate('user')//.populate('account')
	// .then( (paymentmanagementdata) => {
	// 	/* create the countersigned pdf */
	// 	return createCounterSignedPdf( paymentmanagementdata.id, req, res )
	// 	.then( ( consentdata ) => {
	// 		/* get the url for the counter-signed pdf */
	// 		if( consentdata ) {
	// 			return Utils.getS3Url( consentdata.agreementpath );
	// 		} else {
	// 			return null;
	// 		}
	// 	} );
	// } )
	// .then( ( newestISAPath ) => {
	//pdfPath = newestISAPath;
	return AchService.changeContractStatus(payID, "ACTIVE", req.user);
	// } )
	// .then( () => {
	// 	return pdfPath;
	// } )
}

function approveISA(req, res) {
	return Promise.resolve()
		.then(() => {
			var payID = req.param('paymentId');
			if (!payID) {
				throw new Error(" Payment ID argument required");
			}
			return _approveISA(payID, req, res);
		})
		.then((newestISAPath) => {
			res.contentType("text/html");
			res.json({ isapath: newestISAPath }, 200);
		})
		.catch((err) => {
			sails.log.error("AchController.approveISA; catch:", err, "session:", JSON.stringify(req.session), "params:", JSON.stringify(req.allParams()));
			return { code: 500, data: null };
		});
}
function showAllBankruptcies(req, res) {
	return res.view("admin/pendingach/partials/paymentBankruptcyList");
}
async function ajaxGetBankruptcyList(req, res) {
	try {
		const responseJson = await CollectionsService.lookupPaymentManagement(
			req.query.columns,
			{ isInBankruptcy: true },
			req.query.search ? req.query.search.value : "",
			[],
			req.query.order,
			req.query.start, req.query.length);

		return res.json(responseJson);

	} catch (exc) {
		sails.log.error("AchController#ajaxGetBankruptcyList: Error: ", exc);
		return res.json({ error: exc.message });
	}
}

async function ajaxUpdatePaymentBankruptcy(req, res) {
	try {
		const requestBody = req.body;
		if (!validateFieldsExist(["confirmReason", "paymentId"], requestBody) || !validateBankruptcyObj(requestBody)) {
			const errorMessage = `Unable to move this contract to a bankruptcy status. Missing required data`;
			sails.log.error("CollectionsController#ajaxUpdatePaymentBankruptcy: Error: ", errorMessage);
			return res.status(400).json({ message: errorMessage });
		}
		const paymentUpdate = await PlatformSpecificService.updatePaymentContractForBankruptcy(requestBody.paymentId, requestBody.bankruptcy, requestBody.confirmReason, req.user);// moveCollectionsContractPaymentStatus(requestBody.paymentId, requestBody.workflow, requestBody.confirmReason, req.user);
		if (paymentUpdate) {
			return res.json({ success: true });
		} else {
			const errorMessage = "There was a problem moving this contract to a bankruptcy status. Unknown error";
			sails.log.error("CollectionsController#ajaxUpdatePaymentBankruptcy: Error: ", errorMessage);
			return res.status(500).json({ message: errorMessage });
		}
	} catch (exc) {
		sails.log.error("CollectionsController#ajaxUpdatePaymentBankruptcy: Error: ", exc);
		return res.status(500).json({ message: exc.message });
	}
}
function validateBankruptcyObj(requestBody) {
	// {
	// 	"dischargeDate": "02-08-2020",
	// 	"lawyerFirm": "test firm",
	// 	"lawyerName": "My Lawyer Name test",
	// 	"lawyerPhone": "6568584741",
	// 	"lawyerAddress": "223 S St",
	// 	"lawyerCity": "Pleasant Grove",
	// 	"lawyerState": "GA",
	// 	"lawyerZip": "84602",
	// 	"workflow": "Bankruptcy",
	// 	"confirmReason": "my test reason",
	// 	"paymentId": "5e00ec3dcbe65f9864eebe5f"
	// }
	if (!requestBody || !requestBody.bankruptcy) {
		return false;
	}
	return !_.some(["dischargeDate", "bankruptcyType", "lawyerName", "lawyerPhone", "lawyerAddress", "lawyerCity", "lawyerState", "lawyerZip"], (field) => {
		return !requestBody.bankruptcy[field]
	});
}
function validateFieldsExist(fieldArray, requestBody) {
	return !_.some(fieldArray, (field) => {
		return !requestBody[field]
	});
}

/**************** Leads ****************/
function setupRequestDataForDataTableList(req) {
	var errorval = '';
	var successval = '';
	var newLoanupdateSuccessMsg = '';
	var newLoanupdateMsg = '';
	if (req.session.approveerror !== '') {
		errorval = req.session.approveerror;
		req.session.approveerror = '';
	}
	if (req.session.successmsg !== '') {
		successval = req.session.successmsg;
		req.session.successmsg = '';
	}
	if ("undefined" !== typeof req.session.newLoanupdateSuccessMsg && req.session.newLoanupdateSuccessMsg !== '' && req.session.newLoanupdateSuccessMsg != null) {
		newLoanupdateSuccessMsg = req.session.newLoanupdateSuccessMsg;
		req.session.newLoanupdateSuccessMsg = '';
	}
	if ("undefined" !== typeof req.session.newLoanupdateMsg && req.session.newLoanupdateMsg !== '' && req.session.newLoanupdateMsg != null) {
		newLoanupdateMsg = req.session.newLoanupdateMsg;
		req.session.newLoanupdateMsg = '';
	}

	//req.session.viewType = 'open';
	return responsedata = {
		approveerror: errorval,
		approvesuccess: successval,
		newLoanupdateMsg: newLoanupdateMsg,
		newLoanupdateSuccessMsg: newLoanupdateSuccessMsg
	};
}

function showLeadAchAction(req, res) {
	const responseData = _.assign({}, setupRequestDataForDataTableList(req), { viewStatus: "Lead" });
	res.view("admin/pendingach/openLeadList", responseData);
}

// Tranfer the comment from Achcomments to remind me later DB collection.
async function laterAchNeedsReviewAction(req, res) {
	let { commentID, laterTime } = req.body
	// const laterTime = req.form.laterTime;

	try {
		const comment = await Achcomments.findOne({ id: commentID })
		comment.resolved = false;
		comment.reminder = laterTime
		comment.save(function (err) {
			if (err) {
				console.log(err)
			}
			const json = {
				status: 200,
				message: `the reminder has been set for ${laterTime}`
			};
			res.contentType('application/json');
			res.json(json);
		})
	} catch (err) {
		console.log(err)

	}
}

// bill.TODD: reconstruct
async function resolveAchCommentsAction(req, res) {
	let { commentID } = req.body

	try {
		const comment = await Achcomments.findOne({ id: commentID })
		comment.resolved = true;
		comment.reminder = ''
		comment.save(function (err) {
			if (err) {
				console.log(err)
			}
			const json = {
				status: 200,
				message: `the comment set to <Resolved>`
			};
			res.contentType('application/json');
			res.json(json);
		})
	} catch (err) {
		console.log(err)

	}
}
async function waivePaymentItem(req, res) {
	try {
		const paymentId = req.param("paymentId");
		const scheduleItemIndex = parseInt(req.param("scheduleItemIndex") || "-1");
		if (!paymentId || scheduleItemIndex < 0) {
			const errorMessage = "Unable to waive this payment. Missing payment info."
			sails.log.error("AchController#waivePaymentItem Error: ", errorMessage);
			return res.status(400).json({ message: errorMessage });
		}
		const paymentManagement = await PaymentManagement.findOne({ id: paymentId }).populate("user").populate("screentracking");
		if (!paymentManagement) {
			const errorMessage = "Unable to waive this payment. Loan was not found."
			sails.log.error("AchController#waivePaymentItem Error: ", errorMessage);
			return res.status(404).json({ message: errorMessage });
		}
		const pmResponse = await AchService.processWaivePayment(paymentManagement, scheduleItemIndex, req.user);
		if (pmResponse && pmResponse.length > 0) {
			req.session.loadPaymentSheduleTab = true;
			req.session.successmsg = "Payment waived successfully!";
			return res.json({ paymentSchedule: pmResponse })
		}
		const errorMessage = "An unknown error occurred while waiving this payment."
		sails.log.error("AchController#waivePaymentItem Error: ", errorMessage);
		return res.status(500).json({ message: errorMessage });

	} catch (exc) {
		sails.log.error("AchController#waivePaymentItem Error: ", exc);
		return res.status(500).json({ message: exc.message });
	}
}

async function deferPaymentItem(req, res) {
	try {
		const paymentId = req.param("paymentId");
		const scheduleItemIndex = parseInt(req.param("scheduleItemIndex") || "-1");
		if (!paymentId || scheduleItemIndex < 0) {
			const errorMessage = "Unable to defer this payment. Missing payment info."
			sails.log.error("AchController#deferPaymentItem Error: ", errorMessage);
			return res.status(400).json({ message: errorMessage });
		}
		const paymentManagement = await PaymentManagement.findOne({ id: paymentId }).populate("user").populate("screentracking");
		if (!paymentManagement) {
			const errorMessage = "Unable to defer this payment. Loan was not found."
			sails.log.error("AchController#deferPaymentItem Error: ", errorMessage);
			return res.status(404).json({ message: errorMessage });
		}
		const ledger = PlatformSpecificService.getPaymentLedger(paymentManagement, moment().startOf("day").toDate());
		const pmResponse = await AchService.processDeferredPayment(paymentManagement, paymentManagement.screentracking, ledger, scheduleItemIndex, req.user);
		if (pmResponse && pmResponse.length > 0) {
			req.session.loadPaymentSheduleTab = true;
			req.session.successmsg = "Payment deferred successfully!";
			return res.json({ paymentSchedule: pmResponse })
		}
		const errorMessage = "An unknown error occurred while defer this payment."
		sails.log.error("AchController#deferPaymentItem Error: ", errorMessage);
		return res.status(500).json({ message: errorMessage });

	} catch (exc) {
		sails.log.error("AchController#deferPaymentItem Error: ", exc);
		return res.status(500).json({ message: exc.message });
	}
}
async function waiveEntireLoan(req, res) {
	try {
		const paymentId = req.param("paymentId");
		if (!paymentId) {
			const errorMessage = "Unable to waive this loan. Missing payment info."
			sails.log.error("AchController#waiveEntireLoan Error: ", errorMessage);
			return res.status(400).json({ message: errorMessage });
		}
		const paymentManagement = await PaymentManagement.findOne({ id: paymentId }).populate("user").populate("screentracking");
		if (!paymentManagement) {
			const errorMessage = "Unable to waive this loan. Loan was not found."
			sails.log.error("AchController#waiveEntireLoan Error: ", errorMessage);
			return res.status(404).json({ message: errorMessage });
		}
		const pmResponse = await AchService.waiveEntireLoan(paymentManagement, req.user);
		if (pmResponse && pmResponse.length > 0) {
			req.session.loadPaymentSheduleTab = true;
			req.session.successmsg = "Loan waived successfully!";
			return res.json({ success: true })
		}
		const errorMessage = "An unknown error occurred while waiving this loan."
		sails.log.error("AchController#waiveEntireLoan Error: ", errorMessage);
		return res.status(500).json({ message: errorMessage });
	} catch (exc) {
		sails.log.error("AchController#waiveEntireLoan Error: ", exc);
		return res.status(500).json({ message: exc.message });
	}
}

async function ajaxOriginateLoan(req, res) {
	try {
		const paymentId = req.param("paymentId");
		if (!paymentId) {
			const errorMessage = "Unable to originate this loan. Missing payment info."
			sails.log.error("AchController#ajaxOriginateLoan Error: ", errorMessage);
			return res.status(400).json({ message: errorMessage });
		}
		const paymentManagement = await PaymentManagement.findOne({ id: paymentId }).populate("user").populate("screentracking");
		if (!paymentManagement) {
			const errorMessage = "Unable to originate this loan. Loan was not found."
			sails.log.error("AchController#ajaxOriginateLoan Error: ", errorMessage);
			return res.status(404).json({ message: errorMessage });
		}
		const pmResponse = await AchService.originateLoan(paymentManagement, req.user);

		if (pmResponse && !!pmResponse.id) {
			req.session.successmsg = "Loan was originated and moved to pending.";
			return res.json({ success: true })
		}
		const errorMessage = "An unknown error occurred while originating this loan."
		sails.log.error("AchController#ajaxOriginateLoan Error: ", errorMessage);
		return res.status(500).json({ message: errorMessage });
	} catch (exc) {
		sails.log.error("AchController#ajaxOriginateLoan Error: ", exc);
		return res.status(500).json({ message: exc.message });
	}
}

function showFreshLeadsList(req, res) {
	res.view("admin/pendingach/FreshLeadsList", {});
}
async function ajaxFreshLeadList(req, res) {
	let matchCriteria = {
		$and: [
			{ $or: [{ moveToArchive: { $exists: false } }, { moveToArchive: { $eq: 0, $exists: true } }] },
			{ $or: [{ "userData.leadReject": { $exists: false } }, { "userData.leadReject": { $eq: false, $exists: true } }] },
		],
	}
	if (!!req.body.isCompletedFilter) {
		switch (!!req.body.isCompletedFilter ? parseInt(req.body.isCompletedFilter) : -1) {
			case 0: // by default, the filter is set to only show completed leads.
				matchCriteria["$and"].push({ iscompleted: 1, "paymentData.status": PaymentManagement.paymentManagementStatus.origination });
				break;
			case 1: // only show incomplete leads
				matchCriteria["$and"].push({ iscompleted: 0 });
				break;
			case 2: // show both finished and incomplete leads
				matchCriteria["$and"].push({ $or: [{ iscompleted: 0 }, { iscompleted: 1, "paymentData.status": PaymentManagement.paymentManagementStatus.origination }] },)
				break;
			default: // defaults to only completed leads.
				matchCriteria["$and"].push({ iscompleted: 1, "paymentData.status": PaymentManagement.paymentManagementStatus.origination });
				break;
		}
	}
	try {
		const responseJson = await AchService.getFreshLeadsList(
			req.body.columns,
			matchCriteria,
			req.body.search ? req.body.search.value : "",
			[],
			req.body.order,
			req.body.start, req.body.length);
		return res.json(responseJson)
	} catch (exc) {
		return res.json({ error: exc.message });
	}
}

async function savePaymentScheduleChanges(req, res) {
	try {
		const firstPaymentDateString = req.param("firstPaymentDate");
		const payID = req.param("paymentId");
		const isFundingConfirmationApproval = ((req.param("isFundingConfirmationApproval") || "").toLowerCase() === "true");
		const fundingPaymentType = req.param("fundingPaymentType") || null;
		let newOriginateDate = req.param("newOriginateDate") || null;
		if (!!newOriginateDate) {
			newOriginateDate = moment(newOriginateDate, "MM/DD/YYYY").startOf("day").toDate();
		}
		let updateLoanSetDate = false;
		console.log('===========payID===================>>>>>', payID)
		const dateArray = req.param("dateArray");
		const bankHolidayDirection = parseInt(req.param("bankHolidayDirection") || "0");
		const frequency = req.param("payFrequency");
		//=================

		let paymentManagement = await PaymentManagement.findOne({ id: payID }).populate("user").populate("screentracking");
		let loanSetDate = moment(paymentManagement.loanSetdate).startOf("day").toDate();
		if ([PaymentManagement.paymentManagementStatus.pending, PaymentManagement.paymentManagementStatus.origination].indexOf(paymentManagement.status) >= 0 && newOriginateDate && !moment(loanSetDate).isSame(moment(newOriginateDate).startOf("day"))) {
			loanSetDate = moment(newOriginateDate).startOf("day").toDate();
			updateLoanSetDate = true;
		}
		paymentManagement["paymentFrequency"] = frequency;
		paymentManagement.screentracking["paymentFrequency"] = frequency
		const changeScheduleObj = await AchService.processChangeSchedule(paymentManagement, moment(firstPaymentDateString, "MMMM D, YYYY").startOf("day").toDate(), true, false, loanSetDate, bankHolidayDirection);

		if (changeScheduleObj) {
			const paymentUpdateObj = {
				paymentSchedule: changeScheduleObj.paymentSchedule,
				nextPaymentSchedule: moment(changeScheduleObj.nextPaymentSchedule).startOf("day").toDate(),
				scheduleIdSequenceCounter: changeScheduleObj.scheduleIdSequenceCounter,
				maturityDate: changeScheduleObj.maturityDate,
				isAfterHoliday: bankHolidayDirection,
				paymentFrequency: frequency
			};
			if (isFundingConfirmationApproval && !!fundingPaymentType && paymentManagement.fundingPaymentType !== fundingPaymentType) {
				paymentUpdateObj["fundingPaymentType"] = fundingPaymentType;
			}
			if (updateLoanSetDate) {
				paymentUpdateObj["loanSetdate"] = loanSetDate;
			}
			await PaymentManagement.update({ id: paymentManagement.id }, paymentUpdateObj)

			await Screentracking.update({ id: paymentManagement.screentracking.id }, {
				paymentFrequency: frequency,
				signChangeScheduleAuthorization: true
			});

			const latestEmployment = await EmploymentHistory.getLatestEmploymentHistoryForUser(paymentManagement.user.id);
			if (latestEmployment && !!latestEmployment.id) {
				await EmploymentHistory.update({ id: latestEmployment.id }, { payFrequency: frequency });
			}
			req.session.loadPaymentSheduleTab = true;
			return res.json({
				status: 200, message: "Success"
			});
		}

		const errorMessage = "Unable to save and create payment schedule. Unknown error occurred";
		sails.log.error("AchController#savePaymentScheduleChanges :: err - ", errorMessage);
		return res.status(500).json({
			message: errorMessage
		});
	} catch (exc) {
		sails.log.error("AchController#savePaymentScheduleChanges :: err - ", exc);
		return res.status(500).json({ exc });
	}
}

async function changeFundingPaymentType(req, res) {
	try {
		const fundingPaymentType = req.param("fundingPaymentType");
		const payID = req.param("paymentId");
		console.log('===========payID===================>>>>>', payID)

		const paymentManagement = await PaymentManagement.findOne({ id: payID }).populate("user").populate("screentracking");

		if (!paymentManagement || !fundingPaymentType || [Payment.paymentTypeForFundingEnum.ACH, Payment.paymentTypeForFundingEnum.WIRE, Payment.paymentTypeForFundingEnum.DEBIT].indexOf(fundingPaymentType) < 0) {
			const errorMessage = "Unable to save funding payment type. Missing required data or data not in the correct format.";
			sails.log.error("AchController#changeFundingPaymentType :: err - ", errorMessage);
			return res.status(400).json({
				message: errorMessage
			});
		}

		await PaymentManagement.update({ id: payID }, { fundingPaymentType: fundingPaymentType });
		req.session.loadPaymentSheduleTab = true;
		return res.json({
			status: 200, message: "Success"
		});

	} catch (exc) {
		sails.log.error("AchController#changeFundingPaymentType :: err - ", exc);
		return res.status(500).json({ exc });
	}
}
async function changeIncompleteFundingPaymentType(req, res) {
	try {
		const fundingPaymentType = req.param("fundingPaymentType");
		const screenId = req.param("screenId");
		console.log('===========screenId===================>>>>>', screenId)

		const screentracking = await Screentracking.findOne({ id: screenId });

		if (!screentracking || screentracking.iscompleted === 1 || !fundingPaymentType || [Payment.paymentTypeForFundingEnum.ACH, Payment.paymentTypeForFundingEnum.WIRE, Payment.paymentTypeForFundingEnum.DEBIT].indexOf(fundingPaymentType) < 0) {
			const errorMessage = "Unable to save funding payment type. Missing required data or data not in the correct format.";
			sails.log.error("AchController#changeIncompleteFundingPaymentType :: err - ", errorMessage);
			return res.status(400).json({
				message: errorMessage
			});
		}

		if (!screentracking.incompleteFundingPaymentType || screentracking.incompleteFundingPaymentType !== fundingPaymentType) {
			await Screentracking.update({ id: screenId }, { incompleteFundingPaymentType: fundingPaymentType });
		}
		return res.json({
			status: 200, message: "Success"
		});

	} catch (exc) {
		sails.log.error("AchController#changeIncompleteFundingPaymentType :: err - ", exc);
		return res.status(500).json({ exc });
	}
}
async function ajaxOriginateOrApproveAndFundLoan(req, res) {
	try {
		const payID = req.param("paymentId");
		console.log('===========payID===================>>>>>', payID)
		const paymentManagement = await PaymentManagement.findOne({ id: payID }).populate("user").populate("screentracking").populate("account");

		if (!paymentManagement || !paymentManagement.screentracking || !paymentManagement.screentracking.requestedLoanAmount || [Payment.paymentTypeForFundingEnum.ACH, Payment.paymentTypeForFundingEnum.WIRE, Payment.paymentTypeForFundingEnum.DEBIT].indexOf(paymentManagement.fundingPaymentType) < 0
			|| [PaymentManagement.paymentManagementStatus.pending, PaymentManagement.paymentManagementStatus.origination].indexOf(paymentManagement.status) < 0) {
			const errorMessage = "Unable to originate or approve this loan. Missing required data or data is not in the correct format.";
			sails.log.error("AchController#ajaxOriginateOrApproveAndFundLoan :: err - ", errorMessage);
			return res.status(400).json({
				message: errorMessage
			});
		}
		const errorSuffix = paymentManagement.status === PaymentManagement.paymentManagementStatus.origination ? "originate" : "approve and fund";

		const loanAmountToFund = $ize(paymentManagement.screentracking.requestedLoanAmount);
		let account = null;
		if (paymentManagement.fundingPaymentType === Payment.paymentTypeForFundingEnum.ACH) {
			if (paymentManagement.account && paymentManagement.account.id) {
				account = paymentManagement.account;
			} else {
				const accounts = await UserBankAccount.getBankData(paymentManagement.screentracking.id, paymentManagement.user.id, paymentManagement);
				if (accounts && accounts.length > 0) {
					account = _.find(accounts, (foundAccount) => {
						return foundAccount.linkedAccount === true;
					});
				}
			}
			if (!account) {
				const errorMessage = `Unable to ${errorSuffix} this loan. A bank account is required to fund with ACH.`;
				sails.log.error("AchController#ajaxOriginateOrApproveAndFundLoan :: err - ", errorMessage);
				return res.status(500).json({
					message: errorMessage
				});
			}
		} else {
			account = { id: null };
		}
		let fundingType = null;

		switch (paymentManagement.fundingPaymentType) {
			case Payment.paymentTypeForFundingEnum.WIRE:
				fundingType = Payment.paymentTypeEnum.WIRE_CREDIT;
				break;
			case Payment.paymentTypeForFundingEnum.DEBIT:
				fundingType = Payment.paymentTypeEnum.CARD_CREDIT;
				break;
			default:
				fundingType = Payment.paymentTypeEnum.ACH_CREDIT;
				break;
		}

		const nextStatus = paymentManagement.status === PaymentManagement.paymentManagementStatus.origination ? PaymentManagement.paymentManagementStatus.pending : PaymentManagement.paymentManagementStatus.active;
		if (paymentManagement.status === PaymentManagement.paymentManagementStatus.pending) {

			const fundPaymentItem = {
				interestAmount: 0,
				principalAmount: 0,
				waivedAmount: 0,
				waivedInterest: 0,
				waivedPrincipal: 0,
				date: moment().startOf("day").toDate(),
				amount: loanAmountToFund,
				status: "PENDING",
				scheduleId: -1,
				isAmendPayment: false
			}
			const transactionItem = await Payment.createPaymentActionTransaction(Payment.transactionTypeEnum.FUNDED, fundPaymentItem, paymentManagement.id, paymentManagement.user.id, account.id, fundingType);

			if (transactionItem && !!transactionItem.pmtRef) {
				await PaymentManagement.update({ id: paymentManagement.id }, {
					fundedInfomration: {
						amount: loanAmountToFund,
						fundingPaymentType: paymentManagement.fundingPaymentType,
						date: moment().startOf("day").toDate(),
						pmtRef: transactionItem.pmtRef
					}
				})
			}
		}

		await AchService.changeContractStatus(payID, nextStatus, req.user);

		return res.json({
			status: 200, message: "Success", redirectUrl: nextStatus === PaymentManagement.paymentManagementStatus.pending ? "/admin/getOpenApplicationDetails" : "/admin/showAllPerforming"
		});

	} catch (exc) {
		sails.log.error("AchController#ajaxOriginateOrApproveAndFundLoan :: err - ", exc);
		return res.status(500).json({ exc });
	}
}

async function ajaxChangeLoanDetails(req, res) {
	try {
		const paymentId = req.param("paymentId");
		const term = req.param("term");
		const requestedLoanAmount = req.param("requestedLoanAmount");
		if (!paymentId || (!term && !requestedLoanAmount)) {
			const errorMessage = "Unable to change loan details. Missing required data";
			sails.log.error("AchController#ajaxChangeLoanDetails ERROR: ", errorMessage);
			return res.status(400).json({ message: errorMessage });
		}
		const resultObj = await AchService.changeLoanDetailsWithScheduleChange(paymentId, term, requestedLoanAmount);
		if (resultObj && resultObj.paymentManagement) {
			if (resultObj.hasChanged) {
				const paymentManagement = resultObj.paymentManagement;
				if (paymentManagement && paymentManagement.paymentSchedule && paymentManagement.paymentSchedule.length > 0) {
					const firstPaymentScheduleItem = _.find(paymentManagement.paymentSchedule, (item) => item.initiator === "automatic");

					const changeScheduleObj = await AchService.processChangeSchedule(paymentManagement,
						moment(firstPaymentScheduleItem.date).startOf("day").toDate(), true, false,
						moment(paymentManagement.loanSetdate).startOf("day").toDate(),
						paymentManagement.isAfterHoliday || 0);

					if (changeScheduleObj) {
						const paymentUpdateObj = {
							paymentSchedule: changeScheduleObj.paymentSchedule,
							nextPaymentSchedule: moment(changeScheduleObj.nextPaymentSchedule).startOf("day").toDate(),
							scheduleIdSequenceCounter: changeScheduleObj.scheduleIdSequenceCounter,
							maturityDate: changeScheduleObj.maturityDate,
						};
						await PaymentManagement.update({ id: paymentManagement.id }, paymentUpdateObj)

						await Screentracking.update({ id: paymentManagement.screentracking.id }, {
							signChangeScheduleAuthorization: true
						});

					}
				}
			}
			req.session.loadPaymentSheduleTab = true;
			return res.json({
				status: 200, message: "Success"
			});
		}

		const errorMessage = "Unable to change loan details. Unknown error occurred saving the new loan details";
		sails.log.error("AchController#ajaxChangeLoanDetails ERROR: ", errorMessage);
		return res.status(500).json({ message: errorMessage });
	} catch (exc) {
		sails.log.error("AchController#ajaxChangeLoanDetails :: err - ", exc);
		return res.status(500).json({ exc });
	}
}
async function ajaxUpdateUserTabInformation(req, res) {
	try {
		const userId = req.param("userId");
		const userData = req.param("userInfo");

		if (!userId || !userData || _.some(["email", "firstname", "lastname", "dateofBirth", "phoneNumber", "street", "city", "state", "zipCode"], (userItemKey) => {
			return !userData[userItemKey]
		})) {
			const errorMessage = "Unable to update user info. Missing required data";
			sails.log.error("AchController#ajaxUpdateUserTabInformation ERROR: ", errorMessage);
			return res.status(400).json({ message: errorMessage });
		}
		const userUpdateData = await ApplicationService.updateUserWithRevision(userData, userId)
		if (userUpdateData) {
			return res.json(userUpdateData);
		}
		const errorMessage = "Unable to update user info. Unknown error occurred";
		sails.log.error("AchController#ajaxUpdateUserTabInformation ERROR: ", errorMessage);
		return res.status(500).json({ message: errorMessage });
	} catch (exc) {
		sails.log.error("AchController#ajaxUpdateUserTabInformation :: err - ", exc);
		return res.status(500).json({ exc });
	}
}
async function ajaxUpdateEmployerTabInformation(req, res) {
	try {
		const userId = req.param("userId");
		const employerData = req.param("employerData");

		if (!userId || !employerData || _.some(["typeOfIncome", "employerName", "employerPhone", "employerStatus", "payFrequency", "monthlyIncome", "lastPayDate", "nextPayDate"], (employerItemKey) => {
			return !employerData[employerItemKey]
		})) {
			const errorMessage = "Unable to update employment info. Missing required data";
			sails.log.error("AchController#ajaxUpdateEmployerTabInformation ERROR: ", errorMessage);
			return res.status(400).json({ message: errorMessage });
		}
		employerData.monthlyIncome = $ize(employerData.monthlyIncome || "0");
		employerData.lastPayDate = moment(employerData.lastPayDate, "YYYY-MM-DD").startOf("day").toDate();
		employerData.nextPayDate = moment(employerData.nextPayDate, "YYYY-MM-DD").startOf("day").toDate();
		if (!!employerData.secondPayDate) {
			employerData.secondPayDate = moment(employerData.secondPayDate, "YYYY-MM-DD").startOf("day").toDate();
		}
		const userUpdateData = await ApplicationService.updateEmploymentInfo(employerData, userId)
		if (userUpdateData) {
			req.session["employmentInfoTab"] = true;
			return res.json(userUpdateData);
		}
		const errorMessage = "Unable to update employment info. Unknown error occurred";
		sails.log.error("AchController#ajaxUpdateEmployerTabInformation ERROR: ", errorMessage);
		return res.status(500).json({ message: errorMessage });
	} catch (exc) {
		sails.log.error("AchController#ajaxUpdateEmployerTabInformation :: err - ", exc);
		return res.status(500).json({ exc });
	}
}
async function ajaxUpdateBankAccountInformation(req, res) {
	try {
		const userBankAccountId = req.param("userBankAccountId");
		const userBankData = req.param("userBankData");

		if (!userBankAccountId || !userBankData || _.some(["accountName", "accountNumber", "routingNumber"], (userBankItemKey) => {
			return !userBankData[userBankItemKey]
		})) {
			const errorMessage = "Unable to update bank account info. Missing required data";
			sails.log.error("AchController#ajaxUpdateBankAccountInformation ERROR: ", errorMessage);
			return res.status(400).json({ message: errorMessage });
		}
		const userUpdateData = await ApplicationService.updateUserBankAccountInfo(userBankData, userBankAccountId);
		if (userUpdateData) {
			req.session["bankAccountInfoTab"] = true;
			return res.json(userUpdateData);
		}
		const errorMessage = "Unable to update bank account info. Unknown error occurred";
		sails.log.error("AchController#ajaxUpdateBankAccountInformation ERROR: ", errorMessage);
		return res.status(500).json({ message: errorMessage });
	} catch (exc) {
		sails.log.error("AchController#ajaxUpdateBankAccountInformation :: err - ", exc);
		return res.status(500).json({ exc });
	}
}

async function ajaxUpdatePaymentStatus(req, res) {
	const paymentId = req.body.id;
	const updatedStatus = req.body.status;
	const declineCode = req.body.declineCode;
	const declineReason = req.body.declineReason;
	const user = req.user;
	try {
		await AchService.manualPaymentStatusUpdate(paymentId, updatedStatus, user, declineCode, declineReason);
		return res.json({ success: true });
	} catch (err) {
		sails.log.error("AchController#ajaxUpdatePaymentStatus :: Error : ", err);
		return res.status(500).json(err);
	}
}

async function ajaxToggleAutoAch(req, res) {
	const paymentManagementId = req.body.id;
	let disableAutoAch = ""
	switch (req.body.disableAutoAch) {
		case "true":
			disableAutoAch = true;
			break;
		case "false":
			disableAutoAch = false;
			break;
		default:
			const errorMessage = "disableAutoAch needs to be a boolean";
			sails.log.error("AchController#ajaxToggleAutoAch :: Error : ", errorMessage);
			return res.status(400).json({ "errorMessage": errorMessage });
			break;
	}
	//const disableAutoAch = _.get(req, "body.disableAutoAch", "");
	//if (!disableAutoAch || (disableAutoAch != "true" && disableAutoAch != "false")) {

	try {
		await AchService.toggleAutoAch(paymentManagementId, disableAutoAch);
		return res.json({ success: true });
	} catch (err) {
		sails.log.error("AchController#ajaxToggleAutoAch :: Error : ", err);
		return res.status(500).json(err);
	}
}