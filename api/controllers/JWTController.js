/* global Jwt */

/**
 * JWT Controller
 *
 * @description :: Server-side logic for parsing inbound leads
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

const _ = require( "lodash" );
const util = require( "util" );
const moment = require( "moment" );
const jwt = require( "jsonwebtoken" );
const jwtSign = util.promisify( jwt.sign );

module.exports = {
	generateJWT: generateJWT
};

async function generateJWT( req, res ) {
	try {
		const obj = {};
		const params = req.allParams();

		if( !params.name ) {
			throw new Error( "the 'name' property is required" );
		}

		// const leadCampaignLookup = await Campaign.find({"referral.channelId": params.name});
		//
		// if(!leadCampaignLookup || leadCampaignLookup.length === 0) {
		// 	throw new Error( "This lead campaign does not exist." );
		// }
		//
		_.merge( obj, params );
		
		obj.iat = parseInt( moment().format( "X" ) );
		const jwtData = await Jwt.create( obj );
		obj.sub = jwtData.id;
		const jwt = await jwtSign( obj, process.env.JWT_KEY, { algorithm: "HS512" } );
		await Jwt.update( { id: jwtData.id }, { jwt: jwt } );
		return res.json( {
			jwt: jwt,
			status: 200
		} );
	} catch ( err ) {
		return res.json( {
			error: err.message,
			status: 500
		} );
	}
}
