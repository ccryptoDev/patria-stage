/* global sails, sails, PracticeManagement, Payment, ReportTemplate, ReportService, ReportHistory, S3Service */
/**
 * ReportController
 *
 * @description :: Server-side logic for managing report end points.
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
"use strict";
const moment = require( "moment" );
const json2csv = require( "json2csv" );
const _ = require( "lodash" );
const ObjectId = require( "mongodb" ).ObjectID;

module.exports = {
	reports: reports,
	createAndDownloadPaymentReport: createAndDownloadPaymentReport,
	reportShow: reportShow,
	generateReport: generateReport,
	reportHistory: reportHistory,
	downloadReport: downloadReport
};

async function getReportPageData( partnerId, startDate, endDate ) {
	const yearList = [];
	for( let idx = 2019; idx < parseInt( moment().add( 2, "year" ).format( "YYYY" ) ); idx++ ) {
		yearList.push( idx );
	}
	const responsedata = {};
	responsedata.partners = await PracticeManagement.find( { isDeleted: false, Status: "Active" } ).sort( "PracticeName ASC" );
	responsedata.yearList = yearList;
	if( partnerId ) {
		responsedata.partnerId = partnerId;
	}
	if( startDate ) {
		responsedata.startDate = startDate;
	}
	if( endDate ) {
		responsedata.startDate = endDate;
	}
	responsedata.initMonth = moment().subtract( 1, "month" ).format( "MM" );
	responsedata.initYear = moment().subtract( 1, "month" ).format( "YYYY" );
	return responsedata;
}

async function reports( req, res ) {
	try {
		const responsedata = await getReportPageData();
		const reportTemplate = await getReportTemplate( "payments", "table" );
		responsedata.template = reportTemplate;
		return res.view( "admin/reports/reporting", responsedata );
	} catch ( err ) {
		const json = {
			error: err.message,
			code: 400
		};
		return res.json( json );
	}
}

async function getReportTemplate( template, mode ) {
	let reportTemplate = await ReportTemplate.findOne( { "key": template } );
	if( ! reportTemplate ) {
		reportTemplate = sails.config.adminReports.reports.find( ( report ) => {
			if( report.key == template ) {
				return true;
			}
		} );
		if( reportTemplate ) {
			await ReportTemplate.create( reportTemplate );
		}
	}
	if( ! reportTemplate ) {
		throw new Error( `report template not found for '${template}'` );
	}
	reportTemplate.labels = reportTemplate.fields.map( ( field ) => {
		return field.label;
	} );
	if( mode == "table" ) {
		reportTemplate.fields.forEach( ( field ) => {
			const parts = field.property.split(".");

			if( parts.length > 1 ) {
				field.property = parts[ 0 ] + "Data." + parts[ 1 ];
				if( parts.length > 2 ) {
					field.property = field.property + "." + parts.slice( 2 ).join( "." );
				}
			}
		} );
	}
	return reportTemplate;
}

function findFirstPaymentDate(obj) {
	if( obj && obj.paymentmanagement && obj.paymentmanagement.paymentSchedule && obj.pmtRef ) {
		var scheduled = obj.paymentmanagement.paymentSchedule.find( ( sched ) => {
			if( sched.status == 'PAID' || sched.status == 'PENDING' || sched.status == 'SETTLING' ) {
				return true;
			}
		} );
		if( scheduled ) {
			return scheduled.date;
		}
	}
}

function getDPD(obj){
	if( obj && obj.paymentmanagement && obj.paymentmanagement.paymentSchedule && obj.pmtRef ) {
		var scheduled = obj.paymentmanagement.paymentSchedule.find( ( sched ) => {
			if( sched.status == 'DECLINED' || sched.status == 'RETURNED' ) {
				return true;
			}
		} );
		if( scheduled ) {
			return Math.floor(moment.duration(moment().diff(scheduled.date)).asDays());
		}
	}
}

function getAggregatedPayments(obj){
	if( obj && obj.paymentmanagement && obj.paymentmanagement.paymentSchedule && obj.pmtRef ) {
		var scheduleArr = obj.paymentmanagement.paymentSchedule.filter( ( sched ) => {
			if( sched.status == 'PAID' || sched.status == 'PENDING' || sched.status == 'SETTLING' ) {
				return true;
			}
		} );
		if( scheduleArr.length != 0 ) {	
			let sum = 0;
			for(var i = 0; i < scheduleArr.length; i++){
				sum += scheduleArr[i].amount;
			}
			return sum;
		}
	}
}

function getPaymentsMade(obj){
	if( obj && obj.paymentmanagement && obj.paymentmanagement.paymentSchedule && obj.pmtRef ) {
		var scheduleArr = obj.paymentmanagement.paymentSchedule.filter( ( sched ) => {
			if( sched.status == 'PAID' || sched.status == 'PENDING' || sched.status == 'SETTLING' ) {
				return true;
			}
		} );
		if( scheduleArr.length != 0 ) {	
			return scheduleArr.length;
		}
	}
}


async function generateCSV( template, results ) {
	const Promise = require('bluebird');
	try {
		let promiseArr = [];
		let objArr = [];
		let counter = 0;
		let simplified = [];

		const reportTemplate = await getReportTemplate( template );
		const fields = reportTemplate.fields;

		const employmentData = [];

		results.forEach(function(obj){
			promiseArr.push(() => {
						return EmploymentHistory.getCurrentEmployment(obj.paymentmanagement.id)
						.then(function(history){
							employmentData.push(history);
						});} );
			objArr.push(obj);
		});

		return Promise.each(promiseArr, (fn) => fn()).then(function(){
			employmentData.forEach(function(currentEmploymentData){
				//sails.log.info("+++++++++++++++++++++++++++++++++++++++++++++++++++++++", currentEmploymentData);
				let simple = {};
				fields.forEach( ( field ) => {
					let content = _.get( objArr[counter], field.property );
					switch( field.property ) {
						case "customPaymentType":
							simple[ field.label ] = objArr[counter].scheduledType;
							break;
						case "customAmount":
							simple[ field.label ] = objArr[counter].scheduledAmount;
							break;
						case "customAmountReceived":
							simple[ field.label ] = objArr[counter].scheduledPaid;
							break;
						case "customFirstPaymentDate":
							simple[field.label] = findFirstPaymentDate(objArr[counter]);
							break;
						case "customDPD":
							simple[field.label] = getDPD(objArr[counter]);
							break;
						case "customAggregatedPayments":
							simple[field.label] = getAggregatedPayments(objArr[counter]);
							break;
						case "customVerifiedIncome":
							if(currentEmploymentData && currentEmploymentData.verifiedIncome){
								simple[field.label] = currentEmploymentData.verifiedIncome;
							}
							break;
						case "customPaymentsMade":
							simple[field.label] = getPaymentsMade(objArr[counter]);
							break;
						default:
							if( content ) {
								simple[ field.label ] = content;
							}
							break;
					}
				} );

				counter++;
				simplified.push(simple);
			});

			//sails.log.info("^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^", simplified);

			const paymentToCsv = {
				data: simplified,
				fields: reportTemplate.labels,
				hasCSVColumnTitle: true
			};

			return json2csv( paymentToCsv );
		});

		
	} catch ( err ) {
		return {
			code: 500,
			error: err.message
		};
	}
}

async function createAndDownloadPaymentReport( req, res ) {
	try {
		const startdate = req.param( "startdate" );
		const enddate = req.param( "enddate" );
		let partnerId = req.param( "partner" );
		let adminPractice;

		if( !req.session.rolename ) {
			throw new Error( "User not authorized to generate this report" );
		}
		switch( req.session.rolename ) {
			case "Admin":
				break;
			case "PartnerAdmin":
			case "PartnerStaff":
				partnerId = req.session.adminpracticeID;
				adminPractice = req.session.adminpracticeID;
				break;
			default:
				throw new Error( "User not authorized to generate this report" );
		}

		let practicedata;
		if( partnerId ) {
			practicedata = PracticeManagement.findOne( { id: partnerId } );
		}
		const query = {};
		if( startdate && enddate ) {
			query.createdAt = { ">=": startdate, "<=": enddate };
		} else if( startdate ) {
			query.createdAt = { ">=": startdate };
		} else if( enddate ) {
			query.createdAt = { "<=": enddate };
		}
		if( partnerId && practicedata ) {
			query.practicemanagement = partnerId;
		}
		const results = await Payment.find( query ).populate( "user" ).populate( "practicemanagement" ).populate( "paymentmanagement" ).sort( "practicemanagement ASC" );
		const filteredResults = results.filter( ( payment ) => {
			const scheduled = payment.paymentmanagement.paymentSchedule.find( ( sched ) => {
				if( sched.pmtRef == payment.pmtRef ) {
					return true;
				}
			} );
			if( ! scheduled ) {
				sails.log.error( `Payment ${payment.pmtRef} was not found in the payment schedule` );
				return false;
			}
			return true;
		} );

		filteredResults.forEach( ( payment ) => {
			const scheduled = payment.paymentmanagement.paymentSchedule.find( ( sched ) => {
				if( sched.pmtRef == payment.pmtRef ) {
					return true;
				}
			} );
			if( ( scheduled.status == Payment.STATUS_RETURNED ) || ( scheduled.status == Payment.STATUS_DECLINED ) ) {
				payment.scheduledPaid = 0;
			} else {
				payment.scheduledPaid = scheduled.amount;
			}
			payment.scheduledAmount = scheduled.amount;
			payment.scheduledType = scheduled.status;
		} );

		const csv = await generateCSV( "payments", results );
		const args = {
			startDate: startdate,
			endDate: enddate
		};
		if( partnerId ) {
			args.partnerId = partnerId;
		}
		const reportdata = await ReportHistory.saveReport( "payments", csv, args, req.user, adminPractice );
		const json = {
			status: 200,
			reportid: reportdata.id
		};
		return res.json( json );
	} catch ( err ) {
		const json = {
			error: err.message,
			code: 400
		};
		return res.json( json );
	}
}

async function generateReport( req, res ) {
	if( !req.session.rolename ) {
		throw new Error( "User not authorized to generate this report" );
	}
	let partnerId;
	switch( req.session.rolename ) {
		case "Admin":
			break;
		case "PartnerAdmin":
		case "PartnerStaff":
			partnerId = req.session.adminpracticeID;
			break;
		default:
			throw new Error( "User not authorized to generate this report" );
	}

	const startdate = req.query.filters.startdate ? new Date( req.query.filters.startdate ) : null;
	const enddate = req.query.filters.enddate ? new Date( req.query.filters.enddate ): null;
	if( !partnerId && req.query.filters.partner ) {
		/* the admin is allowed to specify.  Partner admins are not */
		partnerId = req.query.filters.partner;
	}

	const criteria = {};
	let practicedata;
	if( partnerId ) {
		/* verify that this is a valid practice */
		practicedata = await PracticeManagement.findOne( { id: partnerId } );
		if( practicedata ) {
			criteria.practicemanagement = new ObjectId( practicedata.id );
		}
	}

	if( startdate && enddate ) {
		criteria.createdAt = { "$gte": startdate, "$lte": enddate };
	} else if( startdate ) {
		criteria.createdAt = { "$gte": startdate };
	} else if( enddate ) {
		criteria.createdAt = { "$lte": enddate };
	}

	try {
		const reportId = req.param( "name" );
		let responseJson;

		switch( reportId ) {
			case "payments":
				responseJson = await ReportService.lookupPayments( req.query.columns, criteria, req.query.search ? req.query.search.value : "", [], req.query.order, req.query.start, req.query.length );
				break;
			default: {
				const errorMessage = `Report '${reportId}' was not found`;
				sails.log.error( "ReportController#generateReport: Error: ", errorMessage );
				throw new Error( errorMessage );
			}
		}
		return res.json( responseJson );
	} catch ( err ) {
		return res.json( { error: err.message } );
	}
}

