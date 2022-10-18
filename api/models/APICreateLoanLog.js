/**
 * APICreateLoanLog.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */
var Q = require('q');
var moment = require('moment');

module.exports = {
	attributes: {
		reqData: {
			type: 'object'
		},
		resData: {
			type: 'object'
		}
	}
};
