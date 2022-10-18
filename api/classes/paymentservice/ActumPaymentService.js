/* global sails, Payment */
"use strict";

const _ = require("lodash");
const BasePaymentService = require("./BasePaymentService");
const fs = require("fs");
const moment = require("moment");
const querystring = require("querystring");
const request = require("request");

const pmtSvcConfig = sails.config.paymentService;
const actumConfig = sails.config.actumConfig;

class ActumPaymentService extends BasePaymentService {
	constructor() {
		super();
		this._instanceClass = "actum";
	}

	/**
	 * Prepare Debit Payment
	 * @param {Payment} payment Payment model
	 * @param {User} user User model
	 * @param {Account} userAccount Account model
	 * @param {string} orderNumber order number
	 * @param {string} ipAddr IP Address
	 * @return {Object}
	 */
	prepareDebitPayment(payment, user, userAccount, orderNumber, ipAddr) {
		const account = {};
		const customer = { order_number: orderNumber };
		sails.log.verbose("prepareDebitPayment; payment.type:", payment.type);
		switch (payment.type) {
			case pmtSvcConfig.TYPES.DEBTFUND_CREDIT_PRACTICE:
			case pmtSvcConfig.TYPES.OPERATING_CREDIT_DEBTFUND:
			case pmtSvcConfig.TYPES.OPERATING_CREDIT_PRACTICE:
				sails.log.error(`prepareDebitPayment; Incorrect Payment.type: ${payment.type} for Debit payment`);
				return null;
			case pmtSvcConfig.TYPES.OPERATING_DEBIT_DEBTFUND:
				account.parent_id = actumConfig.operating.parent_id;
				account.sub_id = actumConfig.operating.debit_sub_id;
				account.username = actumConfig.operating.username;
				account.password = actumConfig.operating.password;
				account.syspass = actumConfig.operating.syspass;
				customer.name = actumConfig.pfiCustomer.name;
				customer.email = actumConfig.pfiCustomer.email;
				customer.address = actumConfig.pfiCustomer.address;
				customer.city = actumConfig.pfiCustomer.city;
				customer.state = actumConfig.pfiCustomer.state;
				customer.zip = actumConfig.pfiCustomer.zip;
				customer.phone = actumConfig.pfiCustomer.phone;
				customer.account = actumConfig.debtfund.account;
				customer.routing = actumConfig.debtfund.routing;
				return prepareAchDebit(account, customer, payment.amount, ipAddr);
			case pmtSvcConfig.TYPES.OPERATING_DEBIT_USER:
				account.parent_id = actumConfig.operating.parent_id;
				account.sub_id = actumConfig.operating.debit_sub_id;
				account.username = actumConfig.operating.username;
				account.password = actumConfig.operating.password;
				account.syspass = actumConfig.operating.syspass;
				customer.account = userAccount.accountNumber;
				customer.routing = userAccount.routingNumber;
				customer.name = `${user.firstName} ${user.lastname}`.substr(0, 64);
				customer.email = user.email;
				customer.address = user.street;
				customer.city = user.city;
				customer.state = user.state;
				customer.zip = user.zipCode;
				customer.phone = user.phoneNumber.replace(/[^0-9]/g, "");
				return prepareAchDebit(account, customer, payment.amount, ipAddr);
		}
		sails.log.error("prepareDebitPayment; Unhandled condition!");
		return null;
	}


