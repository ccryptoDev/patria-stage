"use strict";

var request = require('request'),
  _ = require('lodash'),
  moment = require('moment-timezone');

var fs = require('fs');
var asyncLoop = require('node-async-loop');

module.exports = {
  getAllVikingDebitPayment: getAllVikingDebitPayments,
	checkVikingPaymentStatuses:checkVikingPaymentStatuses
};

async function getAllVikingDebitPayments() {
	sails.log.verbose("CronService#getAllVikingDebitPayments: Starting checking for viking payments to go out cron.");
	const today =  moment().tz( "America/New_York" ).startOf("day");
	const contractPayments = await PaymentManagement.find({status: PaymentManagement.paymentManagementStatus.active, $or: [ {isInCollections: {$exists: false}},{isInCollections:false}]}).populate("user");
	if(contractPayments && contractPayments.length > 0) {
		const schedContractPayments = [];
		for(let contractPayment of contractPayments) {
			contractPayment.paymentScheduleItem  = _.find(contractPayment.paymentSchedule,(paySched) => {
				return moment(paySched.date).startOf("day").diff(today,"days") === 0;
			});

			const account = await Account.findOne({user: contractPayment.user.id});
			const contractPaymentObj = {
				paymentmanagement: contractPayment,
				practicemanagement: contractPayment.practicemanagement,
				user: contractPayment.user,
				account: account,
				paymentScheduleItem:contractPayment.paymentScheduleItem
			};
			schedContractPayments.push(contractPaymentObj)
		}
		sails.log.info("==============================================Start processing contract payments");
		await PaymentService.processContractPayments(schedContractPayments,"127.0.0.1");
	}
	return true;
}

async function checkVikingPaymentStatuses() {
	sails.log.verbose("CronService#checkVikingPaymentStatuses: Starting viking statuses check cron.");
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
	return true;
}

