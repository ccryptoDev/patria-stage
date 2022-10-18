/* global sails, PaymentManagement */
"use strict";

const _ = require("lodash");
const BasePlatformSpecificService = require("./BasePlatformSpecificService");
const moment = require("moment-timezone");
const fs = require("fs");
const path = require("path");

class PatriaPlatformSpecificService extends BasePlatformSpecificService {
    constructor() {
        super();
        this._instanceClass = "patria";
    }

    getPaymentLedger(paymentManagement, ledgerDate) {
        sails.log.error("calling to get payment ledger in the patria platform");
        ledgerDate = moment(ledgerDate).startOf("day").toDate();
        let today = moment().startOf("day").toDate();
        // const achCutoff = moment.tz( today, "America/New_York" ).hour( 13 ).minute( 30 ).toDate(); // 1:3
        // if(today > achCutoff) {
        //     today =  moment.tz( "America/New_York" ).startOf( "day" ).add( 1, "days" ).toDate()
        // }
        if(!paymentManagement || !paymentManagement.screentracking || ((!paymentManagement.screentracking.offerdata || paymentManagement.screentracking.offerdata.length === 0) && (paymentManagement.status !== "DENIED"))) {
            throw Error("Unable to get payment ledger. Missing contract or offer data.");
        }
        if(paymentManagement.status === "DENIED"){
            return {};
        }
        const loanSetdate = moment(_.get(paymentManagement, "loanSetdate", null)).startOf("day").toDate();
        const noInterestPayoffDate = moment(loanSetdate).startOf("day").add(sails.config.paymentService.waiveInterestMonths || 0, "months").toDate();
        // sails.log.verbose( "getPaymentScheduleLedger; noInterestPayoffDate:", noInterestPayoffDate );
        const loanAmount = $ize(paymentManagement.screentracking.offerdata[0].financedAmount);
        const ledger = {
            paymentId: paymentManagement.id,
            registry: [],
            regularPayment: 0,
            regularFirstFuturePayment: 0,
            payoff: 0,
            principalPayoff: loanAmount,
            noInterestPayoff: loanAmount,
            principalPaid: 0,
            noInterestPaid: 0,
            accruedInterest: 0,
            unpaidInterest: 0,
            unpaidFees: 0,
            canPayoffWithNoInterest: (sails.config.paymentService.waiveInterestMonths > 0 && (ledgerDate < noInterestPayoffDate || moment(ledgerDate).isSame(noInterestPayoffDate, "day"))),
            hasLatePayments: false,
            latestDaysPastDue: 0,
            totalPastDueAmount: 0,
            lastPaidEndingBalance: 0,
            pastDueInterestAmount: 0,
            pastDuePrincipalAmount: 0,
            lateAccruedInterest: 0,
            lastLatePayment: 0,
            numberOfPastDuePayments: 0,
            totalAmountOwned: 0,
            hasFeesToShow: false,
            unpaidLateAccruedInterest: 0,
            totalAccruedInterestPaid: 0,
            totalUnpaidInterestPaid: 0,
            totalUnpaidPrincipalPaid: 0,
            totalPrincipalPaid: 0,
            totalInterestPaid: 0,
            totalAccruedInterest: 0,
            currentAccruedInterest: 0,
            startAccruedDate: null,
            totalAmountPastDue: 0,
            forgivableInterest: 0,
            totalForgivableInterest: 0,
            totalRemainingInterest:  0,
            totalRemainingPrincipal:  0,
            totalChargedAccruedInterest: 0,
            totalAppliedAccruedInterest:  0,
            totalAppliedRemainingInterest:  0,
            totalAppliedRemainingPrincipal:  0,
            totalAppliedScheduledPrincipal:  0,
            latePaymentAmount: 0,
            unpaidScheduledInterest: 0,
            currentRemainingInterest: 0,
            remainingForgivenInterestAmount: 0,
            deferredWithForgiven: 0,
            remainingDeferredAmount: 0,
            paidDeferredAmount: 0,
            currentPeriodInterest: 0,
            deferrableAmount: 0,
            pastDueStartDate: 0,
            totalInterestOwed: 0,
            hasOpenSameDay:false,
            isCurrentEnoughToBeCollectionsFree: true,
            hasScheduleError: false,
            estimatedApr: 0,
            currentTerm: 0,
            term: 0,
            missedPayments: [],
            closestScheduledPaymentToToday: null,
            nextActualPayment: null,
            nextActualScheduleItem: null,
            lastScheduledDate: moment(loanSetdate).startOf("day").toDate(),
            futurePrincipalAmount: 0,
            futureInterestAmount: 0,
            futureAppliedPayments: [],
            totalScheduledInterest: 0,
            firstPastDuePaymentDate: moment(loanSetdate).startOf("day").toDate(),
            totalLeftToPay: 0,
            totalInterestLeftToPay: 0,
            totalPrincipalLeftToPay: 0,
            lastPaymentMade: null,
            projectedFutureLedger: {totalPaidAmount:0,totalInterestPaid:0,totalPrincipalPaid:0 }
        };
        const projectedFutureLedger = _.assign({},ledger);
        ledger.estimatedApr = parseFloat(((paymentManagement.screentracking.offerdata[0].apr || 0) / 100).toFixed(2));
        ledger.term = parseInt((paymentManagement.screentracking.offerdata[0].term || 0).toString());
        let totalScheduledInterest = 0;
        let totalInterestPaid = 0;
        let totalForgivenInterestPaid = 0;
        let remainingForgivenInterestAmount = 0;

        let accrueInterestDate = moment(loanSetdate).toDate();
        let firstPastDuePaymentDate = moment(loanSetdate).toDate();
        let remainingInterestDue = 0;
        let currentPeriodScheduleDate = moment(ledger).toDate();
        let accruedInterestHigh = 0;
        let happyPathPrincipalAmount = 0;
        let totalPrincipalDue = 0;
        let totalScheduleInterestPaid = 0;
        let totalPrincipalAmount = 0;
        
        let isFutureLedgerDate = moment(ledgerDate).startOf("day").isAfter(moment(today).startOf("day"));
        const paymentSchedule = paymentManagement.paymentSchedule;
        if(!paymentSchedule || paymentSchedule.length === 0) {
            ledger.hasScheduleError = true;
            return ledger;
        }
        _.forEach(paymentSchedule, (scheduleItem, index) => {
                if(moment(loanSetdate).startOf("day").isSameOrBefore(moment(today)) && moment(scheduleItem.date).startOf("day").diff(moment(loanSetdate).startOf("day"), "days") < 0 ) {
                    ledger.hasScheduleError = true;
                    return false;
                }
                
            if(!scheduleItem.initiator && scheduleItem.paymentType) {
                scheduleItem.initiator = scheduleItem.paymentType;
            }
            
            if (ledger.regularPayment === 0 && (scheduleItem.initiator === "automatic" || !scheduleItem.initiator)) {   //If the regularPayment is 0 AND (the initiator is automatic OR doesn't exist)
                if(scheduleItem.firstChangedSchedule && ledger.regularFirstFuturePayment === 0) {
                    ledger.regularFirstFuturePayment = scheduleItem.amount;
                }
                ledger.regularPayment = scheduleItem.amount;
            }
            if(!scheduleItem.initiator) {
                ledger.hasScheduleError = true;
                scheduleItem.initiator = "automatic";
            }
            if(scheduleItem.initiator === "automatic") {
                ledger.totalScheduledInterest = $ize(ledger.totalScheduledInterest + scheduleItem.interestAmount);  //add in the interest for this item
            }
            
            if ( moment(scheduleItem.date).startOf("day").isSameOrBefore(ledgerDate, "day")
                    || (moment(scheduleItem.date).startOf("day").isAfter(ledgerDate, "day") &&
                    (scheduleItem.initiator === "makepayment" || scheduleItem.isAmendPayment) )) {
                let gatherProjectedLedger =  (["OPENED", "OPEN"].indexOf(scheduleItem.status) >= 0
                  && moment(scheduleItem.date).startOf("day").isAfter(moment(today).startOf("day"))
                  && (scheduleItem.initiator === "automatic" || scheduleItem.isAmendPayment)
                );
                const lineItem = {
                    date: moment(scheduleItem.date).toDate(),
                    initiator: scheduleItem.initiator,
                    amount: scheduleItem.amount,
                    principalBalance: ledger.principalPayoff,
                    startBalanceAmount: scheduleItem.startBalanceAmount,
                    interestPaid: scheduleItem.interestAmount,
                    unpaidInterest: parseFloat(parseFloat(_.get(scheduleItem, "unpaidInterest", 0)).toFixed(2)),
                    feesAmount: scheduleItem.feesAmount,
                    feesPaid: 0,
                    principalPaid: 0,
                    status: scheduleItem.status,
                    daysPastDue: 0,
                    isUpToCurrent: true,
                    endBalanceAfterPayment: 0,
                    cumulativeInterestPaid: 0,
                    cumulativePrincipalPaid: 0,
                    cumulativeTotalPaid: 0,
                    totalAmountOwned: 0,
                    startAccruedDate: moment(scheduleItem.date).startOf("day"),
                    endAccruedDate: moment(scheduleItem.endAccruedDate),
                    accruedPrincipal: scheduleItem.accruedPrincipal,
                    periodAccruedInterest: scheduleItem.periodAccruedInterest,
                    forgivableInterest: scheduleItem.forgivableInterest,
                    remainingInterest: scheduleItem.remainingInterest,
                    remainingPrincipal: scheduleItem.remainingPrincipal,
                    chargedAccruedInterest: scheduleItem.chargedAccruedInterest,
                    forgivenInterest: scheduleItem.forgivenInterest || 0,
                    appliedAccruedInterest: scheduleItem.appliedAccruedInterest,
                    appliedRemainingInterest: scheduleItem.appliedRemainingInterest,
                    appliedRemainingPrincipal: scheduleItem.appliedRemainingPrincipal,
                    appliedScheduledPrincipal: scheduleItem.appliedScheduledPrincipal,
                    appliedForgivenInterest: scheduleItem.appliedForgivenInterest || 0,
                    balloonScheduledInterest: scheduleItem.balloonScheduledInterest || 0,
                    deferredAmount: scheduleItem.deferredAmount || 0,
                    appliedDeferredAmount: scheduleItem.appliedDeferredAmount || 0,
                };
                if(scheduleItem.initiator === "automatic" || scheduleItem.isAmendPayment) {
                    ledger.currentTerm = ledger.chargedAccruedInterestAmount +1;
                }
                const startBalanceAmount = parseFloat((ledger.principalPayoff).toFixed(2));
                const noInterestPayoff = parseFloat((ledger.noInterestPayoff).toFixed(2));
                // TODO: late payments
                accrueInterestDate = moment(scheduleItem.date).toDate();
                let payment = parseFloat(scheduleItem.amount);
                lineItem.endBalanceAfterPayment = scheduleItem.endBalanceAfterPayment;

                // apply payment to accrued interest
                lineItem.interestPaid = scheduleItem.interestAmount;
                // apply remainder to principal balance
                lineItem.principalPaid = scheduleItem.principalAmount;

                if(scheduleItem.initiator === "makepayment" && ["LATE", "DECLINED", "RETURNED"].indexOf(scheduleItem.status) >= 0) {
                    ledger.remainingDeferredAmount =  lineItem.deferredAmount;
                    return;
                }
                    remainingForgivenInterestAmount = parseFloat((remainingForgivenInterestAmount + lineItem.forgivenInterest + lineItem.forgivableInterest).toFixed(2));
                    happyPathPrincipalAmount = parseFloat((startBalanceAmount-scheduleItem.principalAmount).toFixed(2));

                    if(scheduleItem.initiator !== "makepayment") {
                            totalPrincipalDue = $ize(totalPrincipalDue + (scheduleItem.amount - scheduleItem.principalAmount));
                    }

                // Create array of missedPayments
                totalPrincipalAmount = parseFloat((totalPrincipalAmount +  scheduleItem.principalAmount).toFixed(2));
                if(scheduleItem.initiator === "automatic"                                                                                    //ACH processing AND
                    && moment(scheduleItem.date).startOf("day").isSameOrBefore(moment(ledgerDate).startOf("day"))       //Scheduled Date was before the ledger was created (i.e. past) AND
                    && moment(scheduleItem.date).startOf("day").isSameOrBefore(moment(today).startOf("day"))            //Scheduled Date is past
                ) {
                    let numberOfDaysPastDue =  moment( ledgerDate ).startOf( "day" ).diff(moment( scheduleItem.date ).startOf( "day" ), "days" ) ;  //DPD = difference between the ledger date and the scheduled date
                    if(numberOfDaysPastDue < 0) {
                        numberOfDaysPastDue = 0;
                    }
                    ledger.missedPayments.push( {
                        scheduledAmount: scheduleItem.amount,
                        pmtRef: scheduleItem.pmtRef,
                        appliedPastDueAmount: 0,
                        hasPaidOff: false,
                        amountRemaining: scheduleItem.amount,
                        indexOfScheduleItem: index,
                        scheduleItem: _.cloneDeep(scheduleItem),
                        numberOfDaysPastDue: numberOfDaysPastDue,
                        accruedInterestLeft:scheduleItem.interestAmount,
                        principalLeft: scheduleItem.principalAmount
                    } );
                }
                
                if (["OPENED", "OPEN", "LATE", "DECLINED", "RETURNED"].indexOf(scheduleItem.status) >= 0
                        && scheduleItem.initiator === "automatic"  && !gatherProjectedLedger) {// || ["LATE", "DECLINED", "RETURNED"].indexOf(scheduleItem.status) >= 0)  ) {
    
                    ledger.closestScheduledPaymentToToday = moment(scheduleItem.date).startOf("day").toDate();
                    
                    const lateAccruedInterestStartDate = moment(firstPastDuePaymentDate || loanSetdate).startOf("day");
                    let lastPayAccruedInterest = 0;
                    if (!paymentManagement.isInLoanModification) {
                        lastPayAccruedInterest = parseFloat(((ledger.principalPayoff * ledger.estimatedApr / 365 * moment(scheduleItem.date).startOf("day")
                            .diff(lateAccruedInterestStartDate, "days"))).toFixed(2));
                        // sails.log.error("====================days past due accrue: " + moment(scheduleItem.date).startOf("day").diff(lateAccruedInterestStartDate, "days"));
                    }
                    if(firstPastDuePaymentDate) {
                        const firstPastDuePaymentDays = moment(scheduleItem.date).startOf("day").diff(moment(firstPastDuePaymentDate).startOf("day"),"days");
                        accruedInterestHigh = parseFloat((  (ledger.principalPayoff * ledger.estimatedApr  / 365 * firstPastDuePaymentDays)).toFixed(2));
                    }
                    
                    if( moment(scheduleItem.date).startOf("day").isSameOrBefore(moment().startOf("day"))) {
                        ledger.lastScheduledDate = moment(scheduleItem.date).startOf("day").toDate();
                    }
                    ledger.hasLatePayments = true;
                    ledger.latePaymentAmount = $ize(ledger.latePaymentAmount + scheduleItem.amount);
                    ledger.numberOfPastDuePayments = ledger.numberOfPastDuePayments + 1;
                    lineItem.isPastDue = true;
                    lineItem.daysPastDue = moment(scheduleItem.date).diff(moment(lateAccruedInterestStartDate), "days");


                    ledger.totalPastDueAmount = $ize(ledger.totalPastDueAmount + scheduleItem.amount);
                    ledger.lastLatePayment = lineItem;
                    // totalPastDueAmount += parseFloat((currentPeriodInterest + totalPastDuePrincipalAmount).toFixed(2));
                }
                if ((["PAID", "PENDING", "WAIVED"].indexOf(scheduleItem.status) >= 0
                  || gatherProjectedLedger
                  || (scheduleItem.initiator === "makepayment") && ["LATE", "DECLINED", "RETURNED"].indexOf(scheduleItem.status) < 0)
                  //   ||(moment(ledgerDate).startOf("day").isAfter(moment(today).startOf("day"))
                  //   && ["OPENED", "OPEN"].indexOf(scheduleItem.status) >= 0
                  //   && moment(scheduleItem.date).startOf("day").isSameOrBefore(moment(ledgerDate).startOf("day"))
                  // )
                ) {

                    if(gatherProjectedLedger){
                        const totalFuturePaid = ledger.projectedFutureLedger["totalPaidAmount"] || 0;
                        ledger.projectedFutureLedger["totalPaidAmount"] = $ize(totalFuturePaid + scheduleItem.amount);
                        const totalFutureInterestPaid = ledger.projectedFutureLedger.totalInterestPaid || 0;
                        ledger.projectedFutureLedger["totalInterestPaid"] = $ize(totalFutureInterestPaid + scheduleItem.interestAmount);
                        const totalFuturePrincipalPaid = ledger.projectedFutureLedger["totalPrincipalPaid"] || 0;
                        ledger.projectedFutureLedger["totalPrincipalPaid"] = parseFloat((totalFuturePrincipalPaid +  scheduleItem.principalAmount).toFixed(2));
                    }
                    ledger.paidDeferredAmount = parseFloat((ledger.paidDeferredAmount + lineItem.appliedDeferredAmount).toFixed(2));
                    ledger.remainingDeferredAmount =  lineItem.deferredAmount;
                    firstPastDuePaymentDate = moment(scheduleItem.date).toDate();
                    ledger.lastPaymentMade = moment(firstPastDuePaymentDate).startOf("day").toDate();
                    remainingInterestDue = lineItem.remainingInterest;
                    ledger.totalAccruedInterestPaid = parseFloat((ledger.totalAccruedInterestPaid + lineItem.appliedAccruedInterest).toFixed(2));
                    ledger.totalUnpaidInterestPaid = parseFloat((ledger.totalUnpaidInterestPaid + lineItem.appliedRemainingInterest).toFixed(2));
                    ledger.totalUnpaidPrincipalPaid = parseFloat((ledger.totalUnpaidPrincipalPaid + lineItem.appliedRemainingPrincipal).toFixed(2));
                    totalScheduleInterestPaid = parseFloat(((totalScheduleInterestPaid + scheduleItem.appliedAccruedInterest + scheduleItem.appliedRemainingInterest) ).toFixed(2));
                    totalInterestPaid = parseFloat((totalInterestPaid + scheduleItem.interestAmount).toFixed(2));
                    ledger.principalPayoff = parseFloat((ledger.principalPayoff - scheduleItem.principalAmount).toFixed(2));

                    remainingForgivenInterestAmount = parseFloat((remainingForgivenInterestAmount - lineItem.appliedForgivenInterest).toFixed(2));

                    const totalPaid = ledger["totalPaidAmount"] || 0;
                    ledger["totalPaidAmount"] = $ize(totalPaid + scheduleItem.amount);
                    ledger["totalInterestPaid"] = totalInterestPaid;
                    const totalPrincipalPaid = ledger["totalPrincipalPaid"] || 0;
                    ledger["totalPrincipalPaid"] = parseFloat((totalPrincipalPaid +  scheduleItem.principalAmount).toFixed(2));

                    ledger.totalAppliedAccruedInterest =  lineItem.appliedAccruedInterest;
                    ledger.totalAppliedRemainingInterest =  lineItem.appliedRemainingInterest;
                    ledger.totalAppliedRemainingPrincipal =  lineItem.appliedRemainingPrincipal;
                    ledger.totalAppliedScheduledPrincipal =  lineItem.appliedScheduledPrincipal;
                }
                // sails.log.verbose("getPaymentLedger;", [moment(scheduleItem.date).format("MM/DD/YYYY"), noInterestPayoff, "", scheduleItem.amount, ledger.noInterestPayoff, "", startBalanceAmount, scheduleItem.principalAmount, ledger.principalPayoff, "", lineItem.accruedInterest, scheduleItem.interestAmount, lineItem.unpaidInterest].join("\t"));
                if(["OPENED", "OPEN", "LATE", "DECLINED", "RETURNED"].indexOf(scheduleItem.status) >= 0 &&  moment(scheduleItem.date).startOf("day").isAfter(moment(today).startOf("day")) && scheduleItem.initiator === "automatic") {
                    ledger.futureAppliedPayments.push({
                        scheduleItem: scheduleItem,
                        scheduleIndex: index,
                        appliedInterestAmount: 0,
                        appliedPrincipalAmount: 0,
                        principalRemaining: 0,
                        interestRemaining: 0
                    });
                }
                currentPeriodScheduleDate = moment(scheduleItem.date).toDate();
            }else if(scheduleItem.initiator === "automatic") {
                if(!ledger.nextActualPayment) {
                    ledger.nextActualPayment = moment(scheduleItem.date).startOf("day").toDate();
                }

               if(["PAID", "PENDING", "WAIVED"].indexOf(scheduleItem.status) >= 0
                 // || (moment(ledgerDate).startOf("day").isAfter(moment(today).startOf("day"))
                 // && ["OPENED", "OPEN"].indexOf(scheduleItem.status) >= 0
                 // && moment(scheduleItem.date).startOf("day").isSameOrBefore(moment(ledgerDate).startOf("day"))
                 // )
               ) {
                   const totalPaid = ledger["totalPaidAmount"] || 0;
                   ledger["totalPaidAmount"] = $ize(totalPaid + scheduleItem.amount);
                   const totalInterestFuturePaid = ledger.totalInterestPaid || 0;
                   ledger["totalInterestPaid"] = $ize(totalInterestFuturePaid + scheduleItem.interestAmount);
                   const totalPrincipalFuturePaid = ledger["totalPrincipalPaid"] || 0;
                   ledger["totalPrincipalPaid"] = parseFloat((totalPrincipalFuturePaid + scheduleItem.principalAmount).toFixed(2));
                   ledger.principalPayoff = $ize(ledger.principalPayoff - scheduleItem.principalAmount);
               }
               // if(["OPENED", "OPEN"].indexOf(scheduleItem.status) >= 0 && moment(ledgerDate).startOf("day").isAfter(moment(today).startOf("day"))) {
               //     const totalPaid = ledger["totalPaidAmount"] || 0;
               //     ledger["totalPaidAmount"] = $ize(totalPaid + (scheduleItem.isAmendPayment?scheduleItem.waivedAmount:scheduleItem.amount));
               //     const totalInterestFuturePaid = ledger.totalInterestPaid || 0;
               //     ledger["totalInterestPaid"] = $ize(totalInterestFuturePaid + (scheduleItem.isAmendPayment?scheduleItem.waivedInterest:scheduleItem.interestAmount));
               //     const totalPrincipalFuturePaid = ledger["totalPrincipalPaid"] || 0;
               //     ledger["totalPrincipalPaid"] = parseFloat((totalPrincipalFuturePaid +  (scheduleItem.isAmendPayment?scheduleItem.waivedPrincipal:scheduleItem.principalAmount)).toFixed(2));
               //     ledger.principalPayoff = $ize(ledger.principalPayoff - (scheduleItem.isAmendPayment?scheduleItem.waivedPrincipal:scheduleItem.principalAmount));
               // }
               
               if(["OPENED", "OPEN", "LATE", "DECLINED", "RETURNED"].indexOf(scheduleItem.status) >= 0) {
                   ledger.futureAppliedPayments.push({
                       scheduleItem: scheduleItem,
                       scheduleIndex: index,
                       appliedInterestAmount: 0,
                       appliedPrincipalAmount: 0,
                       principalRemaining: 0,
                       interestRemaining: 0
                   });
               }
            }
             ledger.payoff = ledger.principalPayoff;
        });
        ledger.firstPastDuePaymentDate = firstPastDuePaymentDate;
        
        //
        // let afterTotalAppliedPastDue = $ize((ledger.totalPaidAmount || 0) - (ledger.totalPaidAmount >= ledger.projectedFutureLedger.totalPaidAmount?ledger.projectedFutureLedger.totalPaidAmount:0)); // ledger.totalManualPaymentPrincipalPaid + ledger.totalManualPaymentInterestPaid + ledger.totalManualPaymentFeesPaid;
        // let interestTallyPaid =  $ize((ledger.totalInterestPaid || 0) - (ledger.totalInterestPaid >= ledger.projectedFutureLedger.totalInterestPaid?ledger.projectedFutureLedger.totalInterestPaid:0));
        // let principalTallyPaid = $ize((ledger.totalPrincipalPaid || 0) - (ledger.totalPrincipalPaid >= ledger.projectedFutureLedger.totalPrincipalPaid?ledger.projectedFutureLedger.totalPrincipalPaid:0));
        //
        let afterTotalAppliedPastDue = ledger.totalPaidAmount || 0; // ledger.totalManualPaymentPrincipalPaid + ledger.totalManualPaymentInterestPaid + ledger.totalManualPaymentFeesPaid;
        let interestTallyPaid =  ledger.totalInterestPaid || 0;
        let principalTallyPaid = ledger.totalPrincipalPaid || 0;
        // let totalAutomaticInterestAmounts = 0;
        
        let unpaidInterest = 0;
        let unpaidPrincipal = 0;
        
        const afterAppliedMissedPayments = [];
        if( ledger.missedPayments && ledger.missedPayments.length > 0 ) {
            ledger.missedPayments = _.orderBy( ledger.missedPayments, "numberOfDaysPastDue", [ "desc" ] );
        }
        let firstItem = false;
        _.forEach( ledger.missedPayments, ( missedPayment ) => {
    
            // const appliedInterest = Math.min(afterTotalAppliedPastDue, missedPayment.scheduleItem.interestAmount);
            // missedPayment.accruedInterestLeft = parseFloat((missedPayment.scheduleItem.interestAmount - appliedInterest).toFixed(2));
            // afterTotalAppliedPastDue = parseFloat((afterTotalAppliedPastDue - appliedInterest).toFixed(2));
            //
            // const appliedPrincipal = Math.min(afterTotalAppliedPastDue, missedPayment.scheduleItem.principalAmount);
            // missedPayment.principalLeft = parseFloat((missedPayment.scheduleItem.principalAmount - appliedPrincipal).toFixed(2));
            // afterTotalAppliedPastDue = parseFloat((afterTotalAppliedPastDue - appliedPrincipal).toFixed(2));
            let interestAmountOwed = missedPayment.scheduleItem.interestAmount;
            let principalAmountOwed = missedPayment.scheduleItem.principalAmount;
            // if(missedPayment.scheduleItem.isAmendPayment) {
            //     interestAmountOwed = missedPayment.scheduleItem.waivedInterest;
            //     principalAmountOwed = missedPayment.scheduleItem.waivedPrincipal;
            // }



            const appliedInterest = Math.min(afterTotalAppliedPastDue, interestAmountOwed);
            missedPayment.accruedInterestLeft = parseFloat((interestAmountOwed - appliedInterest).toFixed(2));
            afterTotalAppliedPastDue = parseFloat((afterTotalAppliedPastDue - appliedInterest).toFixed(2));

            const appliedPrincipal = Math.min(afterTotalAppliedPastDue, principalAmountOwed);
            missedPayment.principalLeft = parseFloat((principalAmountOwed - appliedPrincipal).toFixed(2));
            afterTotalAppliedPastDue = parseFloat((afterTotalAppliedPastDue - appliedPrincipal).toFixed(2));

    
            missedPayment.appliedPastDueAmount = $ize(appliedInterest+appliedPrincipal);
            // afterTotalAppliedPastDue = $ize(afterTotalAppliedPastDue - missedPayment.appliedPastDueAmount);
            missedPayment.amountRemaining = $ize ( missedPayment.accruedInterestLeft + missedPayment.principalLeft );
            
            if( missedPayment.amountRemaining > 0 && moment(missedPayment.scheduleItem.date).startOf("day").isSameOrBefore(moment(ledgerDate).startOf("day"))) {
                // totalAutomaticInterestAmounts = parseFloat((totalAutomaticInterestAmounts + missedPayment.scheduleItem.interestAmount).toFixed(2));
                unpaidInterest = $ize(unpaidInterest + missedPayment.accruedInterestLeft);
                unpaidPrincipal = $ize(unpaidPrincipal + missedPayment.principalLeft);
                
                    if(!firstItem && !missedPayment.scheduleItem.isAmendPayment) {
                        firstItem = true;
                        missedPayment["eligibleForPaymentActions"] = true;
                    }
                ledger.totalLeftToPay = $ize(ledger.totalLeftToPay +  missedPayment.amountRemaining);
                ledger.totalInterestLeftToPay = $ize(ledger.totalInterestLeftToPay + missedPayment.accruedInterestLeft);
                ledger.totalPrincipalLeftToPay = $ize(ledger.totalPrincipalLeftToPay + missedPayment.principalLeft);
                    afterAppliedMissedPayments.push(missedPayment);
            }
        } );
        ledger.pastDuePrincipalAmount = unpaidPrincipal;
        ledger.unpaidInterest = unpaidInterest;
        ledger.missedPayments = afterAppliedMissedPayments;
        
        if(afterTotalAppliedPastDue < 0) {
            afterTotalAppliedPastDue = 0;
        }
         // afterTotalAppliedPastDue = $ize(afterTotalAppliedPastDue + (ledger.projectedFutureLedger.totalPaidAmount > 0?ledger.projectedFutureLedger.totalPaidAmount:0)); // ledger.totalManualPaymentPrincipalPaid + ledger.totalManualPaymentInterestPaid + ledger.totalManualPaymentFeesPaid;
         // interestTallyPaid =  $ize(interestTallyPaid + (ledger.projectedFutureLedger.totalInterestPaid > 0?ledger.projectedFutureLedger.totalInterestPaid:0));
         // principalTallyPaid = $ize(principalTallyPaid + (ledger.projectedFutureLedger.totalPrincipalPaid > 0?ledger.projectedFutureLedger.totalPrincipalPaid:0));
            const futureAppliedPaymentsTemp = [];
            _.forEach(ledger.futureAppliedPayments, (appliedPayments) => {
    
                // const appliedFutureInterest = Math.min(afterTotalAppliedPastDue, appliedPayments.scheduleItem.interestAmount);
                // const accruedFutureInterestLeft = $ize(appliedPayments.scheduleItem.interestAmount - appliedFutureInterest);
                // afterTotalAppliedPastDue = $ize(afterTotalAppliedPastDue - appliedFutureInterest);
                //
                // const appliedPrincipal = Math.min(afterTotalAppliedPastDue, appliedPayments.scheduleItem.principalAmount);
                // const futurePrincipalLeft = parseFloat((appliedPayments.scheduleItem.principalAmount - appliedPrincipal).toFixed(2));
                // afterTotalAppliedPastDue = parseFloat((afterTotalAppliedPastDue - appliedPrincipal).toFixed(2));
    
                const appliedFutureInterest = Math.min(afterTotalAppliedPastDue, appliedPayments.scheduleItem.interestAmount);
                const accruedFutureInterestLeft = $ize(appliedPayments.scheduleItem.interestAmount - appliedFutureInterest);
                afterTotalAppliedPastDue = $ize(afterTotalAppliedPastDue - appliedFutureInterest);

                const appliedPrincipal = Math.min(afterTotalAppliedPastDue, appliedPayments.scheduleItem.principalAmount);
                const futurePrincipalLeft = parseFloat((appliedPayments.scheduleItem.principalAmount - appliedPrincipal).toFixed(2));
                afterTotalAppliedPastDue = parseFloat((afterTotalAppliedPastDue - appliedPrincipal).toFixed(2));
    
                //afterTotalAppliedPastDue = $ize(afterTotalAppliedPastDue - appliedFutureInterest - appliedPrincipal);
    
                const futureAmountRemaining = $ize ( accruedFutureInterestLeft + futurePrincipalLeft );
                if(futureAmountRemaining > 0) {
                    ledger.totalLeftToPay = $ize(ledger.totalLeftToPay + futureAmountRemaining);
                    ledger.totalInterestLeftToPay = $ize(ledger.totalInterestLeftToPay + accruedFutureInterestLeft);
                    ledger.totalPrincipalLeftToPay = $ize(ledger.totalPrincipalLeftToPay + futurePrincipalLeft);
                    futureAppliedPaymentsTemp.push({
                        scheduleItem: appliedPayments.scheduleItem,
                        scheduleIndex: appliedPayments.scheduleIndex,
                        appliedInterestAmount: appliedFutureInterest,
                        appliedPrincipalAmount: appliedPrincipal,
                        principalRemaining: futurePrincipalLeft,
                        interestRemaining: accruedFutureInterestLeft
                    })
                }
            });
            ledger.futureAppliedPayments = futureAppliedPaymentsTemp;
            
            if(ledger.futureAppliedPayments.length > 0 && ledger.missedPayments.length === 0 && ledger.unpaidInterest === 0 && ledger.pastDuePrincipalAmount === 0) {
                const firstFuturePayment = ledger.futureAppliedPayments[0];
                // {
                //     scheduleItem: appliedPayments,
                //             appliedInterestAmount: appliedFutureInterest,
                //         appliedPrincipalAmount: appliedPrincipal,
                //         principalRemaining: futurePrincipalLeft,
                //         interestRemaining: accruedFutureInterestLeft
                // }
                ledger.unpaidInterest = firstFuturePayment.scheduleItem.interestAmount;
                ledger.pastDuePrincipalAmount = firstFuturePayment.scheduleItem.principalAmount;
                ledger.nextActualScheduleItem = firstFuturePayment.scheduleItem;
                ledger.nextActualPayment = moment(ledger.nextActualScheduleItem.date).startOf("day").toDate();
                ledger.regularPayment = $ize(ledger.pastDuePrincipalAmount + ledger.unpaidInterest);
                ledger["isFuturePayment"] = true;
            }
        
            // ledger.unpaidScheduledInterest = parseFloat((totalScheduledInterest - totalScheduleInterestPaid - remainingInterestDue ).toFixed(2));

            // ledger.lateAccruedInterest = parseFloat((ledger.lateAccruedInterest + lastPayAccruedInterest).toFixed(2));
       // ledger.pastDuePrincipalAmount = parseFloat((totalPrincipalDue - ledger.totalPrincipalPaid).toFixed(2));

        ledger.startAccruedDate = moment(currentPeriodScheduleDate).startOf("day").toDate();
        //bigger
        const startAccruedDays =  moment(ledgerDate).diff(moment(ledger.startAccruedDate), "days");
        const startLateAccrued =  moment(ledgerDate).diff(moment(firstPastDuePaymentDate), "days");
        ledger.pastDueStartDate = firstPastDuePaymentDate;
        
       //  ledger.accruedInterest = parseFloat((ledger.principalPayoff * ledger.estimatedApr  / 365 * startLateAccrued ).toFixed(2));
       //  ledger.currentPeriodInterest = parseFloat((happyPathPrincipalAmount * ledger.estimatedApr  / 365 * startAccruedDays ).toFixed(2));
       //
       //  if(ledger.accruedInterest  > ledger.unpaidScheduledInterest && ledger.unpaidScheduledInterest > 0) {
       //      ledger.lateAccruedInterest = parseFloat((ledger.accruedInterest - ledger.unpaidScheduledInterest).toFixed(2));
       //  }
       //      // ledger.lateAccruedInterest = parseFloat((ledger.accruedInterest - ledger.calcScheduleInterest).toFixed(2));
       //  if(ledger.lateAccruedInterest > ledger.currentPeriodInterest) {
       //      ledger.forgivableInterest = parseFloat((ledger.lateAccruedInterest - ledger.currentPeriodInterest).toFixed(2));
       //  }
       //      remainingForgivenInterestAmount = parseFloat((remainingForgivenInterestAmount).toFixed(2));
       //  ledger.remainingDeferredAmount = parseFloat((ledger.remainingDeferredAmount - ledger.paidDeferredAmount).toFixed(2));
       //  ledger.deferrableAmount = ledger.currentPeriodInterest;
       //
       //
       // ledger.deferredWithForgiven = parseFloat((remainingForgivenInterestAmount + ledger.remainingDeferredAmount ).toFixed(2));
        //ledger.totalChargedAccruedInterest = ledger.accruedInterest;
        ledger.totalChargedAccruedInterest = 0;


        ledger.currentRemainingInterest = remainingInterestDue;
        ledger.totalRemainingInterest = parseFloat((ledger.totalChargedAccruedInterest).toFixed(2));
        ledger.remainingForgivenInterestAmount = remainingForgivenInterestAmount ;
       // ledger.unpaidInterest = parseFloat((remainingInterestDue || 0 ).toFixed(2));
        ledger.totalRemainingPrincipal =  ledger.pastDuePrincipalAmount;
        //ledger.totalInterestOwed = parseFloat((ledger.totalChargedAccruedInterest + ledger.unpaidInterest + ledger.remainingDeferredAmount + ledger.remainingForgivenInterestAmount ).toFixed(2));
        ledger.totalInterestOwed = ledger.unpaidInterest;
        ledger.totalAmountPastDue =  parseFloat((ledger.pastDuePrincipalAmount + ledger.unpaidInterest ).toFixed(2));
        ledger.currentAccruedInterest = parseFloat(( ledger.totalChargedAccruedInterest).toFixed(2));

        // ledger.totalPastDueAmount = ledger.totalAmountPastDue;
        // ledger.totalAmountOwned = parseFloat((ledger.principalPayoff +  ledger.totalChargedAccruedInterest + ledger.unpaidInterest +  ledger.remainingDeferredAmount + ledger.remainingForgivenInterestAmount).toFixed(2));
        ledger.totalAmountOwned = parseFloat((ledger.principalPayoff + ledger.unpaidInterest).toFixed(2));
        ledger.isUpToCurrent = ( ledger.pastDuePrincipalAmount === 0 && ledger.unpaidInterest === 0 );
        ledger.isCurrentEnoughToBeCollectionsFree = !ledger.missedPayments || ledger.missedPayments.length === 0;
        return ledger;
    }
    previewPayment(self, paymentDate, paymentAmount, dialogState, accountId = null, amendData = null) {
        paymentDate = moment(paymentDate).startOf("day").toDate();
        const today = moment().tz( "America/Los_Angeles" ).startOf("day").toDate();
        const loanSetdate = moment(_.get(self, "loanSetdate", null)).startOf("day").toDate();
        const noInterestPayoffDate = moment(loanSetdate).startOf("day").add(sails.config.paymentService.waiveInterestMonths, "months").toDate();
        sails.log.verbose("previewPayment; noInterestPayoffDate:", noInterestPayoffDate);
        let paymentSchedule =  self.paymentSchedule;
        let ledger = this.getPaymentLedger(self, paymentDate);
        const isAmendedPayment = dialogState.isAmendPayment && amendData;
        // if(isAmendedPayment) {
        //     self.paymentSchedule = AchService.getAmendManualPaymentData(self,ledger,paymentSchedule[dialogState.amendData.index], dialogState.amendData.index, null);
        //     if(!self.paymentSchedule  || self.paymentSchedule .length === 0) {
        //         throw new Error("Unable to make the amended payment due to the schedule payment being amended is not found.")
        //     }
        //     ledger = this.getPaymentLedger(self, paymentDate);
        //     paymentSchedule = self.paymentSchedule;
        //
        // }
        
        // let correctStartOfBalance = paymentSchedule[0].startBalanceAmount;
        // _.forEach(paymentSchedule, (item) => {
        //
        //     const correctPrincipal = parseFloat((item.amount - item.interestAmount).toFixed(2));
        //     const correctEndBalance =  parseFloat((item.startBalanceAmount - correctPrincipal).toFixed(2));
        //
        //     if(correctPrincipal !== item.principalAmount) {
        //         sails.log.error("Principal on item " + correctPrincipal + " does not equal correct principal " + item.principalAmount);
        //     }
        //
        //     if(item.startBalanceAmount !== correctStartOfBalance) {
        //         sails.log.error("StartBalance " + item.startBalanceAmount + " does not equal correct StartBalance " + correctStartOfBalance);
        //     }
        //     if(item.endBalanceAfterPayment !== correctEndBalance) {
        //         sails.log.error("EndBalance " + item.endBalanceAfterPayment + " does not equal correct EndBalance " + correctEndBalance);
        //     }
        //     correctStartOfBalance = correctEndBalance;
        // });

        let currentInterest = 0;
        let currentForgivableInterest = 0;
        let currentForgivenInterest = 0;
        let chargedAccruedInterestAmount = 0;
        let remainingPastDuePrincipal = 0;
        let deferredAmount = parseFloat((ledger.remainingForgivenInterestAmount ).toFixed(2));
        const preview = {
            unpaidInterest: ledger.unpaidInterest,
            unpaidPrincipal: 0,
            interestPayment: 0,
            feesPayment: 0,
            principalPayment: paymentAmount,
            principalBalance: 0,
            interestSavings: 0,
            paymentSchedule: [],
            accruedInterest: 0,
            normalPaymentAmount: 0,
            nextPaymentSchedule: moment(ledger.nextActualPayment).startOf("day").toDate(),
            nextManualPaymentDate: moment(paymentDate).startOf("day").toDate(),
            unpaidInterestPayment: 0,
            scheduleIdSequenceCounter: self.scheduleIdSequenceCounter,
            amend: {
                amendCurrentInterest: 0,
                amendAppliedInterest: 0,
                amendLeftOverInterest: 0,
                amendCurrentPrincipal: 0,
                amendAppliedPrincipal:0,
                amendLeftOverPrincipal: 0,
                amendPaymentAmount: paymentAmount,
                amendCurrentPaymentAmount: 0,
            },
            previewChanges: {
                unpaidInterest: 0,
                lateAccruedInterest: 0,
                pastDuePrincipalAmount: 0,
                feesPayment: 0,
                scheduledPrincipal: 0,
                accruedInterest: 0,
                currentRemainingInterest:0,
                appliedForgivenInterest:0,
                deferredAmount: 0
            }
        };
        // if (preview.nextPaymentSchedule > paymentDate) {
        //     preview.nextPaymentSchedule = paymentDate;
        // }
        ledger.payoff = parseFloat((ledger.principalPayoff).toFixed(2));
        currentForgivableInterest = parseFloat((ledger.forgivableInterest ).toFixed(2));
        chargedAccruedInterestAmount = ledger.accruedInterest + ledger.remainingDeferredAmount + ledger.remainingForgivenInterestAmount;
        currentInterest = parseFloat(( ledger.unpaidInterest +chargedAccruedInterestAmount  ).toFixed(2));
        preview["totalChargedAccruedInterest"] = chargedAccruedInterestAmount;
        ledger.totalChargedAccruedInterest = chargedAccruedInterestAmount;
        ledger.totalPastDueAmount = parseFloat((ledger.pastDuePrincipalAmount + currentInterest).toFixed(2));
        ledger.totalAmountOwned = parseFloat((ledger.payoff + currentInterest).toFixed(2));
     
        // if(isAmendedPayment) {
        //     const scheduleItem = paymentSchedule[dialogState.amendData.index];
        //     if(scheduleItem) {
        //         preview.amend.amendCurrentInterest = scheduleItem.interestAmount;
        //         preview.amend.amendCurrentPrincipal = scheduleItem.principalAmount;
        //         preview.amend.amendAppliedPrincipal = scheduleItem.amendPrincipal;
        //         preview.amend.amendAppliedInterest = scheduleItem.amendInterest;
        //         preview.amend.amendLeftOverPrincipal = $ize(preview.amend.amendCurrentPrincipal - preview.amend.amendAppliedPrincipal);
        //         preview.amend.amendLeftOverInterest = $ize(preview.amend.amendCurrentInterest - preview.amend.amendAppliedInterest);
        //         preview.amend.amendCurrentPaymentAmount = scheduleItem.amount;
        //          paymentAmount = scheduleItem.amount;
        //         if($ize(ledger.principalPayoff - preview.amend.amendAppliedPrincipal) <= 0) {
        //             dialogState.isPayoffPayment = true;
        //             ledger.accruedInterest = preview.amend.amendAppliedInterest;
        //             ledger.remainingDeferredAmount = 0;
        //             ledger.remainingForgivenInterestAmount = 0;
        //             ledger.unpaidInterest = 0;
        //             ledger.pastDuePrincipalAmount = 0;
        //             currentInterest = preview.amend.amendAppliedInterest;
        //         }
        //     }
        // }
        if (dialogState.isPayoffPayment || dialogState.isAmendPayoff) {
            if(currentInterest > 0) {
                preview.interestPayment = parseFloat(( ledger.unpaidInterest).toFixed(2));
                preview.principalPayment = parseFloat((ledger.principalPayoff).toFixed(2));
                preview.previewChanges.unpaidInterest = ledger.unpaidInterest;
                // preview.previewChanges.accruedInterest = ledger.accruedInterest;// parseFloat((ledger.accruedInterest - currentForgivenInterest).toFixed(2));
                // preview.previewChanges.lateAccruedInterest = ledger.lateAccruedInterest;
                // preview.previewChanges.appliedForgivenInterest = ledger.remainingForgivenInterestAmount;
                preview.previewChanges.pastDuePrincipalAmount = 0;
                // preview.previewChanges.remainingPrincipal = ledger.pastDuePrincipalAmount;
                 preview.previewChanges.scheduledPrincipal =  preview.principalPayment;
            
                ledger.pastDuePrincipalAmount = 0;
                ledger.totalChargedAccruedInterest = 0;
                ledger.totalRemainingInterest = 0;
                ledger.totalRemainingPrincipal = 0;
                ledger.unpaidInterest = 0;
                preview.unpaidInterest = 0;
                ledger.lateAccruedInterest = 0;
                ledger.unpaidFees = 0;
                ledger.remainingDeferredAmount = 0;
                ledger.remainingForgivenInterestAmount = 0;
            
                const totalPayment = parseFloat((preview.interestPayment +  preview.principalPayment).toFixed(2));
                if(!dialogState.isAmendPayoff && paymentAmount !== totalPayment) {
                    sails.log.error("Payment amount payoff does not match interest and principal due.");
                    paymentAmount = totalPayment;
                }
            }else {
                preview.principalPayment = parseFloat(ledger.principalPayoff);
                preview.previewChanges.unpaidInterest = 0;
                preview.previewChanges.pastDuePrincipalAmount = 0;
                preview.previewChanges.scheduledPrincipal =  preview.principalPayment;
                ledger.pastDuePrincipalAmount = 0;
                ledger.totalChargedAccruedInterest = 0;
                ledger.totalRemainingInterest = 0;
                ledger.totalRemainingPrincipal = 0;
                ledger.unpaidInterest = 0;
                preview.unpaidInterest = 0;
                ledger.lateAccruedInterest = 0;
                ledger.unpaidFees = 0;
                ledger.remainingDeferredAmount = 0;
                ledger.remainingForgivenInterestAmount = 0;
            }
        }else {
            //===============waterfall
            let interestPayment = Math.min( paymentAmount, currentInterest);
            let unpaidDifference = interestPayment;
            let unpaidInterestOrig = ledger.unpaidInterest;
            let unpaidPrincipalOrg = ledger.pastDuePrincipalAmount;
            if(!dialogState.isPrincipalOnlyPayment){
                if(ledger.missedPayments.length > 0 && (ledger.pastDuePrincipalAmount > 0 || ledger.unpaidInterest > 0)) {
                    const firstMissedPayment = ledger.missedPayments[0];
                    // {
                    //     scheduleItem: appliedPayments,
                    //             appliedInterestAmount: appliedFutureInterest,
                    //         appliedPrincipalAmount: appliedPrincipal,
                    //         principalRemaining: futurePrincipalLeft,
                    //         interestRemaining: accruedFutureInterestLeft
                    // }
                    if(firstMissedPayment && paymentAmount === firstMissedPayment.scheduleItem.amount) {
                        ledger.unpaidInterest = firstMissedPayment.scheduleItem.interestAmount;
                        ledger.pastDuePrincipalAmount = firstMissedPayment.scheduleItem.principalAmount;
                        ledger.nextActualScheduleItem = firstMissedPayment.scheduleItem;
                        ledger.nextActualPayment = moment(firstMissedPayment.scheduleItem.date).startOf("day").toDate();
                        interestPayment = ledger.unpaidInterest;
                        unpaidDifference = interestPayment;
                        ledger["isFuturePayment"] = true;
                    }
                }
    
                // 2 Unpaid Interest
                let leftOverRemainingInterest = Math.min(ledger.unpaidInterest, unpaidDifference);
                ledger.unpaidInterest = parseFloat((ledger.unpaidInterest - leftOverRemainingInterest).toFixed(2));
                preview.previewChanges.unpaidInterest = leftOverRemainingInterest;
                unpaidDifference =  parseFloat((unpaidDifference - leftOverRemainingInterest).toFixed(2));
                ledger.totalRemainingInterest = parseFloat((ledger.totalRemainingInterest - leftOverRemainingInterest).toFixed(2));
    
                // 3. Accrued Interest
                let remainingAccruedInterest = Math.min(ledger.totalChargedAccruedInterest, unpaidDifference);
                ledger.totalChargedAccruedInterest = parseFloat((ledger.totalChargedAccruedInterest - remainingAccruedInterest).toFixed(2));
                preview.previewChanges.accruedInterest = remainingAccruedInterest;
                // ledger.unpaidInterest = parseFloat((ledger.unpaidInterest + ledger.totalChargedAccruedInterest).toFixed(2));
                preview.principalPayment = parseFloat((paymentAmount - interestPayment).toFixed(2));
                // 4. Unpaid Principal
    
                remainingPastDuePrincipal = Math.min(ledger.pastDuePrincipalAmount, preview.principalPayment);
                ledger.pastDuePrincipalAmount = parseFloat((ledger.pastDuePrincipalAmount- remainingPastDuePrincipal).toFixed(2));
                preview.previewChanges.pastDuePrincipalAmount = remainingPastDuePrincipal;
                preview.interestPayment = interestPayment;
    
                preview.principalPayment =  parseFloat((preview.principalPayment - remainingPastDuePrincipal).toFixed(2));
            }else {
                remainingPastDuePrincipal = paymentAmount;
                currentInterest = 0;
                preview.principalPayment = paymentAmount;
                preview.previewChanges.principalPayment = paymentAmount;
            }
            // 1. Forgiven Interest
            ledger.unpaidInterest = $ize(unpaidInterestOrig - preview.previewChanges.unpaidInterest);
            ledger.pastDuePrincipalAmount = $ize(unpaidPrincipalOrg - preview.previewChanges.pastDuePrincipalAmount);
            
            const leftOverPrincipal = $ize(ledger.principalPayoff - remainingPastDuePrincipal);
            // 5. sched Principal
            preview.previewChanges.scheduledPrincipal = Math.min(preview.principalPayment, ledger.principalPayoff );// parseFloat((leftOverPrincipal - preview.principalPayment).toFixed(2));
            ledger.totalRemainingPrincipal = parseFloat((ledger.totalRemainingPrincipal - preview.principalPayment).toFixed(2));
        }

        ledger.totalForgivableInterest = parseFloat((ledger.totalForgivableInterest + currentForgivenInterest).toFixed(2));
        preview.previewChanges.principalPayment = $ize(preview.previewChanges.scheduledPrincipal + preview.previewChanges.pastDuePrincipalAmount);
        preview.principalPayment = preview.previewChanges.principalPayment;
        
        preview.unpaidInterest = parseFloat(ledger.unpaidInterest.toFixed(2));

        preview.latePaymentAmount = parseFloat((ledger.latePaymentAmount - (preview.principalPayment + preview.interestPayment)).toFixed(2));
        if (preview.latePaymentAmount < 0) {
            preview.latePaymentAmount = 0;
        }
        ledger.latePaymentAmount = preview.latePaymentAmount;
        // transaction index
        let transactionIdx = 0;
        _.forEach(self.paymentSchedule, (scheduleItem) => {
            const itemTransaction = parseInt(_.get(scheduleItem, "transaction", 0));
            if (itemTransaction > transactionIdx) {
                transactionIdx = parseInt(itemTransaction);
            }
        });
        ++transactionIdx;
        preview.principalBalance = $ize(ledger.principalPayoff - preview.previewChanges.pastDuePrincipalAmount - preview.previewChanges.scheduledPrincipal);
    
        // if(isAmendedPayment && preview.amend.amendPaymentAmount > 0) {
        //     paymentAmount = preview.amend.amendPaymentAmount;
        //     preview.principalPayment = preview.amend.amendAppliedPrincipal;
        //     preview.interestPayment = preview.amend.amendAppliedInterest;
        //
        //     // preview.previewChanges.accruedInterest = preview.interestPayment;
        //     // preview.previewChanges.unpaidInterest = 0
        //     // preview.previewChanges.scheduledPrincipal =  preview.principalPayment;
        // }
        // payment schedule item
        const newScheduleItem = {
            monthcount: transactionIdx,
            startBalanceAmount: ledger.principalPayoff,
            principalAmount: parseFloat(preview.principalPayment),
            interestAmount: parseFloat(preview.interestPayment),
            endBalanceAfterPayment: 0,
            amount: parseFloat(paymentAmount),
            oldprincipalAmount: parseFloat(preview.principalPayment),
            paidprincipalAmount: 0,
            paidinterestAmount: 0,
            lastpaidprincipalAmount: 0,
            lastpaidinterestAmount: 0,
            unpaidInterest: parseFloat((ledger.unpaidInterest).toFixed(2)),
            lastpaidcount: 0,
            date: paymentDate,
            lastpaiddate: paymentDate,
            transaction: transactionIdx,
            status: dialogState.useDebitCard?Payment.STATUS_PAID:Payment.STATUS_PENDING,
            feesAmount: 0,
            initiator: "makepayment",
            account: accountId,
            interestDue: 0,
            remainingUnpaidInterest: ledger.unpaidInterest,
            remainingUnpaidLateAccrued: ledger.lateAccruedInterest,
            remainingUnpaidPrincipal: ledger.pastDuePrincipalAmount,

            principalAmountPreview:  parseFloat(( preview.previewChanges.pastDuePrincipalAmount).toFixed(2)),
            unpaidInterestAmountPreview:   parseFloat((  preview.previewChanges.unpaidInterest).toFixed(2)),
            pastDuePrincipalAmount: parseFloat(ledger.pastDuePrincipalAmount.toFixed(2)),

            startAccruedDate: ledger.startAccruedDate,
            endAccruedDate: paymentDate,

            accruedPrincipal: 0,
            periodAccruedInterest: ledger.accruedInterest,
            forgivableInterest: currentForgivableInterest,
            remainingInterest:  ledger.unpaidInterest,
            remainingPrincipal: ledger.totalRemainingPrincipal,
            chargedAccruedInterest: chargedAccruedInterestAmount,
            forgivenInterest: currentForgivenInterest,
            
            appliedAccruedInterest: preview.previewChanges.accruedInterest,
            appliedRemainingInterest: preview.previewChanges.unpaidInterest,
            appliedScheduledPrincipal: preview.previewChanges.scheduledPrincipal,
            
            appliedForgivenInterest: preview.previewChanges.appliedForgivenInterest,
            
            appliedRemainingPrincipal: preview.previewChanges.pastDuePrincipalAmount,
         
            appliedDeferredAmount: preview.previewChanges.deferredAmount,
            daysInCycle: 0,
            cumulativeInterestPaid: ledger.totalUnpaidInterestPaid,
            cumulativePrincipalPaid:  ledger.totalPrincipalPaid,
            cumulativeTotalPaid: ledger.totalPaidAmount,
            deferredAmount: parseFloat((ledger.remainingDeferredAmount + preview.previewChanges.deferredAmount).toFixed(2)),
            isForgiven: dialogState.forgiveLateAccruedInterest,
            scheduleId: preview.scheduleIdSequenceCounter,
            paymentType: dialogState.useDebitCard?Payment.paymentTypeEnum.CARD_DEBIT:Payment.paymentTypeEnum.ACH_DEBIT
        };
        if(dialogState.isAmendPayoff) {
            newScheduleItem["isAmendPayoff"] = true;
        }
        preview.scheduleIdSequenceCounter = preview.scheduleIdSequenceCounter +1;
        
        let actualScheduleDateToUse = newScheduleItem.date;
        if(isAmendedPayment) {
            newScheduleItem["isAmendManualPayment"] = true;
            newScheduleItem["amendedScheduleDate"] = amendData.amendDate;
             newScheduleItem["amendOriginalPaymentAmount"] = amendData.amendAmount;
            newScheduleItem["amendOriginalPrincipalAmount"] = amendData.amendPrincipal;
            newScheduleItem["amendOriginalInterestAmount"] = amendData.amendInterest;
            actualScheduleDateToUse = moment().startOf("day").toDate();
        }
        newScheduleItem.accruedPrincipal = newScheduleItem.startBalanceAmount;
        newScheduleItem.daysInCycle = moment(newScheduleItem.endAccruedDate).diff(moment(newScheduleItem.startAccruedDate), "days");

        let newStartBalance = newScheduleItem.startBalanceAmount;
        transactionIdx += 1;

        sails.log.verbose("previewPayment; newScheduleItem:", newScheduleItem);

        let regularInterest = 0;
        let recalculatedInterest = 0;
        let interestDue = 0;

        let cumulativeInterestPaid = 0;
        let cumulativePrincipalPaid = 0;
        let cumulativeTotalPaid = 0;
        let interestToApply = parseFloat((newScheduleItem.interestAmount).toFixed(2));
        let principalToApply = parseFloat((newScheduleItem.principalAmount).toFixed(2));
        const futureSchedule = [];
    
        // paymentSchedule = paymentSchedule.sort( ( a, b ) => {
        //     if( moment( a.date ).isBefore( moment( b.date ) ) ) {
        //         return -1;
        //     }
        //     if( moment( a.date ).isAfter( moment( b.date ) ) ) {
        //         return 1;
        //     }
        //     if( a.transaction < b.transaction ) {
        //         return -1;
        //     }
        //     if( a.transaction > b.transaction ) {
        //         return 1;
        //     }
        //     return 0;
        // } );
        
        _.forEach(paymentSchedule, (scheduleItem) => {
            if ((preview.normalPaymentAmount === 0 && !scheduleItem.firstChangedSchedule) || scheduleItem.firstChangedSchedule) {
                preview.normalPaymentAmount = parseFloat(scheduleItem.amount.toFixed(2));
            }
            
            if ((!newScheduleItem.isAmendManualPayment && scheduleItem.date < newScheduleItem.date || moment(scheduleItem.date).isSame(newScheduleItem.date, "day")) || (newScheduleItem.isAmendManualPayment &&  moment(scheduleItem.date).isSameOrBefore(newScheduleItem.amendedScheduleDate, "day") )) {
                newStartBalance = scheduleItem.startBalanceAmount;
                preview.paymentSchedule.push(scheduleItem);
            }else {
                futureSchedule.push(scheduleItem);
            }
            if (scheduleItem.date > today || moment(scheduleItem.date).isSame(today, "day") && (regularInterest > 0 || scheduleItem.accruedInterest > 0)) {
                regularInterest = parseFloat((regularInterest + scheduleItem.chargedAccruedInterest).toFixed(2));
            }
        });
        newScheduleItem.endBalanceAfterPayment = parseFloat((newScheduleItem.startBalanceAmount - newScheduleItem.principalAmount).toFixed(2));

        let principalPayoff = newScheduleItem.startBalanceAmount;
        newScheduleItem.cumulativeInterestPaid = parseFloat((ledger.totalInterestPaid + newScheduleItem.interestAmount).toFixed(2));
        newScheduleItem.cumulativePrincipalPaid = parseFloat((ledger.totalPrincipalPaid + newScheduleItem.principalAmount).toFixed(2));
        newScheduleItem.cumulativeTotalPaid = parseFloat((newScheduleItem.cumulativeInterestPaid + newScheduleItem.cumulativePrincipalPaid).toFixed(2));
        cumulativeInterestPaid = parseFloat((newScheduleItem.cumulativeInterestPaid).toFixed(2));
        cumulativePrincipalPaid = parseFloat((newScheduleItem.cumulativePrincipalPaid).toFixed(2));
        cumulativeTotalPaid = parseFloat((newScheduleItem.cumulativeTotalPaid).toFixed(2));
        let newScheduleItemIndex = preview.paymentSchedule.length-1;
        if(!isAmendedPayment || dialogState.isAmendPayoff)
        {
            preview.paymentSchedule.push(newScheduleItem);
            newScheduleItemIndex = preview.paymentSchedule.length-1;
        }
      
        principalPayoff = parseFloat((principalPayoff - newScheduleItem.principalAmount).toFixed(2));
        preview.principalBalance = parseFloat(principalPayoff);
        //ledger.principalPayoff = principalPayoff;
        recalculatedInterest = newScheduleItem.chargedAccruedInterest;

        sails.log.verbose("previewPayment; regularInterest:", regularInterest);
        sails.log.verbose("previewPayment; recalculatedInterest:", recalculatedInterest);
            // if(principalPayoff > 0) {
                preview.paymentSchedule = preview.paymentSchedule.concat(futureSchedule);
            // }
        ledger.principalPayoff = principalPayoff;
        sails.log.verbose("previewPayment; interestSavings:", preview.interestSavings);
        const templateData = {
            paymentAmount: paymentAmount,
            ledger: ledger,
            preview: preview,
            newScheduleItem: newScheduleItem,
            newScheduleItemIndex: newScheduleItemIndex
        };
        // sails.log.verbose( "previewPayment; templateData:", templateData );
        return templateData;
    }
    
