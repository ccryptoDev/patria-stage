/* global sails, Account, Payment, Nacha, PaymentManagement, EmploymentHistory */
"use strict";

const _ = require( "lodash" );
const EventEmitter = require( "events" );
const moment = require( "moment" );
const config = sails.config.nacha;
const fs = require( "fs" );
const path = require( "path" );
const util = require( "util" );

const pmtSvcConfig = sails.config.paymentService;
const CREDIT_STATUS = {
	NA: 0,
	PENDING: 1,
	ACCEPTED: 2,
	ERROR: 3
};

class NachaPaymentService extends EventEmitter {
	constructor() {
		super();
		this._instanceClass = "nacha";
	}

	/**
	 * process batch of payments
	 * @param {Array} contractPayments
	 * @param {string} ipAddr
	 * @return {Promise}
	 */
	processContractPayments( contractPayments, ipAddr ) {
		fs.mkdirSync( `${sails.config.appPath}/paymentservice/processScheduledPayments`, { recursive: true } );
		fs.mkdirSync( `${sails.config.appPath}/paymentservice/nacha`, { recursive: true } );

		const self = this;
		const Promise = require( "bluebird" );
		const moment = require( "moment-timezone" );
		const now = new Date();
		const tomorrow = moment().add( 1, "days" ).startOf( "day" ).toDate();
		const nachaDirectoryPath =  path.resolve( sails.config.appPath, "paymentservice", "nacha");
		const nachaFileName = `${config.bankNumber}.${config.taxId}.${moment(now).format("MMDDYY-HHmm")}`;
		const nachaFilePath = path.resolve( nachaDirectoryPath,nachaFileName);
		Utils.makeFSDirectory(nachaDirectoryPath)
		let lineCount = 0;
		let debitCount = 0;
		let totalDebits = 0;
		let creditCount = 0;
		let totalCredits = 0;
		let nacha = { filePath: nachaFilePath };

		return Promise.resolve()
			.then( fileHeaderRecord )
			.then( batchHeaderRecord )
			.then( entryDetailRecords )
			.then( addendaRecords )
			.then( batchControlRecord )
			.then( fileControlRecord )
		.then(() => {
				nacha["remoteFileName"] = nachaFileName;
				if(config.leadBankSftp.enabled && config.leadBankSftp.uploadToSftpEnabled) {
						return NachaFtpService.uploadNachaFile(nacha).then(()=>{return Promise.resolve(true)}).catch((exc) => {
							sails.log.error("NachaPaymentService#uploadNachaFile Error uploading nacha file: ", exc);
							nacha["fileUploadError"] = exc && !!exc.message? exc.message:"Nacha SFTP credentials are not correct";
							return EmailService.sendNachaFileUploadFailureEmail({
								fileName: nacha.remoteFileName,
								entryDate: moment(nacha.batchHeaderRecord.effectiveEntryDate, "YYMMDD").startOf("day").toDate() || moment().toDate(),
								debitCount: debitCount,
								debitAmount: totalDebits,
								creditCount: creditCount,
								creditAmount: totalCredits
							}, nacha.fileUploadError).then((results) => {
								return Promise.resolve(false);
							});
						})
				}else {
					return Promise.resolve(true)
				}
		})
			.then( (isNoError) => {
				if( config.leadBankSftp.enabled && config.leadBankSftp.uploadToSftpEnabled && isNoError) {
					return EmailService.sendNachaFileNotificationEmail({
						fileName: nacha.remoteFileName,
						entryDate: moment(nacha.batchHeaderRecord.effectiveEntryDate, "YYMMDD").startOf("day").toDate() || moment().toDate(),
						debitCount: debitCount,
						debitAmount: totalDebits,
						creditCount: creditCount,
						creditAmount: totalCredits
					});
				}
				if(!isNoError) {
					return Promise.reject(nacha.fileUploadError)
				}
				return Promise.resolve();
			} ).catch(async (exc) => {
					sails.log.error("NachaPaymentService#processContractPayments Error nacha process: ", exc);
					for(let entryItem of nacha.entryDetailRecord) {
						await Payment.update({pmtRef: `TX_${parseInt(entryItem.individualIdentification)}`}, {nachaPaymentError: nacha.fileUploadError, isNachaError: true})
					}
					nacha["isNachaError"] = true;
				await Nacha.update( { id: nacha.id }, {fileUploadError: nacha.fileUploadError, isNachaError: nacha.isNachaError} );
		});

		function writeToNachaFile( line ) {
			return new Promise( ( resolve, reject ) => {
				if( line.length !== 94 ) {
					sails.log.error( "writeToNachaFile; length:", line.length, `"${line}"` );
					return reject( new Error( "Invalid Record" ) );
				}
				
				 fs.appendFileSync( nachaFilePath, `${line}\n\r` );
				return resolve();
			} );
		}

		function fileHeaderRecord() {
			nacha.fileHeaderRecord = {
				recordTypeCode: "1",			// 01-01 (1)
				priorityCode: "01",				// 02-03 (2)
				immediateDestination: "",		// 04-13 (10)
				immediateOrigin: "",			// 14-23 (10)
				fileCreationDate: "",			// 24-29 (6)
				fileCreationTime: "",			// 30-33 (4)
				fileIdModifier: "A",			// 34-34 (1)
				recordSize: "094",				// 35-37 (3)
				blockingFactor: "10", 			// 38-39 (2)
				formatCode: "1",				// 40-40 (1)
				immediateDestinationName: "",	// 41-63 (23)
				immediateOriginName: "",		// 64-86 (23)
				referenceCode: "        "				// 87-94 (8)
			};

			nacha.fileHeaderRecord.immediateDestination = config.fileHeaderImmediateDestination.padStart( 10, " " );
			nacha.fileHeaderRecord.immediateDestinationName = config.immediateDestinationName.substr( 0, 23 ).padEnd( 23, " " );
			nacha.fileHeaderRecord.immediateOrigin = config.immediateOrigin.padStart( 10, "0" );
			nacha.fileHeaderRecord.immediateOriginName = config.immediateOriginName.substr( 0, 23 ).padEnd( 23, " " );
			nacha.fileHeaderRecord.fileCreationDate = moment( now ).format( "YYMMDD" );
			nacha.fileHeaderRecord.fileCreationTime = moment( now ).format( "HHmm" );

			const lineData = [
				nacha.fileHeaderRecord.recordTypeCode,
				nacha.fileHeaderRecord.priorityCode,
				nacha.fileHeaderRecord.immediateDestination,
				nacha.fileHeaderRecord.immediateOrigin,
				nacha.fileHeaderRecord.fileCreationDate,
				nacha.fileHeaderRecord.fileCreationTime,
				nacha.fileHeaderRecord.fileIdModifier,
				nacha.fileHeaderRecord.recordSize,
				nacha.fileHeaderRecord.blockingFactor,
				nacha.fileHeaderRecord.formatCode,
				nacha.fileHeaderRecord.immediateDestinationName,
				nacha.fileHeaderRecord.immediateOriginName,
				nacha.fileHeaderRecord.referenceCode
			];
			const line = lineData.join( "" );
			sails.log.verbose( "fileHeaderRecord;  ", `"${line}"` );
			++lineCount;
			return Nacha.create( nacha )
				.then( ( created ) => {
					nacha = created;
					return writeToNachaFile( line );
				} );
		}

		function batchHeaderRecord() {
			nacha.batchHeaderRecord = {
				recordTypeCode: "5",			// 01-01 (1)
				serviceClassCode: "200",		// 02-04 (3)
				companyName: "",				// 05-20 (16)
				companyDiscretionaryData: "",	// 21-40 (20)
				companyIdentification: "",		// 41-50 (10)
				standardEntryClassCode: "PPD",	// 51-53 (3)
				companyEntryDescription: "",	// 54-63 (10)
				companyDescriptiveDate: "",		// 64-69 (6)
				effectiveEntryDate: "",			// 70-75 (6)
				settlementDate: "",				// 76-78 (3)
				originatorStatusCode: "1",		// 79-79 (1)
				odfiIdentifcation: "",			// 80-87 (8)
				batchNumber: "1"				// 88-94 (7)
			};

			nacha.batchHeaderRecord.companyName = config.companyName.substr( 0, 16 ).padEnd( 16, " " );
			nacha.batchHeaderRecord.companyDiscretionaryData = nacha.batchHeaderRecord.companyDiscretionaryData.padEnd( 20, " " );
			nacha.batchHeaderRecord.companyIdentification = config.companyIdentification.substr( 0, 10 ).padStart( 10, "0" );
			nacha.batchHeaderRecord.companyEntryDescription = config.companyEntryDescription.substr( 0, 10 ).padEnd( 10, " " );
			nacha.batchHeaderRecord.companyDescriptiveDate = "".padEnd(6," ");// moment( now ).format( "YYMMDD" );
			nacha["fileEffectiveEntryDate"] =  moment(SmoothPaymentService.getBusinessDateBasedOnBankDays(moment( now ).add(1, "day").toDate(),true)
					|| moment( now ).add(1, "day").toDate()).toDate();
			nacha.batchHeaderRecord.effectiveEntryDate = moment(nacha.fileEffectiveEntryDate).format( "YYMMDD" );
			
			nacha.batchHeaderRecord.settlementDate = "".padEnd( 3, " " );
			nacha.batchHeaderRecord.odfiIdentifcation = config.originatingDFIIdentification.substr( 0, 8 );
			nacha.batchHeaderRecord.batchNumber = nacha.batchHeaderRecord.batchNumber.padStart( 7, "0" );
			
			const lineData = [
				nacha.batchHeaderRecord.recordTypeCode,
				nacha.batchHeaderRecord.serviceClassCode,
				nacha.batchHeaderRecord.companyName,
				nacha.batchHeaderRecord.companyDiscretionaryData,
				nacha.batchHeaderRecord.companyIdentification,
				nacha.batchHeaderRecord.standardEntryClassCode,
				nacha.batchHeaderRecord.companyEntryDescription,
				nacha.batchHeaderRecord.companyDescriptiveDate,
				nacha.batchHeaderRecord.effectiveEntryDate,
				nacha.batchHeaderRecord.settlementDate,
				nacha.batchHeaderRecord.originatorStatusCode,
				nacha.batchHeaderRecord.odfiIdentifcation,
				nacha.batchHeaderRecord.batchNumber
			];
			const line = lineData.join( "" );
			sails.log.verbose( "batchHeaderRecord; ", `"${line}"` );
			++lineCount;
			return Nacha.update( { id: nacha.id }, { batchHeaderRecord: nacha.batchHeaderRecord } )
				.then( ( updated ) => {
					nacha = updated[ 0 ];
					return writeToNachaFile( line );
				} );
		}

		async function entryDetailRecords() {
			const paymentPromises = [];
			nacha.entryDetailRecord = [];
			let uniqueIndex = 0;
			for (const contract of contractPayments) {
				uniqueIndex = uniqueIndex +1;
				// sails.log.debug( "contract:", JSON.stringify( contract.paymentScheduleItem ) );
				if( contract.paymentScheduleItem.amount == 0 ) return;
				const retVal = async () => {
					// return Promise.resolve( { pmtRef: "PMT_1234567", amount: parseFloat( parseFloat( contract.paymentScheduleItem.amount ).toFixed( 2 ) ) } )
					let payment = await self.processScheduledPayment( contract.paymentmanagement, contract.practicemanagement, contract.user, contract.account, contract.paymentScheduleItem, ipAddr, contract.existingPayment)
					if( ! payment ) {
						sails.log.error( "entryDetailRecords; processScheduledPayment(): Not eligible payment to send", contract.paymentmanagement, contract.paymentScheduleItem );
						 return {};
					}
					const entryDetailRecord = {
						recordTypeCode: "6",			// 01-01 (1)
						transactionCode: "",//22 for credit// 02-03 (2)
						rdfiIdentification: "",			// 04-11 (8)
						checkDigit: "",					// 12-12 (1)
						dfiAccountNumber: "",			// 13-29 (17)
						dollarAmount: "",				// 30-39 (10)
						individualIdentification: "",	// 40-54 (15)
						individualName: "",				// 55-76 (22)
						discretionaryData: "",			// 77-78 (2)
						addendaRecordIndicator: "0",	// 79-79 (1)
						traceNumber: ""					// 80-94 (15)
					};
					try {
					if(payment.type === Payment.paymentTypeEnum.ACH_CREDIT) {
						entryDetailRecord.transactionCode = "22";
						totalCredits = $ize( totalCredits + payment.amount);
						creditCount = creditCount +1;
					}else if(payment.type === Payment.paymentTypeEnum.ACH_DEBIT) {
						entryDetailRecord.transactionCode = "27";
						totalDebits = $ize( totalDebits + payment.amount);
						debitCount = debitCount +1;
					}else {
						sails.log.error( "entryDetailRecords; payment.type: Error: Missing or not correct payment type to send to nacha.");
						return {};
					}
					entryDetailRecord.rdfiIdentification = contract.account.routingNumber.substr( -9 ).substr( 0, 8 );
					entryDetailRecord.checkDigit = contract.account.routingNumber.substr( -1 );
					entryDetailRecord.dfiAccountNumber = contract.account.accountNumber.substr( 0, 17 ).padEnd( 17, " " );
					entryDetailRecord.dollarAmount = ( parseFloat( parseFloat( payment.amount ).toFixed( 2 ) ) * 100 ).toFixed( 0 ).padStart( 10, "0" );
					entryDetailRecord.individualIdentification = payment.pmtRef.replace( "TX_", "" ).substr( 0, 15 ).padStart( 15, "0" );
					entryDetailRecord.individualName = `${contract.user.firstname.toUpperCase()} ${contract.user.lastname.toUpperCase()}`.substr( 0, 22 ).padEnd( 22, " " );
					entryDetailRecord.discretionaryData = entryDetailRecord.discretionaryData.padEnd( 2, " " );
					entryDetailRecord.traceNumber = `${nacha.batchHeaderRecord.odfiIdentifcation.substr( 0, 8 )}${uniqueIndex.toString().padStart( 7, "0" )}`.padStart( 15, "0" );
					sails.log.debug( "entryDetailRecord:", JSON.stringify( entryDetailRecord ) );
					nacha.entryDetailRecord.push( entryDetailRecord );
					
					const updated = await Payment.update( { id: payment.id }, { nacha: nacha.id, hasBeenSentToAch: true, nachaSentAttempt: payment.nachaSentAttempt >=0?payment.nachaSentAttempt+1:0} )
					payment = updated[ 0 ];
					} catch (e) { console.log(e) }
					return payment;
				}
				paymentPromises.push(await retVal());
			}
			const r = await Promise.all(paymentPromises)
					const updated = await Nacha.update( { id: nacha.id }, { entryDetailRecord: nacha.entryDetailRecord } )
							nacha = updated[ 0 ];
							const promises = [];
							for (const entryDetailRecord of nacha.entryDetailRecord) {
								sails.log.debug( "entryDetailRecord:", JSON.stringify( entryDetailRecord ) );
								const rVal = async () => {
									try {
										// totalDebitDollarAmount
										const lineData = [
											entryDetailRecord.recordTypeCode,
											entryDetailRecord.transactionCode,
											entryDetailRecord.rdfiIdentification,
											entryDetailRecord.checkDigit,
											entryDetailRecord.dfiAccountNumber,
											entryDetailRecord.dollarAmount,
											entryDetailRecord.individualIdentification,
											entryDetailRecord.individualName,
											entryDetailRecord.discretionaryData,
											entryDetailRecord.addendaRecordIndicator,
											entryDetailRecord.traceNumber
										];
										const line = lineData.join( "" );
										sails.log.verbose( "entryDetailRecord; ", `"${line}"` );
										++lineCount;
										return writeToNachaFile( line );
	
									} catch (e) {console.log(e)}
								}
								promises.push( await rVal() );
						}
								await Promise.all(promises);
		}

		function addendaRecords() {
			return; // currently unsupported
		}

		function batchControlRecord() {
			nacha.batchControlRecord = {
				recordTypeCode: "8",			// 01-01 (1)
				serviceClassCode: nacha.batchHeaderRecord.serviceClassCode,		// 02-04 (3)
				entryCount: "",					// 05-10 (6)
				entryHash: "",					// 11-20 (10)
				totalDebitDollarAmount: "",		// 21-32 (12)
				totalCreditDollarAmount: "",	// 33-44 (12)
				companyIdentification: "",		// 45-54 (10)
				messageAuthenticationCode: "",	// 55-73 (19)
				reserved: "",					// 74-79 (6)
				odfiIdentification: "0",		// 80-87 (8)
				batchNumber: ""					// 88-94 (7)
			};
			let entryHash = 0;
			_.forEach( nacha.entryDetailRecord, ( entryDetailRecord ) => {
				entryHash = parseInt( ( entryHash + parseInt( entryDetailRecord.rdfiIdentification ) ).toFixed( 0 ) );
				
				// if( entryDetailRecord.transactionCode == "27" ) {
				// 	debitCount = debitCount +1;
				//
				// }
				// if( entryDetailRecord.transactionCode == "22" ) {
				// 	creditCount = creditCount +1;
				// 	totalCredits = $ize( totalCredits + $ize(entryDetailRecord.dollarAmount));
				// }
			} );
			
			nacha.batchControlRecord.entryCount = `${nacha.entryDetailRecord.length}`.padStart( 6, "0" );
			nacha.batchControlRecord.entryHash = `${entryHash}`.padStart( 10, "0" ).substr( -10 );
			nacha.batchControlRecord.totalDebitDollarAmount = ( parseFloat( parseFloat( totalDebits ).toFixed( 2 ) ) * 100 ).toFixed( 0 ).padStart( 12, "0" );
			nacha.batchControlRecord.totalCreditDollarAmount =  ( parseFloat( parseFloat( totalCredits ).toFixed( 2 ) ) * 100 ).toFixed( 0 ).padStart( 12, "0" );
			nacha.batchControlRecord.companyIdentification = config.companyIdentification.substr( 0, 10 ).padStart( 10, "0" );
			nacha.batchControlRecord.messageAuthenticationCode = nacha.batchControlRecord.messageAuthenticationCode.padEnd( 19, " " );
			nacha.batchControlRecord.reserved = nacha.batchControlRecord.reserved.padEnd( 6, " " );
			nacha.batchControlRecord.odfiIdentification = nacha.batchHeaderRecord.odfiIdentifcation.substr( 0, 8 );
			nacha.batchControlRecord.batchNumber = nacha.batchHeaderRecord.batchNumber.substr( 0, 7 );

			const lineData = [
				nacha.batchControlRecord.recordTypeCode,
				nacha.batchControlRecord.serviceClassCode,
				nacha.batchControlRecord.entryCount,
				nacha.batchControlRecord.entryHash,
				nacha.batchControlRecord.totalDebitDollarAmount,
				nacha.batchControlRecord.totalCreditDollarAmount,
				nacha.batchControlRecord.companyIdentification,
				nacha.batchControlRecord.messageAuthenticationCode,
				nacha.batchControlRecord.reserved,
				nacha.batchControlRecord.odfiIdentification,
				nacha.batchControlRecord.batchNumber
			];
			const line = lineData.join( "" );
			sails.log.verbose( "batchControlRecord;", `"${line}"` );
			++lineCount;
			return Nacha.update( { id: nacha.id }, { batchControlRecord: nacha.batchControlRecord } )
				.then( ( updated ) => {
					nacha = updated[ 0 ];
					return writeToNachaFile( line );
				} );
		}

		function fileControlRecord() {
			let blockCount = Math.ceil( lineCount / 10 );
			nacha.fileControlRecord = {
				recordTypeCode: "9",			// 01-01 (1)
				batchCount: "",					// 02-07 (6)
				blockCount: "",					// 08-13 (6)
				entryCount: "",					// 14-21 (8)
				entryHash: "",					// 22-31 (10)
				totalDebitDollarAmount: "",		// 32-43 (12)
				totalCreditDollarAmount: "",	// 44-55 (12)
				reserved: ""					// 56-94 (39)
			};
			
			nacha.fileControlRecord.batchCount = "1".padStart( 6, "0" );
			nacha.fileControlRecord.blockCount = `${blockCount}`.padStart( 6, "0" );
			nacha.fileControlRecord.entryCount = nacha.batchControlRecord.entryCount.padStart( 8, "0" );
			nacha.fileControlRecord.entryHash = nacha.batchControlRecord.entryHash;
			nacha.fileControlRecord.totalDebitDollarAmount = nacha.batchControlRecord.totalDebitDollarAmount;
			nacha.fileControlRecord.totalCreditDollarAmount = nacha.batchControlRecord.totalCreditDollarAmount;
			nacha.fileControlRecord.reserved = nacha.fileControlRecord.reserved.padEnd( 39, " " );

			const lineData = [
				nacha.fileControlRecord.recordTypeCode,
				nacha.fileControlRecord.batchCount,
				nacha.fileControlRecord.blockCount,
				nacha.fileControlRecord.entryCount,
				nacha.fileControlRecord.entryHash,
				nacha.fileControlRecord.totalDebitDollarAmount,
				nacha.fileControlRecord.totalCreditDollarAmount,
				nacha.fileControlRecord.reserved
			];
			const line = lineData.join( "" );
			sails.log.verbose( "fileControlRecord; ", `"${line}"` );
			++lineCount;
			
			return Nacha.update( { id: nacha.id }, { fileControlRecord: nacha.fileControlRecord } )
				.then( ( updated ) => {
					nacha = updated[ 0 ];
					return writeToNachaFile( line );
				} ).then(()=> {
				
					const blockFactor = parseInt(nacha.fileHeaderRecord.blockingFactor);
					const padLineTotal = parseInt( (blockFactor - (lineCount % blockFactor)).toString());
						const writePromise = [];
						for(let i = 1; i <= padLineTotal; i++) {
								writePromise.push(writeToNachaFile("".padEnd(94, "9")))
						}
						return Promise.all(writePromise);
			});
		}
	}


