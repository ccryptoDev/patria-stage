"use strict";
const moment = require("moment");
const path = require( "path" );
const fs = require("fs");
const readline = require('readline');
const _ = require("lodash");
const nachaConfig = sails.config.nacha;
module.exports = {
    
    uploadNachaFile: async (nachaObj) => {
        if(nachaObj && !!nachaObj.filePath && nachaConfig.leadBankSftp && nachaConfig.leadBankSftp.uploadToSftpEnabled && nachaConfig.leadBankSftp.sftp){
            const leadBankSftpConfig = nachaConfig.leadBankSftp;
            try{
                if(!nachaObj.remoteFileName) {
                    nachaObj["remoteFileName"] = `${nachaConfig.bankNumber}.${nachaConfig.taxId}.${moment(nachaObj.createdAt).format("MMDDYY-HHmm")}`;
                }
                const fileUploadRemotePath = `${leadBankSftpConfig.sftpRemoteUploadFolder}/${nachaObj.remoteFileName}`;
               if( process.env.NODE_ENV === "production" ||  process.env.NODE_ENV === "prod") {
                   let currentSettings = await AdminSettings.findOne({ setting: "nachaCredentials" });
                   nachaConfig.leadBankSftp.sftp.username = currentSettings.nachaCredentials.username;
                   nachaConfig.leadBankSftp.sftp.password = currentSettings.nachaCredentials.password;
               }
                return await SftpService.uploadFile(nachaObj.filePath,fileUploadRemotePath,  nachaConfig.leadBankSftp.sftp);
            }catch(exc) {
                sails.log.error("NachaFtpService#uploadNachaFile Error: ", exc);
                throw exc;
            }
        }
        return Promise.resolve();
    },
    
    checkForNachaReturnFile: async () => {
        const leadBankSftpConfig = nachaConfig.leadBankSftp;
        const now = moment().toDate();
        try{
            
            if(!leadBankSftpConfig || !leadBankSftpConfig.sftp) {
                throw new Error("Unable to check for lead bank return file. Missing lead bank sftp configuration.")
            }
            if( process.env.NODE_ENV === "production" ||  process.env.NODE_ENV === "prod") {
                let currentSettings = await AdminSettings.findOne({ setting: "nachaCredentials" });
                if(currentSettings && currentSettings.nachaCredentials) {
                    leadBankSftpConfig.sftp.username = currentSettings.nachaCredentials.username;
                    leadBankSftpConfig.sftp.password = currentSettings.nachaCredentials.password;
                }
            }
            const returnFileFolder = `${leadBankSftpConfig.sftpPullRemoteUploadFolder}`;
            const returnFileLogFolder =  path.resolve( sails.config.appPath, nachaConfig.processNachaLogFolder);
            mkdirp(returnFileLogFolder);
            let fileList = await getEligibleNachaReturnFiles(returnFileFolder, leadBankSftpConfig.sftp);
            if(fileList && fileList.length > 0) {
                for(let remoteFileName of fileList){
                    const remoteFile = path.resolve(returnFileFolder, remoteFileName);
                    const localFile = path.resolve(returnFileLogFolder, remoteFileName);
                    await SftpService.downloadFile(remoteFile,localFile,leadBankSftpConfig.sftp);
                    const returnResponse = await parseReturnFileContents(localFile);
                    await updateNachaReturnFileLog(remoteFileName,now,returnResponse,true)
                    //await EmailService.sendNachaSummaryEmail(returnResponse);
                }
                return fileList;
            }
            return {found: "none"};
        }catch(exc) {
            sails.log.error("NachaFtpService#checkForNachaReturnFile Error: ", exc);
            throw exc;
        }
    }
};
 async function parseReturnFileContents(returnFileLocalPath) {
        const responsePayments = await readDataFromStream(returnFileLocalPath);
        const paymentRefs = responsePayments?Object.keys(responsePayments):[];
        if(paymentRefs.length > 0) {
            for(let itemKey of paymentRefs) {
                const reason = responsePayments[itemKey].extractedReason;
                const reasonCode = responsePayments[itemKey].extractedReasonCode;
                const userName = responsePayments[itemKey].extractedName || "";
                
                sails.log.error(`${itemKey}: ${responsePayments[itemKey].extractedName}`);
                const payment = await Payment.findOne({ pmtRef: itemKey }).populate("user");
                if(!payment || !payment.user || userName.trim().toUpperCase() !== `${payment.user.firstname.toUpperCase()} ${payment.user.lastname.toUpperCase()}`.substr( 0, 22 ).trim()) {
                     sails.log.warn("NachaFtpService#parseReturnFileContents Error: ", `Payment included in the nacha return file but can't be found in the DB with transaction id: ${itemKey}, reason: ${reason}`);
                } else {
                    const paymentUpdateObj = {
                        status: Payment.STATUS_DECLINED,
                        returnReason: reason,
                        returnReasonCode: reasonCode,
                        hasAchReturnFileBeenProcessed: true
                    };

                    if(payment.hasAchReturnFileBeenProcessed || [Payment.STATUS_PAID, Payment.STATUS_SETTLING, Payment.STATUS_DECLINED].indexOf(payment.status) >= 0) {
                        sails.log.error("NachaFtpService#parseReturnFileContents Error: ", `Payment ${payment.pmtRef} included in the nacha return file has already been processed.`);
                        const logReferenceData = await User.getNextSequenceValue("logs");
                        const logReference = `LOG_${logReferenceData.sequence_value}`;
                            await Logactivity.create( {
                                modulename: "Return file received for payment",
                                logmessage: `A return file was received after the payment ${payment.pmtRef} for ${payment.amount} had already been updated to status ${payment.status}. Moving this payment to DECLINED.`,
                                logreference: logReference,
                                paymentManagement: payment.paymentmanagement
                            } );
                                _.assign(paymentUpdateObj, {
                                    achReturnFileReceivedAfterPaidDate: moment().startOf("day").toDate(),
                                    achReturnFileReceivedAfterPaidReason: reason,
                                    achReturnFileReceivedOldStatus: payment.status,
                                    achReturnFileReceivedOldReason: payment.returnReason
                                });
                        }
                        await Payment.update({id: payment.id},paymentUpdateObj);
                        _.assign(payment, paymentUpdateObj);

                        await PaymentService.updatePaymentScheduleForPaymentStatus(payment);
                    if(!!reasonCode && nachaConfig.returnCodesToStopACH && nachaConfig.returnCodesToStopACH.indexOf(reasonCode) >= 0){
                        const newPaymentManagementUpdate = {disableAutoAch: true, disableAchMoveToCollections: true};
                        await PaymentManagement.update({id: payment.paymentmanagement}, newPaymentManagementUpdate);
                        sails.log.error("NachaFtpService#parseReturnFileContents Error: ", `Payment ${payment.pmtRef} included in the nacha return file has a disable ACH code ${reasonCode}.`);
                        const logReferenceData = await User.getNextSequenceValue("logs");
                        const logReference = `LOG_${logReferenceData.sequence_value}`;
                        await Logactivity.create( {
                            modulename: "Return file with payment contains a disable ACH reason",
                            logmessage: `A return file was received after the payment ${payment.pmtRef} for ${payment.amount} was sent that contains a disabled ach reason response (${reason}). ACH has been disabled and this loan will move to collections.`,
                            logreference: logReference,
                            paymentManagement: payment.paymentmanagement
                        } );
                    }
                        sails.log.info("NachaFtpService#parseReturnFileContents Error: ", `Updated payment ${itemKey} for declined with reason: ${reason}.`);
                }
            }
        }
    
        return responsePayments;
}
async function readDataFromStream(returnFileLocalPath) {
    const returnPaymentData = {}
    let lineCount = 0;

    if(!!returnFileLocalPath) {
        const rl = readline.createInterface({
            input: fs.createReadStream(returnFileLocalPath), crlfDelay: Infinity
        });
        let extractedReason = null;
        let extractedReasonCode = null;
        let extractedPmtRef = null;
        let extractedName = null;
        for await (let line of rl) {
                if(line.startsWith("626") || line.startsWith("799")) {

                    if(line.startsWith("626")) {
                        extractedPmtRef = getTextFromFileForIndex(line, 39, 15);
                        if(!!extractedPmtRef) {
                            extractedPmtRef = `TX_${extractedPmtRef.replace(/\b(0(?!\b))+/g, "")}`;
                        }
                        extractedName = getTextFromFileForIndex(line, 54, 22);
                        if(!!extractedName){
                            extractedName = extractedName.trim();
                        }
                    }
                    if(line.startsWith("799")) {
                        extractedReason = getTextFromFileForIndex(line, 3, 3);
                        if(!!extractedReason) {
                            extractedReasonCode = `${extractedReason}`
                            extractedReason = NachaPaymentService.errorReasons(extractedReason);
                        }
      
                        if(!!extractedPmtRef) {
                            returnPaymentData[extractedPmtRef] = {extractedReason: extractedReason, extractedName: extractedName,extractedReasonCode: extractedReasonCode};
                            extractedPmtRef = null;
                            extractedReason = null;
                            extractedReasonCode = null;
                            extractedName = null;
                        }
                    }
                    
                }
        }
    }
    return returnPaymentData;
}

