/**
 * Blocklist.js
 */

module.exports = {
	attributes: {
		ssn: {
			type: "string"
		},
		firstname: {
			type: "string"
		},
		middlename: {
			type: "string"
		},
		lastname: {
			type: "string"
		},
		address1: {
			type: "string"
		},
		address2: {
			type: "string"
		},
		city: {
			type: "string"
		},
		state: {
			type: "string"
		},
		zip: {
			type: "string"
		},
		reason: {
			type: "string"
		},
		timestamp: {
			type: "integer"
		}
	},

	async isBorrowerBlocked(query) {
		try {
			const result = await Blocklist.findOne(query);
			if (result) return true;
			return false;
		} catch (error) {
			return true;
		}
	}
};
