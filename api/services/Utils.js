/* global sails */
"use strict";

const _ = require('lodash');
const shortid = require('shortid');
const Q = require('q');
const parseAddress = require( "parse-address" );
const fs = require('fs');
const path = require("path");
const bcrypt = require("bcrypt");
module.exports = {

  generateReferenceId: generateReferenceId,
  verifyReferenceId: verifyReferenceId,
  getOriginalNameFromUrl: getOriginalNameFromUrl,
  isTimeExpired: isTimeExpired,
  getS3Url: getS3Url,
  $format: $format,
  $formatNL: $formatNL,
  parseStreetAddress: parseStreetAddress,
  phoneformat: phoneformat,
	formatDate: formatDate,
	formatDateOnly: formatDateOnly,
	getFirstObjectFromArray: getFirstObjectFromArray,
	doesUserContainRole:doesUserContainRole,
	doesKeyExist: doesKeyExist,
	makeFSDirectory:makeFSDirectory,
	phoneformatForDatatables:phoneformatForDatatables,
	payFrequencyDisplay: payFrequencyDisplay,
	ssnFormat: ssnFormat,
};

/**
 *
 * @returns {String} - Reference ID
 */
function getS3Url(path) {
  if (!path) {
    return "";
  }
  // TODO: Add production config
  //return 'https://s3.amazonaws.com/fluid-assets-staging-processed/' + path;
  //return 'https://s3.amazonaws.com/fluidfitek/' + path;
  //return 'https://s3-us-west-2.amazonaws.com/fluidfitek/' + path;
  return sails.config.s3BaseUrl + path;
}

function generateReferenceId() {
  return shortid.generate();
}

/**
 * Verified whether the short id is valid
 *
 * @param id
 * @returns {Boolean}
 */
function verifyReferenceId(id) {
  return shortid.isValid(id);
}

function getOriginalNameFromUrl(url) {
  if (!url) {
    return "";
  }

  var urlArray = url.split('/');

  return urlArray[urlArray.length - 1];
}

function isTimeExpired(dateString) {
  var emailTokenExpiresOn = moment(dateString);

  if (!emailTokenExpiresOn) {
    return true;
  }
  // get the current time
  var currentTime = moment();

  return emailTokenExpiresOn.diff(currentTime) <= 0;

}


function _$format( number, currency, decimals, label ) {
	decimals = ( typeof decimals == "number" ? decimals : 2 );
	currency = ( typeof currency == "undefined" || currency );
	if( typeof number == "string" ) {
		number = parseFloat( number.replace( /[^0-9.]/g, "" ) );
	}
	if( typeof number !== "number" ) number = 0;
	const value = number.toLocaleString( "en-US", { maximumFractionDigits: decimals, minimumFractionDigits: decimals } );
	return ( currency ? label ? `$${value}`: value: value );
}

function $format( number, currency, decimals ) {
	return _$format( number, currency, decimals, true );
}

function $formatNL( number, currency, decimals ) {
	return _$format( number, currency, decimals, false );
}


function parseStreetAddress( address ) {
	const pAddress = parseAddress.parseLocation( address );
	pAddress.number = ( pAddress.number || "" );
	pAddress.prefix = ( pAddress.prefix || "" );
	pAddress.street = ( pAddress.street || "" );
	pAddress.type = ( pAddress.type || "" );
	pAddress.sec_unit_type = ( pAddress.sec_unit_type || "" );
	pAddress.sec_unit_num = ( pAddress.sec_unit_num || "" );
	sails.log.debug( "parseStreetAddress;", pAddress );
	return pAddress;
}
function phoneformat( rawNumber, isSimple = false ) {
	const cleaned = ( "" + rawNumber ).replace( /\D/g, "" );
	const match = cleaned.match( /^(\d{3})(\d{3})(\d{4})$/ );
	if( match ) {
		if(isSimple) {
			return match[ 1 ] + "-" + match[ 2 ] + "-" + match[ 3 ];
		}else {
			return "(" + match[ 1 ] + ") " + match[ 2 ] + "-" + match[ 3 ];
		}
	}
	return null;
}
function formatDate(dateObj, formatString) {
	let parsedDate = "";
	if(!!dateObj) {
		parsedDate = moment(dateObj).format(formatString || "MM-DD-YYYY hh:mm:ss" );
	}
	return parsedDate
}

function formatDateOnly(dateObj, formatString) {
	let parsedDate = "";
	if( !!dateObj ) {
		parsedDate = moment( dateObj ).format( formatString || "MM-DD-YYYY" );
	}
	return parsedDate
}
function getFirstObjectFromArray(theArray) {
	return theArray && theArray.length >0? theArray[0]: null;
}

async function doesUserContainRole( user, roleNames, callback ) {
	const roles = _.map(await Roles.getAllRoles(), "rolename");
	if(!user || !roleNames || !_.isArray( roleNames ) || roleNames.length === 0 || !_.some( roleNames, ( role ) => {
		return roles.indexOf( role ) >= 0;
	} )) {
		callback( null, false );
	} else {
		callback( null, roleNames.indexOf(user.rolename) >= 0 || roleNames.indexOf(user.collectionRoleName) >= 0 );
	}
}
function doesKeyExist(theObj, param, theValue) {
	return theObj && !!param && _.isObject(theObj) && Object.keys(theObj).indexOf(param) >=0 && theObj[param] === theValue;
}

function makeFSDirectory(filepath) {
	var dirname = path.dirname(filepath);

	if (!fs.existsSync(filepath)) {
		makeFSDirectory(dirname);
	}else {
		return;
	}

	fs.mkdirSync(filepath);
}
function phoneformatForDatatables( rawNumber ) {
	const cleaned = ( "" + rawNumber ).replace( /\D/g, "" );
	const match = cleaned.match( /^(\d{3})(\d{3})(\d{4})$/ );
	if( match ) {
		return  `${match[ 1 ]}-${match[ 2 ]}-${match[ 3 ]}`;
	}
	return null;
}
function payFrequencyDisplay(frequency) {
	if(!frequency || !PaymentManagement.convertedPeriodicityToText[frequency]) {
		return null;
	}
	return PaymentManagement.convertedPeriodicityToText[frequency];
}
function ssnFormat( rawNumber ) {
	const cleaned = ( "" + rawNumber ).replace( /\D/g, "" );
	const match = cleaned.match( /^(\d{3})(\d{2})(\d{4})$/ );
	if( match ) {
		return  `${match[ 1 ]}-${match[ 2 ]}-${match[ 3 ]}`;
	}
	return null;
}
