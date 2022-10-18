/* global module, sails */

"use strict";
const moment = require("moment");
const ObjectId = require("mongodb").ObjectID;
var mailerConfig = sails.config.mailer;
module.exports = {
  validateISA: validateISA,
  incompleteToPending: incompleteToPending,
  
  changeContractStatus: changeContractStatus,
  markContractNeedingReview: markContractNeedingReview,
  markContractNeedsReviewedResolved: markContractNeedsReviewedResolved,
  markUnderwritingRuleAsNeedReviewResolved: markUnderwritingRuleAsNeedReviewResolved,
  markUnderwritingNoHitResolved: markUnderwritingNoHitResolved,
  markUnderwritingThinFileResolved: markUnderwritingThinFileResolved,
  moveContractToArchive: moveContractToArchive,
  unArchiveContract: unArchiveContract,
  rejectContract: rejectContract,
  confirmProgramCompletion: confirmProgramCompletion,
  addStatusLogActivity: addStatusLogActivity,
  scrapePaymentDisplayData: scrapePaymentDisplayData,
  readjustPaymentSchedule: readjustPaymentSchedule,
  processAmendManualPayment: processAmendManualPayment,
  getAmendManualPaymentData: getAmendManualPaymentData,
  getAmendPayOffPaymentData: getAmendPayOffPaymentData,
  processDeferredPayment: processDeferredPayment,
  processWaivePayment: processWaivePayment,
  waiveEntireLoan: waiveEntireLoan,
  scrapePaymentsScheduleActionEligibility: scrapePaymentsScheduleActionEligibility,
  processChangeSchedule: processChangeSchedule,
  getFreshLeadsList: getFreshLeadsList,
  originateLoan: originateLoan,
  getFreshLeadsCount: getFreshLeadsCount,
  changeLoanDetailsWithScheduleChange: changeLoanDetailsWithScheduleChange,
  getAllUsersList: getAllUsersList,
  manualPaymentStatusUpdate: manualPaymentStatusUpdate,
  toggleAutoAch: toggleAutoAch
};

function scrapePaymentDisplayData(paymentSchedule, paymentWindow) {
  let displayData = [];
  let idx = 1;
  
  if(paymentSchedule) {
    const payments = paymentSchedule.map((payment) => {
      const displayObj = {};
      
      switch(payment.status) {
        case "OPEN":
        case "OPENED":
        case "Schedule":
          displayObj.color = "white";
          displayObj.status = "Scheduled";
          displayObj.paymentType = "";
          displayObj.incomePercent = payment.incomePercent + "%";
          break;
        case "STATUS_DECINED":
        case "STATUS_RETURNED":
          displayObj.color = "red";
          displayObj.status = "Returned";
          displayObj.paymentType = payment.paymentType || "automatic";
          displayObj.incomePercent = payment.incomePercent + "%";
          break;
        case "PAID":
        case "STATUS_PAID":
          if(payment.paidprincipalAmount == 0) {
            displayObj.color = "blue";
            displayObj.status = "Deferred";
            displayObj.paymentType = "";
            displayObj.incomePercent = "";
          } else {
            displayObj.status = "Paid";
            displayObj.color = "green";
            displayObj.paymentType = payment.paymentType || "automatic";
            displayObj.incomePercent = payment.incomePercent + "%";
          }
          break;
        default:
          displayObj.status = "Pending";
          displayObj.color = "yellow";
          displayObj.paymentType = payment.paymentType || "automatic";
          displayObj.incomePercent = payment.incomePercent;
      }
      displayObj.date = moment(payment.date).format("MMMM D, YYYY");
      displayObj.amount = "$" + payment.amount;
      displayObj.paid = (displayObj.paid > 0) ? "$" + payment.paidprincipalAmount : "";
      displayObj.index = idx;
      idx++;
      return displayObj;
    });
    if(payments.length > 0) {
      payments[payments.length - 1].last = true;
      const lastDate = moment(paymentSchedule[paymentSchedule.length - 1].date);
      for(let idx = payments.length; idx < paymentWindow; idx++) {
        lastDate.add(1, "month");
        const displayObj = {
          color: "white", status: "", amount: "", paid: ""
        };
        displayObj.date = lastDate.format("MMMM D, YYYY");
        displayObj.index = idx;
        displayObj.paymentType = "";
        displayObj.incomePercent = "";
        payments.push(displayObj);
      }
      displayData = payments;
    }
  }
  return displayData;
}

function validateISA(userId) {
  return new Promise((resolve, reject) => {
    return PaymentManagement.findOne({ user: userId }).then((paymentmangementData) => {
      if(!paymentmangementData) {
        return resolve(false);
      }
      let validated = false;
      return User.findOne({ id: userId }).then((userData) => {
        /* check for email address */
        if(!userData.email || userData.email.length == 0) {
          return resolve(false);
          // return false;
        }
        /* check that email has been validated */
        if(!userData.isEmailVerified) {
          return resolve(false);
          // return false;
        }
        /* check for phone  */
        if(!userData.phoneNumber || userData.phoneNumber.length == 0) {
          return resolve(false);
          // return false;
        }
        /* check that phone is validated */
        if(!userData.isPhoneVerified) {
          return resolve(false);
          // return false;
        }
        /* check references added */
        if(!userData.isReferenceAdded) {
          return resolve(false);
          // return false;
        }
        return Achdocuments.find({ user: userId }).then((documents) => {
          documents.forEach((document) => {
            if(document.docType == "doctype1") {
              validated = true;
            }
          });
          if(!validated) {
            return resolve(false);
            // return false;
          }
          return resolve(true);
        });
      });
    });
  });
}

function incompleteToPending(userId) {
  return new Promise((resolve, reject) => {
    return Screentracking.findOne({ $and: [{ user: userId }, { isCompleted: { $ne: 2 } }] }).then(function(screentrackingData) {
      screentrackingData.lastlevel = 6;
      screentrackingData.isCompleted = true;
      return screentrackingData.save();
    }).then((updated) => {
      return PaymentManagement.findOne({ user: userId });
    }).then((paymentmanagementData) => {
      if(paymentmanagementData) {
        paymentmanagementData.status = sails.config.paymentManagementStatus.pending;
        paymentmanagementData.achstatus = 0;
        return paymentmanagementData.save().then(() => {
          return resolve(true);
        });
      }
      return resolve(true);
    });
  });
}

function changeContractStatus(payId, newStatus, loggedInUser, additionalUpdateObject = {}) {
  return new Promise((resolve, reject) => {
    let errorMessage = "";
    if(!payId || !newStatus || !loggedInUser) {
      errorMessage = "Missing required data to update this contract status";
      sails.log.error("AchService#changeContractStatus  :: Error :: " + errorMessage);
      return reject({ message: errorMessage });
    }
    PaymentManagement.findOne({ id: payId }).then((paymentManagementData) => {
      if(paymentManagementData) {
        let updateObject = _.assign({
          status: newStatus, achstatus: sails.config.paymentManagementAchStatus.achStatus[newStatus]
        }, additionalUpdateObject);
        //const sendApproveEmail = paymentManagementData.status === "PENDING" && newStatus === sails.config.paymentManagementAchStatus.ACTIVE;
        
        PaymentManagement.update({ id: payId }, updateObject).then((payUpdateResponse) => {
          if(payUpdateResponse && payUpdateResponse.length > 0) {
            Screentracking.update({ id: paymentManagementData.screentracking }, {
              moveToIncomplete: newStatus === sails.config.paymentManagementAchStatus.status.INCOMPLETE ? 1 : 0,
              iscompleted: newStatus === sails.config.paymentManagementAchStatus.status.INCOMPLETE ? 0 : 1
            }).then((screenTrackingUpdate) => {
              
              addStatusLogActivity(loggedInUser, payUpdateResponse[0], "Contract status changed", `Contract status was changed to '${newStatus}'.`).then((logActivityResponse) => {
                return resolve(paymentManagementData);
              }).catch((errorObj) => {
                sails.log.error("AchService#markContractNeedingReview  :: Error unable to save need review log activity ", errorObj);
                return reject(errorObj);
              });
            }).catch((errorObj) => {
              sails.log.error("AchService#changeContractStatus  :: Error ", errorObj);
              return reject(errorObj);
            });
            
          } else {
            errorMessage = "Error payment management was not updated";
            sails.log.error("AchService#changeContractStatus  :: " + errorMessage);
            return reject({ message: errorMessage });
          }
        });
      } else {
        errorMessage = "Error payment management was not found";
        sails.log.error("AchService#changeContractStatus  :: " + errorMessage);
        return reject({ message: errorMessage });
      }
    }).catch((errorObj) => {
      sails.log.error("AchService#changeContractStatus  :: Error ", errorObj);
      return reject(errorObj);
    });
  });
  
}

