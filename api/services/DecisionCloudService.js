"use strict";

const	_ = require("lodash"),
	moment = require("moment");


module.exports = {
	saveApplicationToScreenTracking: async (screenTrackingCreateObj, user, employment, req,res) => {
		if(!user || !user.id || !employment || !screenTrackingCreateObj) {
			const errorMessage = "Missing required data for saving employment.";
			sails.log.error("DecisionCloudService#saveApplicationToScreenTracking :: Error ", errorMessage);
			return Promise.reject({status: 400, message:errorMessage })
		}
		const appReference = await User.getNextSequenceValue( "application" );

		if(!appReference && !appReference.sequence_value) {
			const errorMessage = "Unable to get generate application reference.";
			sails.log.error("DecisionCloudService#saveApplicationToScreenTracking :: Error ", errorMessage);
			return Promise.reject({status: 400, message:errorMessage })
		}

		let currentIncome = 0;
		let payFreq = "";
		if (employment.periodicity == "B") {
			currentIncome = employment.currentIncome * 26 / 12;
			payFreq = "Bi-weekly";
		} else if(employment.periodicity == "M") {
			currentIncome = employment.currentIncome;
			payFreq = "Monthly";
		} else if(employment.periodicity == "D") {
			currentIncome = employment.currentIncome * 2;
			payFreq = "Semi-monthly";
		} else if (employment.periodicity == "W") {
			currentIncome = employment.currentIncome * 52 / 12;
			payFreq = "Weekly";
		}
		const practiceManagement = await PracticeManagement.findOne({id:sails.config.product.defaultPracticeManagementId });
		const loanPracticeSettings = {
			requiredNumberOfPayments: practiceManagement.requiredNumberOfPayments || 24,
			interestRatioAmount: practiceManagement.interestRatioAmount || 100,
			interestRatioFee: practiceManagement.interestRatioFee || 30,
			interestRatioWindowDays: practiceManagement.interestRatioWindowDays || 7
		};
		const screenTrackingMergeData = {
			practicemanagement: sails.config.product.defaultPracticeManagementId,
			user: user.id,
			iscompleted: 0,
			product: sails.config.product.productid,
			blockedList: false,
			filloutmanually: 0,
			isAccountLinked: 0,
			isBankAdded: 0,
			loanchangeManually: 0,
			loanchanged: 0,
			moveToIncomplete:1,
			incompleteverified: 1,
			incompleteEmailSent: 0,
			moveToArchive: 0,
			borrowerapplication: 0,
			detectedPayroll: 0,
			incomeamount: currentIncome,

			applicationReference: `APL_${appReference.sequence_value}`,
			esignatureStatus: Screentracking.esignatureStatus.UNSIGNED,
			loanPracticeSettings: loanPracticeSettings,
			offerdata:[
				{
					interestRate: 23.3,
					term: 24,
					paymentFrequency: payFreq,
					monthlyPayment: 134.53,
					downPayment: 384.32,
					apr: 73,
					financeCharge: 3.48,
					financedAmount: screenTrackingCreateObj.requestedLoanAmount,
					loanAmount: screenTrackingCreateObj.requestedLoanAmount,
				}
			]
		};
		_.assign(screenTrackingMergeData, screenTrackingCreateObj);
		const screenTrackingCreateResponse = await Screentracking.create(screenTrackingMergeData);
		const paymentManagementUpdateResponse = await generatePaymentSchedule(screenTrackingCreateResponse);
		if(!paymentManagementUpdateResponse){
			throw Error( `Unable to create loan from application '${screenTrackingMergeData.applicationReference}'. An unknown error occurred while trying to create payment schedule.` );
		}
		paymentManagementUpdateResponse.email = user.email;
		EmailService.processSendingStatusEmail(EmailService.emailSendType.partnerCompletedApplication, paymentManagementUpdateResponse);
		return screenTrackingCreateResponse
	},
	saveEmployment(employerUpdateData, user) {
		if(!user || !user.id || !employerUpdateData ) {
			const errorMessage = "Missing required data for saving employment.";
			sails.log.error("DecisionCloudService#saveApplicationToScreenTracking :: Error ", errorMessage);
			return Promise.reject({status: 400, message: errorMessage })
		}else {
			
			//employerUpdateData["screenTracking"] = screenTracking.id;
			employerUpdateData["user"] = user.id;
			return EmploymentHistory.create(employerUpdateData)
		}
	},
	saveReference(referenceUpdateData, screenTracking) {
		if(!screenTracking || !referenceUpdateData) {
			const errorMessage = "Missing required data for saving reference.";
			sails.log.error("DecisionCloudService#saveReference :: Error", errorMessage);
			return Promise.reject({status: 400, message: errorMessage})
		} else {
			referenceUpdateData["screenTracking"] = screenTracking.id;
			return References.createreference(referenceUpdateData)
		}
	}
};

async function generatePaymentSchedule(screentracking) {
	try {
		const previousPaymentDetails = await PaymentManagement.findOne( { screentracking: screentracking.id } );
		if(!previousPaymentDetails) {
			const paymentDetails = await PaymentManagement.createLoanPaymentSchedule( screentracking );
			if(!paymentDetails) {
				return null;
			}
			await Screentracking.update( { id: screentracking.id }, {
				paymentmanagement: paymentDetails.id
			} );
			return paymentDetails
		} else {
			const paymentDetails = await PaymentService.updatePaymentSchedule( previousPaymentDetails.id );
			if(!paymentDetails) {
				throw Error( `An unknown error occurred while trying to create payment schedule for loan '${screentracking.applicationReference}'` );
			}
			return paymentDetails
		}
	}catch(exc) {
		sails.log.error("DecisionCloudService#generatePaymentSchedule:: err ", exc);
		throw exc;
	}
}
