/**
 * Logactivity.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

const Q = require("q");

const LOG_TYPE = {
	USER_LOG: 'user',
	ADMIN_LOG: 'admin',
}

module.exports = {

	attributes: {
		adminuser: {
			model: "Adminuser"
		},
		userId: {
			model: "Adminuser"
		},
		email: {
			type: "string"
		},
		status: {
			type: "string"
		},
		actualValue: {
			type: "string"
		},
		expectedValue: {
			type: "string"
		},
		type: {
			type: "string",
			enum: Object.values(LOG_TYPE),
			defaultsTo: LOG_TYPE.USER_LOG
		},
		moduleName: {
			type: "string"
		},
		requestUri: {
			type: "string"
		},
		message: {
			type: "text"
		},
		ip: {
			type: "string"
		},
		loanReference: {
			type: "text"
		},
		logReference: {
			type: "text"
		},
		screenTrackingId: {
			model: "Screentracking"
		},
		paymentManagementId: {
			model: "PaymentManagement"
		},
		jsonData: {
			type: "string",
		},
	},
	registerLogActivity: registerLogActivity,
	/* enduserLogActivity:enduserLogActivity */
	practiceLogActivity: practiceLogActivity,
	createLogActivity,
	countLogs
};

async function createLogActivity(context) {
	try {
		const res = await Logactivity.create(context);
		return res;
	} catch (error) {
		sails.log.error("ERROR::createLogActivity: Error while creating the Log Activity", error);
		return null;
	}
}

async function countLogs(query) {
	try {
		const total = await Logactivity.count(query);
		return total;
	} catch (error) {
		sails.log.error("ERROR::createLogActivity", error);
		return null;
	}
}

function registerLogActivity(reqdata, modulename, modulemessage) {
	return Q.promise(function (resolve, reject) {
		sails.log.info("reqdata.user", reqdata.user);

		if (!modulename || !reqdata || !modulemessage) {
			// sails.log.error("Logactivity#registerLogActivity :: data null ");
			return reject({
				code: 500,
				message: "INTERNAL_SERVER_ERROR"
			});
		}

		if (modulename == "Admin login") {
			User.getNextSequenceValue("logs")
				.then(function (logRefernceData) {
					// sails.log.info("logRefernceData",logRefernceData);
					const logreference = "LOG_" + logRefernceData.sequence_value;

					const loginfodata = {
						adminuser: reqdata.user.id,
						userid: reqdata.userid,
						email: reqdata.user.email,
						modulename: modulename,
						requesturi: reqdata.url,
						logmessage: reqdata.user.email + " - " + reqdata.user.rolename + "  " + modulemessage,
						logdata: reqdata.logdata,
						logreference: logreference,
						remoteaddr: reqdata.ip
					};

					Logactivity.create(loginfodata)
						.then(function (logdetails) {
							// sails.log.info("Logactivity#registerLogActivity :: ", logdetails);
							return resolve(logdetails);
						})
						.catch(function (err) {
							sails.log.error("Logactivity#registerLogActivity :: Error :: ", err);
							return reject(err);
						});
				})
				.catch(function (err) {
					sails.log.error("Logactivity#registerLogActivity:: Error ::", err);
					return reject(err);
				});
		} else {
			//if( reqdata.session.logReferenceID && reqdata.session.logReferenceID != "" ) {
			// sails.log.info("345345345345343453453 :: ");
			let achlogvalue = 0;
			if (reqdata.achlog == 1) {
				achlogvalue = 1;
			}
			const logreference = reqdata.session ? reqdata.session.logReferenceID : null;
			let loginfodata;
			if (reqdata.payID && reqdata.payID != "") {
				if (reqdata.user == "LastPaymentCompletion Cron") {
					loginfodata = {
						adminuser: "Cron Job",
						email: "Cron Job",
						userid: "",
						modulename: modulename,
						requesturi: reqdata.url,
						logmessage: reqdata.user + " - " + modulemessage,
						logdata: reqdata.logdata,
						logreference: logreference,
						remoteaddr: reqdata.ip,
						achlog: achlogvalue,
						paymentManagement: reqdata.payID
					};
				} else {
					loginfodata = {
						adminuser: reqdata.user.id,
						email: reqdata.user.email,
						modulename: modulename,
						requesturi: reqdata.url,
						logmessage: reqdata.user.email + (reqdata.user && !!reqdata.user.rolename ? " - " + reqdata.user.rolename + ": " + modulemessage : " - " + modulemessage),
						logdata: reqdata.logdata,
						logreference: logreference,
						remoteaddr: reqdata.ip,
						achlog: achlogvalue,
						paymentManagement: reqdata.payID
					};

				}

			} else {
				if (reqdata.user == "LastPaymentCompletion Cron") {
					loginfodata = {
						adminuser: "cronjob",
						email: "",
						userid: "",
						modulename: reqdata.user,
						requesturi: reqdata.url,
						logmessage: reqdata.user + modulemessage,
						logdata: reqdata.logdata,
						logreference: logreference,
						remoteaddr: reqdata.ip,
						achlog: achlogvalue
					};
				} else {
					loginfodata = {
						adminuser: reqdata.user.id,
						email: reqdata.user.email,
						userid: reqdata.userid,
						modulename: modulename,
						requesturi: reqdata.url,
						logmessage: reqdata.user.email + (reqdata.user && !!reqdata.user.rolename ? " - " + reqdata.user.rolename + ": " + modulemessage : " - " + modulemessage),
						logdata: reqdata.logdata,
						logreference: logreference,
						remoteaddr: reqdata.ip,
						achlog: achlogvalue
					};

				}

			}

			// sails.log.info("loginfodata :: ", loginfodata);

			Logactivity.create(loginfodata)
				.then(function (logdetails) {
					// sails.log.info("Logactivity#registerLogActivity :: ", logdetails);
					return resolve(logdetails);
				})
				.catch(function (err) {
					sails.log.error("Logactivity#registerLogActivity :: Error :: ", err);
					return reject(err);
				});
			//} else {

			//}
		}
	});
}


