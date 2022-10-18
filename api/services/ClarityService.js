const request = require("request"); // DEPRECATED: https://www.npmjs.com/package/request
const moment = require("moment");
const { Config, clarityTestData } = require("../../config/clarityConfig");
const { default: Axios } = require("axios");
const ClarityResponse = require("../models/ClarityResponse");

// module.exports = {
//     verifyCredit: verifyCredit_v2,
//     testVerifyCredit: testVerifyCredit,
//     mlaCheck:mlaCheck
// }

/**
 * Verify ssn with clarity
 * @param paramObj <{userId,screenId}>
 */

function verifyCredit(paramObj) {                                     // Remember to delete url in routes for this
  const userId = paramObj.userId;
  const screenId = paramObj.screenId;

  return new Promise(async (resolve, reject) => {
    const user = await User.findOne({
      where: { id: userId },
      select: ['firstName', 'middlename', 'lastName', 'email', 'phoneNumber', 'street', 'unitapt', 'city', 'state', 'zipCode', 'ssn_number', 'dateofBirth']
    })
    const bankaccount = await Screentracking.findOne({
      where: { id: screenId },
      select: ['routingNumber', 'accountNumber', 'monthlyIncome'],
    })

    var postData = {
      inquiry: {
        username: sails.config.clarityConfig.username,
        password: sails.config.clarityConfig.password,
        group_id: sails.config.clarityConfig.group_id,
        account_id: sails.config.clarityConfig.account_id,
        location_id: sails.config.clarityConfig.location_id,
        control_file_name: sails.config.clarityConfig.control_file_name,
        control_file_version_number: sails.config.clarityConfig.control_file_version_number,
        inquiry_purpose_type: sails.config.clarityConfig.inquiry_purpose_type,
        inquiry_tradeline_type: sails.config.clarityConfig.inquiry_tradeline_type,
        first_name: user.firstName,
        last_name: user.lastName,
        email_address: user.email,
        cell_phone: user.phoneNumber.replace(/[^0-9]/g, ""),
        date_of_birth: moment(user.dateofBirth, "YYYY-MM-DD").format("YYYY-MM-DD"),
        street_address_1: user.street,
        street_address_2: "",
        city: user.city,
        state: user.state,
        zip_code: user.zipCode,
        social_security_number: user.ssn_number.replace(/[^0-9]/g, ""),
        net_monthly_income: parseInt(((parseFloat(bankaccount.monthlyIncome)) || 0).toFixed(0)),
        bank_account_type: "checking",
        bank_account_number: bankaccount.accountNumber,
        bank_routing_number: bankaccount.routingNumber
      }
    }

    const reqOpts = {
      url: sails.config.clarityConfig.apiBaseUrl,
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json"
      },
      json: postData
    };
    request(reqOpts, (err, response, body) => {
      if (err) return Promise.reject(500);
      resolve(body);
    })
  })
    .then(body => {
      const state = body.xml_response['action'];
      if (state == 'Approve') {
        return Promise.resolve({
          code: 200,
          message: 'Clarity verification success.'
        });
      }
      else {
        return Promise.reject({
          code: 700,
          message: 'Credit verification not pass.'
        })
      }
    })
}

async function verifyCredit_v2(inquiryParam) {
  let config = {
    method: 'post',
    url: sails.config.clarityConfig.apiBaseUrl,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    data: inquiryParam
  };

  const response = await Axios(config);
  // sails.log.info(response.data.xml_response);
  return response.data.xml_response;
}

/* Sends a post request to Clarity's test_inquiries endpoint with sample data from their API documentation.
 * Uses default test data from the clarityConfig.js file. See Clarity's API documentation for required data. */
async function testVerifyCredit(postData = clarityTestData) { // make postData a default param?

  let config = {
    method: 'post',
    url: 'https://test.clarityservices.com/test_inquiries',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    data: postData
  };

  sails.log.info('Calling Clarity POST request...');
  const response = await Axios(config);
  sails.log.info('@@@@@@@@@@@@@@@ Clarity\'s response @@@@@@@@@@@@@@@@@@@');
  sails.log.info(response.data.xml_response);
  return response.data.xml_response;
};