function markContractNeedingReview(payId, needsReviewedReason, loggedInUser, employmentHistory = {}) {
  return new Promise((resolve, reject) => {
    if(!payId) {
      const errorMessage = "Missing payment management id for marking as need reviewed";
      sails.log.error("AchService#markContractNeedingReview  :: Error :: " + errorMessage);
      return reject({ message: errorMessage });
    }
    PaymentManagement.findOne({ id: payId }).populate("screentracking").then((paymentManagementData) => {
      if(paymentManagementData && paymentManagementData.screentracking) {
        if(!needsReviewedReason) {
          const errorMessage = "Missing required data to update needing reviewed";
          sails.log.error("AchService#markContractNeedingReview  :: Error :: " + errorMessage);
          return reject({ message: errorMessage });
        }
        if(!paymentManagementData.screentracking.needsReviewing || needsReviewedReason === sails.config.needsReviewReasonEnum.needsReviewReason.incomeChanged) {
          Screentracking.update({ id: paymentManagementData.screentracking.id }, {
            needsReviewing: true,
            needsReviewedReason: needsReviewedReason,
            hasProgramEnded: needsReviewedReason === sails.config.needsReviewReasonEnum.needsReviewReason.programEnds,
            hasGracePeriodEnded: needsReviewedReason === sails.config.needsReviewReasonEnum.needsReviewReason.gracePeriodEnding,
            hasIncomeChanged: needsReviewedReason === sails.config.needsReviewReasonEnum.needsReviewReason.incomeChanged,
            hasFailedUnderwriting: needsReviewedReason === sails.config.needsReviewReasonEnum.needsReviewReason.failedUnderwriting
          }).then((screenTrackingUpdateResponse) => {
            if(screenTrackingUpdateResponse && screenTrackingUpdateResponse.length > 0) {
              if(needsReviewedReason === sails.config.needsReviewReasonEnum.needsReviewReason.programEnds) {
                EmailService.processSendingStatusEmail(EmailService.emailSendType.partnerProgramEnding, paymentManagementData);
              }
              let logMessage = `Contract marked as needing review because of '${needsReviewedReason}'.`;
              if(needsReviewedReason === sails.config.needsReviewReasonEnum.needsReviewReason.incomeChanged && employmentHistory && Object.keys(employmentHistory).length > 0) {
                const currentIncomeString = employmentHistory.currentIncome ? employmentHistory.currentIncome.toLocaleString("en-US", {
                  style: "currency", currency: "USD", maximumFractionDigits: 0, minimumFractionDigits: 0
                }) : "$0";
                const previousIncomeString = employmentHistory.previousSetIncome ? employmentHistory.previousSetIncome.toLocaleString("en-US", {
                  style: "currency", currency: "USD", maximumFractionDigits: 0, minimumFractionDigits: 0
                }) : "$0";
                logMessage += ` Income was changed from '${previousIncomeString}' to '${currentIncomeString}.`;
              }
              addStatusLogActivity(loggedInUser, paymentManagementData, "Contract marked as need reviewed", logMessage).then((logActivityResponse) => {
                return resolve(paymentManagementData);
              }).catch((errorObj) => {
                sails.log.error("AchService#markContractNeedingReview  :: Error unable to save need review log activity ", errorObj);
                return reject(errorObj);
              });
            } else {
              const errorMessage = "Screentracking was not updated for needing reviewed";
              sails.log.error("AchService#markContractNeedingReview  :: Error :: " + errorMessage);
              return reject({ message: errorMessage });
            }
          });
        } else {
          sails.log.error("AchService#markContractNeedingReview  :: Error tried to mark as needing reviewed with reason " + needsReviewedReason + " but could not. Income change review is there and trumps others.");
          addStatusLogActivity(loggedInUser, paymentManagementData, "Contract was attempted to be marked needing reviewed", `An attempt to mark needing reviewed on this contract '${needsReviewedReason}' but income change review was already set`).then((logActivityResponse) => {
            return resolve(paymentManagementData);
          }).catch((errorObj) => {
            sails.log.error("AchService#markContractNeedingReview  :: Error unable to save need review log activity ", errorObj);
            return reject(errorObj);
          });
        }
      } else {
        const errorMessage = "Unable to set needing review";
        sails.log.error("AchService#markContractNeedingReview  :: Error :: " + errorMessage);
        return reject({ message: errorMessage });
      }
      
    }).catch((errorObj) => {
      sails.log.error("AchService#markContractNeedingReview  :: Error ", errorObj);
      return reject(errorObj);
    });
  });
}

function addStatusLogActivity(userMakingTheChange, paymentManagement, subject, message, screenTracking = null) {
  const loggingData = {
    user: userMakingTheChange,
    payID: paymentManagement ? paymentManagement.id : null,
    logdata: paymentManagement ? paymentManagement : screenTracking
  };
  return Logactivity.registerLogActivity(loggingData, subject, message);
}

function confirmProgramCompletion(payId, loggedInUser) {
  return new Promise((resolve, reject) => {
    if(!payId) {
      const errorMessage = "Missing payment management id for confirming program completion";
      sails.log.error("AchService#confirmProgramCompletion  :: Error :: " + errorMessage);
      return reject({ message: errorMessage });
    }
    PaymentManagement.findOne({ id: payId }).then((paymentManagementData) => {
      if(paymentManagementData && !!paymentManagementData.screentracking) {
        Screentracking.update({ id: paymentManagementData.screentracking }, { isProgramCompleteConfirmed: true }).then((screenTrackingResults) => {
          if(screenTrackingResults && screenTrackingResults.length > 0 && screenTrackingResults[0]) {
            const screenTrackingObj = screenTrackingResults[0];
            if(screenTrackingObj.needsReviewing && screenTrackingObj.hasProgramEnded) {
              AchService.markContractNeedsReviewedResolved(payId, loggedInUser, false).then((paymentManagementResponse) => {
                resolve(paymentManagementResponse);
              }).catch((errorObj) => {
                const errorMessage = "Program completion was confirmed but was unable to resolve needs review.";
                sails.log.error("AchService#confirmProgramCompletion  :: Error :: " + errorMessage + " ", errorObj);
                resolve(paymentManagementResponse);
              });
            } else {
              resolve(paymentManagementData);
            }
          } else {
            const errorMessage = "There was a problem confirming program completion. Screen tracking did not update.";
            sails.log.error("AchService#confirmProgramCompletion  :: Error :: " + errorMessage);
            return reject({ message: errorMessage });
          }
        }).catch((errorObj) => {
          sails.log.error("AchService#confirmProgramCompletion  :: Error ", errorObj);
          return reject(errorObj);
        });
      } else {
        const errorMessage = "There was a problem confirming program completion. Unable to find payment management";
        sails.log.error("AchService#confirmProgramCompletion  :: Error :: " + errorMessage);
        return reject({ message: errorMessage });
      }
    }).catch((errorObj) => {
      sails.log.error("AchService#confirmProgramCompletion  :: Error ", errorObj);
      return reject(errorObj);
    });
  });
}

function markContractNeedsReviewedResolved(payId, loggedInUser, isDismissReview = false) {
  return new Promise((resolve, reject) => {
    if(!payId) {
      const errorMessage = "Missing payment management id for resolving needing reviewed";
      sails.log.error("AchService#markContractNeedsReviewedResolved  :: Error :: " + errorMessage);
      return reject({ message: errorMessage });
    }
    
    PaymentManagement.findOne({ id: payId }).populate("screentracking").then((paymentManagementData) => {
      if(paymentManagementData && paymentManagementData.screentracking) {
        if(!paymentManagementData.screentracking.needsReviewing || !paymentManagementData.screentracking.needsReviewedReason) {
          const message = "Can't resolve review. It's already resolved.";
          sails.log.verbose("AchService#markContractNeedsReviewedResolved  :: Error :: " + message);
          return resolve(paymentManagementData);
        }
        Screentracking.update({ id: paymentManagementData.screentracking.id }, {
          needsReviewing: false,
          needsReviewedReason: null,
          isNeedReviewDismissed: isDismissReview,
          hasProgramEnded: paymentManagementData.screentracking.needsReviewedReason === sails.config.needsReviewReasonEnum.needsReviewReason.programEnds && isDismissReview,
          hasGracePeriodEnded: paymentManagementData.screentracking.needsReviewedReason === sails.config.needsReviewReasonEnum.needsReviewReason.gracePeriodEnding && isDismissReview,
          hasIncomeChanged: paymentManagementData.screentracking.needsReviewedReason === sails.config.needsReviewReasonEnum.needsReviewReason.incomeChanged && isDismissReview,
          hasFailedUnderwriting: paymentManagementData.screentracking.needsReviewedReason === sails.config.needsReviewReasonEnum.needsReviewReason.failedUnderwriting && isDismissReview
        }).then((screenTrackingUpdateResponse) => {
          if(screenTrackingUpdateResponse && screenTrackingUpdateResponse.length > 0) {
            let reasonItWasInReview = !isDismissReview ? "was resolved" : "was dismissed";
            addStatusLogActivity(loggedInUser, paymentManagementData, "Contract needing review was resolved", `Contract that was marked as needing review for reason '${paymentManagementData.screentracking.needsReviewedReason}' ${reasonItWasInReview}`).then((logActivityResponse) => {
              paymentManagementData.screentracking = screenTrackingUpdateResponse[0];
              return resolve(paymentManagementData);
            }).catch((errorObj) => {
              sails.log.error("AchService#markContractNeedingReview  :: Error unable to save need review log activity ", errorObj);
              return reject(errorObj);
            });
          }
        });
      } else {
        const errorMessage = "Unable to mark needing review as resolved";
        sails.log.error("AchService#markContractNeedsReviewedResolved  :: Error :: " + errorMessage);
        return reject({ message: errorMessage });
      }
    }).catch((errorObj) => {
      sails.log.error("AchService#markContractNeedsReviewedResolved  :: Error ", errorObj);
      return reject(errorObj);
    });
  });
}

function markUnderwritingRuleAsNeedReviewResolved(payId, loggedInUser, ruleStatusString) {
  return new Promise((resolve, reject) => {
    if(!payId || !ruleStatusString) {
      const errorMessage = "Missing required parameters for resolving underwriting needing reviewed rule";
      sails.log.error("AchService#markUnderwritingRuleAsNeedReviewResolved  :: Error :: " + errorMessage);
      return reject({ message: errorMessage });
    }
    const ruleStatus = ruleStatusString.toUpperCase();
    PaymentManagement.findOne({ id: payId }).populate("screentracking").then((paymentManagementData) => {
      if(paymentManagementData && paymentManagementData.screentracking && paymentManagementData.screentracking.rulesDetails && paymentManagementData.screentracking.rulesDetails.rulesStatus && paymentManagementData.screentracking.rulesDetails.rulesStatus[ruleStatus]) {
        //const currentRuleStatus =paymentManagementData.screentracking.rulesDetails.rulesStatus[ruleStatus];
        // currentRuleStatus.status = false;
        const updateJson = { rulesDetails: {} };
        updateJson.rulesDetails = paymentManagementData.screentracking.rulesDetails;
        updateJson.rulesDetails.rulesStatus[ruleStatus]["needsReviewResolved"] = true;
        Screentracking.update({ id: paymentManagementData.screentracking.id }, updateJson).then((screenTrackingUpdateResponse) => {
          if(screenTrackingUpdateResponse && screenTrackingUpdateResponse.length > 0) {
            const screenTrackingUpdate = screenTrackingUpdateResponse[0];
            const updatedRuleStatus = screenTrackingUpdate.rulesDetails.rulesStatus;
            if(updatedRuleStatus && !_.some(Object.keys(updatedRuleStatus), (ruleKey) => {
              return updatedRuleStatus[ruleKey].status === true && !updatedRuleStatus[ruleKey].needsReviewResolved;
            })) {
              Promise.all([AchService.markContractNeedsReviewedResolved(payId, loggedInUser, false), AchService.changeContractStatus(payId, sails.config.paymentManagementStatus.incomplete, loggedInUser)]).then((allPromiseResponse) => {
                if(allPromiseResponse && allPromiseResponse.length > 1 && allPromiseResponse[1]) {
                  Screentracking.update({ id: paymentManagementData.screentracking.id }, {
                    lastlevel: 2, lastScreenName: "Select Bank"
                  }).then((screenLevelUpdate) => {
                    EmailService.processSendingStatusEmail(EmailService.emailSendType.customerKoOverride, allPromiseResponse[1]);
                    resolve(allPromiseResponse[1]);
                  }).catch((errorObj) => {
                    sails.log.error("AchService#markUnderwritingRuleAsNeedReviewResolved  :: Error ", errorObj);
                    return reject(errorObj);
                  });
                } else {
                  const errorMessage = "Resolved underwriting review but was unable to update the status of this contract.";
                  sails.log.error("AchService#markUnderwritingRuleAsNeedReviewResolved  :: Error :: " + errorMessage);
                  return reject({ message: errorMessage });
                }
              }).catch((errorObj) => {
                sails.log.error("AchService#markUnderwritingRuleAsNeedReviewResolved  :: Error ", errorObj);
                return reject(errorObj);
              });
            } else {
              paymentManagementData.screentracking = screenTrackingUpdate;
              resolve(paymentManagementData);
            }
          } else {
            const errorMessage = "Error trying to resolve underwriting need review status. Nothing was updated.";
            sails.log.error("AchService#markUnderwritingRuleAsNeedReviewResolved  :: Error :: " + errorMessage);
            return reject({ message: errorMessage });
          }
        }).catch((errorObj) => {
          sails.log.error("AchService#markUnderwritingRuleAsNeedReviewResolved  :: Error ", errorObj);
          return reject(errorObj);
        });
      } else {
        const errorMessage = "Error trying to resolve underwriting need review status. Unable to find current underwriting rules to resolve.";
        sails.log.error("AchService#markUnderwritingRuleAsNeedReviewResolved  :: Error :: " + errorMessage);
        return reject({ message: errorMessage });
      }
    }).catch((errorObj) => {
      sails.log.error("AchService#markUnderwritingRuleAsNeedReviewResolved  :: Error ", errorObj);
      return reject(errorObj);
    });
  });
}