	/**
	 * process prepared payment
	 * @param {Payment} payment
	 * @return {Promise}
	 */
	processPayment( payment ) {
		const self = this;
		return new Promise( ( resolve, reject ) => {
			// sails.log.verbose( "processPayment; pmtRequest:", JSON.stringify( payment.pmtRequest ) );
			// const logPath = `paymentservice/processPayment/${payment.id}.txt`;
			// fs.appendFileSync( logPath, `${JSON.stringify( payment.pmtRequest )}\n\n` );
			const update = {
				pmtResponse: null,
				status: Payment.STATUS_PENDING,
				order_id: "--",
				history_id: "--",
				authcode: "--"
			};
			return Payment.update( { id: payment.id }, update )
				.then( ( updated ) => {
					payment = updated[ 0 ];
					return resolve( payment.pmtResponse );
				} );
		} );
	}

	
	/**
	 * Error Reasons
	 * @param {string} code
	 * @return {string}
	 */
	errorReasons( code ) {
		code = (!!code && typeof code == "string" ? code.toUpperCase() : "UNKNOWN" );
		const declineCodes = {
			"R01": "Insufficient funds",
			"R02": "Account Closed",
			"R03": "No Account / Unable to Locate Account",
			"R04": "Invalid Account Number Structure",
			"R05": "Unauthorized Debit to Consumer Account Using Corporate SEC Code",
			"R06": "Returned per ODFI's Request",
			"R07": "Authorization Revoked by Customer",
			"R08": "Payment Stopped",
			"R09": "Uncollected Funds",
			"R10": "Customer Advises Not Authorized, Improper, or Ineligible",
			"R11": "Check Truncation Entry Return",
			"R12": "Account Sold to Another DFI",
			"R13": "Invalid ACH Routing Number",
			"R14": "Representative Payee Deceased or Unable to Continue in That Capacity",
			"R15": "Beneficiary or Account Holder (Other Than a Representative Payee) Deceased",
			"R16": "Account Frozen / Entry Returned Per OFAC Instruction",
			"R17": "File Record Edit Criteria",
			"R18": "Improper Effective Entry Date",
			"R19": "Amount Field Error",
			"R20": "Non-Transaction Account",
			"R21": "Invalid Company Identification",
			"R22": "Invalid Individual ID Number",
			"R23": "Credit Entry Refused by Receiver",
			"R24": "Duplicate Entry",
			"R25": "Addenda Error",
			"R26": "Mandatory Field Error",
			"R27": "Trace Number Error",
			"R28": "Routing Number Check Digit Error",
			"R29": "Corporate Customer Advises Not Authorized",
			"R30": "RDFI Not Participant in Check Truncation Program",
		};
		return _.get( declineCodes, code, "Unspecified Error" );
	}

