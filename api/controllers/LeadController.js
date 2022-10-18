/* global sails LeadService Screentracking */
/**
 * Lead Controller
 */
module.exports = { };

module.exports = {
	considerLead: considerLead,
	getLeadStats: getLeadStats,
	getCampaignStats: getCampaignStats,
	setDayLimit: setDayLimit,
	getDayLimit: getDayLimit,
	setMonthLimit: setMonthLimit,
	getMonthLimit: getMonthLimit,
	setHourLimit: setHourLimit,
	getHourLimit: getHourLimit,
	setCampaignDayLimit: setCampaignDayLimit,
	getCampaignDayLimit: getCampaignDayLimit,
	setCampaignMonthLimit: setCampaignMonthLimit,
	getCampaignMonthLimit: getCampaignMonthLimit,
	setPurchaseBool: setPurchaseBool,
	getPurchaseBool: getPurchaseBool,
	setPurchaseHolidaysBool: setPurchaseHolidaysBool,
	setPurchaseWeekendsBool: setPurchaseWeekendsBool,
	setPurchaseHoursRange: setPurchaseHoursRange,
	getLeadControllerUI: getLeadControllerUI,
	getConfig: getConfig,
	getRejectedLeadUI: getRejectedLeadUI,
	getRejectedLeads: getRejectedLeads,
	getRejectedDetails: getRejectedDetails,
	ajaxGetDeniedLeadApiData:ajaxGetDeniedLeadApiData,
	setCampaignAutoPromote:setCampaignAutoPromote
};

async function considerLead( req, res ) {
	const lead = req.allParams();
	const { userId, ...response } = await LeadService.evaluateLead(lead);

	LeadService.postLead(lead, response, userId);
	res.json(response).status(200);
}

async function getLeadStats( req, res ) {
	const active = req.query.active != undefined;
	const stats = await LeadService.getStats( active );
	return res.json( stats );
}

async function getCampaignStats( req, res ) {
	sails.log.info( "getCampaignStats" );
	const active = req.query.active != undefined;
	const campaigns = await LeadService.getCampaignStats( active );
	// sails.log.debug( "campaign stats list: ", campaigns );
	let campaignList = campaigns;

	if( campaignList.length > 0 ) {
		sails.log.info("processing lead campaigns")
		campaignList = campaignList.map( ( campaign ) => {
			const tmp =
				active || campaign.days30.limit > 0 ? { id: campaigns.findIndex( ( item ) => item.name === campaign.name ) + 1, ...campaign, action: `<i id='action-add' class='fa fa-minus-circle action' style='color: red;'  onClick=deactivateCampaign('${campaign.name}')></i>` } : { id: campaigns.findIndex( (item) => item.name === campaign.name ) + 1, ...campaign, action: `<i id='action-add' class='fa fa-plus-circle action' style='color: green;'  onClick=activateCampaign('${campaign.name}')></i>`};
			return tmp;
		} );
	}

	// sails.log.debug( "campaign list w/actions:", campaignList );
	const json = {
		aaData: campaignList
	};
	res.contentType( "application/json" );
	return res.json( json );
}

async function setDayLimit( req, res ) {
	try {
		const limit = req.param( "limit" );
		await LeadService.setGlobalLimit( "day", parseInt( limit ) );
		return res.json( { status: "Done" } );
	} catch ( err ) {
		sails.log.error( "setDayLimit - Error: ", err );
		return res.json( { status: "Failed" } );
	}
}

async function getDayLimit( req, res ) {
	try {
		const limit = await LeadService.getGlobalLimit( "day" );
		return res.json( {
			status: "OK",
			limit: limit
		} );
	} catch ( err ) {
		sails.log.error( "getDayLimit - Error: ", err );
		return res.json( { status: "Failed" } );
	}
}

