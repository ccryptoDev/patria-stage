/**
 * Lead.js
 */

const LEAD_STATUS = {
  PENDING: "pending",
  ACCEPTED: "accepted",
  REJECTED: "rejected",
};

module.exports = {
  LEAD_STATUS,
  attributes: {
    lead: {
      type: "object",
    },
    // reply: {
    // 	type: "object"
    // },

    source: {
      type: "string",
    },
    action: {
      type: "string",
      enum: Object.values(LEAD_STATUS),
    },
    stage: {
      type: "integer",
    },
    /*directmail: {
			model: "DirectMail"
		},*/
    reason: {
      type: "string",
    },
    // details: {
    // 	type: "object"
    // },
    user: {
      model: "User",
    },
  },
};