function markUnderwritingNoHitResolved(payId, loggedInUser) {
  return new Promise((resolve, reject) => {
    if(!payId) {
      const errorMessage = "Missing required parameters for resolving underwriting no hit";
      sails.log.error("AchService#markUnderwritingNoHitResolved  :: Error :: " + errorMessage);
      return reject({ message: errorMessage });
    }
    PaymentManagement.findOne({ id: payId }).populate("screentracking").then((paymentManagementData) => {
      if(paymentManagementData && paymentManagementData.screentracking) {
        Screentracking.update({ id: paymentManagementData.screentracking.id }, {
          hasFailedUnderwritingNoHit: false, noHitRejectResolved: true
        }).then((screenTrackingUpdateResponse) => {
          updateNeedsReviewForResolvingUnderwriting(screenTrackingUpdateResponse, paymentManagementData, payId, loggedInUser).then((updateResponse) => {
            return resolve(updateResponse);
          }).catch((errorObj) => {
            return reject(errorObj);
          });
        }).catch((errorObj) => {
          sails.log.error("AchService#markUnderwritingNoHitResolved  :: Error ", errorObj);
          return reject(errorObj);
        });
      } else {
        const errorMessage = "Error trying to resolve underwriting need review status. Unable to find current underwriting rules to resolve.";
        sails.log.error("AchService#markUnderwritingNoHitResolved  :: Error :: " + errorMessage);
        return reject({ message: errorMessage });
      }
    }).catch((errorObj) => {
      sails.log.error("AchService#markUnderwritingNoHitResolved  :: Error ", errorObj);
      return reject(errorObj);
    });
  });
}

function markUnderwritingThinFileResolved(payId, loggedInUser) {
  return new Promise((resolve, reject) => {
    if(!payId) {
      const errorMessage = "Missing required parameters for resolving underwriting thin file";
      sails.log.error("AchService#markUnderwritingThinFileResolved  :: Error :: " + errorMessage);
      return reject({ message: errorMessage });
    }
    PaymentManagement.findOne({ id: payId }).populate("screentracking").then((paymentManagementData) => {
      if(paymentManagementData && paymentManagementData.screentracking) {
        Screentracking.update({ id: paymentManagementData.screentracking.id }, {
          hasFailedUnderwritingThinCredit: false, thinCreditRejectResolved: true
        }).then((screenTrackingUpdateResponse) => {
          updateNeedsReviewForResolvingUnderwriting(screenTrackingUpdateResponse, paymentManagementData, payId, loggedInUser).then((updateResponse) => {
            return resolve(updateResponse);
          }).catch((errorObj) => {
            return reject(errorObj);
          });
        }).catch((errorObj) => {
          sails.log.error("AchService#markUnderwritingThinFileResolved  :: Error ", errorObj);
          return reject(errorObj);
        });
      } else {
        const errorMessage = "Error trying to resolve underwriting need review status. Unable to find current underwriting rules to resolve.";
        sails.log.error("AchService#markUnderwritingThinFileResolved  :: Error :: " + errorMessage);
        return reject({ message: errorMessage });
      }
    }).catch((errorObj) => {
      sails.log.error("AchService#markUnderwritingThinFileResolved  :: Error ", errorObj);
      return reject(errorObj);
    });
  });
}

function updateNeedsReviewForResolvingUnderwriting(screenTrackingUpdateResponse, paymentManagementData, payId, loggedInUser) {
  return new Promise((resolve, reject) => {
    if(screenTrackingUpdateResponse && screenTrackingUpdateResponse.length > 0) {
      Promise.all([AchService.markContractNeedsReviewedResolved(payId, loggedInUser, false), AchService.changeContractStatus(payId, sails.config.paymentManagementStatus.incomplete, loggedInUser)]).then((allPromiseResponse) => {
        if(allPromiseResponse && allPromiseResponse.length > 1 && allPromiseResponse[1]) {
          Screentracking.update({ id: paymentManagementData.screentracking.id }, {
            lastlevel: 2, lastScreenName: "Select Bank"
          }).then((screenLevelUpdate) => {
            EmailService.processSendingStatusEmail(EmailService.emailSendType.customerKoOverride, allPromiseResponse[1]);
            resolve(allPromiseResponse[1]);
          }).catch((errorObj) => {
            sails.log.error("AchService#updateNeedsReviewForResolvingUnderwriting  :: Error ", errorObj);
            return reject(errorObj);
          });
        } else {
          const errorMessage = "Resolved underwriting review but was unable to update the status of this contract.";
          sails.log.error("AchService#updateNeedsReviewForResolvingUnderwriting  :: Error :: " + errorMessage);
          return reject({ message: errorMessage });
        }
      }).catch((errorObj) => {
        sails.log.error("AchService#updateNeedsReviewForResolvingUnderwriting  :: Error ", errorObj);
        return reject(errorObj);
      });
    } else {
      const errorMessage = "Error trying to resolve underwriting need review status. Nothing was updated.";
      sails.log.error("AchService#updateNeedsReviewForResolvingUnderwriting  :: Error :: " + errorMessage);
      return reject({ message: errorMessage });
    }
  });
}

function moveContractToArchive(screenTrackingId, loggedInUser, disqualifyStatus = null, disqualifiedReason = null) {
  return new Promise((resolve, reject) => {
    if(!screenTrackingId || (!!disqualifyStatus && !disqualifiedReason)) {
      const errorMessage = "Missing required data for archiving this contract";
      sails.log.error("AchService#moveContractToArchive  :: Error :: " + errorMessage);
      return reject({ message: errorMessage });
    }
    Screentracking.findOne({ id: screenTrackingId }).then((screenTracking) => {
      if(screenTracking) {
        let logMessage = {
          subject: "", message: ""
        };
        const screenTrackingUpdateObj = {
          moveToArchive: 1
        };
        const paymentManagementUpdateObj = {
          moveToArchive: 1
        };
        if(!!disqualifyStatus && (disqualifyStatus === sails.config.needsReviewReasonEnum.needsReviewDisqualifyStatus.withdrawn || disqualifyStatus === sails.config.needsReviewReasonEnum.needsReviewDisqualifyStatus.disqualified)) {
          screenTrackingUpdateObj["disqualifiedStatus"] = disqualifyStatus;
          screenTrackingUpdateObj["disqualifiedReason"] = disqualifiedReason;
          screenTrackingUpdateObj["archiveStatus"] = sails.config.needsReviewReasonEnum.needsReviewDisqualifyStatus.archiveContract;
          paymentManagementUpdateObj["archiveStatus"] = sails.config.needsReviewReasonEnum.needsReviewDisqualifyStatus.archiveContract;
          logMessage.subject = `Contract was ${disqualifyStatus === sails.config.needsReviewReasonEnum.needsReviewDisqualifyStatus.withdrawn ? "withdrawn" : "disqualified"}`;
          logMessage.message = `${logMessage.subject} for reason '${disqualifiedReason}'.`;
        } else {
          paymentManagementUpdateObj["archiveStatus"] = sails.config.needsReviewReasonEnum.needsReviewDisqualifyStatus.archiveApp;
          screenTrackingUpdateObj["archiveStatus"] = sails.config.needsReviewReasonEnum.needsReviewDisqualifyStatus.archiveApp;
          logMessage.subject = "Contract was archived";
          logMessage.message = "Contract status was changed to archived.";
        }
        Screentracking.update({ id: screenTrackingId }, screenTrackingUpdateObj).then((screenTrackingUpdateResponse) => {
          if(screenTrackingUpdateResponse && screenTrackingUpdateResponse.length > 0) {
            const screenTrackingUpdate = screenTrackingUpdateResponse[0];
            PaymentManagement.findOne({ screentracking: screenTrackingUpdate.id }).then((paymentManagementData) => {
              if(paymentManagementData) {
                PaymentManagement.update({ id: paymentManagementData.id }, paymentManagementUpdateObj).then((paymentUpdate) => {
                  if(paymentUpdate && paymentUpdate.length > 0 && paymentUpdate[0]) {
                    addStatusLogActivity(loggedInUser, paymentUpdate[0], logMessage.subject, logMessage.message).then((logActivityResponse) => {
                      return resolve(paymentManagementData);
                    }).catch((errorObj) => {
                      sails.log.error("AchService#moveContractToArchive  :: Error unable to save archive activity  log", errorObj);
                      return reject(errorObj);
                    });
                  } else {
                    const returnMessage = "Error unable to update archive status for payment management. It did not update";
                    sails.log.error("AchService#moveContractToArchive  :: " + returnMessage);
                    return reject({ message: errorMessage });
                  }
                }).catch((errorObj) => {
                  sails.log.error("AchService#moveContractToArchive  :: Error getting contract information for disqualifying", errorObj);
                  return reject(errorObj);
                });
              } else {
                addStatusLogActivity(loggedInUser, null, logMessage.subject, logMessage.message, screenTrackingUpdate).then((logActivityResponse) => {
                  resolve(screenTrackingUpdateObj);
                }).catch((errorObj) => {
                  sails.log.error("AchService#moveContractToArchive  :: Error unable to save archive activity  log", errorObj);
                  return reject(errorObj);
                });
              }
              
            }).catch((errorObj) => {
              sails.log.error("AchService#moveContractToArchive  :: Error ::", errorObj);
              return reject(errorObj);
            });
          } else {
            const errorMessage = "There was a problem updating screen tracking for archiving.";
            sails.log.error("AchService#moveContractToArchive  :: Error :: " + errorMessage);
            return reject({ message: errorMessage });
          }
        }).catch((errorObj) => {
          sails.log.error("AchService#moveContractToArchive  :: Error ::", errorObj);
          return reject(errorObj);
        });
      } else {
        const errorMessage = "Missing screen tracking for archiving this contract";
        sails.log.error("AchService#moveContractToArchive  :: Error :: " + errorMessage);
        return reject({ message: errorMessage });
      }
    }).catch((errorObj) => {
      sails.log.error("AchService#moveContractToArchive  :: Error ::", errorObj);
      return reject(errorObj);
    });
  });
}

