/**
 * State.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */
"use strict";

const Q = require( "q" );
const _ = require( "lodash" );

module.exports = {
	attributes: {
		product: { model: "Productlist" },
		ruleid: { type: "String" },
		description: { type: "String" },
		declinedif: { type: "String" },
		value: { type: "integer" },
		isDeleted: { type: "boolean" }
	}
};
