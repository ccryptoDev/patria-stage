

const collectionAssignStatus = {
	ASSIGNED: "Assigned",
	UNASSIGNED: "Unassigned",
	REASSIGNED: "Re-assigned"
};
const collectionsAccountStatus = {
	WAITING_TO_COLLECT: "WAITING_TO_COLLECT",
	CHARGEOFF:"CHARGEOFF",
	SETTLED: "SETTLED",
	BANKRUPTCY: "BANKRUPTCY",
	SCHEDULE_TO_CONTACT: "SCHEDULE_TO_CONTACT",
	IN_LOAN_MODIFICATION: "IN_LOAN_MODIFICATION",
	PROMISE_TO_PAY: "PROMISE_TO_PAY",
	LATE_FIRST_PAYMENT: "LATE_FIRST_PAYMENT"
};
module.exports = {
	attributes: {
		paymentmanagement: {
			model: "PaymentManagement"
		},
		collectionAssignStatus:  { type: "string", enum: Object.values(collectionAssignStatus), defaultsTo: collectionAssignStatus.UNASSIGNED},
		collectionAssignedUser: {
			model: "Adminuser"
		},
		oldestDaysPastDue: {
			type: "integer"
		},
		totalNumberOfPastDue: {
			type:"integer"
		},
		collectionsAccountStatus: { type: "string", enum: Object.values(collectionsAccountStatus), defaultsTo: collectionsAccountStatus.WAITING_TO_COLLECT},

		nextScheduleContactDate: {
			type: "date"
		},
	},

	collectionsAccountStatusEnum: collectionsAccountStatus,
	collectionAssignStatusEnum: collectionAssignStatus,
};
