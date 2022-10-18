/* global sails, Counters */
"use strict";

const _ = require("lodash");
const moment = require("moment");
const pmtSvcConfig = sails.config.paymentService;
const typesEnum = [];
_.forEach(pmtSvcConfig.TYPES, (type) => { typesEnum.push(type); });

const STATUS_PENDING = "PENDING";
const STATUS_DECLINED = "DECLINED";
const STATUS_RETURNED = "RETURNED";
const STATUS_SETTLING = "SETTLING"; // unreturned for >3 business days
const STATUS_WAIVED = "WAIVED";
const STATUS_DEFERRED = "DEFERRED";
const STATUS_AMENDED = "AMENDED";
const STATUS_PAID = "PAID";
const STATUS_OPENED = "OPENED";
const statusEnum = [STATUS_PENDING, STATUS_DECLINED, STATUS_RETURNED, STATUS_SETTLING, STATUS_PAID, STATUS_WAIVED, STATUS_AMENDED, STATUS_DEFERRED, STATUS_OPENED];

const paymentType = {
	ACH_CREDIT: "ACH_CREDIT",
	ACH_DEBIT: "ACH_DEBIT",
	WIRE_CREDIT: "WIRE_CREDIT",
	WIRE_DEBIT: "WIRE_DEBIT",
	CARD_CREDIT: "CARD_CREDIT",
	CARD_DEBIT: "CARD_DEBIT",
	CASH_CREDIT: "CASH_CREDIT",
	CASH_DEBIT: "CASH_DEBIT",
	PAYMENT_CHANGE: "PAYMENT_CHANGE",
}

const paymentTypeForFunding = {
	ACH: "ACH",
	WIRE: "WIRE",
	DEBIT: "DEBIT",
}
const transactionPaymentTypeForDisplay = {
	WAIVED: "Waive",
	LOAN_WAIVED: "Loan Waived",
	AMENDED: "Amend",
	DEFERRED: "Defer",
	PAID: "Paid",
	DECLINED: "Declined",
	PENDING: "Pending",
	PAYMENT: "Payment",
	FUNDED: "Funding"
}

const transactionType = {
	WAIVED: "WAIVED",
	LOAN_WAIVED: "LOAN_WAIVED",
	AMENDED: "AMENDED",
	DEFERRED: "DEFERRED",
	PAID: "PAID",
	DECLINED: "DECLINED",
	PENDING: "PENDING",
	PAYMENT: "PAYMENT",
	FUNDED: "FUNDED"
}
module.exports = {
	tableName: "payment",
	attributes: {
		pmtRef: { type: "string", required: true },
		type: { type: "string", enum: paymentType, required: true },
		amount: { type: "float", required: true },
		interestAmount: { type: "float", defaultsTo: 0.0 },
		principalAmount: { type: "float", defaultsTo: 0.0 },
		status: { type: "string", enum: statusEnum, required: true },
		errReason: { type: "string", defaultsTo: "" },
		paymentmanagement: { model: "PaymentManagement" },
		user: { model: "User" },
		nacha: { model: "Nacha", defaultsTo: null },
		order_id: { type: "string", defaultsTo: null },
		isAmendPayment: { type: "boolean" },
		transactionMeta: { type: "json" },
		transactionDate: { type: "date" },
		transactionType: {
			type: 'string',
			enum: Object.keys(transactionType),
			defaultsTo: transactionType.PENDING
		},
		transactionTypeForDisplay: {
			type: 'string',
			enum: Object.values(transactionPaymentTypeForDisplay),
			defaultsTo: transactionPaymentTypeForDisplay.PENDING
		},
		pmtRequests: {
			type: "array"
		},
		scheduleId: { type: "integer" },
		account: {
			model: "Account"
		},
		hasBeenSentToAch: { type: "boolean" },
		sentToAchDate: { type: "date" }
	},
	STATUS_PENDING,
	STATUS_DECLINED,
	STATUS_RETURNED,
	STATUS_SETTLING,
	STATUS_PAID,
	STATUS_WAIVED,
	STATUS_DEFERRED,
	STATUS_AMENDED,
	STATUS_OPENED,
	paymentTypeEnum: paymentType,
	paymentTypeForFundingEnum: paymentTypeForFunding,
	getNextValue: getNextValue,
	transactionTypeEnum: transactionType,
	transactionPaymentTypeForDisplayEnum: transactionPaymentTypeForDisplay,
	getTransactionForLoan: getTransactionForLoan,
	createPaymentActionTransaction: createTransaction
};

