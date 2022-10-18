module.exports =  {

    processDailyNachaPayments: () => {
    
        const criteria = {
            status: PaymentManagement.paymentManagementStatus.active,
            $or: [ { moveToArchive: { $exists: false } }, { moveToArchive: { $eq: 0, $exists: true } } ]
        };
        
        if(!!paymentId) {
            criteria["id"] = paymentId
        }
        let skip = 0;
        let limit = 1000;
        return new Promise( async ( resolve, reject ) => {
            let sectionCount = 1;
            let overallCount = 1;
            const totalCollectionCount = await PaymentManagement.count(criteria);
            let paymentManagementSection = await PaymentManagement.find(criteria).limit(limit).skip(skip).populate("screentracking")
            sails.log.error(`total active loan count ${totalCollectionCount} with current count ${paymentManagementSection.length}`);
            while(paymentManagementSection && paymentManagementSection.length > 0) {
                let itemCount = 1;
                const currentDateTime = moment.utc().startOf("day");
                for(let pmdetail of paymentManagementSection) {
                    if( pmdetail.paymentSchedule && pmdetail.paymentSchedule.length > 0 ) {
                        const ledger = PlatformSpecificService.getPaymentLedger(pmdetail, currentDateTime.toDate());
                        if(ledger) {
                            const actualMissedPayments = findOldestPastDue(ledger.missedPayments);
                            if(actualMissedPayments && actualMissedPayments.actualPastDueSchedule && actualMissedPayments.actualPastDueSchedule.length > 0) {
                                const missedPaymentDate = moment.utc(actualMissedPayments.oldestPastDueDate).startOf("day"); // missedPaymentListedSorted[ 0 ].scheduleItem.date;
                                const latePaymentDays = moment.utc(currentDateTime).diff(missedPaymentDate, "days");
                            
                                if(latePaymentDays >= 120) {
                                
                                    const updateObj = await PaymentManagement.update({id: pmdetail.id}, {
                                        status: PaymentManagement.paymentManagementStatus.chargeOff,
                                        isChargeOff: true,
                                        chargeOffDate: moment.utc().toDate()
                                    });
                                    if(updateObj && updateObj.length > 0) {
                                        sails.log.verbose(`${overallCount} - section item: ${itemCount} | loan120DayChargeOff Found  ${pmdetail.id} at ${latePaymentDays} days. Moving to charge off`);
                                        const user = {
                                            id: "Cron Job", email: "loan120DayChargeOff Cron Job"
                                        };
                                        await CollectionsService.logCollectionActivity(user, pmdetail.id, "ChargeOff", "This contract was moved to CHARGEOFF");
                                    }
                                }
                            }
                        }
                    }
                    // sails.log.error(`=================================${overallCount} - section item: ${itemCount} | payment item: ${pmdetail.id} - isInCollections: ${pmdetail.isInCollections === true}`);
                    itemCount = itemCount +1;
                }
                skip = skip + limit;
                paymentManagementSection = await PaymentManagement.find(criteria).limit(limit).skip(skip).populate("screentracking")
                sails.log.error(`${overallCount}=========================${sectionCount} test loan 120 day charge off: section start with ${paymentManagementSection.length}`)
                itemCount = 1;
                sectionCount = sectionCount +1;
                overallCount = overallCount+limit;
            }
            sails.log.error("END test loan 120 day chargeoff stuff")
            return resolve(true);
        });
    }
};
