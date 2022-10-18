/**
 * Jwt.js
 *
 * @description :: Keep a record of the JSON Web Tokens that have been created for this system
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {
	attributes: {
		name: {
			type: "string"
		},
		sub: {
			type: "string"
		},
		iat: {
			type: "integer"
		}
	}
};