async function getEligibleNachaReturnFiles(returnFileFolder, leadBankSftpConfig) {
    let fileList = await getRemoteReturnFolderList(returnFileFolder, leadBankSftpConfig);
    // return fileList;
    if(fileList && fileList.length > 0) {
        fileList = await getNachaReturnFileLogs(fileList);
        if(fileList && fileList.length > 0) {
            return fileList;
        }
    }
     return [];
}
async function getNachaReturnFileLogs(fileList) {
     let newFileList = fileList;
     if(!!fileList && fileList.length > 0) {
         const nachaFileLogList = await NachaReturnFileLog.find({fileName: {$in: fileList}});
         if(nachaFileLogList && nachaFileLogList.length > 0) {
             newFileList = _.filter(fileList, (file) => {
                 if(_.some(nachaFileLogList, (nachaLog) => {return nachaLog.fileName === file})){
                     sails.log.error(`NachaFTPService#getNachaReturnFileLogs Error: Tried to parse file that has already been processed - ${file}`);
                     return false
                 }else {
                     return true;
                 }
             });
         }
     }
     return newFileList;
}
async function updateNachaReturnFileLog(fileName, parsedDate, returnContents, wasParsed = false ) {
     if(!fileName || !parsedDate || !moment(parsedDate).isValid() || !returnContents) {
       const error = "Unable to update nacha return file log. Missing required data.";
       sails.log.error("NachaFtpService#updateNachaReturnFileLog Error: ", error);
       throw new Error(error);
     }
     let existingNachaReturnFileLog = await NachaReturnFileLog.findOne({fileName: fileName});
     const nachaReturnFileUpdate = {
         fileName: fileName,
         parsedDate: moment(parsedDate).toDate(),
         returnContents: returnContents,
         wasParsed: wasParsed,
     }
     if(!existingNachaReturnFileLog) {
         return await NachaReturnFileLog.create(nachaReturnFileUpdate);
     }else {
         const updated = await NachaReturnFileLog.update({id: existingNachaReturnFileLog.id}, nachaReturnFileUpdate)
         if(updated && updated.length > 0) {
             return updated[0];
         }
     }
     return null;
}

function getTextFromFileForIndex(line, start, end) {
     if(end > 0) {
         return line.substr(start,end ).trim();
     }else {
         return line.substr(start).trim();
     }
}
async function getRemoteReturnFolderList(returnFileFolder, sftpConfig) {
    const remoteDirectoryList = await SftpService.listDir(returnFileFolder,sftpConfig);
    const fileList = [];
    if(remoteDirectoryList && remoteDirectoryList.length > 0) {
        return remoteDirectoryList.map((item) => {return item.name;});
        // for(let remoteFile of remoteDirectoryList){
        //     const fileName = remoteFile.name;
        //     if(!!fileName) {
        //         const fileDate = fileName.substr(fileName.length - 13,6);
        //         if(!!fileDate && moment(fileDate,"MMDDYY").startOf("day").isSame(moment().startOf("day"))) {
        //             fileList.push(fileName);
        //         }else {
        //             sails.log.error(`NachaFtpService#parseNewReturnFiles WARNING: file ${fileName} return file found but is not set for today.`);
        //         }
        //     }
        // }
    }
    return fileList;
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
