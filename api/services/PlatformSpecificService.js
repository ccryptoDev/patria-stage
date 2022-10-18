/* global sails */
"use strict";

const path = require( "path" );

const config = sails.config.platformSpecificService;

let PlatformSpecificService = {}; // class
let platformSpecificServiceInstance = {}; // instance of class

switch( config.platform.toLowerCase() ) {
	case "patria":
	default:
		PlatformSpecificService = require( path.join( sails.config.appPath, "api", "classes", "platformspecificservice", "PatriaPlatformSpecificService" ) );
		break;
}
platformSpecificServiceInstance = new PlatformSpecificService();

module.exports = platformSpecificServiceInstance;
