"use strict";

var request = require('request'),
Q = require('q'),
_ = require('lodash'),
moment = require('moment');

var fs = require('fs');

module.exports = {
  getNewIncompleteApplication: getNewIncompleteApplicationAction,
  getTodayProcedureLoan:getTodayProcedureLoanAction,
  sendEmailtoStaffAdmin:sendEmailtoStaffAdminAction,
  paymentReminderEmails: paymentReminderEmailsAction
};

function getNewIncompleteApplicationAction() {
  return Q.promise(function(resolve, reject) {

		var getincompletecronPath = sails.config.appPath+'/cronemailservice/'+'newincompletecron_'+ moment().format('MM-DD-YYYY')+'.txt';
		var checkCreatedDate = moment().subtract(1, 'hour').toDate().getTime();
		var criteria={
			isCompleted: false,
			incompleteEmailSent: { $eq: 0, $exists: true },
			createdAt:{ $lte : new Date(checkCreatedDate), $exists: true }
			//createdAt :  { $lte: new Date(ISODate().getTime() - 1000 * 60 * 60)}
		}
		Screentracking
		.find(criteria)
		.sort("createdAt ASC")
		.then(function(screentrackingdetails) {

			var incompleteCount= screentrackingdetails.length;
			sails.log.info("getNewIncompleteApplication count value : ",incompleteCount);

			var currentDateTime = moment().format('MMMM Do YYYY, h:mm:ss a');
			var initialData ='\n\nIncomplete cron called\n';
			initialData +='Cron time: '+currentDateTime+' \n';
			initialData +='Incomplete count: '+incompleteCount+' \n';
			initialData += '************************************************\n\n';
			fs.appendFileSync( getincompletecronPath, initialData);

			if(incompleteCount>0)
			{
				 var loopcount=0;
				 _.forEach(screentrackingdetails, function(screentrackingdata) {

					var appendData ='';
					appendData +='Screentracking ID: '+screentrackingdata.id+' \n';
					appendData +='Reference Number: '+screentrackingdata.applicationReference+' \n';
					fs.appendFileSync( getincompletecronPath, appendData);

					Cronemails.registerIncompleteApplication(screentrackingdata.id, function(results){

						fs.appendFileSync(getincompletecronPath, 'Loopcount :'+loopcount+'\n');
						fs.appendFileSync(getincompletecronPath, 'Register Response :'+JSON.stringify(results)+'\n');

						var looplogData ='------------------------------------------------------------\n\n';
						fs.appendFileSync( getincompletecronPath, looplogData);

						loopcount++;
						if(loopcount==incompleteCount)
						{
							var finalData ='==============================================================\n\n';
							fs.appendFileSync( getincompletecronPath, finalData);
							return resolve({statuscode:200,message:'Incomplete count::'+incompleteCount});
						}
					});
				 });
			}
			else
			{
				return resolve({statuscode:200,message:'No incomplete:: count::'+incompleteCount});
			}
		})
		.catch(function (err) {
			sails.log.error('#getNewIncompleteApplication :: err', err);
			return resolve({statuscode:400,message: err});
		});

  });
}

