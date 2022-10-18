"use strict";

const clarityConfig = {
	apiBaseUrl: "https://test.clarityservices.com/test_inquiries",
	username: "patrialendingutility",
	password: "jecwob-wifze1-ridxyZ",
	group_id: "1751",
	account_id: "2933",
	location_id: "10819",
	control_file_name: "FraudInsight",
	control_file_version_number: "1",
	inquiry_purpose_type: "AR",	
	inquiry_tradeline_type: "C3",
	testCase: {
		routing: "021000021",
		account: "10203040",
		CI: "666522860",
		CBB: "666344019",
		CRH: "666504241"
	}
};

const defaultTestData = {
	inquiry: {
		/* Alchemy's Credentials -- ID provided by Clarity Services. (Reference the User Name Notification email) */
		group_id: clarityConfig.group_id,
		account_id: clarityConfig.account_id,
		location_id: clarityConfig.location_id,
		username: clarityConfig.username,
		password: clarityConfig.password,
		control_file_name: clarityConfig.control_file_name,
		/* Client's Information */
		bank_account_number: '1234567890',
		bank_account_type: 'CHECKING',
		bank_routing_number: '123456789',
		cell_phone: '1112223333',
		city: 'Clearwater',
		date_of_birth: '1984-01-01',
		date_of_next_payday: '2016-10-01',
		drivers_license_number: '2345-5678',
		drivers_license_state: 'FL',
		email_address: 'test@test.test',
		employer_address: '123 Anywhere St',
		employer_city: 'Clearwater',
		employer_state: 'FL',
		first_name: 'First',
		last_name: 'Last',
		generational_code: 'JR',
		home_phone: '2223334444',
		housing_status: 'RENT',
		inquiry_purpose_type: 'AR',
		inquiry_tradeline_type: 'C3',
		net_monthly_income: '1500',
		pay_frequency: 'WEEKLY',
		paycheck_direct_deposit: 'true',
		reference_first_name: 'Sam',
		reference_last_name: 'Plereference',
		reference_phone: '3334445555',
		reference_relationship: 'EMPLOYER',
		social_security_number: '301001238',
		state: 'FL',
		street_address_1: '456 Somewhere St',
		street_address_2: 'Unit 2',
		months_at_address: '12',
		months_at_current_employer: '48',
		work_fax_number: '5556667777',
		work_phone: '6667778888',
		zip_code: '33755'
	}
};

if( process.env.NODE_ENV == "production" || process.env.NODE_ENV == "prod" || process.env.NODE_ENV == "live" ) {
	clarityConfig.apiBaseUrl = "https://secure.clarityservices.com/inquiries";
}


module.exports.clarityConfig = clarityConfig;
module.exports.clarityTestData = defaultTestData;
