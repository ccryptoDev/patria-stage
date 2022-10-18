"use strict";

const path = require("path");
const fs = require("fs");
const viking = getVikingConfig();

module.exports.viking = viking;

function getVikingConfig() {
const vikingConfig = {
	apiBaseUrl: "https://bari.vikingmove.com:44344/PaymentAPI/api/BatchTransaction/",
	logPath: "logs/viking",
	rccPrefix: "rcclog_",
	achPrefix: "achlog_",
	merchantCode: "TTT_TA",
	layoutVersion: "001",
	accountTypeName: "Debit",
	vikingTransactionType: "ACH",
	vikingIssuedCompanyName: "VBS TrustAlchemy",
	standardEntryClassCode: "PPD",
	companyIssuedEntryDescription: "8005551212",
	apiCert:"TTT_TA_Viking_TrustAlchemy.crt",
	apiKey: "TTT_TA_Viking_TrustAlchemy.key",
	passphrase: "#Password1",
	apiAuthorizationBearerCredentials: {
		username: "TestTrustAlchemy",
		password: "dccda168-3014-473c-9e97-e5b2a6088ccb"
	},
	endpoints: {
		sendBatchTransaction: "PostJSON",
		getBatchTransactionByVikingReferenceId: "GetbyVikingReferenceId",
		getBatchTransactionByMerchantBatchId: "GetbyMerchantBatchId"
	},
	achStartUrl: "",
	creditLenderCode: "",
	debitLenderCode: "",
	rccCsvFilePath: "logs/viking",
	rccFtpHostName: "",
	rccRtpPort: "",
	rccFtpUserName: "",
	rccFtpPassName: "",
	rccFtpTimeout: 5000,
	rccServerUpPath: "",
	fixedFee: 0,
	percentFee: 0,
	originationFee: 0,
};
	if(process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'prod') {


	}
	return vikingConfig;
}
