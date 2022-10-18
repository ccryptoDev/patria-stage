"use strict";
var bankruptcytype = ["CB", "TB", "1D", "1F", "1V", "1X", "2D", "2F", "2V", "2X", "3D", "3F", "3V", "3X", "7D", "7F", "7V", "7X"];
var forclosuretype = ["DF", "FC", "SF"];
// Kuber Credentials Test

module.exports.applicationConfig = {
	apiBaseUrl: "https://netaccess-test.transunion.com/",
	apiindustryCode: "F",
	apimemberCode: "04851442",
	apiprefixCode: "0622",
	apiPassword: "D555",
	apiKeyPassword: "alchemy123",
	apiEnv: "standardTest",
	apiuserRefNumber: "12345",
	apiVersionr: "2.21",
	apiPempath: "KUBERFI2.pem",
	apiPemkeypath: "KUBERFI2Key.pem",
	bankruptcytype: bankruptcytype,
	forclosuretype: forclosuretype,
	//--New configs for dynamic
	apiMode: "sandbox"
};

//live credentials Soft pull
/*module.exports.applicationConfig = {
	apiBaseUrl: 'https://netaccess.transunion.com/',
	apiindustryCode:'F',
	apimemberCode:'1906526',
	apiprefixCode:'1201',
	apiPassword:'X3Q5',
	apiKeyPassword:'tfcsecure123',
	apiEnv:'production',
	apiuserRefNumber:'12345',
	apiVersionr:'2.21',
	bankruptcytype:bankruptcytype,
	forclosuretype:forclosuretype,
};*/