async function reportShow( req, res ) {
	const responsedata = {};
	const reportTemplate = await getReportTemplate( "payments", "table" );
	responsedata.template = reportTemplate;
	return res.view( "admin/reports/reporttable", responsedata );
}

async function reportHistory( req, res ) {
	try {
		const criteria = {};
		let adminPartnerId;
		if( req.user.rolename != "Admin" ) {
			adminPartnerId = req.user.practicemanagement;
		}
		if( adminPartnerId ) {
			criteria.adminPracticeId = new ObjectId( adminPartnerId );
		}
		const responseJson = await ReportService.history( req.query.columns, criteria, req.query.search ? req.query.search.value : "", [], req.query.order, req.query.start, req.query.length );
		return res.json( responseJson );
	} catch ( err ) {
		return res.json( { error: err.message } );
	}
}

async function downloadReport( req, res ) {
	try {
		const fileId = req.param( "id" );

		const fileDetail = await ReportHistory.findOne( { id: fileId } );
		if( !fileDetail ) {
			throw new Error( "File Not Found" );
		}

		const file = await S3Service.downloadReportCSV( fileDetail.reportPath );
		res.attachment( fileDetail.reportPath.split( "/" ).pop() ).send( file );
		return;
	} catch ( err ) {
		const json = {
			error: err.message,
			code: 400
		};
		return res.json( json );
	}
}
