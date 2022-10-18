"use strict";

const transunion = {
	baseUrl: "https://netaccess-test.transunion.com/",
	mode: "sandbox",
	industryCode: "F",
	memberCode: "09351169",
	prefixCode: "0622",
	password: "J34F",
	keyPassword: "secure123",
	env: "standardTest",
	version: "2.21",
	productCode: "07000",
	addOnProduct: { code: "00W18", scoreModelProduct: "true" },
	certificate: { crtPath: "KUBERFI2.pem", keyPath: "KUBERFI2Key.pem", password: "secure123" }
};

if( process.env.NODE_ENV == "production" ) {
	transunion.baseUrl = "https://netaccess.transunion.com/";
	transunion.memberCode = "--";
	transunion.prefixCode = "1201";
	transunion.password = "--";
	transunion.env = "production";
	transunion.mode = "production";
}

module.exports.transunion = transunion;