const ClarityService = {
  requestApi: function (reqOpts) {
    return new Promise(function (resolve, reject) {
      request(reqOpts, function (error, res, body) {
        if (!error) {
          resolve(body);
        } else {
          if (error) return reject(error);
          reject(body);
        }
      });
    });
  },

  getInquiryPayload: function (userDetails, street_1, street_2, trackingNumber, checkingAccountData) {

    const SSN_NUMBER = userDetails.ssn_number || userDetails.ssnNumber;
    const inquiryData = {
      username: sails.config.clarityConfig.username,
      password: sails.config.clarityConfig.password,
      group_id: sails.config.clarityConfig.group_id,
      account_id: sails.config.clarityConfig.account_id,
      location_id: sails.config.clarityConfig.location_id,
      control_file_name: userDetails.control_file_name || sails.config.clarityConfig.control_file_name,
      inquiry_purpose_type: sails.config.clarityConfig.inquiry_purpose_type,
      inquiry_tradeline_type: sails.config.clarityConfig.inquiry_tradeline_type,
      first_name: userDetails.firstName,
      last_name: userDetails.lastName,
      email_address: userDetails.email,
      cell_phone: userDetails?.phoneNumber?.replace(/[^0-9]/g, ""),
      date_of_birth: moment(userDetails.dateOfBirth).format("YYYY-MM-DD"),
      street_address_1: street_1,
      street_address_2: street_2,
      city: userDetails.city,
      state: userDetails.state,
      zip_code: userDetails.zipCode || '11101',
      social_security_number: SSN_NUMBER?.replace(/[^0-9]/g, "")
    };

    if (trackingNumber) {
      inquiryData.initiating_inquiry = trackingNumber;
    }

    if (checkingAccountData) {
      inquiryData.bank_account_number = checkingAccountData.accountNumber,
      inquiryData.bank_routing_number =  checkingAccountData.routingNumber
    }
    console.log("inquiryDatainquiryData", inquiryData)
    // if (sails.config.clarityConfig.apiBaseUrl.includes("test")) {
    //   inquiryData.social_security_number = sails.config.clarityConfig.testCase;
    // }
    return inquiryData;
  },

  makeInquiry: async function (userDetails, trackingNumber = null, checkingAccountData = null) {
    try {
      const { street, unitapt } = userDetails;
      const streetAddress = street.toLowerCase();
      const units = [" apt", " suite", " #"];
      let street_1 = street;
      let street_2 = unitapt;
      if (street_2 == "") {
        units.forEach((unit) => {
          if (streetAddress.indexOf(unit.toLowerCase()) > -1) {
            const st = userDetails.street.split(unit);
            if (st[1]) {
              street_2 = `${unit} ${st[1]}`.trim();
            }
            street_1 = st[0];
          }
        });
      }

      const inquiryData = ClarityService.getInquiryPayload(userDetails, street_1, street_2, trackingNumber, checkingAccountData);
      sails.log.info("ClarityService.makeInquiry::inquiryData", inquiryData);

      const jsonData = { inquiry: inquiryData };

      const reqOpts = {
        url: sails.config.clarityConfig.apiBaseUrl,
        method: "POST",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json"
        },
        json: jsonData
      };
      const data = await ClarityService.requestApi(reqOpts);
      sails.log.info("ClarityService.makeInquiry::response", data);
      // await ClarityResponse.saveClarityResponse(userDetails.id, data)
      return {
        ok: true,
        data: { ...data }
      };
    } catch (error) {
      console.log("INQUIRY::ERROR ", error)
      return { ok: false, data: error };
    }
  },

  mlaCheck: async function (clarityData) {
    if (
      typeof clarityData !== "object" ||
      clarityData == null ||
      !clarityData.hasOwnProperty("clear_recent_history") ||
      typeof clarityData.clear_recent_history !== "object"
    ) {
      sails.log.verbose("clarityData:", Object.keys(clarityData));
      return Promise.resolve({ code: 500, status: "Invalid" });
    }
    return new Promise(async (resolve, reject) => {
      const crh = clarityData.clear_recent_history;
      if (crh.hasOwnProperty("supplier_recent_history")
        && crh.supplier_recent_history.hasOwnProperty("active_duty_status")
        && parseInt(crh.supplier_recent_history.active_duty_status) == 1) {
        resolve({ code: 200, status: "Mla found" });
      } else {
        resolve({ code: 404, status: "Mla not found" });
      }
    });

  },

  getLatestClarityInquiry: async function (userId) {
    return ClarityResponse.getUserLatestInquiryResponse(userId);
  },

  getClarityScore: async function (userId) {
    const clarityInquiryResponse = await ClarityService.getLatestClarityInquiry(userId);

    if (clarityInquiryResponse) {
      const clarityScore = _.get(clarityInquiryResponse, 'data.clear_credit_risk.score');

      return clarityScore;
    }

    throw new Error("Clarity Inquiry not found");
  }
}

module.exports = ClarityService;