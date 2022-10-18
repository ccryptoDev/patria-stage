"use strict";

const moment = require( "moment" );
const _ = require( "lodash" );
const htmlEntitiesLibrary = require( "html-entities" ).AllHtmlEntities;
const htmlEntities = new htmlEntitiesLibrary();

module.exports = {
	validateUserExists: async( email, ssn ) => {
		const userData = await User.findOne( {
			email: email.trim(),
			ssn_number: ssn.trim()
		} );
		return !!userData;
	},
	getCurrentLoanStatus: async( loanId, ssn ) => {
		const responseObj = {};
		const screenTrackingQuery = {};
		if(!!loanId) {
			responseObj["loanId"] = loanId;
			screenTrackingQuery["applicationReference"] = loanId;
		} else if(!!ssn) {
			//responseObj["ssn"] = ssn;
			const userFound = await User.findOne( {
				ssn_number: ssn.trim()
			} );
			screenTrackingQuery["user"] = "";
			if(userFound) {
				screenTrackingQuery.user = userFound.id;
			}
		}
		const screentracking = await Screentracking.findOne( screenTrackingQuery ).populate( "paymentmanagement" );
		if(screentracking) {
			if(!!ssn){
				responseObj["loanId"] = screentracking.applicationReference;
			}

			let loanStatus = PaymentManagement.paymentManagementStatus.incomplete;
			if(screentracking.iscompleted === 1 && screentracking.paymentmanagement && !!screentracking.paymentmanagement.status) {
				loanStatus = screentracking.paymentmanagement.status;
			}
			_.assign( responseObj, {
				loanAmount: screentracking.requestedLoanAmount,
				eSignatureStatus: [],
				loanStatus: loanStatus,
				applicationDate: screentracking.applicationDate
			} );
			const agreements = await Agreement.find( { practicemanagement: screentracking.practicemanagement } );
			if(agreements) {
				for(const agreement of agreements) {
					const foundUserConsents = await UserConsent.find( {
						agreement: agreement.id,
						user: screentracking.user
					} ).sort( "signedAt DESC" );
					if(foundUserConsents && foundUserConsents.length > 0) {
						const userConsent = foundUserConsents[0];
						responseObj.eSignatureStatus.push( {
							documentId: agreement.id,
							eSignatureStatus: userConsent.esignatureStatus || Screentracking.esignatureStatus.UNSIGNED,
							consentId: userConsent.id
						} );
					} else {
						responseObj.eSignatureStatus.push( {
							documentId: agreement.id,
							eSignatureStatus: Screentracking.esignatureStatus.UNSIGNED
						} );
					}
				}
			}
			return responseObj;
		}
		return null;
	},
	getDocumentsForSigning: async( loanId, ssn, req ) => {
		const responseMessage = {};
		const screenTrackingQuery = {};
		if(!!loanId) {
			responseMessage["loanId"] = loanId;
			screenTrackingQuery["applicationReference"] = loanId;
		} else if(!!ssn) {
			responseMessage["ssn"] = ssn;
			const userFound = await User.findOne( {
				ssn_number: ssn.trim()
			} );
			screenTrackingQuery["user"] = "";
			if(userFound) {
				screenTrackingQuery.user = userFound.id;
			}
		}
		const screentracking = await Screentracking.findOne( screenTrackingQuery ).populate( "paymentmanagement" ).populate( "user" );
		if(screentracking) {
			responseMessage["loanId"] = screentracking.applicationReference;
			responseMessage["documents"] = [];
			const agreements = await Agreement.find( { practicemanagement: screentracking.practicemanagement } );
			const promissoryNoteData = await ApplicationService.getPromissoryNoteData( req, screentracking.id, screentracking.user.id );
			promissoryNoteData["totalPaymentsPrincipalAmount"] = screentracking.paymentmanagement.totalPaymentsPrincipalAmount;
			promissoryNoteData["totalPaymentsFeeChargeAmount"] = screentracking.paymentmanagement.totalPaymentsFeeChargeAmount;
			promissoryNoteData["totalPaymentsFinancedAmount"] = screentracking.paymentmanagement.totalPaymentsFinancedAmount;
			promissoryNoteData["apr"] = screentracking.paymentmanagement.apr;
			const accountInfo = await Account.findOne(screentracking.accounts);
			promissoryNoteData["bankName"] = accountInfo.accountName;
			promissoryNoteData["bankRoutingNumber"] = accountInfo.routingNumber;
			promissoryNoteData["bankAccountNumber"] = accountInfo.accountNumber;
			let header = promissoryNoteData.phoneNumber.slice(0, 3);
			let mid = promissoryNoteData.phoneNumber.slice(3, 6);
			let last = promissoryNoteData.phoneNumber.slice(6);
			promissoryNoteData.phoneNumber = '(' + header + ')' + ' ' + mid + '-' + last;
			promissoryNoteData.loanamount = !!screentracking.offerdata[0].loanAmount ? screentracking.offerdata[0].loanAmount: 0;
			if(agreements && promissoryNoteData) {
				const agreementPromises = [];
				for(let agreement of agreements) {
					agreementPromises.push( new Promise( ( resolve, reject ) => {
						//{screentracking: screentracking,user:screentracking.user}
						sails.renderView( agreement.documentPath, promissoryNoteData, ( errorObj, documentContent ) => {
							const documentResponse = {
								documentId: agreement.id,
								documentName: agreement.documentName,
								content: ""
							};
							if(errorObj) {
								documentResponse["error"] = { message: errorObj.message };
							} else {
								documentResponse.content = htmlEntities.encode( documentContent.replace( /(\r\n|\n|\r)/gm, "" ) );
							}
							return resolve( documentResponse );
						} );

					} ) );
				}
				responseMessage["documents"] = await Promise.all( agreementPromises );
			}
			return responseMessage;
		}
		return null;
	},
	saveDocumentSignature: async( loanId, ssn, eSignatures, agreementCheckboxes, req, res, useThisScheduleObj = null ) => {
		const responseMessage = {};
		const screenTrackingQuery = {};
		let lookupLogString = "";
		if(!!loanId) {
			lookupLogString = `loan id: ${loanId}`;
			responseMessage["loanId"] = loanId;
			screenTrackingQuery["applicationReference"] = loanId;
		} else if(!!ssn) {
			lookupLogString = `ssn: ${ssn}`;
			responseMessage["ssn"] = ssn;
			const userFound = await User.findOne( {
				ssn_number: ssn.trim()
			} );
			screenTrackingQuery["user"] = "";
			if(userFound) {
				screenTrackingQuery.user = userFound.id;
			}
		}
		const screentrackingdetails = await Screentracking.findOne( screenTrackingQuery ).populate( "paymentmanagement" ).populate( "user" );
		if(screentrackingdetails && screentrackingdetails.paymentmanagement) {
			// if(screentrackingdetails.iscompleted === 1){
			// 	throw Error( `Loan '${screentrackingdetails.applicationReference}' must be in an incomplete status in order to sign. If this loan has already been signed, changes requiring signature must mark it as incomplete again before signing.` );
			// }
			responseMessage["loanId"] = screentrackingdetails.applicationReference;
			if(eSignatures.length > 0) {
				responseMessage["documents"] = [];
				sails.log.info( "FoxHillsIntegrationService#saveDocumentSignature userId", screentrackingdetails.user.id );
				const applicationReference = screentrackingdetails.applicationReference;
				const userReference = screentrackingdetails.user.userReference;

				req.session.applicationReference = applicationReference;
				req.session.userReference = userReference;
				const screenId = screentrackingdetails.id;
				const agreements = await Agreement.find( { practicemanagement: screentrackingdetails.practicemanagement, documentKey: '200' } );
				if(agreements.length > 0) {
					for( let agreement of agreements ){
						const eSignatureData = _.find( eSignatures, ( esignature ) => {
							if(eSignatures.length === 1 && !esignature.documentId) {
								return true;
							}
							return esignature.documentId === agreement.id;
						} );
						const userconsentdetails = await UserConsent.createConsent( agreement, screentrackingdetails.user, eSignatureData.ipAddress, screenId, null, agreementCheckboxes );
						const consentId = userconsentdetails.id;
						let signedDocumentResponse = { documentId: agreement.id };
						const objectdatas = await UserConsent.objectdataforpromissory( screentrackingdetails.user.id, req, res, agreement );
						userconsentdetails.applicationReference = applicationReference;
						userconsentdetails.userReference = userReference;

						const signedUserConsent = await UserConsent.createPromissoryAgreementPdf( consentId, screenId, screentrackingdetails.user.id, userconsentdetails, objectdatas, eSignatureData, req, res, useThisScheduleObj );
						const isReSigned = screentrackingdetails.hasESigned;
						const eSignedDate = eSignatureData.eSignedDate?moment(eSignatureData.eSignedDate): moment();
						await Screentracking.update({id: screentrackingdetails.id},{hasESigned: true, eSignatureDate: eSignedDate.toDate(), esignatureStatus: isReSigned?Screentracking.esignatureStatus.RESIGNED:Screentracking.esignatureStatus.SIGNED});
						if(signedUserConsent) {
							signedDocumentResponse = {
								documentId: agreement.id,
								consentId: signedUserConsent.id,
								status: `${isReSigned ? "Re-signing " : ""}ESignature Saved Successfully.`,
								code: 200
							};
						} else {
							signedDocumentResponse = {
								documentId: agreement.id,
								status: `${isReSigned ? "Re-signing " : ""}ESignature Saved Failed.`,
								code: 500
							};
						}
						responseMessage["documents"].push( signedDocumentResponse );
					
				}
			}
				if(!useThisScheduleObj) {
					await updateScreenTrackingStatus(screentrackingdetails, screentrackingdetails.paymentmanagement);
				}
				if(screentrackingdetails.paymentmanagement) {
					responseMessage["loanStatus"] = PaymentManagement.paymentManagementStatus.origination;
				}
				return responseMessage;
			} else {
				throw Error( `E-signatures in the request are required for saving` );
			}
		}
		throw Error( `We were unable save signatures because the loan was not found for criteria '${lookupLogString}'.` );
	},
	getSignedDocuments: async( loanId, ssn, documentIds = null ) => {
		const screenTrackingQuery = {};
		const responseMessage = {};
		if(!!loanId) {
			responseMessage["loanId"] = loanId;
			screenTrackingQuery["applicationReference"] = loanId;
		} else if(!!ssn) {
			responseMessage["ssn"] = ssn;
			const userFound = await User.findOne( {
				ssn_number: ssn.trim()
			} );
			screenTrackingQuery["user"] = "";
			if(userFound) {
				screenTrackingQuery.user = userFound.id;
			}
		}
		const screenTrackingDetail = await Screentracking.findOne( screenTrackingQuery );
		if(screenTrackingDetail) {
			responseMessage["documents"] = [];
			const agreements = await Agreement.find( { practicemanagement: screenTrackingDetail.practicemanagement } );
			if(agreements) {
				const agreementPromises = [];
				for(let agreement of agreements) {
					const documentResponse = {
						documentId: agreement.id
					};
					const userConsentList = await UserConsent.find( {
						agreement: agreement.id,
						user: screenTrackingDetail.user
					} ).sort( "signedAt DESC" );
					const userConsent = userConsentList && userConsentList.length > 0 ? userConsentList[0] : null;
					if(userConsent && !!userConsent.esignatureStatus && userConsent.esignatureStatus === Screentracking.esignatureStatus.SIGNED) {
						documentResponse["eSignatureStatus"] = userConsent.esignatureStatus;
						documentResponse["consentId"] = userConsent.id;
						const downloadData = await S3Service.getStreamFromS3File( userConsent.agreementpath );
						if(downloadData) {
							_.assign( documentResponse, downloadData );
						}
					} else {
						documentResponse["eSignatureStatus"] = Screentracking.esignatureStatus.UNSIGNED;
					}
					responseMessage["documents"].push( documentResponse );
				}
				return responseMessage;
			}
		}
		return null;
	}
};

async function updateScreenTrackingStatus(screentracking,paymentDetails ) {
	const userUpdated = await User.update( { id: screentracking.user }, { isExistingLoan: true } );
	await Screentracking.update( { id: screentracking.id }, {
		iscompleted: 1,
	} );
	const paymentManagementUpdateObj = { blockedList: false,status: PaymentManagement.paymentManagementStatus.origination };
	if(userUpdated && userUpdated.length > 0 && userUpdated[0].badList == 1) {
		paymentManagementUpdateObj.blockedList = screentracking.blockedList;
	}
	const paymentManagementUpdate = await PaymentManagement.update( { id: paymentDetails.id }, paymentManagementUpdateObj );
	if(paymentManagementUpdate && paymentManagementUpdate.length > 0) {
		return paymentManagementUpdate[0];
	}
}