function unArchiveContract(screenTrackingId, loggedInUser) {
  return new Promise((resolve, reject) => {
    if(!screenTrackingId) {
      const errorMessage = "Missing required data for un-archiving this contract";
      sails.log.error("AchService#unArchiveContract  :: Error :: " + errorMessage);
      return reject({ message: errorMessage });
    }
    Screentracking.findOne({ id: screenTrackingId }).then((screenTracking) => {
      if(screenTracking) {
        const unArchiveUpdateObj = {
          moveToArchive: 0, disqualifiedStatus: null, disqualifiedReason: null, archiveStatus: null
        };
        Screentracking.update({ id: screenTrackingId }, unArchiveUpdateObj).then((screenTrackingUpdate) => {
          if(screenTrackingUpdate && screenTrackingUpdate.length > 0) {
            const screenTrackingUpdateObj = screenTrackingUpdate[0];
            PaymentManagement.findOne({ screentracking: screenTrackingUpdateObj.id }).then((paymentManagementData) => {
              if(paymentManagementData) {
                PaymentManagement.update({ id: paymentManagementData.id }, {
                  moveToArchive: 0, archiveStatus: null
                }).then((paymentUpdate) => {
                  if(paymentUpdate && paymentUpdate.length > 0 && paymentUpdate[0]) {
                    const updatedPayment = paymentUpdate[0];
                    addStatusLogActivity(loggedInUser, updatedPayment, "Contract status changed", `Contract status was change to '${updatedPayment.status}' from an archived state`).then((logActivityResponse) => {
                      return resolve(updatedPayment);
                    }).catch((errorObj) => {
                      sails.log.error("AchService#unArchiveContract  :: Error unable to save archive activity  log", errorObj);
                      return reject(errorObj);
                    });
                  }
                }).catch((errorObj) => {
                  sails.log.error("AchService#unArchiveContract  :: Error getting contract information for un-archiving", errorObj);
                  return reject(errorObj);
                });
              } else {
                addStatusLogActivity(loggedInUser, screenTrackingUpdateObj, "Contract status changed", `Contract status was change to '${sails.config.paymentManagementStatus.incomplete}' from an archived state`).then((logActivityResponse) => {
                  return resolve(screenTrackingUpdateObj);
                }).catch((errorObj) => {
                  sails.log.error("AchService#unArchiveContract  :: Error unable to save archive activity  log", errorObj);
                  return reject(errorObj);
                });
              }
            }).catch((errorObj) => {
              sails.log.error("AchService#unArchiveContract  :: Error getting contract information for un-archiving", errorObj);
              return reject(errorObj);
            });
          } else {
            const errorMessage = "There was a problem updating screen tracking for unarchiving.";
            sails.log.error("AchService#unArchiveContract  :: Error :: " + errorMessage);
            return reject({ message: errorMessage });
          }
        }).catch((errorObj) => {
          sails.log.error("AchService#unArchiveContract  :: There was a problem updating screen tracking for un-archiving.", errorObj);
          return reject(errorObj);
        });
        
      } else {
        const errorMessage = "Missing screen tracking for un-archiving this contract";
        sails.log.error("AchService#unArchiveContract  :: Error :: " + errorMessage);
        return reject({ message: errorMessage });
      }
    }).catch((errorObj) => {
      sails.log.error("AchService#unArchiveContract  :: Error ::", errorObj);
      return reject(errorObj);
    });
  });
}

function rejectContract(payID, screenId, declinereason, req, declineEmail = "", eligireply = false) {
  return new Promise((resolve, reject) => {
    if((!payID && !screenId) || !declinereason) {
      const errorMessage = "Missing required parameters for rejecting this contract";
      sails.log.error("AchService#rejectContract  :: Error :: " + errorMessage);
      return reject({ message: errorMessage });
    }
    
    if(!!payID) {
      var options = {
        id: payID
      };
      PaymentManagement.findOne(options).populate("user").then(function(paymentmanagementdata) {
        var userObjectData = paymentmanagementdata.user;
        paymentmanagementdata.achstatus = 2;
        paymentmanagementdata.isPaymentActive = false;
        paymentmanagementdata.eligiblereapply = eligireply;
        paymentmanagementdata.declineemail = declineEmail;
        paymentmanagementdata.declinereason = declinereason;
        paymentmanagementdata.isDenied = true;
        paymentmanagementdata.appverified = 1;
        paymentmanagementdata.status = sails.config.paymentManagementStatus.denied;
        paymentmanagementdata["moveToArchive"] = 0;
        
        //paymentmanagementdata.practicemanagement = practicemanagement;
        paymentmanagementdata.save(function(err) {
          
          if(err) {
            sails.log.error("AchService#rejectContract  :: Error :: ", err);
            return reject(err);
          } else {
            
            //-- Added for back button redirect from detail page starts here
            var checkCreatedDate = moment().startOf("day").subtract(60, "days").format("MM-DD-YYYY");
            checkCreatedDate = moment(checkCreatedDate).tz("America/Los_Angeles").startOf("day").toDate().getTime();
            var loanCreartedDate = moment(paymentmanagementdata.createdAt).tz("America/Los_Angeles").startOf("day").toDate().getTime();
            
            var backviewType = "";
            
            if(paymentmanagementdata.achstatus == 2) {
              backviewType = "/admin/showAllArchivedDenied";
              
              if(loanCreartedDate > checkCreatedDate) {
                backviewType = "/admin/showAllDenied";
              } else {
                if(paymentmanagementdata.screentracking.moveToIncomplete) {
                  if(paymentmanagementdata.screentracking.moveToIncomplete == 1) {
                    backviewType = "/admin/showAllDenied";
                  }
                }
              }
            }
            //-- Added for back button redirect from detail page ends here
            
            var usercriteria = {
              id: paymentmanagementdata.user
            };
            
            User.findOne(usercriteria).then(function(userdata) {
              
              userdata.isUserProfileUpdated = false;
              userdata.save(function(err) {
                
                if(err) {
                  sails.log.error("AchService#rejectContract  :: Error :: ", err);
                  return reject(err);
                }
                
                var screencriteria = {
                  id: paymentmanagementdata.screentracking
                };
                
                Screentracking.findOne(screencriteria).then(function(screendata) {
                  
                  screendata["incompleteverified"] = 1;
                  screendata["isRejectedContract"] = true;
                  if(declinereason === sails.config.needsReviewReasonEnum.needsReviewReason.failedUnderwriting) {
                    screendata["needsReviewedReason"] = sails.config.needsReviewReasonEnum.needsReviewReason.failedUnderwriting;
                    screendata["needsReviewing"] = true;
                    screendata["hasProgramEnded"] = false;
                    screendata["hasGracePeriodEnded"] = false;
                    screendata["hasIncomeChanged"] = false;
                    screendata["hasFailedUnderwriting"] = true;
                    screendata["iscompleted"] = 0;
                    screendata["lastlevel"] = 7;
                  } else {
                    screendata["iscompleted"] = 1;
                  }
                  screendata.save(function(err) {
                    
                    if(err) {
                      sails.log.error("AchService#rejectContract  :: Error :: ", err);
                      return reject(err);
                    }
                    
                    //Log Activity
                    var modulename = "Loan denied";
                    var modulemessage = "Loan denied successfully";
                    req.achlog = 1;
                    req.payID = payID;
                    req.logdata = paymentmanagementdata;
                    
                    
                    Logactivity.registerLogActivity(req, modulename, modulemessage);
                    
                    //EmailService.sendDenyLoanMail(userObjectData,paymentmanagementdata);
                    var userreq = {};
                    var usersubject = "Deny Loan";
                    var userdescription = "Deny Loan email";
                    userreq.userid = userdata.id;
                    userreq.logdata = "Deny Loan to" + userdata.email;
                    Useractivity.createUserActivity(userreq, usersubject, userdescription);
                    var json = {
                      status: 200, backviewType: backviewType, message: "Loan denied successfully"
                    };
                    if(declinereason === sails.config.needsReviewReasonEnum.needsReviewReason.failedUnderwriting) {
                      EmailService.processSendingStatusEmail(EmailService.emailSendType.customerKo, paymentmanagementdata);
                      return resolve(json);
                    } else {
                      return resolve(json);
                    }
                    
                  });
                });
              });
            });
          }
        });
      });
    } else {
      var screenoptions = {
        id: screenId
      };
      Screentracking.findOne(screenoptions).populate("user").then(function(screendata) {
        
        var lastScreenName = screendata.lastScreenName;
        var lastlevel = screendata.lastlevel;
        
        
        //-- Added for back button redirect from detail page starts here
        var checkCreatedDate = moment().startOf("day").subtract(60, "days").format("MM-DD-YYYY");
        checkCreatedDate = moment(checkCreatedDate).tz("America/Los_Angeles").startOf("day").toDate().getTime();
        var loanCreartedDate = moment(screendata.createdAt).tz("America/Los_Angeles").startOf("day").toDate().getTime();
        
        var backviewType = "";
        
        
        backviewType = "/admin/showAllArchivedDenied";
        
        if(loanCreartedDate > checkCreatedDate) {
          backviewType = "/admin/showAllDenied";
        } else {
          if(screendata.moveToIncomplete) {
            if(screendata.moveToIncomplete == 1) {
              backviewType = "/admin/showAllDenied";
            }
          }
        }
        //-- Added for back button redirect from detail page ends here
        
        var idobj = {
          
          transid: screendata.transunion,
          accountid: "",
          rulesDetails: screendata.rulesDetails,
          creditscore: screendata.rulesDetails
        };
        
        
        var dataObject = {};
        var product = { product: screendata.product };
        var userDetail = { id: screendata.user.id };
        
        screendata.offerData = [{ loanamount: 0 }];
        return User.getNextSequenceValue("loan").then(function(loanRefernceData) {
          var loanRefernceDataValue = "LN_" + loanRefernceData.sequence_value;
          var logdata = [{
            message: "", date: new Date()
          }];
          
          var maturityDate = moment().startOf("day").toDate();
          var paymentSchedule = [];
          
          var payobj = {
            paymentSchedule: paymentSchedule,
            maturityDate: maturityDate,
            user: screendata.user.id,
            account: screendata.accounts,
            nextPaymentSchedule: maturityDate,
            achstatus: 2,
            declineemail: declineEmail,
            declinereason: declinereason,
            loanReference: loanRefernceDataValue,
            logs: logdata,
            deniedfromapp: 0,
            isPaymentActive: false,
            screentracking: screendata.id,
            schoolprogram: screendata.schoolprogram,
            creditScore: screendata.creditscore,
            practicemanagement: screendata.practicemanagement,
            appverified: 1,
            isDenied: true,
            moveToArchive: 0,
            status: sails.config.paymentManagementStatus.denied,
            scheduleIdSequenceCounter: 1
          };
          
          PaymentManagement.create(payobj).then(function(paymentDet) {
            var usercriteria = {
              user: screendata.user.id
            };
            User.findOne(userDetail).then(function(userdetails) {
              userdetails.isExistingLoan = false;
              userdetails.isUserProfileUpdated = false;
              userdetails.save();
              
              var consentCriteria = {
                user: userDetail, loanupdated: 1
              };
              
              UserConsent.find(consentCriteria).sort("createdAt DESC").then(function(userConsentAgreement) {
                
                _.forEach(userConsentAgreement, function(consentagreement) {
                  
                  UserConsent.updateUserConsentAgreement(consentagreement.id, userDetail, paymentDet.id);
                  
                });
              }).catch(function(err) {
                sails.log.error("Screentracking::updatedeclinedloan UserConsent error::", err);
              });
              Screentracking.findOne({
                user: userDetail.id, iscompleted: [0, 2]
              }).then(function(screenTracking) {
                
                if(screenTracking) {
                  screenTracking["rulesDetails"] = idobj.rulesDetails;
                  screenTracking["product"] = product;
                  screenTracking["incompleteverified"] = 1;
                  screenTracking["isRejectedContract"] = true;
                  if(declinereason === sails.config.needsReviewReasonEnum.needsReviewReason.failedUnderwriting) {
                    screenTracking["needsReviewedReason"] = sails.config.needsReviewReasonEnum.needsReviewReason.failedUnderwriting;
                    screenTracking["needsReviewing"] = true;
                    screenTracking["hasProgramEnded"] = false;
                    screenTracking["hasGracePeriodEnded"] = false;
                    screenTracking["hasIncomeChanged"] = false;
                    screenTracking["hasFailedUnderwriting"] = true;
                    screenTracking["iscompleted"] = 0;
                    screenTracking["lastlevel"] = 7;
                  } else {
                    screenTracking["iscompleted"] = 1;
                  }
                  screenTracking.save(function(err) {
                    
                    if(err) {
                      sails.log.error("AchService#rejectContract  :: Error :: ", err);
                      return reject(err);
                    }
                    //Log Activity
                    var modulename = "Loan denied";
                    var modulemessage = "Loan denied successfully";
                    
                    req.achlog = 1;
                    req.payID = paymentDet.id;
                    req.logdata = paymentDet;
                    
                    Logactivity.registerLogActivity(req, modulename, modulemessage);
                    //EmailService.sendDenyLoanMail(userdetails,paymentDet);
                    var userreq = {};
                    var usersubject = "Deny Loan";
                    var userdescription = "Deny Loan email";
                    userreq.userid = userdetails.id;
                    userreq.logdata = "Deny Loan to" + userdetails.email;
                    Useractivity.createUserActivity(userreq, usersubject, userdescription);
                    var json = {
                      status: 200, message: "Loan denied successfully", backviewType: backviewType
                    };
                    if(declinereason === sails.config.needsReviewReasonEnum.needsReviewReason.failedUnderwriting) {
                      EmailService.processSendingStatusEmail(EmailService.emailSendType.customerKo, paymentDet);
                      return resolve(json);
                    } else {
                      return resolve(json);
                    }
                  });
                } else {
                  return reject({ message: "Screen tracking did not update the denied status." });
                }
              }).catch((errorObj) => {
                sails.log.error("AchService#rejectContract  :: Error :: ", errorObj);
                return reject(errorObj);
              });
              
              
            }).catch((errorObj) => {
              sails.log.error("AchService#rejectContract  :: Error :: ", errorObj);
              return reject(errorObj);
            });
          }).catch((errorObj) => {
            sails.log.error("AchService#rejectContract  :: Error :: ", errorObj);
            return reject(errorObj);
          });
        }).catch((errorObj) => {
          sails.log.error("AchService#rejectContract  :: Error :: ", errorObj);
          return reject(errorObj);
        });
      }).catch((errorObj) => {
        sails.log.error("AchService#rejectContract  :: Error :: ", errorObj);
        return reject(errorObj);
      });
    }
  });
}

