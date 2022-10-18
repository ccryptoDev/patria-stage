/**
 * PaymentScheduleHistory.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

var config = sails.config,
  Q = require('q'),
  moment = require('moment'),
  _ = require('lodash'),
  shortid = require('shortid'),ddd
  feeManagement = config.feeManagement;


module.exports = {

  attributes: {
    practicemanagement: {
      model: 'PracticeManagement'
    },
    account: {
      model: 'Account'
    },
    user: {
      model: 'User'
    },
    screentracking: {
      model: 'Screentracking'
    },
    programStart: {
      type: 'date'
    },
    programEnd: {
      type: 'date'
    },
    programCompleted: {
      type: 'boolean'
    },
    paymentSchedule: {
      type: 'array'
    },
    nextPaymentSchedule: { type: "date", defaultsTo: null },
    loanSetdate: {
      type: 'date'
    },
    maturityDate: {
      type: 'date'
    },
    status: { type: "string"},
    logs: {
      type: 'array',
      defaultsTo: []
    },
    isPaymentActive: { type: "boolean", defaultsTo: true },
    achstatus: {
      type: 'integer',
      defaultsTo: 1
    },
    contractReference: {
      type: "string",
      defaultsTo: shortid.generate
    },
    loanReference: {
      type: "string",
      defaultsTo: shortid.generate
    },
    deniedfromapp: {
      type: 'integer',
      defaultsTo: 0
    },
    changebankToken: {
      type: 'string'
    },
    changebankinfo: {
      type: 'array',
      defaultsTo: []
    },
    usertransactions: {
      type: 'array',
      defaultsTo: []
    },
    declinereason: {
      type: 'string',
      defaultsTo: ''
    },
    creditScore: {
      type: 'string',
      defaultsTo: ''
    },
    moveToOpen:{
      type: 'integer'
    },
    appverified: {
      type: 'integer',
      defaultsTo: 0
    },
    moveToArchive: {
      type: 'integer'
    },
    moveToArchive: {
      type: 'integer'
    },
    advancedAmount: {
      type: "float"
    },
    minimumIncome: {
      type: "float"
    },
    paymentCap: {
      type: "float"
    },
    requiredPayments: {
      type: "integer"
    },
    canelationPeriod: {
      type: "integer"
    },
    completionPercent: {
      type: "float"
    },
    downPaymentDiscount: {
      type: "integer"
    },
    applicationFee: {
      type: "float"
    },
    latePaymentFee: {
      type: "float"
    },
    checkProcessFee: {
      type: "float"
    },
    returnCheckFee: {
      type: "float"
    },
    totalPaid: {
      type: "float"
    },
    contractStartDate: {
      type: "date"
    },
    effectiveIncomePercent: {
      type: "float"
    },
    annualIncome: {
      type: "float"
    },
    isAfterHoliday:  { type: "integer"},
    paymentFrequency:  { type: "string"},
    isDenied: {
      type: "boolean"
    },
    estimatedAPR: {
      type: "float"
    },
    totalPaymentsFeeChargeAmount: {
      type: "float"
    },
    totalPaymentsFinancedAmount: {
      type: "float"
    },
    totalPaymentsPrincipalAmount: {
      type: "float"
    },
    failedtranscount: { type: "integer", defaultsTo: 0 },
    archiveStatus: {
      type: "string"
    },
    isInCollections: {
      type: "boolean"
    },
    movedToCollectionsDate: {
      type: "date"
    },
    collectionAssignStatus:  { type: "string"},
    collectionAssignedUser: {
      model: "Adminuser"
    },
    oldestDaysPastDue: {
      type: "integer"
    },
    totalNumberOfPastDue: {
      type:"integer"
    },
    contactScheduleReminderDate: {
      type: "date"
    },
    isSettled: {
      type: "boolean"
    },
    isChargeOff: {
      type: "boolean"
    },
    collectionAccountStatusReason: {type: "string"},
    collectionsAccountStatus: { type: "string"},
    totalAmountPastDue: {type: "float"},
    isInLoanModification: {
      type: "boolean"
    },
    loanModificationRevision: {
      type: "integer"
    },
    lastLoanModificationCreatedDate: {
      type: "date"
    },
    lastLoanModificationCreatedBy: {
      model: "Adminuser"
    },
    loanModificationComment: {
      type: "string"
    },
    isInBankruptcy: {
      type: "boolean"
    },
    bankruptcyInfo: {
      type: "object"
    },
    bankruptcyComment: {
      type: "string"
    },
    bankruptcyEnteredBy: {
      model: "Adminuser"
    },
    madeManualPaymentAt: {
      type: "date"
    },
    madeManualPaymentTransaction: {
      type: "integer"
    },
    madeManualPaymentAmount: {
      type: "float"
    },
    madeManualPaymentPmtRef: {
      type: "string"
    },
    paymentManagement: {
      model: "PaymentManagement"
    }
  },

};

