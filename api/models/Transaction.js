/**
 * Transaction.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

const Q = require("q");
const _ = require("lodash");
const moment = require("moment")

const transactionPaymentType = {
  TRANSACTION_TYPE_BORROWED: "TRANSACTION_TYPE_BORROWED",
  TRANSACTION_TYPE_PAID_BACK: "TRANSACTION_TYPE_PAID_BACK",
  TRANSACTION_STATUS_INITIATED: "TRANSACTION_STATUS_INITIATED",
  TRANSACTION_STATUS_RETURN: "TRANSACTION_STATUS_RETURN",
  TRANSACTION_STATUS_COMPLETE: "TRANSACTION_STATUS_COMPLETE",
  TRANSACTION_STATUS_CORRECTION: "TRANSACTION_STATUS_CORRECTION",
  TRANSACTION_STATUS_PENDING: "TRANSACTION_STATUS_PENDING",
    TRANSACTION_STATUS_CHANGED: "TRANSACTION_STATUS_CHANGED",
  TRANSACTION_SOURCE_ACH: "TRANSACTION_SOURCE_ACH",
  CURRENCY_TYPE_USD: "CURRENCY_TYPE_USD"
}

const transactionPaymentTypeForDisplay = {
    TRANSACTION_TYPE_BORROWED: "Borrowed",
    TRANSACTION_TYPE_PAID_BACK: "Paid Back",
    TRANSACTION_STATUS_INITIATED: "Initiated",
    TRANSACTION_STATUS_RETURN: "Return",
    TRANSACTION_STATUS_COMPLETE: "Complete",
    TRANSACTION_STATUS_CORRECTION: "Correction",
    TRANSACTION_STATUS_PENDING: "Pending",
    TRANSACTION_STATUS_CHANGED: "Changed",
    TRANSACTION_SOURCE_ACH: "ACH",
    CURRENCY_TYPE_USD: "USD"
}

const transactionType = {
    WAIVED: "WAIVE",
    LOAN_WAIVED: "WAIVE LOAN",
    AMENDED:"AMEND",
    DEFERRED: "DEFER",
    PAID: "PAID",
    DECLINED: "DECLINED",
    PENDING: "PENDING",
    PAYMENT: "PAYMENT"
}
module.exports = {
  attributes: {
    transactionType: {
      type: 'string',
      defaultsTo: transactionPaymentType.TRANSACTION_TYPE_BORROWED
    },
      transactionTypeForDisplay: {
          type: 'string'
      },
    transactionId: {
      type: 'string'
    },
      orderId: {
        type: "string"
      },
    transactionDate: {
      type: 'datetime',
      defaultsTo: new Date()
    },
    transactionSource: {
      type: 'string',
      defaultsTo: transactionPaymentType.TRANSACTION_SOURCE_ACH
    },
    
    transactionMeta: {
      type: 'json'
    },
    amount: {
      type: 'float'
    },
    currency: {
      type: 'string',
      defaultsTo: transactionPaymentType.CURRENCY_TYPE_USD
    },
     paymentmanagement: {
      model: "PaymentManagement"
    },
    user: {
      model: 'User'
    },
      payment: {
        model: "Payment"
      },
    /*university: {
      model: 'University'
    },*/
    status: {
      type: 'string',
    },
      isAmendPayment: {
        type: "boolean"
      },
    logs: {
      type: 'array',
      defaultsTo: []
    },
    events: {
      type: 'array',
      defaultsTo: []
    }
  },
    transactionTypeEnum: transactionType,
    getTransactionForLoan:getTransactionForLoan,
  getTransactionForId: getTransactionForId,
  createTransactionForPull: createTransactionForPull,
  createPaymentTransaction: createPaymentTransaction,
    createPaymentActionTransaction:createPaymentActionTransaction
};

async function getTransactionForLoan(paymentId) {
     return Payment.getTransactionForLoan(paymentId);
}