//deferred, principal only, ammend, normal payment
async function readjustPaymentSchedule(paymentManagement, screenTracking, newDate, isExtendLoan, originateDate = null, isAfterHoliday = 0) {
  if(!paymentManagement || !paymentManagement.paymentSchedule || paymentManagement.paymentSchedule.length === 0 || !screenTracking || !screenTracking.offerData || screenTracking.offerData.length === 0) {
    const message = "Error re-adjusting this schedule. Missing required data.";
    sails.log.error(`AchService#readjustPaymentSchedule Error: ${message}`);
    throw new Error(message);
  }
  const today = moment().startOf("day");
  const ledger = PlatformSpecificService.getPaymentLedger(paymentManagement, today.toDate());
  if(ledger) {
    // paymentManagement.loanSetDate = moment(originateDate).startOf("day").toDate();
    const oldSchedule = [];
    let nextScheduleDate = newDate ? moment(newDate).startOf("day") : null;
    if(!nextScheduleDate && ledger.nextActualPayment) {
      nextScheduleDate = moment(ledger.nextActualPayment).startOf("day");
    }
    let hasFirstPaymentScheduleSet = false;
    let nextOriginDate = moment(originateDate || paymentManagement.loanSetdate).startOf("day");
    let termUsedUp = 0;
    if([PaymentManagement.paymentManagementStatus.pending, PaymentManagement.paymentManagementStatus.origination].indexOf(paymentManagement.status) < 0) {
      _.forEach(paymentManagement.paymentSchedule, (scheduleItem, scheduleIndex) => {
        if(["PAID", "PENDING", "WAIVED"].indexOf(scheduleItem.status) >= 0 || scheduleItem.initiator === "makepayment" || (moment(scheduleItem.date).startOf("day").isSameOrBefore(today) && scheduleItem.initiator === "automatic" && ["OPENED", "OPEN"].indexOf(scheduleItem.status) >= 0 && !_.some(ledger.missedPayments, (missedPayment) => {
          return missedPayment.indexOfScheduleItem === scheduleIndex;
        }))) {
          if(scheduleItem.initiator === "automatic") {
            termUsedUp += 1;
          }
          nextOriginDate = moment(scheduleItem.date).startOf("day");
          delete scheduleItem.firstChangedSchedule;
          oldSchedule.push(scheduleItem);
        }
        // if(moment(scheduleItem.date).startOf("day").isAfter(today) && scheduleItem.initiator === "automatic" && !nextScheduleDate) {
        //     nextScheduleDate = moment(scheduleItem.date).startOf("day");
        // }
      });
    }
    
    if(!nextScheduleDate || nextScheduleDate.isSameOrBefore(today)) {// || nextScheduleDate.isBefore(nextOriginDate)) {
      const message = "Error re-adjusting this schedule. The changed date specified is invalid. This date needs to be in the future and greater than the last payment made date or loan set date.";
      sails.log.error(`AchService#readjustPaymentSchedule Error: ${message}`);
      throw new Error(message);
    }
    
    // const term = screenTracking.offerData[0].term;
    // const currentTerm = ledger.futureAppliedPayments.length;
    const termLeft = parseInt((screenTracking.offerData[0].term - termUsedUp).toString());
    if(!screenTracking.offerData[0].apr) {
      screenTracking.offerData[0]["apr"] = screenTracking.offerData[0].interestRate;
    }
    const apr = screenTracking.offerData[0].apr / 100;
    if((termLeft > 0 || isExtendLoan) && ledger.principalPayoff > 0 && nextScheduleDate && nextOriginDate) {
      let paymentScheduleObj = null;
      
      if(isExtendLoan) {
        //equal_payment_extend_loan( Orig_date, scheduled_date, beg_balance, pay_cycle, method, apr, paymentAmount, placeDateAfterHoliday = false, interestBalance= 0)
        paymentScheduleObj = await SmoothPaymentService.reExtendPaymentSchedule(nextOriginDate.toDate(), moment(nextScheduleDate).toDate(), ledger.principalPayoff, screenTracking.paymentFrequency || SmoothPaymentService.paymentFrequencyEnum.BI_WEEKLY, "daily based", apr, ledger.regularFirstFuturePayment || ledger.regularPayment, paymentManagement.scheduleIdSequenceCounter, isAfterHoliday === 1);
      } else {
        paymentScheduleObj = await SmoothPaymentService.generatePaymentSchedule(nextOriginDate.toDate(), moment(nextScheduleDate).toDate(), ledger.principalPayoff, screenTracking.paymentFrequency || SmoothPaymentService.paymentFrequencyEnum.BI_WEEKLY, "daily based", apr, termLeft, paymentManagement.scheduleIdSequenceCounter, isAfterHoliday === 1);
      }
      
      if(paymentScheduleObj && paymentScheduleObj.paymentSchedule && paymentScheduleObj.paymentSchedule.length > 0) {
        const newSchedule = _.map(paymentScheduleObj.paymentSchedule, (scheduleItem) => {
          scheduleItem.reAdjustedItem = true;
          if(!hasFirstPaymentScheduleSet) {
            scheduleItem.firstChangedSchedule = true;
            hasFirstPaymentScheduleSet = true;
          }
          return scheduleItem;
        });
        paymentManagement.scheduleIdSequenceCounter = paymentScheduleObj.scheduleIdSequenceCounter;
        paymentManagement.nextPaymentSchedule = newSchedule[0].date;
        paymentManagement.maturityDate = newSchedule[newSchedule.length - 1].date;
        paymentManagement.paymentSchedule = oldSchedule.concat(newSchedule).sort((a, b) => {
          if(moment(a.date).isBefore(moment(b.date))) {
            return -1;
          }
          if(moment(a.date).isAfter(moment(b.date))) {
            return 1;
          }
          if(a.transaction < b.transaction) {
            return -1;
          }
          if(a.transaction > b.transaction) {
            return 1;
          }
          return 0;
        });
        
        // await PaymentManagement.update({id: paymentManagement.id}, {paymentSchedule: paymentManagement.paymentSchedule, nextPaymentSchedule: paymentManagement.nextPaymentSchedule })
        return {
          paymentSchedule: paymentManagement.paymentSchedule,
          nextPaymentSchedule: paymentManagement.nextPaymentSchedule,
          scheduleIdSequenceCounter: paymentManagement.scheduleIdSequenceCounter,
          maturityDate: paymentManagement.maturityDate
        };
      }
    } else {
      return {
        paymentSchedule: paymentManagement.paymentSchedule,
        nextPaymentSchedule: paymentManagement.nextPaymentSchedule,
        scheduleIdSequenceCounter: paymentManagement.scheduleIdSequenceCounter,
        maturityDate: paymentManagement.maturityDate
      };
    }
  }
  const message = "Error re-adjusting this schedule. Unknown error occurred and the schedule was not changed.";
  sails.log.error(`AchService#readjustPaymentSchedule Error: ${message}`);
  throw new Error(message);
}

