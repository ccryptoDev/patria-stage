/* global sails, Counters, PaymentManagement */

const _ = require( "lodash" );
const moment = require("moment");
/**
 * VikingAchBatch.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */


module.exports = {
	attributes: {
		batchId: {
			type: "string",
			required: true
		},
		vikingReferenceId: {
			type: "string"
		},
		merchantBatchId: {
			type: "string"
		},
		requestDate: {
			type: "date",
			required: true
		},
		effectiveDate: {
			type: "date",
			required: false
		},
		totalAmount: {
			type: "float",
			required: true
		},
		totalTransactions: {
			type: "integer",
			required: true
		},
		type: {
			type: "string",
			required: true
		},
		transactions: {
			type: "array"
		},
		status: {
			type: "string"
		},
		request: {
			type: "object"
		},
		response: {
			type: "object"
		},
		statusReason: {
			type: "string"
		}
	},
	getNextSequenceValue: getNextSequenceValue,
	getTransactionData: getTransactionData
};

function getNextSequenceValue() {
	// sails.log.info("sequenceName",sequenceName);

	return Q.promise( function( resolve, reject ) {
		const countercriteria = {
			apptype: "vikingachbatch"
		};
		// sails.log.info("countercriteria",countercriteria);
		Counters.findOne( countercriteria )
			.then( function( counterdata ) {
				counterdata.sequence_value = parseInt( counterdata.sequence_value ) + 1;
				counterdata.save();
				return resolve(`VIKINGBATCH_${counterdata.sequence_value}_${moment().format("MMDD[_]HHmmss") }`);
			} )
			.catch( function( err ) {
				sails.log.error( "User #getNextSequenceValue::Error", err );
				return reject( err );
			} );
	} );
}

async function getTransactionData( achPayments, batchId ) {
	const transactions = [];
	try {
		for(let payment of achPayments) {
			const payId = payment.paymentmanagement.id || payment.paymentmanagement;
			let paymentmanagementdata = await PaymentManagement.findOne( { id: payId } ).populate( "user" );
			if(paymentmanagementdata) {
				const account = await Account.findOne({user: paymentmanagementdata.user.id});
				let amount = 1;
				if(process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'prod') {
					amount = payment.amount
				}
				const obj = 	{
					ConsumerFirstName: paymentmanagementdata.user.firstname,
					ConsumerMiddleName: paymentmanagementdata.user.middlename || "",
					ConsumerLastName:  paymentmanagementdata.user.lastname,
					IndividualIdentificationNumber: `${payment.pmtRef}`,
					RoutingNumber: account && account.routingNumber? account.routingNumber.toString():"",
					BankAccountNumber:  account && account.accountNumber? account.accountNumber.toString():"",
					Amount: amount.toString(),
					AchTransactionCode: "27",
					StreetAddress1:paymentmanagementdata.user.street,
					StreetAddress2: "",
					City: paymentmanagementdata.user.city,
					State: paymentmanagementdata.user.state,
					Zip: paymentmanagementdata.user.zipCode,
					Zip4: "",
					Ssn: paymentmanagementdata.user.ssn_number
				};

				transactions.push( obj );
			}else {
				sails.log.warn(`VikingACHBatch#getTransactionData: WARN: Payment management was not found for viking ach batch id ${batchId}. Unable get transaction for viking ach.`);
			}
		}
	} catch (err) {
		sails.log.error( "VikingACHBatch#getTransactionData: Error: ", err );
	}
	return transactions;
}

