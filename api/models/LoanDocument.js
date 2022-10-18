/**
 * LoanDocument.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

const { MongoKerberosError } = require("mongodb");
const Q = require("q"),
  moment = require("moment");
const PaymentManagementModel = require("./PaymentManagement");
const ObjectId = require("mongodb").ObjectID;

const LoanDocType = {
  GOVERNMENT_ID: "government_id",
  PAYCHECK_STUB: "paycheck_stub",
  BANK_STATEMENT: "bank_statement",
  DRIVER_LICENSE: "driver_license",
  PROOF_OF_RESIDENCE: "proof_of_residence",
};

module.exports = {
  attributes: {
    docname: {
      type: "string",
    },
    screenTracking: {
      model: "ScreenTracking",
    },
    label: {
      type: "string",
      enum: Object.values(LoanDocType),
      defaultsTo: LoanDocType.GOVERNMENT_ID,
    },
    user: {
      model: "User",
    },
    docType: {
      type: "string",
    },
  },
  createLoanEntry: async function (context) {
    try {
      const { screenTracking, user } = context;
      context.screenTracking = ObjectId(screenTracking);
      context.user = ObjectId(user);
      await LoanDocument.create(context);
      return {
        success: true,
      };
    } catch (error) {
      sails.log.error("LoanDoc#createLoanEntry:", error);
      return {
        success: false,
        error,
      };
    }
  },

  getAllDocuments: async function (screenTrackingId, userId) {
    try {
      const query = {};
      const loanData = await LoanDocument.findOne({
        screenTracking: screenTrackingId,
      }).populate("user", {
        select: [
          "firstName",
          "lastName",
          "state",
          "city",
          "street",
          "email",
          "phoneNumber",
          "phones",
        ],
      });

      return loanData
    } catch (error) {
      sails.log.error(`LoanDocumentModel:: getAllDocuments:${error}`);
      return [];
    }
  },
};