	prepareDebitPayment( payment, user, account, orderNumber, ipAddr ) {
		return null;
	}

	prepareCreditPayment( payment, practicemanagement, user, orderNumber, ipAddr ) {
		return null;
	}

	createPaymentScheduleImport( bankinfo, requiredPayments, paymentWindow, paymentCap, isaPercent, minimumIncome, actualIncome, defactoFirstPaymentDate, currentPaymentType, previousSchedule=[],placePaymentOnBankHoliday=0) {
		return createPaymentSchedule( bankinfo, requiredPayments, paymentWindow, paymentCap, isaPercent, minimumIncome, actualIncome, defactoFirstPaymentDate, currentPaymentType,previousSchedule,placePaymentOnBankHoliday );
	}

	processScheduledPayment( paymentmanagement, practicemanagement, user, account, paymentScheduleItem, ipAddr, existingPayment = null, paymentType = "ACH_DEBIT" ) {
		const self = this;
		const debugLogPath = `${sails.config.appPath}/paymentservice/processScheduledPayments/${moment().format( "YYYY-MM-DD" )}.txt`;
		let pmtRef;
		debugLog( `processScheduledPayment[ ${paymentmanagement.loanReference} ]; START` );
		return Promise.resolve()
			
			.then( async () => {
			
			let payment = null;
				if(existingPayment && !!existingPayment.pmtRef) {
					payment = existingPayment;
					
				}else {
					payment = await Payment.createPaymentActionTransaction(Payment.transactionTypeEnum.PAYMENT,
					paymentScheduleItem,paymentmanagement.id,user.id,account.id,paymentType ||  Payment.paymentTypeEnum.ACH_DEBIT)
				}
				if(payment.hasBeenSentToAch){
					debugLog( `processScheduledPayment[ ${paymentmanagement.loanReference} ]; START` );
					return null;
				}
			const orderNumber = `${user.userReference}:${paymentmanagement.loanReference}:${payment.pmtRef}`;
				//start here today
				sails.log.verbose( `processScheduledPayment[ ${paymentmanagement.loanReference} ][ ${pmtRef} ]; payment:`, payment.pmtRef );
				const paymentUpdateObj = {
					errReason: "",
					order_id: orderNumber,
					achJoinDate: moment().startOf( "day" ).toDate(),
					pmtRequest: []
				}
				// if( process.env.NODE_ENV !== "production" && process.env.NODE_ENV !== "live" ) {
				// 	paymentUpdateObj["amount"] = 1.00;
				// }
				await Payment.update({id: payment.id}, paymentUpdateObj)
				
				_.assign(payment, paymentUpdateObj);
				await self.postPaymentProcessing( payment, account )
				return payment;
			} )
			.catch( ( err ) => {
				sails.log.error( `processScheduledPayment[ ${paymentmanagement.loanReference} ][ ${pmtRef} ]; catch:`, err );
			} )
			.finally( () => {
				debugLog( `processScheduledPayment[ ${paymentmanagement.loanReference} ][ ${pmtRef} ]; END` );
			} );

		function debugLog() {
			const logStr = util.format.apply( null, arguments );
			sails.log.info( logStr );
			fs.appendFileSync( debugLogPath, `${moment().format( "YYYY-MM-DD HH:mm:ss.SSS" )}: ${logStr}\n` );
		}
	}

