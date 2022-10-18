"use strict";

// var ddKeyword = ['payroll,direct deposit','payroll','direct deposit','direct dep','dir dep'];

const ddKeyword = [ "transfer,deposit", "payroll,direct deposit", "payroll", "direct deposit", "direct dep", "dir dep" ];

const plaid = {
	productionUrl: "https://sandbox.plaid.com",
	envType: "sandbox",
	clientId: "574538a90259902a3980f180",
	secretKey: "b07b4a78a81e495e97a00c45218092",
	publicKey: "759f4bf75b46831059e7a5c713c2c9",
	clientName: "Patria",
	minincomeamount: 39000,
	minrequestedamount: 1000,
	maxrequestedamount: 40000,
	maximumDti: 50000,
	maxApr: 35,
	minimumIncomePlaidStatus: true,
	ddKeyword: ddKeyword,
	basicLoanamount: 0,
	interestTermsArr: [ "12", "24", "30", "36", "48" ],
	maxPreDTI: 50,
	estimateAnnualIncome: 120000,
	estimatePreDebt: 2500
};

if( process.env.NODE_ENV == "production" ) {
	plaid.productionUrl = "https://production.plaid.com";
	plaid.envType = "production";
	plaid.secretKey = "--";
}

module.exports.plaid = plaid;