async function setMonthLimit( req, res ) {
	try {
		const limit = req.param( "limit" );
		await LeadService.setGlobalLimit( "month", parseInt( limit ) );
		return res.json( { status: "Done" } );
	} catch ( err ) {
		sails.log.error( "set30DayLimit - Error: ", err );
		return res.json( { status: "Failed" } );
	}
}

async function getMonthLimit( req, res ) {
	try {
		const limit = await LeadService.getGlobalLimit( "month" );
		return res.json( {
			status: "OK",
			limit: limit
		} );
	} catch ( err ) {
		sails.log.error( "get30DayLimit - Error: ", err );
		return res.json( { status: "Failed" } );
	}
}

async function setHourLimit( req, res ) {
	try {
		const limit = req.param( "limit" );
		const hour = req.param( "hour" );
		await LeadService.setGlobalLimit( "hour", parseInt( limit ), parseInt( hour ) );
		return res.json( { status: "Done" } );
	} catch ( err ) {
		sails.log.error( "setHourLimit - Error: ", err );
		return res.json( { status: "Failed" } );
	}
}

async function getHourLimit( req, res ) {
	try {
		const hour = req.param( "hour" );
		const limit = await LeadService.getGlobalLimit( "hour", parseInt( hour ) );
		return res.json( {
			status: "OK",
			limit: limit
		} );
	} catch ( err ) {
		sails.log.error( "getHourLimit - Error: ", err );
		return res.json( { status: "Failed" } );
	}
}

async function setCampaignDayLimit( req, res ) {
	try {
		const limit = req.param( "limit" );
		const campaign = req.param( "campaign" );
		await LeadService.setCampaignLimit( campaign, "day", parseInt( limit ) );
		return res.json( { status: "Done" } );
	} catch ( err ) {
		sails.log.error( "setCampaignDayLimit - Error: ", err );
		return res.json( { status: "Failed" } );
	}
}

async function getCampaignDayLimit( req, res ) {
	try {
		const campaign = req.param( "campaign" );
		const limit = await LeadService.getCampaignLimit( campaign, "day" );
		return res.json( {
			status: "OK",
			limit: limit
		} );
	} catch ( err ) {
		sails.log.error( "getCampaignDayLimit - Error: ", err );
		return res.json( { status: "Failed" } );
	}
}

async function setCampaignMonthLimit( req, res ) {
	try {
		const limit = req.param( "limit" );
		const campaign = req.param( "campaign" );
		await LeadService.setCampaignLimit( campaign, "month", parseInt( limit ) );
		return res.json( { status: "Done" } );
	} catch ( err ) {
		sails.log.error( "setCampaignMonthLimit - Error: ", err );
		return res.json( { status: "Failed" } );
	}
}

async function getCampaignMonthLimit( req, res ) {
	try {
		const campaign = req.param( "campaign" );
		const limit = await LeadService.getCampaignLimit( campaign, "month" );
		return res.json( {
			status: "OK",
			limit: limit
		} );
	} catch ( err ) {
		sails.log.error( "getCampaignMonthLimit - Error: ", err );
		return res.json( { status: "Failed" } );
	}
}

async function setPurchaseBool( req, res ) {
	try {
		const status = req.param( "status" );
		let value = false;
		if( status && status == "true" ) {
			value = true;
		}
		await LeadService.setConfigProperty( "purchasing", value, "boolean" );
		return res.json( { status: "Done" } );
	} catch ( err ) {
		sails.log.error( "setDayLimit - Error: ", err );
		return res.json( { status: "Failed" } );
	}
}

async function getPurchaseBool( req, res ) {
	try {
		const status = await LeadService.getConfigProperty( "purchasing", "boolean" );
		return res.json( {
			status: "OK",
			purchasing: status || false
		} );
	} catch ( err ) {
		sails.log.error( "getDayLimit - Error: ", err );
		return res.json( { status: "Failed" } );
	}
}

