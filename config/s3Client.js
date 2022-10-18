"use strict";

// TODO: Add production config

const s3Config = {
	key: "AKIAYNEOQTI4FD65UGWW",
	secret: "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",
	bucket: "patria-staging"
};

if( process.env.NODE_ENV == "production" ) {
	s3Config.bucket = "patria-prod";
}

const s3Client = require( "knox" ).createClient( s3Config );
const s3ClientUploader = require( "knox" ).createClient( s3Config );

module.exports.s3Config = s3Config;
module.exports.s3Client = s3Client;
module.exports.s3ClientUploader = s3ClientUploader;
module.exports.s3BaseUrl = `https://s3-us-west-2.amazonaws.com/${s3Config.bucket}/`;// `https://${s3Config.bucket}.s3-us-west-2.amazonaws.com/`;
