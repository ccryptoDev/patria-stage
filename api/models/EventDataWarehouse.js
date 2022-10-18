/* global sails, EventDataWarehouse */
"use strict";

const _ = require( "lodash" );
const moment = require( "moment" );


module.exports = {
	tableName: "event_data_warehouse",
	attributes: {
		eventName: { type: "string", required: true },
		user_id: { model: "User", required: true },
		screentracking_id: { model: "Screentracking", required: true },
		paymentmanagement_id: { model: "PaymentManagement" },
		date: { type: "date" },
		user: { type: "json", defaultsTo: null },
		screentracking: { type: "json", defaultsTo: null },
		paymentmanagement: { type: "json", defaultsTo: null },
		payment: { type: "json", defaultsTo: null }
	},
	addEvent
};


/**
 * add event
 * @param {string} eventName
 * @param {string} user_id
 * @param {string} screentracking_id
 * @param {string} paymentmanagement_id
 * @param {User} user
 * @param {Screentracking} screentracking
 * @param {PaymentManagement} paymentmanagement
 * @param {Payment} payment
 * @return {Promise<EventDataWarehouse>}
 */
function addEvent( eventName, user_id, screentracking_id, paymentmanagement_id = null, user = null, screentracking = null, paymentmanagement = null, payment = null ) {
	const edw = {
		eventName: eventName,
		user_id: user_id,
		screentracking_id: screentracking_id,
		paymentmanagement_id: ( paymentmanagement_id || null ),
		date: moment().toDate(),
		user: ( user ? JSON.parse( JSON.stringify( user ) ) : null ),
		screentracking: ( screentracking ? JSON.parse( JSON.stringify( screentracking ) ) : null ),
		paymentmanagement: ( paymentmanagement ? JSON.parse( JSON.stringify( paymentmanagement ) ) : null ),
		payment: ( payment ? JSON.parse( JSON.stringify( payment ) ) : null )
	};
	return EventDataWarehouse.create( edw );
}