    async previewAmendPayment(self, originalAmendScheduledPayment, scheduleIndex, paymentDate, paymentAmount, dialogState, loggedInUser, accountId = null) {
        paymentDate = moment(paymentDate).startOf("day").toDate();
        let amendScheduledPayment = _.cloneDeep(originalAmendScheduledPayment);
        let ledger = this.getPaymentLedger(self, paymentDate)
        let originalAmount;
        let amendData = null;
            if(dialogState.isAmendPayoff){
                
                originalAmount = $ize(ledger.principalPayoff + ledger.unpaidInterest);
                amendScheduledPayment.amount = originalAmount;
                amendScheduledPayment.interestAmount = ledger.unpaidInterest;
                amendScheduledPayment.principalAmount = ledger.principalPayoff;
                amendData = await AchService.getAmendPayOffPaymentData(self,ledger,paymentAmount)
            }else {
                originalAmount = amendScheduledPayment.amount;
                const amendedManualPayment = _.cloneDeep(amendScheduledPayment);
                amendedManualPayment.amount = paymentAmount;
                
                amendData = await AchService.getAmendManualPaymentData(self,ledger, amendScheduledPayment, scheduleIndex, loggedInUser);
            }
            amendData["amendDate"] = paymentDate;
            
            const previewResults = this.previewPayment(self, paymentDate, originalAmount,dialogState,accountId,amendData);
        
            if(previewResults && previewResults.newScheduleItem) {
                previewResults.newScheduleItem.amendAmount = amendData.amendAmount;
                previewResults.newScheduleItem.amendInterest = amendData.amendInterest;
                previewResults.newScheduleItem.amendPrincipal = amendData.amendPrincipal;
                previewResults.newScheduleItem.isAmendPayment = true;
               
                previewResults.newScheduleItem["waivedAmount"] = $ize(previewResults.newScheduleItem.amount - amendData.amendAmount);
                previewResults.newScheduleItem["waivedInterest"] = $ize(previewResults.newScheduleItem.interestAmount - amendData.amendInterest);
                previewResults.newScheduleItem["waivedPrincipal"] = $ize(previewResults.newScheduleItem.principalAmount - amendData.amendPrincipal);
                
                const transactionDate = moment( previewResults.newScheduleItem.date).startOf("day").toDate();
                previewResults.newScheduleItem.status = Payment.STATUS_PENDING;

                if(!dialogState.isAmendPayoff) {
                    previewResults.newScheduleItem.date = amendScheduledPayment.date;
                    previewResults.newScheduleItem["amendedScheduleDate"] =  paymentDate;
                    previewResults.newScheduleItem["waivedOriginalDate"] = amendScheduledPayment.date;
                    previewResults.newScheduleItem.initiator = "automatic";
                    // const amendedManualPayment = _.cloneDeep(amendScheduledPayment);
                    // previewResults.newScheduleItem.date = amendedManualPayment.date;
                   
                    // previewResults.newScheduleItem.date = transactionDate;
                    previewResults["amendedWaivedScheduleItem"] = amendScheduledPayment
                    previewResults.newScheduleItemIndex = scheduleIndex;
                }
                
                // const newAmendedManualPayment = previewResults.newScheduleItem;
                
                // newAmendedManualPayment.amount = amendData.amendAmount;
                // newAmendedManualPayment.interestAmount = amendData.amendInterest;
                // newAmendedManualPayment.principalAmount = amendData.amendPrincipal;
                // previewResults.newScheduleItem = newAmendedManualPayment;
                // previewResults.paymentSchedule = paymentSchedule;
                // previewResults.preview.paymentSchedule =  previewResults.paymentSchedule;
    
                previewResults.preview.paymentSchedule[previewResults.newScheduleItemIndex] = _.cloneDeep(previewResults.newScheduleItem);
                previewResults.paymentSchedule =  previewResults.preview.paymentSchedule;
    
                previewResults.preview.scheduleDate = amendScheduledPayment.date;
                previewResults.paymentAmount = paymentAmount;
                
                previewResults.preview.amend.amendCurrentPaymentAmount = amendScheduledPayment.amount
                previewResults.preview.amend.amendCurrentInterest = amendScheduledPayment.interestAmount;
                previewResults.preview.amend.amendCurrentPrincipal = amendScheduledPayment.principalAmount;
                previewResults.preview.amend.amendAppliedPrincipal = amendData.amendPrincipal;
                previewResults.preview.amend.amendAppliedInterest = amendData.amendInterest;
                previewResults.preview.amend.amendPaymentAmount = paymentAmount;
                previewResults.preview.amend.amendLeftOverPrincipal = $ize(previewResults.preview.amend.amendCurrentPrincipal - previewResults.preview.amend.amendAppliedPrincipal);
                previewResults.preview.amend.amendLeftOverInterest = $ize(previewResults.preview.amend.amendCurrentInterest - previewResults.preview.amend.amendAppliedInterest);
                
               return previewResults;
            }
        throw new Error("An unknown error occurred while processing this amended payment.")
     
    }
    async updatePaymentContractForBankruptcy(paymentId, bankruptcyData, confirmReason, loggedInUser) {
        if (paymentId) {
            const paymentManagement = await PaymentManagement.findOne({id: paymentId});
            if (paymentManagement && !paymentManagement.isInBankruptcy) {
                const today = moment().toDate();
                const paymentManagementUpdateObj = {
                    isInBankruptcy: true,
                    bankruptcyInfo: bankruptcyData,
                    bankruptcyComment: confirmReason,
                    bankruptcyEnteredBy: loggedInUser.id,
                    bankruptcyCreatedDate: today
                };
                const updatePaymentResponse = await PaymentManagement.update({id: paymentId}, paymentManagementUpdateObj);
                await User.update({id: paymentManagement.user}, {isInBankruptcy: true});
                if (updatePaymentResponse && updatePaymentResponse.length > 0) {
                    try {
                        await CollectionsService.addCollectionComment(loggedInUser, paymentId, confirmReason, CollectionComments.collectionCommentTypeEnum.BANKRUPTCY);
                    } catch (exc) {
                        sails.log.warn("PatriaPlatformSpecificService#updatePaymentContractForBankruptcy - Error trying to create a collections comment: ", exc)
                    }
                    await super.logUserActivity(loggedInUser, paymentId, "Bankruptcy", `This contract was marked as having a Chapter ${bankruptcyData.bankruptcyType} bankruptcy which was discharged on '${moment(today).format("MM-DD-YYYY")}' with comment '${confirmReason}'`);
                    return updatePaymentResponse[0];
                }
            }
            return paymentManagement;
        }
        return null;
    }