	/**
	 * Prepare Credit Payment
	 * @param {Payment} payment Payment model
	 * @param {PracticeManagement} practicemanagement PracticeManagement model
	 * @param {string} orderNumber order number
	 * @param {string} ipAddr IP Address
	 * @return {Promise<Object>}
	 */
	prepareCreditPayment(payment, practicemanagement = null, orderNumber, ipAddr) {
		const account = {};
		const customer = { order_number: orderNumber };
		sails.log.verbose("prepareCreditPayment; payment.type:", payment.type);
		switch (payment.type) {
			case pmtSvcConfig.TYPES.DEBTFUND_CREDIT_PRACTICE:
				account.parent_id = actumConfig.debtfund.parent_id;
				account.sub_id = actumConfig.debtfund.debit_sub_id;
				account.username = actumConfig.debtfund.username;
				account.password = actumConfig.debtfund.password;
				account.syspass = actumConfig.debtfund.syspass;
				customer.name = practicemanagement.PracticeName.substr(0, 64);
				customer.email = practicemanagement.PracticeEmail;
				customer.address = practicemanagement.StreetAddress;
				customer.city = practicemanagement.City;
				customer.state = practicemanagement.StateCode;
				customer.zip = practicemanagement.ZipCode;
				customer.phone = practicemanagement.PhoneNo;
				customer.account = practicemanagement.Accountnumber;
				customer.routing = practicemanagement.Routingnumber;
				return prepareAchCredit(account, customer, payment.amount, ipAddr);
			case pmtSvcConfig.TYPES.OPERATING_CREDIT_DEBTFUND:
				account.parent_id = actumConfig.operating.parent_id;
				account.sub_id = actumConfig.operating.debit_sub_id;
				account.username = actumConfig.operating.username;
				account.password = actumConfig.operating.password;
				account.syspass = actumConfig.operating.syspass;
				customer.name = actumConfig.pfiCustomer.name;
				customer.email = actumConfig.pfiCustomer.email;
				customer.address = actumConfig.pfiCustomer.address;
				customer.city = actumConfig.pfiCustomer.city;
				customer.state = actumConfig.pfiCustomer.state;
				customer.zip = actumConfig.pfiCustomer.zip;
				customer.phone = actumConfig.pfiCustomer.phone;
				customer.account = actumConfig.debtfund.account;
				customer.routing = actumConfig.debtfund.routing;
				return prepareAchCredit(account, customer, payment.amount, ipAddr);
			case pmtSvcConfig.TYPES.OPERATING_CREDIT_PRACTICE:
				account.parent_id = actumConfig.operating.parent_id;
				account.sub_id = actumConfig.operating.debit_sub_id;
				account.username = actumConfig.operating.username;
				account.password = actumConfig.operating.password;
				account.syspass = actumConfig.operating.syspass;
				customer.name = practicemanagement.PracticeName.substr(0, 64);
				customer.email = practicemanagement.PracticeEmail;
				customer.address = practicemanagement.StreetAddress;
				customer.city = practicemanagement.City;
				customer.state = practicemanagement.StateCode;
				customer.zip = practicemanagement.ZipCode;
				customer.phone = practicemanagement.PhoneNo;
				customer.account = practicemanagement.Accountnumber;
				customer.routing = practicemanagement.Routingnumber;
				return prepareAchDebit(account, customer, payment.amount, ipAddr);
			case pmtSvcConfig.TYPES.OPERATING_DEBIT_DEBTFUND:
			case pmtSvcConfig.TYPES.OPERATING_DEBIT_USER:
				sails.log.error(`prepareCreditPayment; Incorrect Payment.type: ${payment.type} for Debit payment`);
				return null;
		}
		sails.log.error("prepareCreditPayment; Unhandled condition!");
		return null;
	}


	/**
	 * send prepared payment
	 * @param {Payment} payment
	 * @return {Promise}
	 */
	processPayment(payment) {
		const self = this;
		return new Promise((resolve, reject) => {
			const logPath = `paymentservice/processPayment/${payment.id}.txt`;
			sails.log.verbose("processPayment; pmtRequest:", JSON.stringify(payment.pmtRequest));
			fs.appendFileSync(logPath, `${JSON.stringify(payment.pmtRequest)}\n\n`);
			const update = {};
			request(payment.pmtRequest, (err, response, body) => {
				if (err) {
					sails.log.error("processPayment; request( err ):", err);
					return reject(err);
				}
				sails.log.verbose("processPayment; status:", response.statusCode, response.statusMessage);
				fs.appendFileSync(logPath, `${body}\n\n`);
				update.pmtResponse = parseResponse(body);
				const pmtStatus = _.get(update, "pmtResponse.status", "unknown");
				if (`${pmtStatus}`.toLowerCase() == "accepted") {
					update.status = Payment.STATUS_PENDING;
					update.order_id = update.pmtResponse.order_id;
					update.history_id = update.pmtResponse.history_id;
					update.authcode = update.pmtResponse.authcode;
				} else {
					update.status = Payment.STATUS_DECLINED;
					update.history_id = update.pmtResponse.history_id;
					update.errReason = self.errorReasons(update.pmtResponse.authcode); // TODO: Actum decline/return reason(s)
				}
				return Payment.update({ id: payment.id }, update)
					.then((updated) => {
						payment = updated[0];
						return resolve(payment.pmtResponse);
					});
			});
		});
	}


