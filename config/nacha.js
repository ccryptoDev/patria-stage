"use strict";

const nacha = {
	//This list is echoed in paymentSchedulePaymentTransaction.nunjucks
	returnCodesToStopACH: [
		"R02",
		"R07",
		"R08",
		"R16"
	],
	immediateDestination: "101000048",
	fileHeaderImmediateDestination: "101206101",
	immediateDestinationName: "LEAD BANK",
	immediateOrigin: "1822442586",
	immediateOriginName: "Patria",
	companyName: "Patria",
	companyIdentification: "1822442586",
	originatingDFIIdentification: "10120610",
	batchNumber: "0000001",
	companyEntryDescription: "PATRIA PMT",
	bankNumber: "w2825",
	taxId: "1822442586",
	sendNachaFileEmailFromAddress:  "Trust Alchemy <matt.francis+nachaSubmitFile@trustalchemy.com>",
	sendNachaFileEmailAddress: ["matt.francis+nachaprod@trustalchemy.com"],
	processNachaLogFolder: "paymentservice/nachaProcessedReturn",
	leadBankSftp: {
		sftpUserName: "testsftp",
		sftpPassword: "test1234",
		companyName:  "Patria",
		sftpServer: "patria.alchemylms.com",
		
		// sftpUsePkiAuth: false,
		//
		sftpUsePkiAuth: false,
		sftpPrivateKey:null,
		
		sftpPort: 22,
		sftpRemoteUploadFolder: "/testsftp/Staging_Patria",
		sftpPullRemoteUploadFolder: "/testsftp/Staging_Patria_Response",
		sftpRetries: 5,
		sftpRetryMinTimeout: 2000,
		sftpAlgorithms: {
			serverHostKey: ['ssh-rsa', 'ssh-dss']
		},
		enabled: true,
		uploadToSftpEnabled: true,
		sftp: null
	}
};
if( process.env.NODE_ENV === "production" ||  process.env.NODE_ENV === "prod" ) {
	nacha.leadBankSftp.sftpUserName = "EV00025_F3D2"; //Change through Admin Panel
	nacha.leadBankSftp.sftpPassword = "EJqRaRHB2"; //Change through Admin Panel
	nacha.leadBankSftp.sftpRemoteUploadFolder = "/Home/ev00025_f3d2 - Patria"
	nacha.leadBankSftp.sftpPullRemoteUploadFolder = "/Distribution/ACHReturn/W2825/Patria"
	nacha.leadBankSftp.sftpServer = "evaultdsm01.com";
	nacha.sendNachaFileEmailAddress.push("electronicpayments@lead.bank");
	nacha.sendNachaFileEmailAddress.push("john@patria.com");
}
nacha.leadBankSftp.sftp = getLeadSftpConfig(nacha);

function getLeadSftpConfig(nachaFile) {
	return {
		host: nachaFile.leadBankSftp.sftpServer,
		port: nachaFile.leadBankSftp.sftpPort,
		username: nachaFile.leadBankSftp.sftpUserName,
		password: nachaFile.leadBankSftp.sftpPassword,
		retries: nachaFile.leadBankSftp.sftpRetries,
		retry_minTimeout: nachaFile.leadBankSftp.sftpRetryMinTimeout,
		algorithms: nachaFile.leadBankSftp.sftpAlgorithms
	}
}

module.exports.nacha = nacha;