async function getAmendManualPaymentData(paymentManagement, ledger, partialPaymentScheduleItem, scheduleIndex, loggedInUser) {
  if(partialPaymentScheduleItem && partialPaymentScheduleItem.amount > 0 && scheduleIndex >= 0) {
    if(!isPaymentEligibleForActions(paymentManagement.paymentSchedule, scheduleIndex, ledger) && moment(partialPaymentScheduleItem.date).startOf("day").isSameOrBefore(moment().startOf("day"))) {
      throw new Error("This scheduled payment is not eligible for amending.");
    }
    // partialPaymentScheduleItem["isAmendPayment"] = true;
    
    const appliedPrincipal = Math.min(partialPaymentScheduleItem.amount, partialPaymentScheduleItem.principalAmount);
    let leftOverAmount = $ize(partialPaymentScheduleItem.amount - appliedPrincipal);
    
    const appliedInterest = Math.min(leftOverAmount, partialPaymentScheduleItem.interestAmount);
    leftOverAmount = $ize(leftOverAmount - appliedInterest);
    
    const scheduleUpdateObj = {
      isAmendPayment: true,
      amendAmount: partialPaymentScheduleItem.amount,
      amendPrincipal: appliedPrincipal,
      amendInterest: appliedInterest,
      status: Payment.STATUS_PENDING
    };
    // paymentManagement.paymentSchedule[scheduleIndex] = _.assign({}, paymentManagement.paymentSchedule[scheduleIndex], scheduleUpdateObj);
    // return _.assign({}, paymentManagement.paymentSchedule[scheduleIndex], scheduleUpdateObj);
    return scheduleUpdateObj;
  }
  throw new Error("This scheduled payment is not eligible for amending because of missing payment schedule data.");
}

async function getAmendPayOffPaymentData(paymentManagement, ledger, amendedPayOffAmount) {
  if(ledger) {
    
    const appliedPrincipal = Math.min(amendedPayOffAmount, ledger.principalPayoff);
    
    let leftOverAmount = $ize(amendedPayOffAmount - appliedPrincipal);
    
    const appliedInterest = Math.min(leftOverAmount, ledger.unpaidInterest);
    leftOverAmount = $ize(leftOverAmount - appliedInterest);
    
    const scheduleUpdateObj = {
      isAmendPayment: true,
      amendAmount: amendedPayOffAmount,
      amendPrincipal: appliedPrincipal,
      amendInterest: appliedInterest,
      status: Payment.STATUS_PENDING,
      isAmendPayoff: true
    };
    // paymentManagement.paymentSchedule[scheduleIndex] = _.assign({}, paymentManagement.paymentSchedule[scheduleIndex], scheduleUpdateObj);
    // return _.assign({}, paymentManagement.paymentSchedule[scheduleIndex], scheduleUpdateObj);
    return scheduleUpdateObj;
  }
}

async function processAmendManualPayment(paymentManagement, ledger, partialPaymentScheduleItem, scheduleIndex, loggedInUser) {
  // const amendedPaymentScheduleData = getAmendManualPaymentData(paymentManagement,ledger, partialPaymentScheduleItem, scheduleIndex,loggedInUser);
  // if(amendedPaymentScheduleData) {
  //     paymentManagement.paymentSchedule[scheduleIndex] = _.assign({}, paymentManagement.paymentSchedule[scheduleIndex], amendedPaymentScheduleData);
  //     // paymentManagement.paymentSchedule = amendedPaymentScheduleData;
  //     paymentManagement.paymentSchedule[scheduleIndex].status = "PENDING"
  //     await PaymentManagement.update({id: paymentManagement.id}, {paymentSchedule: paymentManagement.paymentSchedule});
  //     await addStatusLogActivity(loggedInUser,paymentManagement, `Schedule item ${Transaction.transactionTypeEnum.AMENDED}.`, `Schedule item was marked as '${Transaction.transactionTypeEnum.AMENDED}'.`);
  //     return paymentManagement.paymentSchedule;
  // }
  // return null;
}

async function processDeferredPayment(paymentManagement, screenTracking, ledger, scheduleIndexOfDeferred, loggedInUser) {
  if(paymentManagement && paymentManagement.paymentSchedule.length > scheduleIndexOfDeferred && screenTracking && screenTracking.offerData && screenTracking.offerData.length > 0 && ledger && paymentManagement.paymentSchedule[scheduleIndexOfDeferred]) {
    if(!isPaymentEligibleForActions(paymentManagement.paymentSchedule, scheduleIndexOfDeferred, ledger)) {
      throw new Error("This scheduled payment is not eligible for deferring.");
    }
    const deferredScheduleItem = _.cloneDeep(paymentManagement.paymentSchedule[scheduleIndexOfDeferred]);
    const term = screenTracking.offerData[0].term;
    const currentTerm = ledger.currentTerm;
    const termLeft = term - currentTerm;
    let paymentsLeft = [];
    let lastItemIndex = -1;
    
    let startBalance = 0;
    let endBalance = 0;
    const pastPayments = [];
    _.forEach(paymentManagement.paymentSchedule, (item, index) => {
      if(index === scheduleIndexOfDeferred) {
        endBalance = item.startBalanceAmount;
      } else {
        if(index > scheduleIndexOfDeferred && item.initiator === "automatic" && item.status === "OPENED") {
          lastItemIndex = index;
          
          startBalance = endBalance;
          endBalance = $ize(startBalance - item.principalAmount);
          
          item.startBalanceAmount = startBalance;
          item.endBalanceAfterPayment = endBalance;
          paymentsLeft.push(item);
        } else {
          pastPayments.push(item);
        }
      }
    });
    if(paymentsLeft.length > 1) {
      const lastItem = paymentManagement.paymentSchedule[lastItemIndex];
      lastItem.amount = $ize(deferredScheduleItem.amount + lastItem.amount);
      lastItem.interestAmount = $ize(deferredScheduleItem.interestAmount + lastItem.interestAmount);
      lastItem.principalAmount = $ize(deferredScheduleItem.principalAmount + lastItem.principalAmount);
      // lastItem.startBalanceAmount = $ize(lastItem.startBalanceAmount + deferredScheduleItem.principalAmount);
      lastItem.endBalanceAfterPayment = $ize(lastItem.startBalanceAmount - lastItem.principalAmount);
      lastItem.appliedAccruedInterest = lastItem.interestAmount;
      lastItem.chargedAccruedInterest = lastItem.interestAmount;
      lastItem.appliedRemainingInterest = 0;
      lastItem.appliedScheduledPrincipal = lastItem.principalAmount;
      paymentsLeft.splice(paymentsLeft.length - 1, 1, lastItem);
      //paymentsLeft.push(lastItem);
      
      const deferItem = paymentManagement.paymentSchedule[scheduleIndexOfDeferred];
      deferItem["deferredAmount"] = deferItem.amount;
      deferItem["deferredInterestAmount"] = deferItem.interestAmount;
      deferItem["deferredPrincipalAmount"] = deferItem.principalAmount;
      deferItem["deferredEndBalanceAfterPayment"] = deferItem.endBalanceAfterPayment;
      deferItem["deferredAppliedAccruedInterest"] = deferItem.appliedAccruedInterest;
      deferItem["deferredAppliedRemainingInterest"] = deferItem.appliedRemainingInterest;
      deferItem["deferredAppliedScheduledPrincipal"] = deferItem.appliedScheduledPrincipal;
      deferItem["deferredStatus"] = deferItem.status;
      
      deferItem.amount = 0;
      deferItem.interestAmount = 0;
      deferItem.principalAmount = 0;
      deferItem.endBalanceAfterPayment = deferItem.startBalanceAmount;
      deferItem.appliedAccruedInterest = 0;
      deferItem.appliedRemainingInterest = 0;
      deferItem.appliedScheduledPrincipal = 0;
      deferItem.status = Payment.STATUS_DEFERRED;
      pastPayments.push(deferItem);
      
      paymentManagement.paymentSchedule = pastPayments.concat(paymentsLeft).sort((a, b) => {
        if(moment(a.date).startOf("day").isBefore(moment(b.date).startOf("day"))) {
          return -1;
        }
        if(moment(a.date).startOf("day").isAfter(moment(b.date).startOf("day"))) {
          return 1;
        }
        if(a.transaction < b.transaction) {
          return -1;
        }
        if(a.transaction > b.transaction) {
          return 1;
        }
        return 0;
      });
      
      await PaymentManagement.update({ id: paymentManagement.id }, { paymentSchedule: paymentManagement.paymentSchedule });
      await Screentracking.update({ id: screenTracking.id }, {
        signChangeScheduleAuthorization: true
      });
      await addStatusLogActivity(loggedInUser, paymentManagement, `Defer Payment.`, `Schedule payment was deferred. Deferred amount is ${deferItem.deferredAmount}.`);
      return paymentManagement.paymentSchedule;
    }
  }
  return null;
}

async function processWaivePayment(paymentManagement, waivedPaymentScheduleIndex, loggedInUser, ignoreEligibility = false) {
  if(paymentManagement && paymentManagement.paymentSchedule.length > waivedPaymentScheduleIndex) {
    const paymentLedger = PlatformSpecificService.getPaymentLedger(paymentManagement, moment().startOf("day").toDate());
    if(!ignoreEligibility && !isPaymentEligibleForActions(paymentManagement.paymentSchedule, waivedPaymentScheduleIndex, paymentLedger)) {
      throw new Error("This scheduled payment is not eligible for waiving.");
    }
    const waivedScheduleItem = _.cloneDeep(paymentManagement.paymentSchedule[waivedPaymentScheduleIndex]);
    
    waivedScheduleItem.status = "WAIVED";
    waivedScheduleItem["waivedAmount"] = $ize(waivedScheduleItem.amount);
    waivedScheduleItem["waivedInterest"] = $ize(waivedScheduleItem.interestAmount);
    waivedScheduleItem["waivedPrincipal"] = $ize(waivedScheduleItem.principalAmount);
    
    
    paymentManagement.paymentSchedule[waivedPaymentScheduleIndex] = waivedScheduleItem;
    
    await PaymentManagement.update({ id: paymentManagement.id }, { paymentSchedule: paymentManagement.paymentSchedule });
    //transactionType, scheduleItem, paymentManagementId, userId
    
    waivedScheduleItem.amount = 0;
    waivedScheduleItem.interestAmount = 0;
    waivedScheduleItem.principalAmount = 0;
    
    await Payment.createPaymentActionTransaction(Payment.transactionTypeEnum.WAIVED, waivedScheduleItem, paymentManagement.id, paymentManagement.user.id, null);
    await addStatusLogActivity(loggedInUser, paymentManagement, `Waive Payment`, `Schedule payment was waived. Waived amount is ${waivedScheduleItem.waivedAmount}.`);
    if(paymentLedger.principalPayoff <= 0) {
      //payoff
      await changeContractStatus(paymentManagement.id, sails.config.paymentManagementAchStatus.status.COMPLETED, loggedInUser);
    }
    return paymentManagement.paymentSchedule;
  }
  return null;
}

