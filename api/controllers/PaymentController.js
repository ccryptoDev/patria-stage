"use strict";
const _ = require("lodash");
const moment = require("moment-timezone");
const Promise = require("bluebird");
module.exports = {
    makePaymentRenderDialog: makePaymentRenderDialog, submitPayment: submitPayment,
};

/**
 * render Make Payment Breakdown
 * @param {Request} req
 * @param {Response} res
 */
async function makePaymentRenderDialog(req, res) {
    let httpStatus = 400;
    let response = {error: "Bad Request"};
    try {
        const reqParams = req.allParams();
        sails.log.verbose("makePaymentRenderDialog; reqParams:", JSON.stringify(reqParams));
        let templateData = {};
        const payID = _.get(reqParams, "loanId", null);
        const today = moment().startOf("day").toDate();
        const now = moment().toDate();
        const achCutoff = moment(today).hour(sails.config.paymentService.achCutOffHour || 21).toDate();
        const nextDay = SmoothPaymentService.getBusinessDateBasedOnBankDays( moment(today).add(1, "day").toDate(),true);
        const dateBoundary = moment(today).add(2, "months").toDate();
        sails.log.verbose("today:", today);
        sails.log.verbose("now:", now);
        sails.log.verbose("achCutoff:", achCutoff);
        sails.log.verbose("nextDay:", nextDay);

        templateData.paymentAmount = parseFloat(_.get(reqParams, "amount", "0").replace(/[^0-9.]/g, ""));
        const dialogState = templateData.dialogState = (_.get(reqParams, "dialogState", {}));
        dialogState.isRegularPayment = (_.get(dialogState, "isRegularPayment", true) == true);
        dialogState.isPayoffPayment = (_.get(dialogState, "isPayoffPayment", false) == true);
        dialogState.isPastDuePayment = (_.get(dialogState, "isPastDuePayment", false) == true);
        dialogState.includeAccruedInterest = (_.get(dialogState, "includeAccruedInterest", true) == true);
        dialogState.forgiveLateAccruedInterest = (_.get(dialogState, "forgiveLateAccruedInterest", false) == true);
        dialogState.includeAllInterest = (_.get(dialogState, "includeAllInterest", true) == true);
        dialogState.includeUnpaidInterest = (_.get(dialogState, "includeUnpaidInterest", true) == true);
        dialogState.includeUnpaidPrincipal = (_.get(dialogState, "includeUnpaidPrincipal", true) == true);
        dialogState.excludeFees = (_.get(dialogState, "excludeFees", false) == true);
        dialogState.accountId = _.get(reqParams, "accountId", null);
        
        templateData["nextEligibleDay"] = nextDay;
        // let paymentDate = _.get(reqParams, "paymentDate", moment(nextDay).format("MM/DD/YYYY"));
        templateData["paymentDate"] = moment(today).toDate();
        let selectedPaymentDate = _.get(reqParams, "paymentDate", moment(nextDay).format("MM/DD/YYYY"));
        selectedPaymentDate = moment(selectedPaymentDate, "MM/DD/YYYY").startOf("day").toDate();
        if(selectedPaymentDate < today) selectedPaymentDate = today;
        if(selectedPaymentDate > dateBoundary) selectedPaymentDate = today;
        //if(moment(paymentDate).isSame(moment(today), "day") && (!dialogState.useDebitCard || now > achCutoff) ) paymentDate = nextDay;
        if(moment(selectedPaymentDate).isSame(moment(today), "day") && (!dialogState.useDebitCard || now > achCutoff) ) selectedPaymentDate = nextDay;
    
    
        selectedPaymentDate = SmoothPaymentService.getBusinessDateBasedOnBankDays( moment(selectedPaymentDate).toDate(),true);
        
        // templateData.paymentDate = moment((_.get(reqParams, "paymentDate", today) || today), "MM/DD/YYYY").startOf("day").toDate();
        // if(templateData.paymentDate < today) templateData.paymentDate = today;
        // if(templateData.paymentDate > dateBoundary) templateData.paymentDate = today;
        // if(moment(templateData.paymentDate).isSame(moment(today), "day") && (!dialogState.useDebitCard || now > achCutoff) ) templateData.paymentDate = nextDay;
        // templateData.paymentDate = SmoothPaymentService.getBusinessDateBasedOnBankDays( moment(templateData.paymentDate).toDate(),true);
    
    
        const isAmendPayment = dialogState.isAmendPayment;
        const amendedData = dialogState.amendData;
        const paymentmanagement = await PaymentManagement.findOne({id: payID}).populate("screentracking")
        if(!paymentmanagement) {
	        httpStatus = 500;
	       response = {
		        errorCode:500,
		        error:`PaymentManagement not found by ID: ${payID}`
	        };
	       return res.status(httpStatus).json(response);
        }
        templateData.paymentmanagementdata = paymentmanagement;
        const userCheckingAccounts = await PlatformSpecificService.getUserCheckingAccounts(payID);
        
        templateData.userCheckingAccounts = userCheckingAccounts;
        const ledger = PlatformSpecificService.getPaymentLedger(paymentmanagement, templateData.paymentDate);
        templateData.paymentLedger = ledger;
        const totalPastDueAmount = parseFloat((ledger.pastDuePrincipalAmount + ledger.unpaidInterest).toFixed(2));
        const totalAmountOwed = $ize(ledger.principalPayoff + ledger.unpaidInterest);
        templateData["totalPastDueAmount"] = totalPastDueAmount;
        templateData["totalAmountOwed"] = totalAmountOwed;
        
        let previewResult = {};
        if(isAmendPayment) {
            if(!amendedData || amendedData.index === undefined || amendedData.index === null || amendedData.index < 0) {
                httpStatus = 500;
                response = {
                    errorCode:500,
                    error:`Unable to preview this amend payment. The schedule data was not found`
                };
                return res.status(httpStatus).json(response);
            }
            const amendedScheduleIndex = amendedData.index;
            dialogState.isPrincipalOnlyPayment = false;
            templateData = _.assign({}, templateData, checkPaymentAmountForPayment(templateData,ledger,dialogState,paymentmanagement.paymentSchedule[amendedScheduleIndex],totalAmountOwed,true));
            previewResult = await PlatformSpecificService.previewAmendPayment(paymentmanagement, paymentmanagement.paymentSchedule[amendedScheduleIndex], amendedScheduleIndex,
                    templateData.paymentDate, templateData.paymentAmount, dialogState, req.user, null);
            previewResult.newScheduleItemIndex = amendedScheduleIndex;
            // previewResult.paymentSchedule[amendedScheduleIndex].amount = previewResult.newScheduleItem.amount;
            // previewResult.paymentSchedule[amendedScheduleIndex].principalAmount = previewResult.newScheduleItem.principalAmount;
            // previewResult.paymentSchedule[amendedScheduleIndex].interestAmount = previewResult.newScheduleItem.interestAmount;
    
            // previewResult.paymentSchedule[amendedScheduleIndex].date = templateData.paymentDate;
            // previewResult.preview.paymentSchedule[amendedScheduleIndex].date = templateData.paymentDate;
            templateData["newScheduleItemIndex"] = amendedScheduleIndex;
        }else {
            templateData = _.assign({}, templateData, checkPaymentAmountForPayment(templateData,ledger,dialogState,null,totalAmountOwed,false));
            previewResult = PlatformSpecificService.previewPayment(paymentmanagement, templateData.paymentDate, templateData.paymentAmount, dialogState, null, false);
            previewResult.paymentSchedule = previewResult.preview.paymentSchedule;
            if(dialogState.isPrincipalOnlyPayment) {
                
                const changeScheduleObj = await AchService.processChangeSchedule(paymentmanagement,ledger.nextActualPayment,
                  false,true,null,paymentmanagement.screentracking.isAfterHoliday);
                previewResult.preview.paymentSchedule = changeScheduleObj.paymentSchedule;
                previewResult.paymentSchedule = changeScheduleObj.paymentSchedule;
                previewResult.ledger = PlatformSpecificService.getPaymentLedger(paymentmanagement, templateData.paymentDate);
            }
        }
        if(moment(selectedPaymentDate).startOf("day").isAfter(moment(templateData.paymentDate).startOf("day"))) {
            templateData["futureLedger"] = PlatformSpecificService.getPaymentLedger(paymentmanagement, selectedPaymentDate);
        }
        paymentmanagement.paymentSchedule = previewResult.preview.paymentSchedule;
        templateData["previewPaymentSchedule"] = [ previewResult.paymentSchedule[previewResult.newScheduleItemIndex]]
        // previewResult.preview.paymentSchedule[previewResult.newScheduleItemIndex].date = selectedPaymentDate;
        if(previewResult.ledger.principalPayoff > 0) {
            templateData["previewPaymentSchedule"] = AchService.scrapePaymentsScheduleActionEligibility(previewResult.preview.paymentSchedule, previewResult.ledger, paymentmanagement.hasWaivedLoan);
        }else {
            previewResult["newScheduleItemIndex"] = 0;
        }
        ledger.nextActualScheduleItem = previewResult.ledger.nextActualScheduleItem;
        ledger.nextActualPayment = previewResult.ledger.nextActualPayment;
        _.assign(templateData, previewResult, {oldLedger: _.cloneDeep(ledger)});
        _.assign(ledger, previewResult.ledger);
        
        
        if(dialogState.isPrincipalOnlyPayment) {
            templateData.ledger.unpaidInterest = templateData.oldLedger.unpaidInterest;
            ledger.unpaidInterest = templateData.oldLedger.unpaidInterest;
        }
        
        templateData["isFuturePayment"] = moment(templateData.paymentDate).startOf("day").isAfter(moment(nextDay).startOf("day"))
        
         let viewUrl = "admin/makepayment/partials/makePaymentDialog.nunjucks";
        if(isAmendPayment) {
            viewUrl = "admin/makepayment/partials/makeAmendPaymentDialog.nunjucks"
        }

        previewResult.preview.paymentSchedule[previewResult.newScheduleItemIndex].date = selectedPaymentDate;
        templateData.paymentDate = moment(selectedPaymentDate).startOf("day").toDate();
        const view = await new Promise((resolve, reject) => {
            res.render(viewUrl, templateData, (err, view) => {
                if(err) {
                    sails.log.error("makePaymentRenderDialog; res.render error:", err);
                    return reject(err);
                }
                return resolve(view);
            });
        })
        
        if(!!view) {
            httpStatus = 200;
            response = {
                dialog: view,
                regularPayment: Utils.$format(templateData.oldLedger.regularPayment),
                payoff: Utils.$format(totalAmountOwed),
                pastDuePayment: Utils.$format(totalPastDueAmount),
                dialogState: dialogState,
                errorCode: previewResult.errorCode || null,
                error: previewResult.error || null
            };
        }
    } catch(exc) {
        sails.log.error("PaymentController#makePaymentRenderDialog Error: ", exc)
	    httpStatus = 500
	    response = {
		    errorCode:500,
		    error: exc.message
	    }
    }
    return res.status(httpStatus).json(response);
}
function checkPaymentAmountForPayment(templateData, ledger, dialogState,  amendScheduleItem, totalAmountOwed, isAmendPayment = false) {
    const templateAmountData = {paymentAmount: templateData.paymentAmount};
    if(isAmendPayment) {
        const amendedData = dialogState.amendData;
        if(!amendedData || amendedData.index === undefined || amendedData.index === null || amendedData.index < 0 || !amendScheduleItem) {
            return templateAmountData;
        }
        if(dialogState.isAmendPayoff) {
            dialogState.isPayoffPayment = true;
                if(templateData.paymentAmount <= 0 || templateData.paymentAmount > totalAmountOwed) {
                    templateAmountData.paymentAmount = totalAmountOwed;
                }
        }else if(templateData.paymentAmount <= 0 || templateData.paymentAmount > amendScheduleItem.amount) {
            templateAmountData.paymentAmount = amendScheduleItem.amount;
        }
    }else {
        if(templateData.paymentAmount <= 0) {
            templateAmountData.paymentAmount = ledger.regularPayment;
            dialogState.isRegularPayment = true;
            dialogState.isPayoffPayment = false;
            dialogState.isPastDuePayment = false;
        }else  if(templateData.paymentAmount >= totalAmountOwed) {
            templateAmountData.paymentAmount = totalAmountOwed;
            dialogState.isRegularPayment = false;
            dialogState.isPayoffPayment = true;
            dialogState.isPastDuePayment = false;
        }else if(dialogState.isPrincipalOnlyPayment) {
            if(templateData.paymentAmount > ledger.principalPayoff) {
                templateAmountData.paymentAmount = ledger.principalPayoff;
                dialogState.isRegularPayment = true;
                dialogState.isPayoffPayment = false;
                dialogState.isPastDuePayment = false;
            }
        }else if(templateData.paymentAmount > ledger.totalAmountPastDue) {
            templateAmountData.paymentAmount = ledger.totalAmountPastDue;
            dialogState.isRegularPayment = false;
            dialogState.isPayoffPayment = false;
            dialogState.isPastDuePayment = true;
        }
        
        
 
    }
   return templateAmountData;
}
/**
 * submit Make Payment
 * @param {Request} req
 * @param {Response} res
 */