	postPaymentProcessing( payment, account ) {
		const self = this;
		if( payment.status == Payment.STATUS_PENDING || payment.status == Payment.STATUS_PAID ) {
			return PaymentManagement.findOne({id: payment.paymentmanagement.id})
			.then(async (paymentmanagement) => {
				paymentmanagement.usertransactions = _.get( paymentmanagement, "usertransactions", [] );
				
				let transactionData = {
					amount: payment.amount,
					loanID: payment.pmtRef,
					paymentId: payment.id,
					status: 3,
					transactionId: "",
					transactionType: "Automatic",
					//apiType: sails.config.paymentService.vendor,
					apiType: "nacha",
					initialschedule: paymentmanagement.paymentSchedule,
					//failure_authcode: failure_authcode,
					//failure_historyId: failure_historyId,
					date: new Date()
				}
				
				transactionData.accountName = account.accountName;
				transactionData.accountNumberLastFour = account.accountNumberLastFour;
				transactionData.accountId = account.id;
				
				paymentmanagement.usertransactions.push(transactionData);
				
				
				// _.forEach( paymentmanagement.paymentSchedule, ( schedule ) => {
				// 	if( moment().startOf( "day" ).toDate().getTime() == moment( schedule.date ).startOf( "day" ).toDate().getTime() ) {
				// 		schedule.date = moment().startOf( "day" ).add( 1, "days" ).toDate();
				// 	}
				// } );
				return paymentmanagement.save()
					.then(() => {
						return { statusCode: 200, message: "Recurring debit completed successfully" };
				} );
			})
		} else {
			return PaymentManagement.findOne( { id: payment.paymentmanagement } )
				.then( async ( paymentmanagement ) => {
					let failure_authcode = "";
					let failure_historyId = "";
					if( payment.status == Payment.STATUS_DECLINED ) {
						failure_historyId = payment.history_id;
						failure_authcode = payment.authcode;
					}
					// if( paymentmanagement.failedtranscount ) {
					// 	paymentmanagement.failedtranscount = paymentmanagement.failedtranscount + 1;
					// } else {
					// 	paymentmanagement.failedtranscount = 1;
					// }
					paymentmanagement.failedtranscount = 0;
					if( ! paymentmanagement.failedtransactions ) {
						paymentmanagement.failedtransactions = [];
					}
					paymentmanagement.failedtransactions.push( {
						amount: payment.amount,
						pmtRef: payment.pmtRef,
						date: new Date()
					} );

					paymentmanagement.usertransactions = _.get( paymentmanagement, "usertransactions", [] );

					let transactionData = {
						amount: payment.amount,
						loanID: payment.pmtRef,
						paymentId: payment.id,
						status: 3,
						transactionId: "",
						transactionType: "Automatic",
						//apiType: sails.config.paymentService.vendor,
						apiType: "nacha",
						initialschedule: paymentmanagement.paymentSchedule,
						// failure_authcode: failure_authcode,
						// failure_historyId: failure_historyId,
						date: new Date()
					}

					transactionData.accountName = account.accountName;
					transactionData.accountNumberLastFour = account.accountNumberLastFour;
					transactionData.accountId = account.id;

					paymentmanagement.usertransactions.push(transactionData);

					// _.forEach( paymentmanagement.paymentSchedule, ( schedule ) => {
					// 	if( moment().startOf( "day" ).toDate().getTime() == moment( schedule.date ).startOf( "day" ).toDate().getTime() ) {
					// 		schedule.date = moment().startOf( "day" ).add( 1, "days" ).toDate();
					// 	}
					// } );

					return paymentmanagement.save()
						.then( () => {
							return { statusCode: 401, message: "failed" };
						} );
				} );
		}
	}
}

let nachaPaymentService = new NachaPaymentService();

module.exports = nachaPaymentService;