async function waiveEntireLoan(paymentManagement, loggedInUser, isAmendPayOff = false) {
  if(paymentManagement && paymentManagement.paymentSchedule && paymentManagement.paymentSchedule.length > 0 && paymentManagement.screentracking) {
    const ledger = PlatformSpecificService.getPaymentLedger(paymentManagement, moment().startOf("day").toDate());
    let waivedObj = {
      totalWaived: 0, totalWaivedInterest: 0, totalWaivedPrincipal: 0
    };
    const newPaymentSchedule = [];
    const paymentsLeftOver = ledger.missedPayments.concat(ledger.futureAppliedPayments);
    _.forEach(paymentManagement.paymentSchedule, (scheduleItem, loopIndex) => {
      if(_.some(paymentsLeftOver, (futurePayment) => {
        return futurePayment.indexOfScheduleItem === loopIndex || futurePayment.scheduleIndex === loopIndex;
      })) {
        waivedObj.totalWaived = $ize(waivedObj.totalWaived + scheduleItem.amount);
        waivedObj.totalWaivedInterest = $ize(waivedObj.totalWaivedInterest + scheduleItem.interestAmount);
        waivedObj.totalWaivedPrincipal = $ize(waivedObj.totalWaivedPrincipal + scheduleItem.principalAmount);
        scheduleItem.status = "WAIVED";
        scheduleItem["waivedAmount"] = scheduleItem.amount;
        scheduleItem["waivedInterest"] = scheduleItem.interestAmount;
        scheduleItem["waivedPrincipal"] = scheduleItem.principalAmount;
        scheduleItem["fromWaiveLoan"] = true;
      }
      newPaymentSchedule.push(scheduleItem);
    });
    if(!isAmendPayOff) {
       await PaymentManagement.update({ id: paymentManagement.id }, { paymentSchedule: newPaymentSchedule, hasWaivedLoan: true });
      await Payment.createPaymentActionTransaction(Payment.transactionTypeEnum.LOAN_WAIVED, {
        date: moment().startOf("day").toDate(),
        amount: waivedObj.totalWaived,
        status: "WAIVED",
        interestAmount: waivedObj.totalWaivedInterest,
        principalAmount: waivedObj.totalWaivedPrincipal,
        waivedInterest: waivedObj.totalWaivedInterest,
        waivedPrincipal: waivedObj.totalWaivedPrincipal,
        waivedAmount: waivedObj.totalWaived
      }, paymentManagement.id, paymentManagement.user.id, null);
      await changeContractStatus(paymentManagement.id, sails.config.paymentManagementAchStatus.status.COMPLETED, loggedInUser);
      await addStatusLogActivity(loggedInUser, paymentManagement, `Waive Loan`, `This loan was marked as waived with remaining amount of ${waivedObj.totalWaived}.`);
    }
  
    return newPaymentSchedule;
  }
  return null;
}

function isPaymentEligibleForActions(paymentSchedule, scheduleIndex, ledger) {
  if(paymentSchedule && ledger && scheduleIndex >= 0) {
    const results = scrapePaymentsScheduleActionEligibility(paymentSchedule, ledger);
    return results && results.length > 0 && results[scheduleIndex] && results[scheduleIndex].firstPaymentActionEligible;
  }
  return false;
}

function scrapePaymentsScheduleActionEligibility(paymentSchedule, paymentLedger, isWaiveLoan = false, dontShowPaidForDisplay = true) {
  if(paymentSchedule && paymentSchedule.length > 0) {
    let eligibleList = [];
    if(paymentLedger) {
      if(paymentLedger.missedPayments && paymentLedger.missedPayments.length > 0) {
        eligibleList = paymentLedger.missedPayments.map((missedPayment) => {
          // if(missedPayment.eligibleForPaymentActions) {
          return missedPayment.indexOfScheduleItem;
          // }
          //  return -1;
        });
      }
      if(paymentLedger.futureAppliedPayments.length > 0) {
        const filteredList = _.filter(paymentLedger.futureAppliedPayments, (futurePayment) => {
          return (futurePayment.initiator !== "automatic" && (!futurePayment.scheduleItem.isAmendPayment || ["OPENED", "OPEN", "LATE", "DECLINED", "RETURNED"].indexOf(futurePayment.scheduleItem.status) >= 0));
        });
        if(filteredList) {
          const firstFuturePayment = filteredList[0];
          eligibleList.push(firstFuturePayment.scheduleIndex);
        }
      }
    }
    const newPaymentSchedule = [];
    let nextPayment = false;
    let firstPaymentActionEligible = false;
    _.forEach(paymentSchedule, (scheduleItem, index) => {
      delete scheduleItem["firstPaymentActionEligible"];
      delete scheduleItem["scheduleItemIsPaidInThePast"];
      if(eligibleList && eligibleList.indexOf(index) >= 0) {
        if([Payment.STATUS_DEFERRED, Payment.STATUS_WAIVED, Payment.STATUS_PENDING, Payment.STATUS_PAID].indexOf(scheduleItem.status) < 0) {
          if(!firstPaymentActionEligible && eligibleList[0] === index) {
            firstPaymentActionEligible = true;
            scheduleItem["firstPaymentActionEligible"] = true;
          }
          scheduleItem["isPaymentActionEligible"] = true;
        }
      } else if(moment(scheduleItem.date).startOf("day").isSameOrBefore(moment().startOf("day")) && scheduleItem.initiator === "automatic") {
        scheduleItem["scheduleItemIsPaidInThePast"] = true;
      }
      const pastDuePayment = _.find(paymentLedger.missedPayments, (item) => {return item.indexOfScheduleItem === index});
      if (pastDuePayment) {

      }
      // const isAfter = moment(scheduleItem.date).startOf("day").isAfter(moment().startOf("day")) && !nextPayment;
      //
      // if(isAfter && [Payment.STATUS_DEFERRED, Payment.STATUS_WAIVED].indexOf(scheduleItem.status) < 0 && scheduleItem.initiator !== "makepayment") {
      //
      //     if(paymentLedger.futureAppliedPayments.length > 0) {
      //
      //     }
      //     if(!firstPaymentActionEligible) {
      //         firstPaymentActionEligible = true;
      //         scheduleItem["firstPaymentActionEligible"] = true;
      //     }
      //         nextPayment = true;
      //     scheduleItem["isPaymentActionEligible"] = true
      // }
      if(scheduleItem.isAmendPayment) {
        // previewResults.newScheduleItem.amendAmount = amendData.amendAmount;
        // previewResults.newScheduleItem.amendInterest = amendData.amendInterest;
        // previewResults.newScheduleItem.amendPrincipal = amendData.amendPrincipal;
        scheduleItem.amount = scheduleItem.amendAmount;
        scheduleItem.interestAmount = scheduleItem.amendInterest;
        scheduleItem.principalAmount = scheduleItem.amendPrincipal;
      }
      // if(!!scheduleItem.transactionId ) {
      //     const transactionFound = _.find(loanTransactions, (transaction) => {return transaction.id === scheduleItem.transactionId});
      //     if(transactionFound) {
      //         scheduleItem.status = transactionFound.status;
      //     }
      // }
      switch(scheduleItem.status) {
        case "OPEN":
        case "OPENED":
          scheduleItem.statusForDisplay = "Scheduled";
          break;
        case "PENDING":
          scheduleItem.statusForDisplay = "Pending";
          break;
        case "PAID":
          scheduleItem.statusForDisplay = scheduleItem.isAmendPayment ? "Amended" : "Paid";
          if (pastDuePayment) {
            scheduleItem.statusForDisplay = "Applied to first past due";
          }
          break;
        case "WAIVED":
          scheduleItem.statusForDisplay = "Waived";
          break;
        case "DEFERRED":
          scheduleItem.statusForDisplay = "Deferred";
          break;
        case "DECLINED":
          scheduleItem.statusForDisplay = "Declined";
          break;
        default:
          scheduleItem.statusForDisplay = "";
          break;
      }
      delete scheduleItem["dontShowPaidForDisplay"];
      if(dontShowPaidForDisplay && (([Payment.STATUS_DEFERRED, Payment.STATUS_WAIVED].indexOf(scheduleItem.status) >= 0 || scheduleItem.isAmendPayment || (!_.some(paymentLedger.missedPayments, (missedPayments) => {
        return missedPayments.indexOfScheduleItem === index;
      }) && !_.some(paymentLedger.futureAppliedPayments, (futureAppliedPayment) => {
        return futureAppliedPayment.scheduleIndex === index;
      }))))) {
        //|| (isWaiveLoan && (scheduleItem.initiator !== "automatic" || scheduleItem.status !== Payment.STATUS_WAIVED)))) {
        
        scheduleItem["dontShowPaidForDisplay"] = dontShowPaidForDisplay;
      }
      newPaymentSchedule.push(scheduleItem);
      // if((moment(scheduleItem.date).startOf("day").isAfter(moment().startOf("day")) && scheduleItem.initiator === "automatic")
      //         || scheduleItem.initiator === "makepayment" || scheduleItem.isAmendPayment && [Payment.STATUS_WAIVED, Payment.STATUS_DEFERRED].indexOf(scheduleItem.status) < 0 ) {
      //     newPaymentSchedule.push(scheduleItem);
      // }
    });
    
    return newPaymentSchedule;
  }
  return paymentSchedule;
}

