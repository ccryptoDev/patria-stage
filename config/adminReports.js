"use strict";
module.exports.adminReports = {
	reports: [
		{
			key: "payments",
			name: "Payments",
			fields: [
				{
					"property": "createdAt",
					"label": "Date",
					"type": "datetime"
				},
				{
					"property": "pmtRef",
					"label": "Payment Ref"
				},
				{
					"property": "user.firstname",
					"label": "First Name",
					"type": "string"
				},
				{
					"property": "user.lastname",
					"label": "Last Name",
					"type": "string"
				},
				{
					"property": "paymentmanagement.loanReference",
					"label": "Contract",
					"type": "string"
				},
				{
					"property": "status",
					"label": "Status",
					"type": "string"
				},
				{
					"property": "customAmount",
					"label": "Requested",
					"type": "customAmount"
				},
				{
					"property": "customAmountReceived",
					"label": "Paid",
					"type": "customAmountReceived"
				},
				{	"property": "customFirstPaymentDate",
					"label": "First Payment Date",
					"type": "customFirstPaymentDate"
				},
				{
					"property": "customDPD",
					"label": "DPD",
					"type": "customDPD"
				},
				{
					"property": "customAggregatedPayments",
					"label": "Aggregate Payments made to date",
					"type": "customAggregatedPayments"
				},
				{
					"property": "paymentmanagement.loantermcount",
					"label": "Loan Term"
				},
				{
					"property": "customPaymentsMade",
					"label": "Payments Made",
					"type": "customPaymentsMade"
				}
			]
		},
		{
			key: "contracts",
			name: "Contracts",
			fields: [
				{
					property: "createdAt",
					label: "Date"
				},
				{
					property: "practicemanagement.PracticeName",
					label: "Partner"
				},
				{
					property: "user.firstname",
					label: "First Name"
				},
				{
					property: "user.lastname",
					label: "Last Name"
				},
				{
					property: "paymentmanagement.loanReference",
					label: "Contract"
				},
				{
					property: "paymentmanagement.incomePercent",
					label: "Percentage"
				}
			]
		}
	]
};
