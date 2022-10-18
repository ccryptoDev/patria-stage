const util = require( "util" );
const jwt = require( "jsonwebtoken" );
const jwtVerify = util.promisify( jwt.verify );
module.exports = async function( req, res, next ) {
	const results = await verify( req );

	if( results == "success" ) {
		return next();
	}

	return res.status( 403 ).send( {message: "failed authentication" });
};

async function verify( req ) {
	const ip = ( req.headers[ "x-forwarded-for" ] || req.headers[ "x-real-ip" ] || req.connection.remoteAddress ).replace( "::ffff:", "" ).replace( /^::1$/, "127.0.0.1" );
	try {
		// const res = inputs.res;
		if( !req.header( "authorization" ) ) {
			sails.log.error( `JWT AUTH: ${ip} failed to send authentication header.` );
			throw new Error( "JWT missing;" );
		}
		// if one exists, attempt to get the header data
		const token = req.header( "authorization" ).split( "Bearer " )[ 1 ];
		// if there's nothing after "Bearer", no go
		if( !token ) {
			sails.log.error( `JWT AUTH: ${ip} provided an invalid authentication header. (${ req.header( "authorization" ) })` );
			throw new Error( "JWT missing;" );
		}
		req.session.jwt = await jwtVerify( token, process.env.JWT_KEY );
		sails.log.info( `JWT AUTH: ${ip} successfully authenticated with a JWT belonging to: ${ req.session.jwt.name }` );
		const jwtLookup = await Jwt.findOne({"jwt": token});
		
		if(!jwtLookup || !jwtLookup.jwt || jwtLookup.isDisabled) {
			throw new Error("JWT token is invalid.")
		}
		return "success";
	} catch ( err ) {
		sails.log.error( `JWT AUTH: ${ip} attempted authenticate with an unrecognized JWT (${req.header( "authorization" ) })`, err );
		return  err.message;
	}
}
