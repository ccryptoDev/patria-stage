module.exports.twilioConfig = {
	getTwilioConfig: getTwilioConfig
};

// bill.TODO: modified
function getTwilioConfig() {
	const twilioConfig = {
		token: "880370fce23a0cc1246c47c95bf45687",
		accountId: "AC17acde22431a8554d6b072e321f1c7e1",
		verifySID: "VA118567f4618210d18b365c532d8702ec",
		createVerificationUrl: "",
		twilioBaseUrl: "https://verify.twilio.com/v2/Services",
		isEnabled: false
	};
	twilioConfig.createVerificationUrl = `${twilioConfig.twilioBaseUrl}/${twilioConfig.verifySID}/Verifications`;

	if( process.env.NODE_ENV === "staging" ) {
		twilioConfig.isEnabled = false;
	} else if( process.env.NODE_ENV === "production" ) {
		twilioConfig.isEnabled = false;
	} else {
		twilioConfig.isEnabled = false;
	}

	return twilioConfig;
}
