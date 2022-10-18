/**
 * Paymentcomissionhistory.js
 *
 * @description :: A model definition.  Represents a database table/collection/etc.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

const _ = require( "lodash" );

module.exports = {

  attributes: {
	user: {
      model: 'User'
    },
	paymentmanagement: {
      model: 'PaymentManagement'
    },
	screentracking: {
      model: 'Screentracking'
    },
	practicemanagement: {
      model: 'PracticeManagement'
    },
	schedulehistory: {
      model: 'Schedulehistory'
    },
	historyId: {
	  type: 'string'
	},
	orderId: {
	  type: 'string'
	},
	transactionType: {
      type: 'string'
    },
	apiType: {
	  type: 'string'
	},
	paymentamount: {
      type: 'float'
    },
	paymentstatus: {
      type: 'integer',
      defaultsTo: 0
    },
	isfirstpayment: {
      type: 'integer',
      defaultsTo: 0
    },
	comissionamount: {
      type: 'float'
    },
	orginiationfee: {
      type: 'float'
    },
	fixedfee: {
      type: 'float'
    },
	percentfee: {
      type: 'float'
    },
	paybackAmount: {
      type: 'float'
    },
	creditrunstatus: {
      type: 'integer',
      defaultsTo: 0
    },
	credithistoryID: {
	  type: 'string'
	},
	creditorderID: {
	  type: 'string'
	},
	creditauthCode: {
	  type: 'string'
	},
	creditrunAmount: {
      type: 'float'
    },
	creditfailurecount: {
      type: 'integer',
      defaultsTo: 0
    },
	creditfailuretransactions: {
      type: 'array',
      defaultsTo: []
    },
	creditpaymentstatus: {
      type: 'integer',
      defaultsTo: 0
    },
	outstandingprincipal:{
      type: 'float'
	},
	paymentId: { model: "Payment", defaultsTo: null },
	pmtRef: { type: "string", defaultsTo: null }
  },
  registerPaymentComissionHistory: registerPaymentComissionHistory
};


function registerPaymentComissionHistory( paymentmanagement, comissionData ) {
	return new Promise( ( resolve, reject ) => {
		let isfirstpayment = 0;
		if( ! paymentmanagement.usertransactions ) {
			isfirstpayment = 1;
		} else {
			const usertransactions = paymentmanagement.usertransactions;
			const userpaymentcount = usertransactions.length;
			if( userpaymentcount <= 1 ) {
				isfirstpayment = 1;
			}
		}
		const objData = {
			user: paymentmanagement.user,
			paymentmanagement: paymentmanagement.id,
			screentracking: paymentmanagement.screentracking,
			practicemanagement: paymentmanagement.practicemanagement,
			schedulehistory: comissionData.schedulehistoryId,
			orderId: _.get( comissionData, "order_id", "" ),
			historyId: _.get( comissionData, "history_id", "" ),
			transactionType: comissionData.transactionType,
			apiType: comissionData.apiType,
			paymentamount: comissionData.payment.amount,
			paymentstatus: 0,
			isfirstpayment: isfirstpayment,
			comissionamount: comissionData.payment.commissionAmount,
			orginiationfee: comissionData.payment.originationFee,
			fixedfee: comissionData.payment.fixedFee,
			percentfee: comissionData.payment.commissionFee,
			paybackAmount: comissionData.payment.paybackAmount,
			outstandingprincipal: comissionData.comissionPayoffAmount,
			practicePayAmount: comissionData.payment.practicePayback,
			debtFundPayAmount: comissionData.payment.debtfundPayback,
			debtFundSoldPercentage: comissionData.payment.contractSoldPercentage,
			paymentId: _.get( comissionData, "payment.id", null ),
			pmtRef: _.get( comissionData, "payment.pmtRef", null )
		};

		Paymentcomissionhistory.create( objData )
		.then( ( comissionDet ) => {
			return resolve( comissionDet );
		} )
		.catch( function( err ) {
			sails.log.error( "registerPaymentComissionHistory; catch:", err );
			return reject( err );
		} );
	} );
}