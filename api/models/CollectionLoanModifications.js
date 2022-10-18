const _ = require("lodash");

//read and create only! No updates
module.exports = {
	attributes: {
		practicemanagement: {
			model: 'PracticeManagement'
		},
		account: {
			model: 'Account'
		},
		user: {
			model: 'User'
		},
		screentracking: {
			model: 'Screentracking'
		},
		programStart: {
			type: 'date'
		},
		programEnd: {
			type: 'date'
		},
		programCompleted: {
			type: 'boolean'
		},
		paymentSchedule: {
			type: 'array'
		},
		nextPaymentSchedule: { type: "date"},
		loanSetdate: {
			type: 'date'
		},
		maturityDate: {
			type: 'date'
		},
		status: { type: "string"},
		logs: {
			type: 'array',
			defaultsTo: []
		},
		isPaymentActive: { type: "boolean"},
		achstatus: {
			type: 'integer',
			defaultsTo: 1
		},
		contractReference: {
			type: "string",
		},
		loanReference: {
			type: "string",
		},
		deniedfromapp: {
			type: 'integer',
			defaultsTo: 0
		},
		changebankToken: {
			type: 'string'
		},
		changebankinfo: {
			type: 'array',
			defaultsTo: []
		},
		usertransactions: {
			type: 'array',
			defaultsTo: []
		},
		declinereason: {
			type: 'string',
			defaultsTo: ''
		},
		creditScore: {
			type: 'string',
			defaultsTo: ''
		},
		moveToOpen:{
			type: 'integer'
		},
		appverified: {
			type: 'integer',
			defaultsTo: 0
		},
		moveToArchive: {
			type: 'integer'
		},
		moveToArchive: {
			type: 'integer'
		},
		advancedAmount: {
			type: "float"
		},
		minimumIncome: {
			type: "float"
		},
		paymentCap: {
			type: "float"
		},
		requiredPayments: {
			type: "integer"
		},
		canelationPeriod: {
			type: "integer"
		},
		completionPercent: {
			type: "float"
		},
		downPaymentDiscount: {
			type: "integer"
		},
		applicationFee: {
			type: "float"
		},
		latePaymentFee: {
			type: "float"
		},
		checkProcessFee: {
			type: "float"
		},
		returnCheckFee: {
			type: "float"
		},
		totalPaid: {
			type: "float"
		},
		contractStartDate: {
			type: "date"
		},
		effectiveIncomePercent: {
			type: "float"
		},
		annualIncome: {
			type: "float"
		},
		isAfterHoliday:  { type: "integer"},
		paymentFrequency:  { type: "string"},
		isDenied: {
			type: "boolean"
		},
		estimatedAPR: {
			type: "float"
		},
		totalPaymentsFeeChargeAmount: {
			type: "float"
		},
		totalPaymentsFinancedAmount: {
			type: "float"
		},
		totalPaymentsPrincipalAmount: {
			type: "float"
		},
		failedtranscount: { type: "integer" },
		archiveStatus: {
			type: "string"
		},
		nextPaymentSchedule: {
			type: "date"
		},
		isInCollections: {
			type: "boolean"
		},
		movedToCollectionsDate: {
			type: "date"
		},
		collectionAssignStatus:  { type: "string"},
		collectionAssignedUser: {
			model: "Adminuser"
		},
		oldestDaysPastDue: {
			type: "integer"
		},
		totalNumberOfPastDue: {
			type:"integer"
		},
		contactScheduleReminderDate: {
			type: "date"
		},
		isSettled: {
			type: "boolean"
		},
		isChargeOff: {
			type: "boolean"
		},
		collectionAccountStatusReason: {type: "string"},
		collectionsAccountStatus: { type: "string" },
		totalAmountPastDue: {type: "float"},

		isInLoanModification: {
			type: "boolean"
		},
		loanModificationRevision: {
			type: "integer"
		},
		lastLoanModificationCreatedDate: {
			type: "date"
		},
		lastLoanModificationCreatedBy: {
			model: "Adminuser"
		},
		loanModificationComment: {
			type: "string"
		},
		isOriginalCreatedLoan: {
			type: "boolean"
		},
		paymentmanagement: {
			model: "PaymentManagement"
		}
	},
	getLoanModificationHistory: getLoanModificationHistory,
};
async function getLoanModificationHistory(paymentId) {
	if(!paymentId){
		throw new Error("Missing required parameters to get loan modification history.")
	}
	const paymentManagementHistories = await CollectionLoanModifications.find({paymentmanagement: paymentId});

	const paymentHistoryResponse = [];
	for(let paymentManagementHistory of  paymentManagementHistories) {
		let adminUser = null;
		if(!!paymentManagementHistory.lastLoanModificationCreatedBy) {
			adminUser = await Adminuser.findOne({id: paymentManagementHistory.lastLoanModificationCreatedBy});
		}
		let requestedLoanAmount = null;
		let requiredNumberOfPayments = null;
		if(paymentManagementHistory.isOriginalCreatedLoan) {
			const screentracking = await Screentracking.findOne({id:paymentManagementHistory.screentracking});
			if(screentracking) {
				if(screentracking.loanPracticeSettings) {
					requiredNumberOfPayments = screentracking.loanPracticeSettings.requiredNumberOfPayments;
				}
				if(screentracking && screentracking.requestedLoanAmount > 0) {
					requestedLoanAmount = screentracking.requestedLoanAmount
				}
			}
			if(!requiredNumberOfPayments) {
				requiredNumberOfPayments = 24;
			}
		}
		paymentHistoryResponse.push({
			loanSetdate: paymentManagementHistory.loanSetdate,
			modifiedInterestAmount: paymentManagementHistory.modifiedInterestAmount,
			modifiedBeginningPrincipal: paymentManagementHistory.modifiedBeginningPrincipal,
			accruedInterest: paymentManagementHistory.accruedInterest,
			adjustedPayment: paymentManagementHistory.adjustedPayment,
			payOffAmount: paymentManagementHistory.payOffAmount,
			isOriginalCreatedLoan: paymentManagementHistory.isOriginalCreatedLoan,
			loanModificationRevision: paymentManagementHistory.loanModificationRevision,
			lastLoanModificationCreatedDate: paymentManagementHistory.lastLoanModificationCreatedDate,
			lastLoanModificationCreatedBy: adminUser,
			loanModificationComment: paymentManagementHistory.loanModificationComment,
			paymentSchedule: paymentManagementHistory.paymentSchedule,
			loanReference: paymentManagementHistory.loanReference,
			isInCollections: paymentManagementHistory.isInCollections,
			movedToCollectionsDate: paymentManagementHistory.movedToCollectionsDate,
			collectionsAccountStatus: paymentManagementHistory.collectionsAccountStatus,
			collectionAccountStatusReason: paymentManagementHistory.collectionAccountStatusReason,
			requestedLoanAmount:requestedLoanAmount,
			finalpayoffAmount: paymentManagementHistory.finalpayoffAmount,
			estimatedAPR: paymentManagementHistory.estimatedAPR,
			loanTerm: requiredNumberOfPayments || (paymentManagementHistory.paymentSchedule?paymentManagementHistory.paymentSchedule.length:null),
			forgiveAccruedInterest: paymentManagementHistory.forgiveAccruedInterest,
			excludeInterest: paymentManagementHistory.excludeInterest,
			paymentFrequency: PaymentManagement.convertedPeriodicityToText[ paymentManagementHistory.paymentFrequency],
			isAfterHoliday: paymentManagementHistory.isAfterHoliday,
			nextPaymentSchedule: paymentManagementHistory.nextPaymentSchedule,
			status: paymentManagementHistory.status,
			isInLoanModification: paymentManagementHistory.isInLoanModification,
			totalPaymentsFeeChargeAmount: paymentManagementHistory.totalPaymentsFeeChargeAmount,
			totalPaymentsPrincipalAmount: paymentManagementHistory.totalPaymentsPrincipalAmount,
			totalPaymentsFinancedAmount: paymentManagementHistory.totalPaymentsFinancedAmount,
		})
	}
	return paymentHistoryResponse;
}
