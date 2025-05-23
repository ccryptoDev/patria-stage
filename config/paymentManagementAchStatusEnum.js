"use strict";

module.exports.paymentManagementAchStatus = {
	achStatus: {
		COMPLETED: 1,
		INCOMPLETE: 4,
		DENIED: 2,
		PENDING: 0,
		ACTIVE: 1,
		PERFORMING: 1,
		CHARGEOFF: 1,
		SETTLED: 1,
		DEFERRED: 1,
		RESET: 4,
		ORIGINATION: 0
	},
	status: {
		COMPLETED: "COMPLETED",
		INCOMPLETE: "INCOMPLETE",
		DENIED: "DENIED",
		PENDING: "PENDING",
		ACTIVE: "ACTIVE",
		PERFORMING: "ACTIVE",
		CHARGEOFF: "CHARGEOFF",
		SETTLED: "SETTLED",
		DEFERRED: "DEFERRED",
		RESET: "RESET",
		ORIGINATION:"ORIGINATION"
	}
};