function getTransactionForId(transactionId) {

  return Q.promise(function(resolve, reject) {
    if (!transactionId) {
      sails.log.error("Transaction#getTransactionForId :: TransctionId is null :: ", transactionId);

      return reject({
        code: 500,
        message: 'INTERNAL_SERVER_ERROR'
      });
    }
 var criteria  = {
    transactionId : transactionId
 };

    // get the transaction
    Transaction
      .findOne(criteria)
      .then(function(transaction) {
        if (!transaction) {
          sails.log.error("Transaction#getTransactionForId :: Transaction not found for the Id :: ", transactionId);

          return reject({
            code: 404,
            message: 'TRANSACTION_NOT_FOUND'
          })
        }

        return resolve(transaction);
      })
      .catch(function(err) {
        sails.log.error("Transaction#getTransactionForId :: ", err);

        return reject({
          code: 500,
          message: 'INTERNAL_SERVER_ERROR'
        });
      });

  });
}


function createTransactionForPull(payid,transactionDetails,amountPull){

	var deferred = Q.defer();
	var criteria = {
		id :payid
	};

	PaymentManagement
	.findOne(criteria)
	.then(function(paymentDetail){

			const newTransaction = {
				transactionDate: new Date(),
				transactionId:transactionDetails.jsonObj.order_id,
				transactionhistoryId:transactionDetails.jsonObj.history_id,
				transactionMeta: {authcode: transactionDetails.jsonObj.authcode},
				amount: amountPull,
				transactionDetails: transactionDetails,
				paymentmanagement: paymentDetail.id,
				user: paymentDetail.user,
				logs: [],
				transactionType: transactionPaymentType.TRANSACTION_TYPE_PAID_BACK,
                status: transactionDetails || transactionType.PENDING
			};

			newTransaction.logs.push({
				message: 'Pull has been intiated',
				date: new Date()
			});

			Transaction.create(newTransaction)
			.then(function(transactionEntity) {

				deferred.resolve(transactionEntity)
			})
			.catch(function(err){
				sails.log.error("create TransanctionFor Emi error", err);
				deferred.reject(err)
			})
	})
	.catch(function(err){
		sails.log.error("get Story for Emi error", err);
		deferred.resolve(err)
	})
	return deferred.promise;
}
/**
 * create transaction for payment
 * @param {Payment} payment
 * @return {Promise<Object>}
 */
async function createPaymentTransaction( payment, transactionType ) {
    const sequence = await Counters.getNextValue("transaction");
  const transaction = {
    transactionDate: new Date(),
      payment: payment.id,
    orderId: payment.order_id,
      transactionId: `TX_${sequence}`,
    transactionhistoryId: payment.history_id,
    transactionMeta: payment.authcode,
    amount: payment.amount,
    transactionDetails: { status: 200, jsonObj: payment.pmtResponse },
    paymentmanagement: payment.paymentmanagement,
    user: payment.user,
    transactionType: transactionType || transactionPaymentType.TRANSACTION_TYPE_PAID_BACK,
      transactionTypeForDisplay: transactionPaymentTypeForDisplay[transactionType] || transactionPaymentTypeForDisplay[ transactionPaymentType.TRANSACTION_TYPE_PAID_BACK],
      status: (!!transactionType), transactionType: payment.status,
      isAmendPayment: payment.isAmendPayment
  };
  return Transaction.create( transaction )
      .then( function( transaction ) {
        return transaction;
      } )
      .catch( ( err ) => {
        sails.log.error( "createPaymentTransaction; catch:", err );
        return err;
      } );
}

async function createPaymentActionTransaction(transactionTypeObj, scheduleItem, paymentManagementId, userId, accountId, paymentType= "PAYMENT_CHANGE", nachaId = null) {
  return Payment.createPaymentActionTransaction(transactionTypeObj, scheduleItem, paymentManagementId, userId, accountId,paymentType, nachaId )
}
