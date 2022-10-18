"use strict";
const _ = require( "lodash" );

module.exports = {

	getStates: (req, res) => {
		return State.getExistingState()
			.then( ( states ) => {
				return res.json(states);
			} )
			.catch( ( err ) => {
				sails.log.error( "UtilityController.getStates; :: err:", err );
				return res.json( { code: 500, message: "INTERNAL_SERVER_ERROR" }, 500 );
			} );
	}
}