	checkPaymentStatus(payment) {
		const self = this;
		const achData = {
			username: payment.pmtRequest.headers.username,
			password: payment.pmtRequest.headers.password,
			action_code: "A",
			prev_history_id: "", // if NOT order_id
			order_id: payment.order_id,
			Type: "Basic"
		};
		const reqOpts = {
			method: "POST",
			uri: sails.config.actumConfig.actumApiUrl,
			headers: { "Content-Type": "application/x-www-form-urlencoded" },
			body: querystring.stringify(achData)
		};
		fs.appendFileSync(`paymentservice/checkPaymentStatus/${payment.id}.txt`, `Request: ${JSON.stringify(reqOpts.body)}\n\n`);
		return Payment.update({ id: payment.id }, { statusRequest: reqOpts })
			.then((updated) => {
				payment = updated[0];
				return new Promise((resolve, reject) => {
					request(reqOpts, (error, response, body) => {
						if (error) {
							sails.log.error("checkPaymentStatus; Error:", error);
							return reject(error);
						} else {
							sails.log.verbose("checkPaymentStatus; response:", response.statusCode, response.statusMessage);
							sails.log.verbose("checkPaymentStatus; body:", body);
							fs.appendFileSync(`paymentservice/checkPaymentStatus/${payment.id}.txt`, `${body}\n\n`);
							const obj = parseResponse(body);
							fs.appendFileSync(`paymentservice/checkPaymentStatus/${payment.id}.txt`, `${JSON.stringify(obj)}\n\n`);
							return resolve(obj);
						}
					});
				})
					.then((result) => {
						sails.log.verbose(`checkPaymentStatus; ${payment.pmtRef} ${payment.id} result:`, result);
						const update = {
							statusResponse: result
						};
						// Settled - CheckAuth:083818996
						// Credit - CheckAuth:083980905
						// Returned - Insufficient Funds
						// Returned - No Account/Unable to Locate Account
						// Returned - Account Frozen
						// Returned - Uncollected Funds
						// Returned - Account Closed
						// Returned - Non-Transaction Account
						// Declined - Merchant Request; Revoked by A20180044_Dev
						// Declined - Merchant Request; Revoked by Ellen_VT
						// PreAuth - Pending Credit:083917314
						const billStatus = result.curr_bill_status.toLowerCase();
						if (billStatus.indexOf("preauth -") == 0) {
							update.status = Payment.STATUS_PENDING;
						} else if (billStatus.indexOf("returned -") == 0) {
							update.status = Payment.STATUS_RETURNED;
							update.errReason = result.curr_bill_status;
						} else if (billStatus.indexOf("declined -") == 0) {
							update.status = Payment.STATUS_DECLINED;
							update.errReason = result.curr_bill_status;
						} else if (billStatus.indexOf("credit - dar") == 0) {
							update.status = Payment.STATUS_DECLINED;
							update.errReason = self.errorReasons(billStatus.split("credit - ")[1]);
						} else if (billStatus.indexOf("credit - dcr") == 0) {
							update.status = Payment.STATUS_DECLINED;
							update.errReason = self.errorReasons(billStatus.split("credit - ")[1]);
						} else if (billStatus.indexOf("credit - ddr") == 0) {
							update.status = Payment.STATUS_DECLINED;
							update.errReason = self.errorReasons(billStatus.split("credit - ")[1]);
						} else if (billStatus.indexOf("credit - dmr") == 0) {
							update.status = Payment.STATUS_DECLINED;
							update.errReason = self.errorReasons(billStatus.split("credit - ")[1]);
						} else if (billStatus.indexOf("credit - dor") == 0) {
							update.status = Payment.STATUS_DECLINED;
							update.errReason = self.errorReasons(billStatus.split("credit - ")[1]);
						} else if (billStatus.indexOf("credit - dta") == 0) {
							update.status = Payment.STATUS_DECLINED;
							update.errReason = self.errorReasons(billStatus.split("credit - ")[1]);
						} else if (billStatus.indexOf("credit - dte") == 0) {
							update.status = Payment.STATUS_DECLINED;
							update.errReason = self.errorReasons(billStatus.split("credit - ")[1]);
						} else if (billStatus.indexOf("settled -") == 0) {
							update.status = Payment.STATUS_PAID;
						} else if (billStatus.indexOf("credit - checkauth:") == 0) {
							update.status = Payment.STATUS_PAID;
							update.history_id = result.curr_bill_status.split(":")[1];
							update.authcode = result.curr_bill_status.split("Credit - ")[1];
						} else {
							sails.log.error(`checkPaymentStatus; ${payment.pmtRef} ${payment.id} unhandled status:`, billStatus);
						}
						const statusJoinDate = _.get(result, "join_date", null);
						if (statusJoinDate !== null) {
							update.achJoinDate = moment(statusJoinDate, "MM/DD/YYYY").startOf("day").toDate();
						}
						sails.log.verbose(`checkPaymentStatus; ${payment.pmtRef} ${payment.id} update:`, update);
						return Payment.update({ id: payment.id }, update)
							.then((updated) => {
								payment = updated[0];
								return payment;
							});
					});
			});
	}