function getNextValue() {
	return Counters.getNextValue("payment")
		.then((seqValue) => `TX_${seqValue}`);
}
async function getTransactionForLoan(paymentId) {
	if (!!paymentId) {
		const transactions = await Payment.find({ paymentmanagement: paymentId });
		_.forEach(transactions, (transaction) => {
			if (transaction.transactionType === transactionType.WAIVED || transaction.transactionType === transactionType.LOAN_WAIVED) {
				transaction["statusForDisplay"] = transactionType.PAID
				transaction.type = transactionType.WAIVED;
			} else if (transaction.transactionType === transactionType.DEFERRED) {
				transaction["statusForDisplay"] = "DEFERRED";
				transaction.type = transactionType.DEFERRED;
			} else {
				transaction["statusForDisplay"] = transaction.status;
			}
			switch (transaction.type) {
				case paymentType.CARD_DEBIT:
					transaction["typeForDisplay"] = "Card Debit";
					break;
				case paymentType.CARD_CREDIT:
					transaction["typeForDisplay"] = "Card Credit";
					break;
				case paymentType.WIRE_CREDIT:
					transaction["typeForDisplay"] = "Wire Credit";
					break;
				case paymentType.WIRE_DEBIT:
					transaction["typeForDisplay"] = "Wire Debit";
					break;
				case paymentType.ACH_CREDIT:
					transaction["typeForDisplay"] = "Ach Credit";
					break;
				case "DEFERRED":
				case "WAIVED":
					transaction["typeForDisplay"] = "";
					break;
				case paymentType.ACH_DEBIT:
				default:
					transaction["typeForDisplay"] = "Ach Debit";
					break;
			}

			if (transaction.transactionMeta.initiator === "makepayment" && !transaction.transactionMeta.isAmendPayment) {
				transaction.transactionTypeForDisplay = `Manual ${transaction.transactionTypeForDisplay}`
			} else if (transaction.transactionMeta.initiator === "automatic" && !transaction.transactionMeta.isAmendPayment) {
				transaction.transactionTypeForDisplay = `Schedule ${transaction.transactionTypeForDisplay}`
			} else if (transaction.transactionMeta.isAmendPayment && transaction.transactionMeta.isAmendPayoff) {
				transaction.transactionTypeForDisplay = `${transaction.transactionTypeForDisplay} Payoff`
			}
		})
		return transactions;
	}
	return null;
}

async function createTransaction(transactionTypeObj, scheduleItem, paymentManagementId, userId, accountId = null, paymentTypeEnumValue = "PAYMENT_CHANGE", isManual = true) {
	const sequence = await getNextValue();

	if ([paymentType.CARD_DEBIT, paymentType.WIRE_CREDIT, paymentType.CARD_CREDIT, paymentType.WIRE_DEBIT].indexOf(paymentTypeEnumValue) >= 0) {
		accountId = null;
		scheduleItem.status = STATUS_PAID;
	}
	const transaction = {
		pmtRef: sequence,
		type: paymentTypeEnumValue,
		transactionDate: moment(scheduleItem.date).startOf("day").toDate(),
		transactionMeta: scheduleItem,
		amount: scheduleItem.amount,
		account: accountId,
		interestAmount: scheduleItem.interestAmount,
		principalAmount: scheduleItem.principalAmount,
		paymentmanagement: paymentManagementId,
		user: userId,
		transactionTypeForDisplay: !!transactionType ? transactionPaymentTypeForDisplay[transactionTypeObj] : transactionPaymentTypeForDisplay.PENDING,
		transactionType: transactionTypeObj || transactionType.PENDING,
		status: scheduleItem.status,
		transactionId: sequence,
		scheduleId: scheduleItem.scheduleId,
		order_id: sequence,
		isAmendPayment: scheduleItem.isAmendPayment,
		hasBeenSentToAch: false,
		sentToAchDate: null,
		isManualTransaction: isManual
	};
	return Payment.create(transaction);
}