    applyAmountsToPastDueItem(scheduleItem, interestToApply, principalToApply) {
        if (["OPENED", "OPEN", "LATE", "DECLINED", "RETURNED"].indexOf(scheduleItem.status) >= 0 && scheduleItem.initiator !== "makepayment" && (interestToApply > 0 || principalToApply > 0)) {
            if(interestToApply > 0) {
                const interestApplied = Math.min(scheduleItem.interestAmount, interestToApply);
                interestToApply = parseFloat((interestToApply - interestApplied).toFixed(2));
                scheduleItem.appliedPastDueInterest = interestApplied;
            }
            if(principalToApply > 0) {
                const principalApplied = Math.min(scheduleItem.principalAmount, principalToApply);
                principalToApply = parseFloat((principalToApply - principalApplied).toFixed(2));
                scheduleItem.appliedPastDuePrincipal = principalApplied;
            }
        }
        return {scheduleItem: scheduleItem, interestToApply: interestToApply, principalToApply:principalToApply};
    }
    async processSmearRipples(rejectedPayment, payId) {
        if(!rejectedPayment || !payId || !rejectedPayment.pmtRef) {
            return null;
        }
        let paymentManagement =  await PaymentManagement.findOne({id: payId}).populate("screentracking");
        if(paymentManagement) {
            let paymentSchedule = paymentManagement.paymentSchedule;
            const scheduleItemIndex = _.findIndex(paymentSchedule,(payScheduleItem) => {return payScheduleItem.pmtRef === rejectedPayment.pmtRef});

            const today = moment().startOf("day");

            if(scheduleItemIndex >= 0) {
                let isManualPayment = false;
                const rejectedPaymentScheduleItem = paymentSchedule[scheduleItemIndex];
                const rejectedPaymentScheduleDate = moment(rejectedPaymentScheduleItem.date);
                if(rejectedPaymentScheduleItem.pmtRef === rejectedPayment.pmtRef) {
                    if(!rejectedPaymentScheduleItem.initiator || rejectedPaymentScheduleItem.paymentType === "automatic") {
                        //auto
                        isManualPayment = false;
                        if(scheduleItemIndex === 0) {
                            //first payment failed -> collections

                        }
                    }else if(rejectedPaymentScheduleItem.initiator === "makepayment") {
                        //mp
                        isManualPayment = true;
                        //revert old schedule
                    }
                }
                rejectedPaymentScheduleItem["isCurrentReject"] = true;
                rejectedPaymentScheduleItem.status = "RETURNED";
                const pendingPaymentsToInclude = [rejectedPaymentScheduleItem];
                for(let i=scheduleItemIndex+1;i< paymentSchedule.length;i++) {
                    const scheduleItem = paymentSchedule[i];
                    //AP reject <-  no mp -> do nothing (collections take over)
                    //with mp -> smear mp -> go to collections if late

                    //1 mp <- rejected not late -> bring back old sched include next paid
                    //past due -> smear then balloon next payment

                    //2 mp <- not late -> bring back old sched then include in next mp
                    //past due -> bring back old sched from point of reject, then smear next mp, then balloon next scheduled


                    // if ((moment(scheduleItem.date).toDate() < today || moment(scheduleItem.date).isSame(today, "day")) && ((scheduleItem.status !== "REPLACED"  && !scheduleItem.isBalloonPayment) || (scheduleItem.initiator === "amount-needed-for-current") ) && (scheduleItem.initiator !== "makepayment" || ["LATE", "DECLINED", "RETURNED", "REJECTED"].indexOf(scheduleItem.status) < 0)) {
                    //     let accruedInterest = parseFloat(parseFloat(_.get(scheduleItem, "accruedInterest", scheduleItem.interestAmount)).toFixed(2));
                    //     if(paymentManagement.isInLoanModification) {
                    //         accruedInterest = parseFloat(parseFloat(scheduleItem.interestAmount).toFixed(2));
                    //     }
                    //     totalAccruedInterest = parseFloat((totalAccruedInterest + accruedInterest).toFixed(2));
                    //
                    // }
                    sails.log.error(moment(scheduleItem.date).diff(moment(rejectedPaymentScheduleDate),"days") + " and " + moment(scheduleItem.date).diff(today,"days")  );
                    if (moment(scheduleItem.date).diff(moment(rejectedPaymentScheduleDate),"days") >= 0 && moment(scheduleItem.date).diff(today,"days") <= 0) {
                        if(["PAID","SETTLED", "PENDING", "WAIVED"].indexOf(scheduleItem.status) >= 0 || (scheduleItem.initiator === "makepayment" && ["LATE", "DECLINED", "RETURNED", "REJECTED"].indexOf(scheduleItem.status) < 0)) {
                            if(rejectedPaymentScheduleItem.initiator === "makepayment" || ((!rejectedPaymentScheduleItem.initiator || rejectedPaymentScheduleItem.paymentType === "automatic") && isManualPayment)) {
                                scheduleItem["smearNeeded"] = true;
                                pendingPaymentsToInclude.push(scheduleItem);
                            }
                        }

                    }
                }
                if(isManualPayment) {
                    const payScheduleHistory = await getPaymentScheduleFromHistory(rejectedPaymentScheduleItem, paymentManagement.screentracking);
                    if(!payScheduleHistory) {
                        throw Error("Critical: Unable to smear due to no history of payment to restore.")
                    }
                    if(payScheduleHistory) {
                        paymentSchedule = payScheduleHistory;
                        paymentManagement.paymentSchedule = paymentSchedule;
                    }
                }
                if(pendingPaymentsToInclude.length > 0) {
                    //include and smear
                    paymentManagement.paymentSchedule = await processPaymentsToInclude(pendingPaymentsToInclude, paymentSchedule, paymentManagement, rejectedPaymentScheduleItem);
                }
                const newPaymentResults = await PaymentManagement.update({id: paymentManagement.id}, {paymentSchedule: paymentManagement.paymentSchedule});
                if(newPaymentResults && newPaymentResults.length > 0) {
                    paymentManagement = newPaymentResults[0];
                }
            }
            return paymentManagement;
        }
        return null;
    }
}

