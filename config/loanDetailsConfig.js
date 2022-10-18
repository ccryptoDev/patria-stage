"use strict";
const _ = require("lodash");
module.exports.loanDetails = {
	loanDetails: {
		doctype1: "Drivers Licence or ID Card",
		doctype2: "Most Recent Paystub",
		doctype3: "Second Most Recent Paystub",
		// doctype4: "Most Recent Utility Bill",
		// doctype5: "Image of Debit Card (front)",
		// doctype6: "Voided Check or First Page of Bank Statement",
		doctype7: "Other",
		// doctype8: "Underwriting Checklist",
		doctype9: "Offer Letter"
	},
	maximumRequestedLoanAmount: 1500,
	minimumRequestedLoanAmount: 200,
	getDocTypeByDocName: getDocTypeByDocName,
	getEmploymentDocTypes:getEmploymentDocTypes,
	getUserUploadDocTypes: getUserUploadDocTypes,
	getAllUserUploadedDocTypes:getAllUserUploadedDocTypes
};
function getDocTypeByDocName(docName) {
	const docKey =  _.findKey(this.loanDetails,(docTypeValue)=> {return docTypeValue === docName;});
	if(!docKey){
		return "doctype7";
	}else {
		return docKey;
	}
}

function getEmploymentDocTypes() {
	return {
		doctype1: "Doc1",
		doctype2: "Most Recent Paystub",
		doctype3: "Second Most Recent Paystub",
		doctype7: "Other",
		doctype9: "Offer Letter"
	}
}
function getUserUploadDocTypes() {
	return {
		doctype1: "Drivers License or ID Card",
		doctype7: "Other"
	}
}
function getAllUserUploadedDocTypes() {
	return this.loanDetails;
}
