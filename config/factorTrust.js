/**
 * factorTrust.js
 */
const testData = {
	ApplicationID: '1 Rf Test',
	MobileNumber: '6784803240',
	FirstName: 'JULIANNE',
	LastName: 'EETR',
	EmailAddress: 'test@factortrust.com',
	IPAddress: '74.95.29.134',
	DLNumber: '',
	DLNumberIssueState: '',
	DateOfBirth: '03/01/1996',
	Address1: 'franklin street',
	Address2: '',
	City: 'Newark',
	State: 'NJ',
	Zip: '07102',
	Country: 'US',
	MonthsAtAddress: '',
	AlternateZip: '',
	HomePhone: '',
	SSN: '666664907',
	SSNIssueState: '',
	AccountABA: '',
	AccountDDA: '',
	AccountType: 'C', // C=Checking, D=Debit, S=Savings
	EmployerName: 'Race Cars 4 life',
	LengthOfEmployment: '',
	MonthlyIncome: '3333.00',
	PayrollType: 'D', // D=Direct Deposit; P=Paper Check
	PayrollFrequency: 'W', // W=Weekly, B=Bi-Weekly, S=Semi-Monthly, M=Monthly
	PayrollGarnishment: '',
	RequestedLoanAmount: '0',
	RequestedEffectiveDate: '',
	RequestedDueDate: '',
	HasBankruptcy: '',
	ProductType: 'PER',
	LeadType: '', // (Not Used At This Time)
	LeadSource: '', // (Not Used At This Time)
	BlackBox: '', // (Provided via the iOvation installation software)
	ECOACode: 'I',
	PortfolioType: 'I',
	PointOfOrigination: 'V', // R=Retail, V=Virtual
	SecuritizationType: 'U',
	OtherIncome: '',
	LoanPaymentAmount: '',
	OtherPayments: '',
	LoanFees: '',
	TermsDuration: '',
	TermsFrequency: '',
	HousingExpenses: '',
	IsHomeOwner: '',
	LivingExpenses: '',
	CreditCardNumber: ''
}
module.exports.factorTrust = {
	lendProtect: getFactorTrustLendProtectConfig(),
	truValidate: getFactorTrustTruValidateConfig
};
/**
 * Factor Trust - Lend Protect Credit Report
 * @returns {{password: string, testData: {Zip: string, TermsFrequency: string, LengthOfEmployment: string, ECOACode: string, HousingExpenses: string, RequestedDueDate: string, LeadType: string, PortfolioType: string, DLNumberIssueState: string, DLNumber: string, TermsDuration: string, RequestedEffectiveDate: string, PointOfOrigination: string, ApplicationID: string, MonthlyIncome: string, DateOfBirth: string, LoanPaymentAmount: string, ProductType: string, City: string, EmailAddress: string, OtherPayments: string, SSNIssueState: string, LeadSource: string, BlackBox: string, State: string, SecuritizationType: string, Country: string, LastName: string, LoanFees: string, RequestedLoanAmount: string, AlternateZip: string, PayrollGarnishment: string, CreditCardNumber: string, LivingExpenses: string, IsHomeOwner: string, FirstName: string, Address2: string, OtherIncome: string, Address1: string, AccountType: string, SSN: string, MobileNumber: string, HomePhone: string, MonthsAtAddress: string, AccountDDA: string, IPAddress: string, AccountABA: string, PayrollType: string, EmployerName: string, PayrollFrequency: string, HasBankruptcy: string}, apiUrl: string, merchantId: string, storeId: string, channelId: string, enabled: boolean, username: string}}
 */