async function submitPayment(req, res) {
	let httpStatus = 400;
	let response = {error: "Bad Request"};
    try {
        const reqParams = req.allParams();
        sails.log.verbose("submitPayment; reqParams:", JSON.stringify(reqParams));
        const payID = _.get(reqParams, "loanId", null);
        const today = moment().startOf("day").toDate();
        const now = moment().toDate();
        const achCutoff = moment(today).hour(sails.config.paymentService.achCutOffHour || 15).toDate();
        const nextDay = SmoothPaymentService.getBusinessDateBasedOnBankDays( moment(today).add(1, "day").toDate(),true);
        const dateBoundary = moment(today).add(2, "months").toDate();
    
        let paymentAmount = parseFloat(_.get(reqParams, "amount", "0").replace(/[^0-9.]/g, ""));
        const dialogState = (_.get(reqParams, "dialogState", {}));
        dialogState.isRegularPayment = (_.get(dialogState, "isRegularPayment", true) == true);
        dialogState.isPayoffPayment = (_.get(dialogState, "isPayoffPayment", false) == true);
        dialogState.forgiveLateAccruedInterest = (_.get(dialogState, "forgiveLateAccruedInterest", false) == true);
        dialogState.includeAccruedInterest = (_.get(dialogState, "includeAccruedInterest", true) == true);
        dialogState.includeAllInterest = (_.get(dialogState, "includeAllInterest", true) == true);
        dialogState.excludeFees = (_.get(dialogState, "excludeFees", false) == true);
        // let paymentDate = _.get(reqParams, "paymentDate", moment(nextDay).format("MM/DD/YYYY"));
        let paymentDate = moment(today).toDate();
        let selectedPaymentDate = _.get(reqParams, "paymentDate", moment(nextDay).format("MM/DD/YYYY"));
        selectedPaymentDate = moment(selectedPaymentDate, "MM/DD/YYYY").startOf("day").toDate();
        if(selectedPaymentDate < today) selectedPaymentDate = today;
        if(selectedPaymentDate > dateBoundary) selectedPaymentDate = today;
        //if(moment(paymentDate).isSame(moment(today), "day") && (!dialogState.useDebitCard || now > achCutoff) ) paymentDate = nextDay;
        if(moment(selectedPaymentDate).isSame(moment(today), "day") && (!dialogState.useDebitCard || now > achCutoff) ) selectedPaymentDate = nextDay;
    
    
        selectedPaymentDate = SmoothPaymentService.getBusinessDateBasedOnBankDays( moment(selectedPaymentDate).toDate(),true);
        
        let accountId = _.get(reqParams, "accountId", null);
        const isAmendPayment = dialogState.isAmendPayment;
        const amendedData = dialogState.amendData;
        const paymentmanagement = await PaymentManagement.findOne({id: payID}).populate("screentracking").populate("practicemanagement").populate("user");
	
	    if(!paymentmanagement) {
		    httpStatus = 500;
		    response = {
			    errorCode:500,
			    error:`PaymentManagement not found by ID: ${payID}`
		    };
		    return res.status(httpStatus).json(response);
	    }
        const practicemanagement = paymentmanagement.practicemanagement;
        const user = paymentmanagement.user;
        const userCheckingAccounts = await PlatformSpecificService.getUserCheckingAccounts(payID);
	    let verifyAccountId = false;
	    _.some(userCheckingAccounts, (checkingAccount) => {
		    if(checkingAccount.id == accountId) {
			    verifyAccountId = true;
			    return true;
		    }
	    });
	    if(!verifyAccountId) {
		    accountId = paymentmanagement.account;
	    }
	    const ledger = PlatformSpecificService.getPaymentLedger(paymentmanagement, paymentDate);
        const nextActualPayment = ledger.nextActualPayment? moment(ledger.nextActualPayment).startOf("day").toDate(): null;
	    // if(paymentAmount <= 0) {
		//     paymentAmount = ledger.regularPayment;
		//     dialogState.isRegularPayment = true;
		//     dialogState.isPayoffPayment = false;
		//     dialogState.isPastDuePayment = false;
	    // }
        const totalPastDueAmount = $ize(ledger.pastDuePrincipalAmount + ledger.unpaidInterest);
        const totalAmountOwed = $ize(ledger.principalPayoff + ledger.unpaidInterest);
	  
	    // if(paymentAmount >= totalAmountOwed) {
		//     paymentAmount = totalAmountOwed;
		//     dialogState.isRegularPayment = false;
		//     dialogState.isPayoffPayment = true;
		//     dialogState.isPastDuePayment = false;
	    // }
        let previewResult = {}
        let templateData = {};
        if(isAmendPayment) {
            if(!amendedData || amendedData.index === undefined || amendedData.index === null || amendedData.index < 0) {
                httpStatus = 500;
                response = {
                    errorCode:500,
                    error:`Unable to preview this amend payment. The schedule data was not found`
                };
                return res.status(httpStatus).json(response);
            }
            const amendedScheduleIndex = amendedData.index;
            templateData = checkPaymentAmountForPayment({paymentAmount: paymentAmount},ledger,dialogState,paymentmanagement.paymentSchedule[amendedScheduleIndex],totalAmountOwed,true);
            paymentAmount = templateData.paymentAmount;
            if(dialogState.isAmendPayoff) {
                dialogState.isPayoffPayment = true;
            }
            previewResult = await PlatformSpecificService.previewAmendPayment(paymentmanagement, paymentmanagement.paymentSchedule[amendedScheduleIndex], amendedScheduleIndex,
              paymentDate, templateData.paymentAmount, dialogState, req.user, null);
        }else {
            templateData = checkPaymentAmountForPayment({paymentAmount: paymentAmount},ledger,dialogState,null,totalAmountOwed,false);
            paymentAmount = templateData.paymentAmount;
            previewResult = PlatformSpecificService.previewPayment(paymentmanagement, paymentDate, paymentAmount, dialogState, accountId, false);
        }
        if(!accountId) {
            previewResult["error"] = "An account to make a payment from is missing."
            previewResult["errorCode"] = 502
        }
	    if(previewResult.errorCode === 502) {
	    	httpStatus = 500;
		    response = {
			    errorCode: previewResult.errorCode, error: previewResult.error
		    };
		    return res.status(httpStatus).json(response);
	    }
	   
	    _.assign(ledger, previewResult.ledger);
	
	    req.achlog = 1;
	    req.payID = paymentmanagement.id;
	    const scheduleHistory = _.cloneDeep(paymentmanagement);
        //make actual payment
        let newManualPaymentItem = previewResult.newScheduleItem;
        newManualPaymentItem.date = selectedPaymentDate;
        // newManualPaymentItem.status = Payment.STATUS_PENDING;
        let transactionItem = null
        if(isAmendPayment) {
            dialogState.isPrincipalOnlyPayment = false;
            const amendedScheduleItem = _.cloneDeep( newManualPaymentItem);
            amendedScheduleItem.amendAmount = newManualPaymentItem.amount;
            amendedScheduleItem.amendInterest = amendedScheduleItem.interestAmount;
            amendedScheduleItem.amendPrincipal = amendedScheduleItem.principalAmount;
            
            amendedScheduleItem.amount = newManualPaymentItem.amendAmount;
            amendedScheduleItem.interestAmount = newManualPaymentItem.amendInterest;
            amendedScheduleItem.principalAmount = newManualPaymentItem.amendPrincipal;
            
            transactionItem = await Payment.createPaymentActionTransaction( Payment.transactionTypeEnum.AMENDED, amendedScheduleItem, paymentmanagement.id,paymentmanagement.user.id, accountId, dialogState.useDebitCard?Payment.paymentTypeEnum.CARD_DEBIT:Payment.paymentTypeEnum.ACH_DEBIT);
           // if(!dialogState.isAmendPayoff) {
           //     previewResult.newScheduleItemIndex = amendedData.index;
           // }
            previewResult.preview.paymentSchedule[previewResult.newScheduleItemIndex]["transactionId"] = transactionItem.id;
            previewResult.preview.paymentSchedule[previewResult.newScheduleItemIndex]["pmtRef"] = transactionItem.pmtRef;
            paymentmanagement.paymentSchedule = previewResult.preview.paymentSchedule;
            if(dialogState.isAmendPayoff) {
                await Logactivity.registerLogActivity(req, "Make Payment", `&ndash; Amend Payoff Payment of: ${Utils.$format(paymentAmount)} submitted for ${moment(paymentDate).format("MMM. D, YYYY")}. Loan is moved to completed (pending successful transaction).`)
            }else {
                await Logactivity.registerLogActivity(req, "Make Payment", `&ndash; Amend Payment of: ${Utils.$format(paymentAmount)} submitted for ${moment(paymentDate).format("MMM. D, YYYY")}.`)
            }
            // previewResult.ledger = PlatformSpecificService.getPaymentLedger(paymentmanagement, paymentDate);
        }else {
            transactionItem = await Payment.createPaymentActionTransaction( Payment.transactionTypeEnum.PAYMENT, newManualPaymentItem, paymentmanagement.id,paymentmanagement.user.id,accountId, dialogState.useDebitCard?Payment.paymentTypeEnum.CARD_DEBIT:Payment.paymentTypeEnum.ACH_DEBIT);
            previewResult.preview.paymentSchedule[previewResult.newScheduleItemIndex]["transactionId"] = transactionItem.id;
            previewResult.preview.paymentSchedule[previewResult.newScheduleItemIndex]["pmtRef"] = transactionItem.pmtRef;
            if(dialogState.isPrincipalOnlyPayment) {
                paymentmanagement.paymentSchedule = previewResult.preview.paymentSchedule;
                const changeScheduleObj = await AchService.processChangeSchedule(paymentmanagement,ledger.nextActualPayment,true,true, null,paymentmanagement.screentracking.isAfterHoliday);
                previewResult.preview.paymentSchedule = changeScheduleObj.paymentSchedule;
                previewResult.paymentSchedule = changeScheduleObj.paymentSchedule;
                previewResult.preview.nextPaymentSchedule = ledger.nextActualPayment;
                previewResult.ledger = PlatformSpecificService.getPaymentLedger(paymentmanagement, paymentDate);
                // await Screentracking.update({id: paymentmanagement.screentracking.id}, {
                //     signChangeScheduleAuthorization: true
                // });
                await Logactivity.registerLogActivity(req, "Make Payment", `&ndash; Principal Only Payment of: ${Utils.$format(paymentAmount)} submitted for ${moment(paymentDate).format("MMM. D, YYYY")}`)
            }else {
                await Logactivity.registerLogActivity(req, "Make Payment", `&ndash; Payment of: ${Utils.$format(paymentAmount)} submitted for ${moment(paymentDate).format("MMM. D, YYYY")}`)
            }
        }
        let paymentSchedule = previewResult.preview.paymentSchedule;
        //processChangeSchedule
        // paymentSchedule[previewResult.newScheduleItemIndex].date = paymentDate;
        paymentmanagement.paymentSchedule = paymentSchedule;
        paymentmanagement.nextPaymentSchedule = moment(previewResult.preview.nextPaymentSchedule).startOf("day").toDate();
        paymentmanagement.nextManualPaymentDate = moment(previewResult.preview.nextManualPaymentDate).startOf("day").toDate();
        paymentmanagement.scheduleIdSequenceCounter = previewResult.preview.scheduleIdSequenceCounter;

        const paymentUpdateObj = {
            paymentSchedule: paymentmanagement.paymentSchedule,
            nextPaymentSchedule: previewResult.preview.nextPaymentSchedule,
            nextManualPaymentDate: previewResult.preview.nextManualPaymentDate,
            scheduleIdSequenceCounter: paymentmanagement.scheduleIdSequenceCounter
        };
        const finalLedger = PlatformSpecificService.getPaymentLedger(paymentmanagement, moment().startOf("day").toDate());
        if(finalLedger && finalLedger.principalPayoff <=0) {
            paymentUpdateObj["status"] = PaymentManagement.paymentManagementStatus.completed;
            // if(dialogState.isAmendPayoff ) {
            //     paymentUpdateObj.paymentSchedule = await AchService.waiveEntireLoan(paymentmanagement,req.user,true);
            // }
        }
        
       await PaymentManagement.update({id: paymentmanagement.id}, paymentUpdateObj);

	    httpStatus = 200;
        response = { success: true };
        req.session.loadPaymentSheduleTab = true;
        if(isAmendPayment) {
            req.session.successmsg = "Payment amended successfully!";
        }else {
            req.session.successmsg = "Payment submitted successfully!";
        }
        
        delete scheduleHistory.id;
	    delete scheduleHistory.createdAt;
	    delete scheduleHistory.updatedAt;
	    scheduleHistory["madeManualPaymentAt"] = previewResult.newScheduleItem.date;
	    scheduleHistory["madeManualPaymentTransaction"] = previewResult.newScheduleItem.transaction;
	    scheduleHistory["madeManualPaymentAmount"] = previewResult.newScheduleItem.amount;
	    scheduleHistory["paymentManagement"] = paymentmanagement.id;
	    await PaymentScheduleHistory.create(scheduleHistory);
    } catch(exc) {
	    sails.log.error("PaymentController#submitPayment Error: ", exc)
	    httpStatus = 500
	    response = {
		    errorCode:500,
		    error: exc.message
	    }
    }
    return res.status(httpStatus).json(response);
}

function checkIfScheduleItemIsEqual(scheduleItem1, scheduleItem2) {
    if(!scheduleItem1 || !scheduleItem2) {
        return false;
    }
    if((!scheduleItem1.pmtRef || !scheduleItem2.pmtRef)) {
        return scheduleItem1.transaction === scheduleItem2.transaction && scheduleItem1.amount === scheduleItem2.amount && moment(scheduleItem1.date).startOf("day").diff(moment(scheduleItem2.date).startOf("day"), "days") === 0;
    } else {
        return scheduleItem1.pmtRef === scheduleItem2.pmtRef;
    }
}