async function processChangeSchedule(paymentManagement, firstPaymentDateString, sendEmail, isExtendLoan = false, originateDate = null, isAfterHoliday = null) {
  
  const user = paymentManagement.user;
  console.log("===========user.email===================>>>>>", user.email, user);
//=================
  if(!firstPaymentDateString || !paymentManagement) {
    const errorMessage = "Missing required data to save and generate a payment schedule.";
    sails.log.error("AchController#savePaymentScheduleChanges :: err - ", errorMessage);
    return res.status(400).json({
      message: errorMessage
    });
  }
  const firstPaymentDate = moment(firstPaymentDateString).startOf("day");
  if(firstPaymentDate.isSameOrBefore(moment().startOf("day"))) {
    const errorMessage = "The date entered has to be greater than today in order to change this schedule.";
    sails.log.error("AchController#savePaymentScheduleChanges :: err - ", errorMessage);
    return res.status(400).json({
      message: errorMessage
    });
  }
  if(isAfterHoliday === null || isAfterHoliday === undefined || isAfterHoliday < 0) {
    isAfterHoliday = paymentManagement.isAfterHoliday || 0;
  }
  const newScheduleObj = await readjustPaymentSchedule(paymentManagement, paymentManagement.screentracking, firstPaymentDate.toDate(), isExtendLoan, originateDate, isAfterHoliday);
  
  if(newScheduleObj && newScheduleObj.paymentSchedule && newScheduleObj.paymentSchedule.length > 0) {
    // await PaymentService.updatePaymentSchedule(payID);
    
    if(sendEmail && !isExtendLoan) {
      return new Promise((resolve, reject) => {
        const hostName = mailerConfig.hostName, activationLink = hostName + "/login";
        const emailObj = {
          // layout should be false, if you only need the partial
          layout: false,
          link: activationLink,
          user: user,
          startdate: firstPaymentDateString,
          amountfinance: paymentManagement.screentracking.offerData[0].loanAmount
        };
        sails.renderView("emailTemplates/changeShedule", emailObj, function(err, view) {
          if(err) {
            sails.log.error("Email template rendering error", err);
            reject(err);
          } else {
            // Change all the values to configurable options
            // Log messages
            var mailer = mailerConfig.contactAccount, mailOptions = {
              from: mailerConfig.sender, to: user.email, subject: "Changed Payment Schedule", html: view
            };
            
            // send email
            mailer.sendMail(mailOptions, function(error, info) {
              if(error) {
                sails.log.error("Mailer error", error);
                console.log("Mailer error", error);
                reject(error);
              }
              sails.log.info("Message sent: ", info);
              resolve(info);
              //console.log('Message %s sent: %s', info.messageId, info.response);
            });
          }
        });
      }).then((results) => {
        return newScheduleObj;
      });
    }
  }
  return newScheduleObj;
}

async function originateLoan(paymentManagement, loggedInUser) {
  if(!paymentManagement) {
    return null;
  }
  if(paymentManagement.status !== PaymentManagement.paymentManagementStatus.origination) {
    throw new Error(`This loan can not be originated. The loan needs to be in the '${PaymentManagement.paymentManagementStatus.origination}' status.`);
  }
  if(!paymentManagement.loanSetdate || !moment(paymentManagement.loanSetdate).startOf("day").isSame(moment().startOf("day"))) {
    throw new Error(`The loan can not be originated. The origination date is different from today. A payment schedule change is required.`);
  }
  return changeContractStatus(paymentManagement.id, PaymentManagement.paymentManagementStatus.pending, loggedInUser);
}

async function getFreshLeadsList(columnTypeList, matchCriteria, searchValue = null, searchFilters = [], orderObj = null, offset = "1", limit = "100") {
  let columnsToShow = CubeListService.getColumnsToShow(columnTypeList);
  return await CubeListService.lookupDataWithAggregate([{
    $lookup: {
      from: "user", localField: "user", foreignField: "_id", as: "userData"
    }
  }, {
    $unwind: "$userData"
  }, {
    $lookup: {
      from: "paymentmanagement", localField: "_id", foreignField: "screentracking", as: "paymentData"
    }
  }, {
    $unwind: {
      path: "$paymentData", preserveNullAndEmptyArrays: true
    }
  }, {
    $match: CubeListService.processFiltering(matchCriteria, searchFilters, searchValue, columnsToShow)
  }, {
    $facet: {
      overallTotal: [{ $count: "overallTotalCount" }],
      screenData: [{ $sort: CubeListService.processListSort(orderObj, columnTypeList) }, { $skip: parseInt(offset || "0") }, { $limit: parseInt(limit || "100") }]
    }
  }], columnTypeList, Screentracking, "screenData");
}

function getFreshLeadsCount(matchCriteria) {
  return new Promise((resolve, reject) => {
    Screentracking.native(function(err, collection) {
      collection.aggregate([{
        $lookup: {
          from: "user", localField: "user", foreignField: "_id", as: "userData"
        }
      }, {
        $unwind: "$userData"
      }, {
        $lookup: {
          from: "paymentmanagement", localField: "_id", foreignField: "screentracking", as: "paymentData"
        }
      }, {
        $unwind: {
          path: "$paymentData", preserveNullAndEmptyArrays: true
        }
      }, {
        $match: matchCriteria
      }, // {
        //     $facet: {
        //         overallTotal: [
        //             { $count: "overallTotalCount" }
        //         ],
        //         screenData: [
        //             { $skip: parseInt( offset || "0" ) },
        //             { $limit: parseInt( limit || "100" ) }
        //         ]
        //     }
        // }
        {
          $count: "overallTotal"
        }], function(err, screenCountArray) {
        if(err) {
          return reject(err);
        }
        if(screenCountArray && screenCountArray.length > 0) {
          return resolve(screenCountArray[0].overallTotal);
        } else {
          return resolve(0);
        }
        // THIS CODE FIXES _.sortBy sorting issue (if a string starts with "C" the sorting doesnt work right)
        
      });
    });
  });
}

async function changeLoanDetailsWithScheduleChange(paymentId, term, requestedLoanAmount) {
  if(!paymentId || (!term && !requestedLoanAmount)) {
    throw new Error("Unable to change loan details. Missing required data");
  }
  const paymentManagement = await PaymentManagement.findOne({ id: paymentId }).populate("screentracking").populate("user");
  if(paymentManagement && paymentManagement.screentracking && paymentManagement.screentracking.offerData && paymentManagement.screentracking.offerData.length > 0) {
    const offerData = paymentManagement.screentracking.offerData[0];
    
    const existingTerm = offerData.term;
    const existingRequestedLoanAmount = paymentManagement.screentracking.requestedLoanAmount;
    const screenTrackingUpdateObj = {};
    if(!!term && (!existingTerm || parseInt(term) !== existingTerm)) {
      offerData.term = parseInt(term);
      screenTrackingUpdateObj["offerData"] = [offerData];
    }
    if(!!requestedLoanAmount && (!existingRequestedLoanAmount || $ize(requestedLoanAmount) !== existingRequestedLoanAmount)) {
      screenTrackingUpdateObj["requestedLoanAmount"] = $ize(requestedLoanAmount);
      offerData.financedAmount = screenTrackingUpdateObj.requestedLoanAmount;
      screenTrackingUpdateObj["offerData"] = [offerData];
    }
    
    if(Object.keys(screenTrackingUpdateObj).length > 0) {
      await Screentracking.update({ id: paymentManagement.screentracking.id }, screenTrackingUpdateObj);
      _.assign(paymentManagement.screentracking, screenTrackingUpdateObj);
      return { hasChanged: true, paymentManagement: paymentManagement };
    } else {
      return { hasChanged: false, paymentManagement: paymentManagement };
    }
  }
  throw new Error("Unable to change loan details. Loan or offer data was not found.");
}

async function getAllUsersList(columnTypeList, matchCriteria, searchValue = null, searchFilters = [], orderObj = null, offset = "1", limit = "100") {
  let columnsToShow = CubeListService.getColumnsToShow(columnTypeList);
  return await CubeListService.lookupDataWithAggregate([{
    $lookup: {
      from: "user", localField: "user", foreignField: "_id", as: "userData"
    }
    }, {
      $unwind: "$userData"
    }, {
      $lookup: {
        from: "paymentmanagement", localField: "_id", foreignField: "screentracking", as: "paymentData"
      }
    }, {
      $unwind: {
        path: "$paymentData", preserveNullAndEmptyArrays: true
      }
    }, {
      $match: CubeListService.processFiltering(matchCriteria, searchFilters, searchValue, columnsToShow)
    }, {
      $facet: {
        overallTotal: [{ $count: "overallTotalCount"}],
        screenData: [
          { $sort: CubeListService.processListSort(orderObj, columnTypeList) },
          { $skip: parseInt(offset || "0") },
          { $limit: parseInt(limit || "100")}
          ]
      }
    }],
    columnTypeList, User, "userData"
  );
}

async function manualPaymentStatusUpdate( pmtRef, status, loggedInUser, declineCode, declineReason ) {
    const payment = await Payment.findOne({pmtRef: pmtRef});
    if (!payment) {
      sails.log.error("AchService#manualPaymentStatusUpdate :: Error : No payment was found to update status");
      throw new Error("No such payment exists");
    } else if (status != Payment.STATUS_DECLINED && status != Payment.STATUS_PAID) {
      //Status can only be changed to DECLINED or PAID
      sails.log.error(`AchService#manualPaymentStatusUpdate :: Error : Payment ${pmtRef} status could not be changed due to invalid status.`)
      throw new Error("Invalid payment status.");
    }
    let updateObj = {
      status: status,
      errReason: declineReason,
    }
    await Payment.update({id: payment.id}, updateObj)
    const logReferenceData = await User.getNextSequenceValue( "logs" );
    const logReference = `LOG_${logReferenceData.sequence_value}`;
    const paymentManagement = await PaymentManagement.findOne({id: payment.paymentmanagement})
    const rejectCodes = sails.config.nacha.returnCodesToStopACH
    let disableAutoAch = (rejectCodes.indexOf(declineCode) >=0)
    if (disableAutoAch) {
      await PaymentManagement.update({id: paymentManagement.id}, {disableAutoAch: disableAutoAch, declinereason: declineReason, disableAchMoveToCollections: true});
    }
    let logMessage= `Payment Transaction status for payment ${payment.pmtRef} was changed from ${payment.status} to ${status}.`
    await Logactivity.create( {
      modulename: "Payment Status Manual Change",
      logmessage: logMessage,
      logreference: logReference,
      paymentManagement: paymentManagement.id
    } );
    _.assign(payment, { status: status });
    await PaymentService.updatePaymentScheduleForPaymentStatus(payment);
    sails.log.warn("AchService#manualPaymentStatusUpdate :: Manual Override: ", logMessage);
    return
}

async function toggleAutoAch(id, disableAutoAch) {
  const paymentManagement = await PaymentManagement.findOne({id: id});
  if (!paymentManagement) {
    sails.log.error("AchService#toggleAutoAch :: Error : No PaymentManagement was found.");
    throw new Error("No PaymentManagement data found.");
  }
  await PaymentManagement.update({id: id}, {disableAutoAch: disableAutoAch});

  const logReferenceData = await User.getNextSequenceValue( "logs" );
  const logReference = `LOG_${logReferenceData.sequence_value}`;
  let logMessage =  disableAutoAch ? `Automatic ACH Processing on Loan ${paymentManagement.loanReference} was disabled` : `Automatic ACH Processing on Loan ${paymentManagement.loanReference} was re-enabled.`;
  await Logactivity.create( {
    modulename: "Automatic ACH ",
    logmessage: logMessage,
    logreference: logReference,
    paymentManagement: id
  });
  sails.log.warn("AchService#toggleAutoAch :: AutoACH: ", logMessage);
  return
}