	/**
	 * Error Reasons
	 * @param {string} code
	 * @return {string}
	 */
	errorReasons(code) {
		code = (typeof code == "string" ? code.toUpperCase() : "UNKNOWN");
		const declineCodes = {
			"DAR104": "Account number length > 17",
			"DAR105": "Account number contains 123456",
			"DAR108": "Invalid ABA Number",
			"DAR109": "Invalid Fractional",
			"DCR103": "Name scrub",
			"DCR105": "Email blocking",
			"DCR106": "Previous scrubbed account (Negative BD)",
			"DCR107": "Recurring Velocity Check Exceeded",
			"DDR101": "Duplicate Check indicates that this transaction was previously declined",
			"DMR001": "Invalid merchant",
			"DMR002": "Invalid billing profile",
			"DMR003": "Invalid cross sale ID",
			"DMR004": "Invalid Consumer Unique",
			"DMR005": "Missing field: processtype, parent_id, mersubid, accttype, consumername, accountname, host_ip, or client_ip",
			"DMR006": "Payment Type Not Supported",
			"DMR007": "Invalid Origination Code",
			"DMR104": "Merchant not authorized for credit",
			"DMR105": "Invalid or non-matching original order for repeat-order-only subid",
			"DMR106": "Invalid Amount Passed In",
			"DMR107": "Invalid Merchant TransID Passed In",
			"DMR109": "Invalid SysPass or Subid",
			"DMR110": "Future Initial Billing not authorized for this merchant",
			"DMR201": "Amount over the per-trans limit",
			"DMR202": "Amount over daily amount limit",
			"DMR203": "Count over daily count limit",
			"DMR204": "Amount over monthly amount limit",
			"DMR205": "Count over monthly count limit",
			"DOR002": "A recur has been found for Order",
			"DOR003": "A return has been found for Order",
			"DOR004": "Order was not found",
			"DOR005": "Order is not active.",
			"DOR006": "The merchant does not match the order",
			"DOR008": "Could not find original transaction for orderkeyid",
			"DOR009": "Recur Record not found for keyid",
			"DOR010": "Multiple transactions found with that TransID",
			"DTA001": "Consumer identity could not be verified",
			"DTE200": "Account information could not be verified"
		};
		return _.get(declineCodes, code, "Unspecified Error");
	}
}