function getFactorTrustLendProtectConfig() {
	const lendProtect = {
		apiUrl: "https://stage.factortrust.com/WebServices/LendProtectRequest.aspx?version=3.3",
		username: "ALCHEMYTECHST3",
		password: "Zb7tR5@@DQdt",
		channelId: "",
		merchantId: "54545",
		storeId: "0003",
		testData: testData,
		productType: "PER", // ??
		ecoaCode: "I", // ??
		portfolioType: "I", // ??
		securitizationType: "U", // ??
		scorecards: { // ??
			"M1100_STL_FT": "Conversion",
			"M1101_INS_FT": "FcraFraud",
			"M1150_STL_FT_TU": "Risk",
			"M1151_INS_FT_TU": "Profitability"
		},
		atap01_dti: 45, // ??
		enabled: true,
	};
	
	
	
	
	if( process.env.NODE_ENV === "production" || process.env.NODE_ENV === "prod") {
		lendProtect.apiUrl = "https://www.factortrust.com/WebServices/LendProtectRequest.aspx?version=3.3";
		lendProtect.username = 'PATRIALENDINGSTORE1';
		lendProtect.password = 'A@F2F@34krrb';
		lendProtect.storeId = '0001';
		lendProtect.merchantId = '40524';
		lendProtect.enabled = true;
	}
	
	return lendProtect;
}

function getFactorTrustTruValidateConfig(strategy) {
	const getCredentialsTestCase = (strategy) => {
		const stagingConfig = {
			device: {
				username: "Patria_Lending_Test",
				password: "79f8ea522b2043c099fb5d68b28863e6",
				secretKey: "a65487d01cbd4bf1a07e6ace775c2c32",
				publicKey: "1f2dc512f2004000a64416531c4661ff",
				url: "https://app.trustev.com/api/v2.0",
			},
			identity: {
				username: "Patria_Lending2_TestSite",
				password: "882c7be4442d46548e0c680ca064f55e",
				secretKey: "6936483a687a42fe833769d46ac11c90",
				publicKey: "e272c4a40fa544dfbd64615ab9389936",
				url: "https://app.trustev.com/api/v2.0",
			},
			kba_otp: {
				username: "Patria_Lending3_TestSite",
				password: "c60e4a0eff344241850b2d411bd55463",
				secretKey: "942663efc449473aafc8bb81ff59b761",
				publicKey: "f9b5283ca9c847f982da5e67a090168f",
				url: "https://app.trustev.com/api/v2.0",
			},
		}

		const prodConfig = {
			device: {
			  username: "Patria_Lending1_ProdSite",
			  password: "b65734c4c9aa4ba38857ffcdfd9e9138",
			  secretKey: "1ebc715ae9b444499ec5bb475b373598",
			  publicKey: "e20042605d2d49f0bf90824e7e623636",
			  url: "https://app.trustev.com/api/v2.0",
			},
			identity: {
			  username: "Patria_Lending2_ProdSite",
			  password: "b89236abd3174a829deeb5ebd3814cb8",
			  secretKey: "fcc8bb04a16b46dcbb9ae7f396980da1",
			  publicKey: "db7e99de1c634496b2a5429216cd10e8",
			  url: "https://app.trustev.com/api/v2.0",
			},
			kba_otp: {
			  username: "Patria_Lending3_ProdSite",
			  password: "36cc93902ec44dde9a101adc0e8ae294",
			  secretKey: "4501e2782ee14c0ca8c911af320d08e4",
			  publicKey: "0dae9d0a22184578bc844d0da3a85dd7",
			  url: "https://app.trustev.com/api/v2.0",
			},
		  };
	  
		  const isProd =
			process.env.NODE_ENV === "production" || process.env.NODE_ENV === "prod";
	  
		  const credentials = isProd ? prodConfig[strategy] : stagingConfig[strategy];

		if (credentials) {
			return credentials;
		}

		throw new Error(`Invalid test case: ${strategy}`);
	}
	
	// const trueValidate = {
	// 	username: "Patria_Lending_Test",
	// 	password: "79f8ea522b2043c099fb5d68b28863e6",
	// 	secretKey: "a65487d01cbd4bf1a07e6ace775c2c32",
	// 	publicKey: "1f2dc512f2004000a64416531c4661ff",
	// 	url: "https://app.trustev.com/api/v2.0",
	// };

	// if( process.env.NODE_ENV === "production" || process.env.NODE_ENV === "prod") {
	// 	trueValidate.url = "https://app-eu.trustev.com/api/v2.0";
	// }

	return getCredentialsTestCase(strategy); // change parameter for different test cases
}

/*
Patria _ STAGE
Username: PATRIASTAGE1
Password: CHangeme123!!
Merchant ID: 54545
Store ID: 1212
Authentication token - c2nN0MBn
 */