function getTodayProcedureLoanAction() {
  return Q.promise(function(resolve, reject) {

		var todayprocedurecronPath = sails.config.appPath+'/cronemailservice/'+'todayprocedureloan_'+ moment().format('MM-DD-YYYY')+'.txt';
		var checktodaysDate 	 =	moment().tz("America/Los_Angeles").startOf('day').format('MM-DD-YYYY');

		var payoptions = {
			status:'OPENED',
			isPaymentActive: true,
			achstatus: { $eq: 0, $exists: true },
			loanSetdate : { $eq : new Date(checktodaysDate), $exists: true }
		};

		PaymentManagement
		.find(payoptions)
		.then(function(paymentManagementDetail) {

			var todayProcedureCount= paymentManagementDetail.length;
			sails.log.info("getTodayProcedureLoan count value : ",todayProcedureCount);

			var currentDateTime = moment().format('MMMM Do YYYY, h:mm:ss a');
			var initialData ='\n\nIncomplete cron called\n';
			initialData +='Cron time: '+currentDateTime+' \n';
			initialData +='Today Procedure count: '+todayProcedureCount+' \n';
			initialData += '************************************************\n\n';
			fs.appendFileSync( todayprocedurecronPath, initialData);

			if(todayProcedureCount>0)
			{
				 var loopcount=0;
				 _.forEach(paymentManagementDetail, function(paymentdata) {

					var appendData ='';
					appendData +='PayID: '+paymentdata.id+' \n';
					appendData +='Loan Reference: '+paymentdata.loanReference+' \n';
					fs.appendFileSync( todayprocedurecronPath, appendData);

					Cronemails.registerProcedureApplication(paymentdata.id, function(results){

						fs.appendFileSync(todayprocedurecronPath, 'Loopcount :'+loopcount+'\n');
						fs.appendFileSync(todayprocedurecronPath, 'Register Response :'+JSON.stringify(results)+'\n');

						var looplogData ='------------------------------------------------------------\n\n';
						fs.appendFileSync( todayprocedurecronPath, looplogData);

						loopcount++;
						if(loopcount==todayProcedureCount)
						{
							var finalData ='==============================================================\n\n';
							fs.appendFileSync( todayprocedurecronPath, finalData);
							return resolve({statuscode:200,message:'Today procedure count::'+todayProcedureCount});
						}
					});
				 });
			}
			else
			{
				return resolve({statuscode:200,message:'No today procedure:: count::'+todayProcedureCount});
			}
		})
		.catch(function (err) {
			sails.log.error('#getTodayProcedureLoan :: err', err);
			return resolve({statuscode:400,message: err});
		});
  });
}
function sendEmailtoStaffAdminAction()
{
	return Q.promise(function(resolve, reject) {
		var practiceemailcronPath = sails.config.appPath+'/cronemailservice/'+'practiceemail_'+ moment().format('MM-DD-YYYY')+'.txt';
		var currentDateTime = moment().format('MMMM Do YYYY, h:mm:ss a');
		var limit	=	20;

		var cronoptions	= {
 			processstatus: 0,
  		};

		Cronemails
		.find(cronoptions)
		.sort("createdAt DESC")
		.limit(limit)
		.then(function(cronemailResults) {

			var cronmailCount= cronemailResults.length;
			var initialData ='\n\Practice email cron called\n';
		    initialData +='Cron time: '+currentDateTime+' \n';
			initialData +='Today cron email count: '+cronmailCount+' \n';
			initialData += '************************************************\n\n';
 		    fs.appendFileSync( practiceemailcronPath, initialData);

		    if(cronmailCount>0)
			{
				var loopcount=0;
				_.forEach(cronemailResults, function(crondata) {

					Cronemails.sendPracticeCronEmail(crondata, function(cronemailResponse){

						loopcount++;

						var appendData	 =	'';
						appendData 		+=	'Cron loopcount: '+loopcount+' \n';
						appendData 		+=	'CronPracticeEmail ID: '+crondata.id+' \n';
						appendData 		+=	'CronPracticeEmail Response Message: '+cronemailResponse.message+' \n';
						appendData 		+=	'CronPracticeEmail Response: '+JSON.stringify(cronemailResponse)+' \n';
						appendData 		+= 	'************************************************\n\n';
						fs.appendFileSync( practiceemailcronPath, appendData);

						if(loopcount==cronmailCount)
						{
							var finalData =	'==============================================================\n\n';
							fs.appendFileSync( practiceemailcronPath, finalData);
							return resolve({statuscode:200,message:"All email process are completed"});
						}
				   });
				});
			}
			else
			{
				return resolve({statuscode:200,message:'No mail count::'+cronmailCount});
			}
		})
		.catch(function (err) {
			sails.log.error('#sendEmailtoStaffAdmin :: err', err);
			return resolve({statuscode:400,message: err});
		});
	});
}

function paymentReminderEmailsAction() {
	return Q.promise(function(resolve, reject) {
		var checktodaysDate = moment().tz("America/Los_Angeles").startOf('day');
		
		var payoptions = {
			status:'ACTIVE',
			isPaymentActive: true,
			nextPaymentSchedule: { $exists: true },
			$and: [{ $or: [ { moveToArchive: { $exists: false } }, { moveToArchive: { $eq: 0, $exists: true } } ] }],
			$and: [{ $or: [ { isInBankruptcy: { $exists: false} }, { isInBankruptcy: { $eq: false, $exists: true } }]}]
		};

		PaymentManagement.find(payoptions)
		.then(function(paymentManagementDetail) {
			var todayPaymentReminderCount = paymentManagementDetail.length;
			sails.log.info("paymentReminderEmailsAction count value : ", todayPaymentReminderCount);

			if(todayPaymentReminderCount>0) {
				_.forEach(paymentManagementDetail, function(pmdata) {
					var dateDiff = moment(pmdata.nextPaymentSchedule).endOf('day').diff(checktodaysDate, "days");
					var dueDate = moment(checktodaysDate).add(3, "day").startOf('day');
					if (dateDiff == 3 ) {
						_.forEach(pmdata.paymentSchedule, function(paymentdata) {
							if (moment(paymentdata.date).diff(dueDate, 'days') == 0){
								EmailService.processSendingStatusEmail(EmailService.emailSendType.customerKoOverride, pmdata)
								.then(() => {
									sails.log.info("paymentReminderEmailsAction:: Payment reminder email sent to " + pmdata.loanReference);
								})
							}
						});
						
					}
				});
			}
			else {
				return resolve({statuscode:200,message:'No today payment reminder:: count::'+todayPaymentReminderCount});
			}
		})
		.catch(function (err) {
			sails.log.error('#paymentReminderEmailsAction :: err', err);
			return resolve({statuscode:400,message: err});
		});
 	});
}
