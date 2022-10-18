/**
 * Bootstrap
 * (sails.config.bootstrap)
 *
 * An asynchronous bootstrap function that runs before your Sails app gets lifted.
 * This gives you an opportunity to set up your data model, run jobs, or perform some special logic.
 *
 * For more information on bootstrapping your app, check out:
 * http://sailsjs.org/#!/documentation/reference/sails.config/sails.config.bootstrap.html
 */

const SailsIOJS = require("sails.io.js");

module.exports.bootstrap = function( cb ) {
	// It's very important to trigger this callback method when you are finished
	// with the bootstrap!  (otherwise your server will never lift, since it's waiting on the bootstrap)
	process.env.TZ = "UTC";

	// polyfill Number.prototype.toFixed()
	( 1.005 ).toFixed( 2 ) == "1.01" || ( function( prototype ) {
		prototype.__toFixed = prototype.toFixed;
		prototype.toFixed = function( precision ) {
			return ( this + 0.0000001 ).__toFixed( precision );
		};
	} )( Number.prototype );
	
	global.$ize = function( num ) {
		return parseFloat( Number( num ).toFixed( 2 ) );
	};
	genKeys();

	cb();
};

// Required for generateJWT
function genKeys() {
	const fs = require( "fs" );
	try {
		const privKey = fs.readFileSync( "JWT_PRIVATE_KEY.PEM", "utf-8" );
		console.log( privKey ? "JWT Keys found": "Generating JWT Keys" );
		process.env.JWT_KEY = privKey;
	} catch ( err ) {
		if( err.code == "ENOENT" ) {
			const { generateKeyPair } = require( "crypto" );
			generateKeyPair( "rsa", {
				modulusLength: 4096, // the length of your key in bits
				publicKeyEncoding: {
					type: "spki", // recommended to be 'spki' by the Node.js docs
					format: "pem"
				},
				privateKeyEncoding: {
					type: "pkcs8", // recommended to be 'pkcs8' by the Node.js docs
					format: "pem",
					cipher: "aes-256-cbc", // *optional*
					passphrase: "top secret" // *optional*
				}
			}, ( err, publicKey, privateKey ) => {
				if( err ) {
					console.log( `Failed to generate JWT keys: ${ err.message }` );
					return;
				}
				process.env.JWT_KEY = privateKey;
				fs.writeFileSync( "JWT_PRIVATE_KEY.PEM", privateKey );
				fs.writeFileSync( "JWT_PUBLIC_KEY.PEM", publicKey );
			} );
		}
	}
}
