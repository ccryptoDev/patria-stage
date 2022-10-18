"use strict";
const moment = require( "moment" );
const _ = require( "lodash" );
const csvWriter = require("csv-writer");
const fs = require('fs');
const path = require("path");
module.exports = {
    sendInsightDataToSFTP: sendInsightDataToSFTP
};

async function sendInsightDataToSFTP() {
    try {
        const dcInsightsConfig = sails.config.dcInsightsConfig.getDcInsightsConfig();
        if(!dcInsightsConfig || !dcInsightsConfig.enabled) {
            return null
        }
        sails.log.info("ReportingService#sendInsightDataToSFTP :: Generating CSV");
        const csvToUpload = await checkForUpdates();
        if(csvToUpload.csvData.length > 0) {
            mkdirp( dcInsightsConfig.csvPath);
            const fileName = `${dcInsightsConfig.companyName}_${moment().format("YYYYMMDD")}.csv`;
            const filePath = path.join(dcInsightsConfig.csvPath, fileName);
            const csvHeaderObj = _.map(Object.values(csvToUpload.headers),(headerValue) => {return {id: headerValue, title: headerValue}});
            const createCsvWriter = csvWriter.createObjectCsvWriter({path: filePath,header:csvHeaderObj});
            await createCsvWriter.writeRecords(csvToUpload.csvData);
            sails.log.info("ReportingService#sendInsightDataToSFTP :: Wrote CSV to " + filePath);

            if(dcInsightsConfig.uploadToSftpEnabled) {
                await SftpService.uploadFile(filePath, path.join(dcInsightsConfig.sftpRemoteUploadFolder, fileName), sails.config.dcInsightsConfig.getDcInsightsSftpConfig());
                sails.log.info(`ReportingService#sendInsightDataToSFTP :: Uploaded CSV to sftp to server '${dcInsightsConfig.sftpServer}' and folder '${path.join(dcInsightsConfig.sftpRemoteUploadFolder, fileName)}'`);
            }

            const loanReferenceIdToUpdate = _.map(csvToUpload.csvData,(loanItem) => {return loanItem[csvToUpload.headers.loanId]});
            if(loanReferenceIdToUpdate && loanReferenceIdToUpdate.length > 0){
                const updateDate = moment().add(-1,"days").startOf("day").toDate();
                await PaymentManagement.update({loanReference: {$in: loanReferenceIdToUpdate}}, {lastInsightsUploadDate: updateDate})
            }
        }else {
            sails.log.info("ReportingService#sendInsightDataToSFTP :: No CSV data to save");
        }
    }catch(errorObj) {
        sails.log.error("ReportingService#sendInsightDataToSFTP :: Error: ", errorObj);
        return {message: errorObj? errorObj.message: "Unknown error", status: "failed"}
    }
    return {status: "success"};
}
async function checkForUpdates() {
    const csvColumnMappings = {
        leadId: "lead_id",
        applicationId: "application_id",
        customerId: "customer_id",
        loanId: "loan_id",
        firstName: "first_name",
        lastName: "last_name",
        email: "email",
        ssn: "ssn",
        leadStatus: "lead_status",
        withdrawnReason: "withdrawn_reason",
        loanAmount: "loan_amount",
        totalPaid: "total_paid",
        customerLoanType: "customer_loan_type",
        loanRep: "loan_rep",
        loanType: "loan_type",
        loanStatus: "loan_status",
        loanOriginated: "loan_originated",
        paymentType: "payment_type",
        paymentMode: "payment_mode",
        paymentCount: "payment_count",
        paymentAmount: "payment_amount",
        fpd: "fpd",
        paymentDate: "payment_date",
        returnAmount: "return_amount",
        returnCode: "return_code",
        returnDate: "return_date",
        applicationDate: "application_date",
        eSignatureDate: "esignature_date",
        originationDate: "origination_date"
    };

    const today = moment().startOf("day");
    const estimatedLastRunDate = {$gt: moment(today).add(-1, "days").toDate()};
    sails.log.verbose("ReportingService#checkForUpdates :: DC Inights - checking for updated contacts since last run.");
     const recentlyUpdatedQuery = {$or:[{lastInsightsUploadDate: {$exists: false}},{updatedAt: estimatedLastRunDate}], status: {$ne: PaymentManagement.paymentManagementStatus.incomplete} };
    // const recentlyUpdatedQuery = {updatedAt: estimatedLastRunDate, status: {$ne: PaymentManagement.paymentManagementStatus.incomplete} };
    const paymentManagementUpdates = await PaymentManagement.find(recentlyUpdatedQuery).populate('screentracking')
        .populate('user');

    const csvRows = [];
    if(paymentManagementUpdates && paymentManagementUpdates.length > 0) {
        sails.log.verbose("ReportingService#checkForUpdates :: DC Insights - Has updated contracts since last run. Parsing the data to send to DC.");
        for(const paymentManagement of paymentManagementUpdates) {
            const paymentSchedules = paymentManagement.paymentSchedule;
            const screenTracking = paymentManagement.screentracking;
            if(!screenTracking.eSignatureDate) {
                screenTracking.eSignatureDate = screenTracking.applicationDate;
            }
            const user = paymentManagement.user;
            let totalPaid = 0;
            let paymentCount = 0;
            let firstPayment = {};
            let nextPayment = {};
            if(paymentSchedules && paymentSchedules.length > 0) {
                _.forEach(paymentSchedules,(paymentScheduleItem, index) => {
                    if(index === 0 ){
                        firstPayment = moment(paymentScheduleItem.date).startOf("day");
                    }
                    const paymentDate = moment(paymentScheduleItem.date).startOf("day");
                    if(today.diff(paymentDate, "days") >= 0) {
                        nextPayment = paymentScheduleItem;
                        paymentCount += 1;
                    }
                    if(paymentScheduleItem.status === "PAID" || paymentScheduleItem.status === "WAIVED"){
                        totalPaid = parseFloat( (totalPaid + paymentScheduleItem.amount).toFixed(2));
                    }
                })
            }
            const csvData = {};
            let loanReference = paymentManagement.loanReference;

            csvData[csvColumnMappings.leadId] = user.id;
            // csvData["paymentId"] = paymentManagement.id;
            csvData[csvColumnMappings.applicationId] = screenTracking.applicationReference;
            csvData[csvColumnMappings.customerId] = user.userReference;
            csvData[csvColumnMappings.loanId] = loanReference;
            csvData[csvColumnMappings.firstName] = user.firstname;
            csvData[csvColumnMappings.lastName] = user.lastname;
            csvData[csvColumnMappings.email] = user.email;
            csvData[csvColumnMappings.ssn] = user.ssn_number;

            const status = paymentManagement.status;

            if(status === PaymentManagement.paymentManagementStatus.denied) {
                csvData[csvColumnMappings.leadStatus] = "withdrawn";
                csvData[csvColumnMappings.withdrawnReason] = paymentManagement.declinereason;
            }else if([PaymentManagement.paymentManagementStatus.pending, PaymentManagement.paymentManagementStatus.incomplete, PaymentManagement.paymentManagementStatus.active].indexOf(status) >= 0) {
                csvData[csvColumnMappings.leadStatus] = "pending";
            }else {
                csvData[csvColumnMappings.leadStatus] = "originated";
            }

            csvData[csvColumnMappings.loanAmount] = screenTracking.requestedLoanAmount;
            csvData[csvColumnMappings.totalPaid] = totalPaid;
            csvData[csvColumnMappings.customerLoanType] = doesUserHaveMultipleLoans(user.id)?"Renewal": "Standard";
            csvData[csvColumnMappings.loanType] = "Installment";
            csvData[csvColumnMappings.loanStatus] = paymentManagement.status;
            csvData[csvColumnMappings.loanOriginated] = paymentManagement.status !== PaymentManagement.paymentManagementStatus.denied?1:0;

            if(firstPayment.diff(nextPayment) === 0) {
                csvData[csvColumnMappings.paymentType] = "FIRST PMT";
            }else if(status === PaymentManagement.paymentManagementStatus.completed) {
                csvData[csvColumnMappings.paymentType] = "PAYOUT";
            }else {
                csvData[csvColumnMappings.paymentType] = "PAYMENT";
            }

            csvData[csvColumnMappings.paymentMode] = "ACH";
            csvData[csvColumnMappings.paymentCount] = paymentCount;
            csvData[csvColumnMappings.paymentAmount] = nextPayment.amount;
            csvData[csvColumnMappings.fpd] = firstPayment.status !== "PAID"?1:0;
            csvData[csvColumnMappings.paymentDate] = moment(nextPayment.date).format("YYYY-MM-DD hh-mm-ss");
            // csvData[csvColumnMappings.returnAmount] = null;
            // csvData[csvColumnMappings.returnCode] = null;
            // csvData[csvColumnMappings.returnDate] = null;
            csvData[csvColumnMappings.applicationDate] = moment(screenTracking.applicationData).format("YYYY-MM-DD hh-mm-ss");
            csvData[csvColumnMappings.eSignatureDate] =  moment(screenTracking.eSignatureDate).format("YYYY-MM-DD hh-mm-ss");
            const originationDate = paymentManagement.loanSetdate?moment(paymentManagement.loanSetdate): moment(screenTracking.applicationDate);
            csvData[csvColumnMappings.originationDate] = originationDate.format("YYYY-MM-DD hh-mm-ss");

            csvRows.push(csvData);
        }
    }else {
        sails.log.verbose("ReportingService#checkForUpdates :: DC Insights - No updated contracts were found since the last time this ran.");
    }
    return {headers: csvColumnMappings, csvData: csvRows};
}
function mkdirp(filepath) {
    var dirname = path.dirname(filepath);

    if (!fs.existsSync(filepath)) {
        mkdirp(dirname);
    }else {
        return;
    }

    fs.mkdirSync(filepath);
}
async function doesUserHaveMultipleLoans(userId) {
    const users = await PaymentManagement.find({user: userId});
    return users && users.length > 0;
}