module.exports = ActumPaymentService;


/**
 * @param {Object} account
 * @param {string} account.parent_id
 * @param {string} account.sub_id
 * @param {Object} customer
 * @param {string} customer.account
 * @param {string} customer.routing
 * @param {string} customer.name
 * @param {string} customer.email
 * @param {string} customer.address
 * @param {string} customer.city
 * @param {string} customer.state
 * @param {string} customer.zip
 * @param {string} customer.phone
 * @param {string} customer.order_number
 * @param {number} amount
 * @param {string} ipAddr
 * @return {Object}
 */
function prepareAchDebit(account, customer, amount, ipAddr) {
	if (process.env.NODE_ENV != "production" && process.env.NODE_ENV != "live") {
		customer = Object.assign(customer, sails.config.actumConfig.testCustomer);
		amount = 0.01;
	}
	const debitData = {
		parent_id: account.parent_id,
		sub_id: account.sub_id,
		pmt_type: "chk",
		chk_acct: customer.account,
		chk_aba: customer.routing,
		custname: customer.name,
		custemail: customer.email,
		custaddress1: customer.address,
		custcity: customer.city,
		custstate: customer.state,
		custzip: customer.zip,
		custphone: customer.phone,
		merordernumber: customer.order_number,
		initial_amount: parseFloat(amount).toFixed(2),
		billing_cycle: "-1",
		ip_forward: ipAddr,
		action_code: "P",
		trans_modifier: "S"
	};
	const reqParams = {
		method: "POST",
		uri: sails.config.actumConfig.actumApiUrl,
		headers: {
			"username": account.username,
			"password": account.password,
			"syspass": account.syspass,
			"Content-Type": "application/x-www-form-urlencoded"
		},
		body: querystring.stringify(debitData)
	};
	return reqParams;
}


/**
 * @param {Object} account
 * @param {string} account.parent_id
 * @param {string} account.sub_id
 * @param {Object} customer
 * @param {string} customer.account
 * @param {string} customer.routing
 * @param {string} customer.name
 * @param {string} customer.email
 * @param {string} customer.address
 * @param {string} customer.city
 * @param {string} customer.state
 * @param {string} customer.zip
 * @param {string} customer.phone
 * @param {string} customer.order_number
 * @param {number} amount
 * @param {string} ipAddr
 * @return {Object}
 */
function prepareAchCredit(account, customer, amount, ipAddr) {
	if (process.env.NODE_ENV != "production" && process.env.NODE_ENV != "live") {
		customer = Object.assign(customer, sails.config.actumConfig.testCustomer);
		amount = 0.01;
	}
	const creditData = {
		parent_id: account.parent_id,
		sub_id: account.sub_id,
		pmt_type: "chk",
		chk_acct: customer.account,
		chk_aba: customer.routing,
		custname: customer.name,
		custemail: customer.email,
		custaddress1: customer.address,
		custcity: customer.city,
		custstate: customer.state,
		custzip: customer.zip,
		custphone: customer.phone,
		merordernumber: customer.order_number,
		initial_amount: parseFloat(amount).toFixed(2),
		billing_cycle: "-1",
		ip_forward: ipAddr,
		action_code: "P",
		creditflag: 1
	};
	const reqParams = {
		method: "POST",
		uri: sails.config.actumConfig.actumApiUrl,
		headers: {
			"username": account.username,
			"password": account.password,
			"syspass": account.syspass,
			"Content-Type": "application/x-www-form-urlencoded"
		},
		body: querystring.stringify(creditData)
	};
	return reqParams;
}


function parseResponse(body) {
	const response = {};
	const lines = body.split("\n");
	_.forEach(lines, (line) => {
		if (line.indexOf("=") == -1) return;
		const keyValPair = line.split("=");
		response[keyValPair[0]] = keyValPair[1];
	});
	return response;
}
