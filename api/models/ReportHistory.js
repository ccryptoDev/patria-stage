/* global ReportTemplate, S3Service, PracticeManagement, ReportHistory */

const moment = require( "moment" );

/**
 * ReportHistory.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {
	attributes: {
		reportTemplate: {
			model: "ReportTemplate"
		},
		reportName: {
			type: "string"
		},
		reportPath: {
			type: "string"
		},
		reportArguments: {
			type: "json"
		},
		adminUser: {
			model: "Adminuser"
		},
		adminUserEmail: {
			type: "string"
		},
		adminRoleName: {
			type: "string"
		},
		adminPracticeId: {
			model: "PracticeManagement"
		},
		adminPracticeName: {
			type: "string"
		}
	},
	saveReport: saveReport
};

async function saveReport( reportKey, content, reportArguments, user, adminpractice ) {
	try {
		const templatedata = await ReportTemplate.findOne( { key: reportKey } );
		const reportHistory = {
			adminUser: user.id,
			adminUserEmail: user.email,
			adminRoleName: user.rolename,
			reportTemplate: templatedata.id,
			reportName: templatedata.name,
			reportArguments: reportArguments
		};

		if( adminpractice ) {
			const practicemanagementData = await PracticeManagement.findOne( { id: adminpractice } );
			reportHistory.adminPracticeName = practicemanagementData.PracticeName;
			reportHistory.adminPracticeId = practicemanagementData.id;
		}

		const fileName = `${ templatedata.name }-${ moment().format() }.csv`;
		const awsPath = await S3Service.uploadReportCSV( fileName, content, templatedata.name, reportHistory.practiceName );
		reportHistory.reportPath = awsPath;
		return await ReportHistory.create( reportHistory );
	} catch ( err ) {
		return { code: 400, error: err };
	}
}
