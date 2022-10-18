"use strict";

const ACH_CREDIT = "ACH_CREDIT";
const ACH_DEBIT = "ACH_DEBIT";
const WIRE_CREDIT = "WIRE_CREDIT";
const WIRE_DEBIT = "WIRE_DEBIT";
const CARD_CREDIT = "CARD_CREDIT";
const CARD_DEBIT = "CARD_DEBIT";
const CASH_CREDIT = "CARD_DEBIT";
const CASH_DEBIT = "CARD_DEBIT";

module.exports.paymentService = {
	vendor: "nacha",
	TYPES: {
		ACH_CREDIT,
		ACH_DEBIT,
		WIRE_CREDIT,
		WIRE_DEBIT,
		CARD_CREDIT,
		CARD_DEBIT,
		CASH_CREDIT,
		CASH_DEBIT
	},
	settlingBusinessDays: 3,
	paidBusinessDays: 7,
	emailAlerts: {
		toEmail: "fintekslc+noreply@gmail.com",
		ccEmails: [ "Brakion Supreme <brakion.testoni@gmail.com>" ],
		bccEmails: []
	},
	waiveInterestMonths: 0,
	achCutOffHour: "21",
	getPrincipalOffset:getPrincipalOffset
};
function getPrincipalOffset(paymentAmount) {
		const principalOffSetAmount = 5;
		 const	principalOffSetType = "STATIC"
			if(!paymentAmount || paymentAmount <=0 || principalOffSetAmount === 0){
				return 0;
			}
			if(principalOffSetType === "PERCENTAGE") {
					return principalOffSetAmount * paymentAmount;
			}else {
				return principalOffSetAmount;
			}
}
