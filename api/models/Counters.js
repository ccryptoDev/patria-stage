/**
 * Counters.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */
var Q = require('q'),
moment = require('moment');

module.exports = {

 attributes: {
	apptype: {
      type: 'String'
    },
    sequence_value: {
      type: 'String'
    },
  },
  getNextValue: getNextValue
};


function getNextValue( sequenceName ) {
	return Counters.findOne( { apptype: sequenceName } )
	.then( function( counter ) {
		if( counter == undefined ) return Promise.reject( new Error( `Counter not found by name: ${sequenceName}` ) );
		counter.sequence_value = parseInt( counter.sequence_value ) + 1;
		return counter.save()
		.then( () => counter.sequence_value );
	} )
	.catch( function( err ) {
		sails.log.error( "Counters.getNextValue; catch:", err );
		return Promise.reject( err );
	} );
}
