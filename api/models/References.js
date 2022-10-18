/**
 * References.js
 *
 * @description :: A model definition.  Represents a database table/collection/etc.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */
var Q = require('q'),
  uuid = require('node-uuid'),
  md5 = require('md5'),
  shortid = require('shortid'),
  moment = require('moment'),
  bcrypt = require('bcrypt');

module.exports = {

  attributes: {
    user: {
      model: 'User'
    },
    name1: {
      type: 'string'
    },
    phoneNumber1: {
      type: 'string'
    },
    relationship1: {
      type: 'string'
    },
  },
createreference : createreferenceAction
};

function createreferenceAction( referenceDetails ) {
  return Q.promise( function( resolve, reject ) {

    References.create( referenceDetails )
    .then(function(referenceData) {
        sails.log.info('referenceData',referenceData);
        return resolve(referenceData);
    } );
  } );
}