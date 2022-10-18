/**
 * Roles.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

const _ = require("lodash");
module.exports = {
	attributes: {
		rolename: {
			type: "string"
		},
		rolelevel: {
			type: "integer"
		},
		isDeleted: {
			type: "boolean",
			defaultsTo: false
		},
		backendEnabled: {
			type: "integer",
			defaultsTo: 0
		}
	},
	getAllRoles:getAllRoles
};

async function getAllRoles(searchCritera = null) {
	try {
		let roles = await Roles.find(searchCritera || {});
		if(!roles) {
			roles = [];
		}
		const collectionRoles = await CollectionRoles.getCollectionRoles(searchCritera || {});

		if(collectionRoles) {
			roles = roles.concat( Object.values(collectionRoles) );
		}
		return roles;
	}catch(errorObj) {
		return [];
	}
}