async function setPurchaseHolidaysBool( req, res ) {
	try {
		const status = req.param( "status" );
		let value = false;
		if( status && status == "true" ) {
			value = true;
		}
		await LeadService.setConfigProperty( "purchasingHolidays", value, "boolean" );
		return res.json( { status: "Done" } );
	} catch ( err ) {
		sails.log.error( "setPurchaseHolidaysBool - Error: ", err );
		return res.json( { status: "Failed" } );
	}
}

async function setPurchaseWeekendsBool( req, res ) {
	try {
		const status = req.param( "status" );
		let value = false;
		if( status && status == "true" ) {
			value = true;
		}
		await LeadService.setConfigProperty( "purchasingWeekends", value, "boolean" );
		return res.json( { status: "Done" } );
	} catch ( err ) {
		sails.log.error( "setPurchaseWeekendsBool - Error: ", err );
		return res.json( { status: "Failed" } );
	}
}
async function setCampaignAutoPromote(req,res) {
	try {
		const status = req.param( "status" );
		let value = false;
		if( status && status === "true" ) {
			value = true;
		}
		await LeadService.setConfigProperty( "autoPromoteCampaign", value, "boolean" );
		return res.json( { status: "Done" } );
	} catch ( err ) {
		sails.log.error( "setCampaignAutoPromote - Error: ", err );
		return res.json( { status: "Failed" } );
	}
}
async function setPurchaseHoursRange( req, res ) {
	try {
		const start = parseInt( req.param( "start" ) );
		const end = parseInt( req.param( "end" ) );
		await LeadService.setHoursRange( start, end );
		return res.json( { status: "Done" } );
	} catch ( err ) {
		sails.log.error( "setPurchaseHoursRange - Error: ", err );
		return res.json( { status: "Failed" } );
	}
}


async function getConfig( req, res ) {
	try {
		const response = await LeadService.getConfig();
		return res.json( response );
	} catch ( err ) {
		sails.log.error( "getConfig - Error: ", err );
		return res.json( { error: err.message } );
	}
}
/**
 * returns lead controller UI
 *
 * @param {Request} req
 * @param {Response} res
 */
async function getLeadControllerUI( req, res ) {
	sails.log.info( "getLeadGenControllerUI" );

	try {
		const config = await LeadService.getConfig();
		const stats = await LeadService.getStats();
		// sails.log.info( "getLeadGenControllerUI-config", config );
		return res.view( "admin/leads/leadGenControl.nunjucks", {config: {...config},stats: {...stats}});
	} catch ( err ) {
		sails.log.error( "getConfig - Error: ", err );
	}
}

async function getRejectedLeadUI( req, res ) {
	sails.log.info( "getLeadGenControllerUI" );

	try {
		return res.view( "admin/leads/rejectedLeads.nunjucks", {} );
	} catch ( err ) {
		sails.log.error( "getRejectedLeadUI - Error: ", err );
	}
}

async function getRejectedLeads( req, res ) {
}


async function ajaxGetDeniedLeadApiData( req, res ) {
	try {
		const responseJson = await LeadService.getDeniedLeadApiDetails(
			req.query.columns,
			{ action: { $ne: "accepted" } },
			req.query.search ? req.query.search.value : "",
			[],
			req.query.order,
			req.query.start,
			req.query.length
		);
		
		return res.json( responseJson );
	} catch ( exc ) {
		sails.log.error( "AchController#ajaxGetDeniedLeadApiData: Error: ", exc );
		return res.json( { error: exc.message } );
	}
}
async function getRejectedDetails( req, res ) {
	sails.log.info( "getRejectedDetails" );
	const leadid = req.param( "leadid" );

	try {
		const leaddata = await Lead.findOne( { id: leadid } );
		leaddata.rulesDetails = leaddata.details;

		return res.view( "admin/leads/rejectedLeadDetails.nunjucks", { screentracking: leaddata, hideCreditReport: true } );
	} catch ( err ) {
		sails.log.error( "getRejectedDetails - Error: ", err );
	}
}
