/* global sails, Counters, PaymentManagement */

const _ = require( "lodash" );

/**
 * VikingRccBatch.js
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
		fileName: {
			type: "string",
			required: true
		},
		requestDate: {
			type: "string",
			required: true
		},
		effectiveDate: {
			type: "string",
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
		}
	},
	getNextSequenceValue: getNextSequenceValue,
	getTransactionData: getTransactionData
};

function getNextSequenceValue( ) {
	// sails.log.info("sequenceName",sequenceName);

	return Q.promise( function( resolve, reject ) {
		const countercriteria = {
			apptype: "vikingrccbatch"
		};
		// sails.log.info("countercriteria",countercriteria);
		Counters.findOne( countercriteria )
		.then( function( counterdata ) {
			counterdata.sequence_value = parseInt( counterdata.sequence_value ) + 1;
			counterdata.save();
			return resolve( "VIKING_RCC_BATCH_" + counterdata.sequence_value );
		} )
		.catch( function( err ) {
			sails.log.error( "User #getNextSequenceValue::Error", err );
			return reject( err );
		} );
	} );
}

async function getTransactionData( rccPayments ) {
	const transactions = [];

	const pmCache = {};
	const promiseArray = [];

	try {
		_.forEach( rccPayments, function( payment ) {
			if( !pmCache[ payment.paymentmanagement.id ] ) {
				pmCache[ payment.paymentmanagement.id ] = {};
				promiseArray.push( PaymentManagement.findOne( { id: payment.paymentmanagement.id } ).populate( "account" ).populate( "user" ) );
			}
		} );

		const pmArray = await Promise.all( promiseArray );

		_.forEach( pmArray, ( obj ) => {
			pmCache[ obj.id ] = obj;
		});

		_.forEach( rccPayments, function( payment ) {
			let paymentmanagementdata = pmCache[ payment.paymentmanagement.id ];
			const obj = {};
			obj.ROUTING = paymentmanagementdata.account.routingNumber.substr( -9 );
			obj.ACCOUNT = paymentmanagementdata.account.accountNumber.substr( 0, 17 );
			obj.AMOUNT = parseFloat( payment.amount ).toFixed( 2 );
			obj.NAME = `${paymentmanagementdata.user.firstname} ${paymentmanagementdata.user.lastname}`;
			// TYPE:payment.lenderType,
			obj.TYPE = "CHK",
			obj.UNIQUEID = payment.id;
			transactions.push( obj );
		} );
		return transactions;
	} catch ( err ) {
		console.log( err );
	}
}