module.exports = PatriaPlatformSpecificService;
async function processPaymentsToInclude(paymentsToInclude, paymentSchedule, paymentmanagement, rejectedPaymentScheduleItem) {
    const paymentsToIncludeLength = paymentsToInclude.length -1;
    let index = 0;
    for(let paymentsToAdd of paymentsToInclude) {

        // dialogState.isRegularPayment = true;
        // dialogState.isPayoffPayment = false;
        // dialogState.isPastDuePayment = false;
        if(!paymentsToAdd.isCurrentReject) {
            const dialogState = {
                isRegularPayment: true,
                isPayoffPayment: false,
                forgiveLateAccruedInterest: false
            };
            const ledger = PlatformSpecificService.getPaymentLedger(paymentmanagement, paymentsToAdd.date);
            if(ledger.unpaidInterest > 0 || ledger.totalChargedAccruedInterest > 0 || ledger.deferredWithForgiven > 0 || ledger.payoff > 0 ) {
            	const  totalInterestOwed = parseFloat((ledger.unpaidInterest + ledger.totalChargedAccruedInterest + ledger.deferredWithForgiven).toFixed(2));
            	const totalAmountOwed = parseFloat((ledger.payoff + totalInterestOwed).toFixed(2));
            	if(paymentsToAdd.amount >= totalAmountOwed) {
                    paymentsToAdd.amount = totalAmountOwed;
            		dialogState.isRegularPayment = false;
            		dialogState.isPayoffPayment = true;
            	}
            }else if( paymentsToAdd.amount >= ledger.payoff ) {
                paymentsToAdd.amount = ledger.payoff;
            	dialogState.isRegularPayment = false;
            	dialogState.isPayoffPayment = true;
            }
            if(paymentsToAdd.isForgiven) {
                dialogState.forgiveLateAccruedInterest = true;
            }
            const templateData = PlatformSpecificService.previewPayment( paymentmanagement, paymentsToAdd.date, paymentsToAdd.amount, dialogState,null,true );

            const scheduleHistory = _.cloneDeep( paymentmanagement );
            delete scheduleHistory.id;
            delete scheduleHistory.createdAt;
            delete scheduleHistory.updatedAt;

            if(paymentsToAdd.initiator === "makepayment") {
                scheduleHistory["madeManualPaymentAt"] = templateData.newScheduleItem.date;
                scheduleHistory["madeManualPaymentTransaction"] = templateData.newScheduleItem.transaction;
                scheduleHistory["madeManualPaymentAmount"] =templateData.newScheduleItem.amount;
                scheduleHistory["madeManualPaymentPmtRef"] = paymentsToAdd.pmtRef;
            }
            scheduleHistory["paymentManagement"] = paymentmanagement.id;
            await PaymentScheduleHistory.create( scheduleHistory );

            templateData.newScheduleItem.status = paymentsToAdd.status;
            templateData.newScheduleItem.initiator = paymentsToAdd.initiator;
            paymentSchedule = templateData.preview.paymentSchedule;
            const newScheduleItemIndex = _.findIndex(paymentSchedule,(previewItem) => {return checkIfScheduleItemIsEqual(previewItem, templateData.newScheduleItem)});
            if(newScheduleItemIndex >= 0) {
                _.assign(paymentsToAdd, templateData.newScheduleItem);
                paymentSchedule.splice(newScheduleItemIndex, 1, paymentsToAdd);
            }
        }else {
            let foundIndex = 0;
            _.forEach(paymentSchedule,(payScheduleItem, thisIndex) => {
                if(moment(payScheduleItem.date).diff(moment(paymentsToAdd.date),"days") <= 0){
                    foundIndex = thisIndex +1;
                }
            });
            delete paymentsToAdd.isCurrentReject;
            paymentSchedule.splice(foundIndex,0,paymentsToAdd);
        }
        paymentmanagement.paymentSchedule = paymentSchedule;

        index = index +1;
    }
    //update payment management
    return paymentSchedule;
}
async function getPaymentScheduleFromHistory(scheduleItem, screenTrackingId) {

    let paymentManagementHistory = await PaymentScheduleHistory.find( {$or: [{ $and:[{madeManualPaymentPmtRef: {$exists: true}},{madeManualPaymentPmtRef: scheduleItem.pmtRef}]},{screentracking: screenTrackingId, madeManualPaymentAt: {$exists: true, $eq: scheduleItem.date},madeManualPaymentTransaction:scheduleItem.transaction,madeManualPaymentAmount: scheduleItem.amount }]}).sort({createdAt: -1}).limit(1);
    // if(!paymentManagementHistory || paymentManagementHistory.length === 0) {
    //         const latestPaymentManagementHistory = PaymentScheduleHistory.find({}).sort({createdAt: -1}).limit(1);
    //         if(latestPaymentManagementHistory && latestPaymentManagementHistory.length > 0) {
    //             paymentManagementHistory = latestPaymentManagementHistory;
    //         }
    // }
    if(paymentManagementHistory && paymentManagementHistory.length > 0) {
        return paymentManagementHistory[0].paymentSchedule;
    }
    return null;
}

function checkIfScheduleItemIsEqual(scheduleItem1, scheduleItem2) {
    if(!scheduleItem1 || !scheduleItem2) {
        return false;
    }
    if((!scheduleItem1.pmtRef || !scheduleItem2.pmtRef)) {
        return scheduleItem1.transaction === scheduleItem2.transaction && scheduleItem1.amount === scheduleItem2.amount && moment(scheduleItem1.date).startOf("day").diff(moment(scheduleItem2.date).startOf("day"),"days") === 0;
    }else {
        return scheduleItem1.pmtRef === scheduleItem2.pmtRef;
    }
}
