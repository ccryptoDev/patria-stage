module.exports.routes = {
	"get /admin/reports": {
		controller: "ReportController",
		action: "reports"
	},
	"post /admin/reports/payments": {
		controller: "ReportController",
		action: "createAndDownloadPaymentReport"
	},
	"get /admin/reports/showreport": {
		controller: "ReportController",
		action: "reportShow"
	},
	"get /admin/reports/generate/:name?": {
		controller: "ReportController",
		action: "generateReport"
	},
	"get /admin/reports/history": {
		controller: "ReportController",
		action: "reportHistory"
	},
	"get /admin/reports/download/:id": {
		controller: "ReportController",
		action: "downloadReport"
	}
};