/*function enduserLogActivity(reqdata,modulename,modulemessage)
{
	return Q.promise(function(resolve, reject) {

	sails.log.info("reqdata123",reqdata.name);

	if (!modulename || !reqdata || !modulemessage ) {
		sails.log.error('Logactivity#registerLogActivity :: data null ');

		return reject({
		code: 500,
		message: 'INTERNAL_SERVER_ERROR'
		});
	}
	sails.log.info("modulemessage123",modulemessage);


	return User.getNextSequenceValue('logs')
	.then(function(logRefernceData) {

	var logreference ='LOG_'+logRefernceData.sequence_value;

		 var loginfodata = {
				user: reqdata.id,
				email:reqdata.email,
				role:reqdata.role,
				modulename: modulename,
				logmessage:reqdata.email+' - '+modulemessage,
				logdata:reqdata,
				logreference : logreference,
			}
			 Logactivity.create(loginfodata)
				.then(function(logdetails) {
					sails.log.info("Logactivity#registerLogActivity :: ", logdetails);
					return resolve(logdetails);
				})
				.catch(function(err) {
					sails.log.error("Logactivity#registerLogActivity :: Error :: ", err);
					return reject(err);
				});
	})
			.catch(function(err) {
				sails.log.error("Logactivity#registerLogActivity:: Error ::", err);
				return reject(err);
			 });
	});

}*/


function practiceLogActivity(reqdata, modulename, modulemessage) {
	return Q.promise(function (resolve, reject) {

		sails.log.info("reqdata.user", reqdata.user);

		if (!modulename || !reqdata || !modulemessage) {
			//sails.log.error('Logactivity#registerLogActivity :: data null ');

			return reject({
				code: 500,
				message: 'INTERNAL_SERVER_ERROR'
			});
		}

		if (modulename == 'Admin login') {
			return User.getNextSequenceValue('logs')
				.then(function (logRefernceData) {

					sails.log.info("logRefernceData", logRefernceData);
					var logreference = 'LOG_' + logRefernceData.sequence_value;

					var loginfodata = {
						adminuser: reqdata.user.id,
						email: reqdata.user.email,
						modulename: modulename,
						requesturi: reqdata.url,
						logmessage: reqdata.user.email + ' - ' + reqdata.user.rolename + '  ' + modulemessage,
						logdata: reqdata.logdata,
						logreference: logreference,
						remoteaddr: reqdata.ip
					}

					Logactivity.create(loginfodata)
						.then(function (logdetails) {

							//sails.log.info("Logactivity#registerLogActivity :: ", logdetails);
							return resolve(logdetails);
						})
						.catch(function (err) {
							sails.log.error("Logactivity#registerLogActivity :: Error :: ", err);
							return reject(err);
						});

				})
				.catch(function (err) {
					sails.log.error("Logactivity#registerLogActivity:: Error ::", err);
					return reject(err);
				});
		}
		else {
			if (reqdata.session.logReferenceID && reqdata.session.logReferenceID != '') {

				achlogvalue = 0;
				if (reqdata.achlog == 1) {
					achlogvalue = 1;
				}
				var logreference = reqdata.session.logReferenceID;

				if (reqdata.payID && reqdata.payID != '') {
					var loginfodata = {
						adminuser: reqdata.user.id,
						email: reqdata.user.email,
						modulename: modulename,
						requesturi: reqdata.url,
						logmessage: reqdata.user.email + ' - ' + reqdata.user.rolename + '  ' + modulemessage,
						logdata: reqdata.logdata,
						logreference: logreference,
						remoteaddr: reqdata.ip,
						achlog: achlogvalue,
						paymentManagement: reqdata.payID
					}
				}
				else {

					var loginfodata = {
						adminuser: reqdata.user.id,
						email: reqdata.user.email,
						modulename: modulename,
						requesturi: reqdata.url,
						logmessage: reqdata.user.email + ' - ' + reqdata.user.rolename + '  ' + modulemessage,
						logdata: reqdata.logdata,
						logreference: logreference,
						remoteaddr: reqdata.ip,
						achlog: achlogvalue
					}
				}

				//sails.log.info("loginfodata :: ", loginfodata);

				Logactivity.create(loginfodata)
					.then(function (logdetails) {
						// sails.log.info("Logactivity#registerLogActivity :: ", logdetails);
						return resolve(logdetails);
					})
					.catch(function (err) {
						sails.log.error("Logactivity#registerLogActivity :: Error :: ", err);
						return reject(err);
					});
			}
		}
	});
}
