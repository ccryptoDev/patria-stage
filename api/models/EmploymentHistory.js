/**
 * EmploymentHistory.js
 *
 * @description :: A model definition.  Represents a database table/collection/etc.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

const ObjectId = require("mongodb").ObjectID;
const _ = require("lodash");
const moment = require( "moment" );

const decisionCloudTypeOfPayroll = {
	DIRECT_DEPOSIT: "D",
	PAPER_CHECK: "P",
};
const decisionCloudPeriodicity = {
	BI_WEEKLY: "B",
	MONTHLY: "M",
	SEMI_MONTHLY: "S",
	WEEKLY: "W"
};

const decisionCloudFrequency = {
	WEEKLY: "W",
	WEEKLY_AS_BI_WEEKLY: "X",
	BI_WEEKLY: "B",
	TWO_SPECIFIC_DAYS: "F",
	SPECIFIC_WEEK_AND_DAYS: "T",
	SPECIFIC_DAY: "E",
	SPECIFIC_WEEK_AND_DAY: "O",
	NUM_BIZ_DAYS_AFTER: "C",
	SPECIFIC_WEEK_AND_DAY_AFTER_SPECIFIC_DAY: "D",
	EVERY_TWENTY_EIGHT_DAYS: "G",
	UNKNOWN: null
};
const decisionCloudIsAfterHoliday = {
	BEFORE_HOLIDAY: 0,
	AFTER_HOLIDAY: 1,
	UNKNOWN: -1
};
const decisionCloudIncomeType = {
	NOT_REQUIRED: "NOT_REQUIRED",
	DISABILITY: "DISABILITY",
	SOCIAL_SECURITY: "SOCIAL_SECURITY",
	OTHER: "OTHER",
	EMPLOYED: "EMPLOYED",
	PENSION: "PENSION",
	UNEMPLOYED: "UNEMPLOYED",
	WELFARE: "WELFARE"
};
module.exports = {
	attributes: {
		practicemanagement: {
			model: "PracticeManagement"
		},
		user: {
			model: "User"
		},
		screentracking: {
			model: "Screentracking"
		},
		employerName: {
			type: "string"
		},
		employerAddress: {
			type: "string"
		},
		employerCity: {
			type: "string"
		},
		employerState: {
			type: "string"
		},
		employerZip: {
			type: "string"
		},
		employerPhone: {
			type: "string"
		},
		currentIncome: {
			type: "float"
		},
		typeOfPayroll: {
			type: "string",
			enum: Object.values(decisionCloudTypeOfPayroll),
			defaultsTo: decisionCloudTypeOfPayroll.DIRECT_DEPOSIT
		},
		typeOfIncome: {
			type: "string",
			//enum: Object.values(decisionCloudIncomeType),
			//defaultsTo: decisionCloudIncomeType.NOT_REQUIRED
		},
		employerStatus: {
			type: "string",
		},
		monthlyIncome: {
			type: "float",
			defaultsTo: 0
		},
		payFrequency: {
			type: "string",
			//enum: Object.values(decisionCloudFrequency),
			//defaultsTo: decisionCloudFrequency.UNKNOWN
		},
		periodicity: {
			type: "string",
			//enum: Object.values(decisionCloudPeriodicity),
			//defaultsTo: decisionCloudPeriodicity.MONTHLY
		},
		lastPayDate: {
			type: "date"
		},
		nextPayDate: {
			type: "date"
		},
		secondPayDate: {
			type: "date"
		},
		isAfterHoliday: {
			type: "integer",
			defaultsTo: 0
		},
		semiMonthlyFirstPayday: {
			type: "date"
		},
		semiMonthlySecondPayDay: {
			type: "date"
		},
		annualIncome: {
			type: "string",
			defaultsTo: 0
		}
	},
	decisionCloudFrequency: decisionCloudFrequency,
	decisionCloudPeriodicity: decisionCloudPeriodicity,
	decisionCloudIsAfterHoliday: decisionCloudIsAfterHoliday,
	decisionCloudIncomeType: decisionCloudIncomeType,
	decisionCloudTypeOfPayroll: decisionCloudTypeOfPayroll,
	getPayrollDatesFromEmploymentHistory: async( userId ) => {
		const latestEmployment = await EmploymentHistory.getLatestEmploymentHistoryForUser( userId );
		if(latestEmployment) {
			// const payFrequency = latestEmployment.payFrequency || latestEmployment.periodicity || decisionCloudFrequency.BI_WEEKLY;
			let frequencies = SmoothPaymentService.getIncomePayFrequencies( latestEmployment.lastPayDate, latestEmployment.nextPayDate, latestEmployment.secondPayDate, null );
			if(frequencies && frequencies.length > 0) {
				const todayMoment = moment().startOf( "day" ).startOf( "month" );
				const secondNextMonth = moment().add( 2, "months" ).startOf( "day" ).startOf( "month" );
				const nextMonth = moment().add( 1, "months" ).startOf( "day" ).startOf( "month" );
				return _.filter( frequencies, ( freq ) => {
					const freqDate = moment( freq, "YYYY-MM-DD" ).startOf( "day" ).startOf( "month" );
					return freqDate.diff( todayMoment ) === 0 || freqDate.diff( secondNextMonth ) === 0 || freqDate.diff( nextMonth ) === 0;
				} );
			}
		}
		return [];
	},
	getLatestEmploymentHistoryForUser: ( userId ) => {
		
		return new Promise( async ( resolve, reject ) => {
			if(!userId) {
				return reject( { message: "Missing user id", code: 400 } );
			} else {
				const employmentHistories = await EmploymentHistory.find({user: userId}).sort({createdAt: -1}).limit(1);
				let employmentHistory = null;
				if(employmentHistories && employmentHistories.length > 0) {
					employmentHistory = employmentHistories[0];
				}
				return resolve( employmentHistory )
			}
		} );
	},
	getCurrentEmployment: ( paymentID ) => {
		return new Promise( ( resolve, reject ) => {
			if(!paymentID) {
				reject( { message: "Missing paymentI management id", code: 400 } );
			} else {
				EmploymentHistory.find( { paymentmanagement: paymentID } ).sort( "createdAt DESC" ).limit( 1 ).then( ( result ) => {
					let employmentHistory = null;
					if(result && result.length > 0 && result[0]) {
						employmentHistory = result[0];
					}
					resolve( employmentHistory );
				} ).catch( ( errorObj ) => {
					sails.log.error( "EmploymentHistory#getCurrentEmployment :: err", errorObj );
					reject( errorObj );
				} );
			}
		} );
	},
	createNewEmployeeHistoryIfNotChanged: (employmentHistoryObj) => {
		return new Promise((resolve,reject)=> {
			if(!employmentHistoryObj){
				sails.log.error( "EmploymentHistory#createNewEmployeeHistoryIfNotChanged :: Missing employment history data" );
				reject({message: "Missing employment history data"});
			}else {
				const previousEmploymentId = employmentHistoryObj.employmentHistoryId;
				if(!!previousEmploymentId) {
					EmploymentHistory.findOne({id: new ObjectId(previousEmploymentId)}).then((employmentHistory) => {
						if(!employmentHistory || !EmploymentHistory.isEmploymentHistoryEqual(employmentHistoryObj, employmentHistory)){
							EmploymentHistory.create(_.assign({},employmentHistoryObj)).then((updateResponse) => {
								resolve(updateResponse);
							}).catch((errorObj) => {
								sails.log.error( "EmploymentHistory#createNewEmployeeHistoryIfNotChanged :: err", errorObj );
								reject(errorObj);
							});
						}else {
							resolve(employmentHistory);
						}
					}).catch((errorObj) => {
						sails.log.error( "EmploymentHistory#createNewEmployeeHistoryIfNotChanged :: err", errorObj );
						reject(errorObj);
					});
				}else {
					EmploymentHistory.create(_.assign({},employmentHistoryObj)).then((updateResponse) => {
						resolve(updateResponse);
					}).catch((errorObj) => {
						sails.log.error( "EmploymentHistory#createNewEmployeeHistoryIfNotChanged :: err", errorObj );
						reject(errorObj);
					});
				}
			}
		})
	},
	isEmploymentHistoryEqual: (oldHistory, newHistory) => {
		// ----------------------- Took out ACH documents -----------------------
		if(newHistory.achDocuments && newHistory.achDocuments.length > 0){
			if(!oldHistory.achDocuments || oldHistory.achDocuments.length === 0){
				return false;
			}else if(!_.some(newHistory.documents, (doc) => { return oldHistory.achDocuments.indexOf(doc) >= 0; })) {
					return false;
			}
		}
		return oldHistory.employerName === newHistory.employerName
			&& oldHistory.employerAddress === oldHistory.employerAddress
			&& oldHistory.employerCity === oldHistory.employerCity
			&& oldHistory.employerState === oldHistory.employerState
			&& oldHistory.employerZip === oldHistory.employerZip
			&& oldHistory.employerPhone === oldHistory.employerPhone
			&& oldHistory.currentIncome === oldHistory.currentIncome
			&& oldHistory.typeOfIncome === oldHistory.typeOfIncome
			&& oldHistory.typeOfPayroll === oldHistory.typeOfPayroll
			&& oldHistory.periodicity === oldHistory.periodicity
			&& oldHistory.lastPayDate === oldHistory.lastPayDate
			&& oldHistory.nextPayDate== oldHistory.nextPayDate
			&& oldHistory.secondPayDate === oldHistory.secondPayDate
			&& oldHistory.payFrequency === oldHistory.payFrequency
			&& oldHistory.isAfterHoliday== oldHistory.isAfterHoliday
			&& oldHistory.semiMonthlyFirstPayday === oldHistory.semiMonthlyFirstPayday
			&& oldHistory.semiMonthlySecondPayDay === oldHistory.semiMonthlySecondPayDay

	},
	mapEmploymentHistoryFromResponse: (responseBody) => {
		if(!responseBody){
			return null;
		}
		return {
			paymentmanagement: responseBody.paymentmanagement,
			user: responseBody.userId || responseBody.user,
			employmentHistoryId: responseBody.employmentHistoryId,
			//achDocuments:  !!responseBody.achDocuments? _.filter(JSON.parse(responseBody.achDocuments),(doc)=>{return !!doc}):[],
			typeOfIncome: responseBody.typeOfIncome || responseBody.typeOfIncome,
			employerName: responseBody.employerName,
			employerAddress: responseBody.employerAddress,
			employerCity: responseBody.employerCity,
			employerState: responseBody.employerState,
			employerZip: responseBody.employerZip,
			employerStatus: responseBody.employerStatus,
			employerPhone: responseBody.employerPhone,
			currentIncome: convertCurrency(responseBody.currentIncome),
			typeOfPayroll: responseBody.typeOfPayroll,
			periodicity: responseBody.periodicity,
			lastPayDate: convertDates(responseBody.lastPayDate),
			nextPayDate: convertDates(responseBody.nextPayDate),
			secondPayDate: convertDates(responseBody.secondPayDate),
			payFrequency: responseBody.payFrequency,
			isAfterHoliday: responseBody.isAfterHoliday
			//semiMonthlyFirstPayday: convertDates(responseBody.semimonthly_1st_payday),
			//semiMonthlySecondPayDay: convertDates(responseBody.semimonthly_2nd_payday)
		}
	},
	addEmploymentHistoryUserActivity: (userMakingTheChange, paymentId, subject, message) => {
		PaymentManagement.findOne({id: paymentId}).then((paymentmanagementdata) => {
			const loggingData = {
				user: userMakingTheChange,
				logdata: paymentmanagementdata,
				payID: paymentmanagementdata? paymentmanagementdata.id: null
			};
			Logactivity.registerLogActivity( loggingData, subject, message );
		});
	}
}

function convertCurrency(incomingCurrencyValue) {
	if(incomingCurrencyValue !== undefined && incomingCurrencyValue !== null) {
		const currencyValue = incomingCurrencyValue.toString().replace(/[^0-9.]/g,"");
		return parseFloat(parseFloat(currencyValue).toFixed(2));
	}
	return null;
}
function convertDates(rawDateString, formatString = "", hasTime = false) {
	if(!!rawDateString) {
		let convertedDate = moment( rawDateString );
		if(!hasTime) {
			convertedDate = convertedDate.startOf( "day" )
		}
		if(!!formatString) {
			return convertedDate.format( formatString );
		} else {
			return convertedDate.toDate();
		}
	}
	return null;
}