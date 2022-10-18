/* global sails, Nacha, AdminSettings  */
/**
 * ApplicationController
 *
 * @description :: Server-side logic for managing States
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
"use strict";

// const request = require('request');
const moment = require( "moment" );
const util = require( "util" );
const fs = require( "fs" );
const readAsync = util.promisify( fs.readFile );

module.exports = {
	nachaFile: nachaFile,
	nachaFiles: nachaFiles,
	nachaFileList: nachaFileList,
	nachaUpdateForm: nachaUpdateForm,
	postNachaCredentials: postNachaCredentials,
};

async function nachaFile( req, res ) {
	try {
		const fileId = req.param( "id" );

		const fileDetail = await Nacha.findOne( { id: fileId } );
		if( !fileDetail ) {
			throw new Error( "File Not Found" );
		}

		const file = await readAsync( fileDetail.filePath );

		res.attachment( fileDetail.filePath.split( '/' ).pop() ).send( file );

		await Nacha.update( { id: fileId }, { downloadStatus: true } );
		return;
	} catch ( err ) {
		const json = {
			error: err.message,
			code: 400
		};
		return res.json( json );
	}
}

function nachaFiles( req, res ) {
	const responsedata = {};
	sails.log.info( "NachaController.userinformation" );
	return res.view( "admin/nacha/nachaFiles", responsedata );
}

async function nachaFileList( req, res ) {
	try {
		const columnsToShow = CubeListService.getColumnsToShow( req.body.columns );
		const responseJson = await CubeListService.lookupDataWithAggregate( [
			{
				$match: CubeListService.processFiltering( {}, [], req.body.search ? req.body.search.value : "", columnsToShow )
			},
			{
				$facet: {
					overallTotal: [
						{ $count: "overallTotalCount" }
					],
					nachaData: [
						{ $sort: CubeListService.processListSort( req.body.order, req.body.columns ) },
						{ $skip: parseInt( 	req.body.start || "0" ) },
						{ $limit: parseInt( 	req.body.length || "100" ) }
					]
				}
			}
		], req.body.columns, Nacha, "nachaData" );
		
		
		return res.json( responseJson );
	} catch ( exc ) {
		sails.log.error( "AchController#ajaxGetDeniedLeadApiData: Error: ", exc );
		return res.json( { error: exc.message } );
	}
	
}

async function nachaUpdateForm( req, res) {
	try {
		let settings = await AdminSettings.find({setting: "nachaCredentials"});
		let oldCredentials = {
			username: settings[0].nachaCredentials.username,
			password: settings[0].nachaCredentials.password
		}
		return res.view('admin/nacha/nachaCredentials', oldCredentials);
	} catch {
		let oldCredentials = {
			username: "",
			password: ""
		}
		return res.view('admin/nacha/nachaCredentials', oldCredentials);
	}
}

async function postNachaCredentials( req, res ) {
	let username = req.body.newCredentials.username;
	let password = req.body.newCredentials.password;
	let newCredentials = {
		username: username,
		password: password
	};
	try {
		await AdminSettings.update({"setting": "nachaCredentials"}, {nachaCredentials: newCredentials});
		sails.log.verbose("Nacha Credentials updated.");
		res.json("ok");
	}catch(err) {
			sails.log.error("NachaController#postNachaCredentials :: Error: " + err.message);
			res.status(500).json(err);
	}
}
