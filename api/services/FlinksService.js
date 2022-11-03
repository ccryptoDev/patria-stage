const { default: Axios } = require("axios");

const FlinkService = {
  BASE_URL_SANDBOX: sails.config.BASE_URL_SANDBOX,
  AUTHORIZE_URL_SANDBOX: sails.config.AUTHORIZE_URL_SANDBOX,
  ACCOUNT_DETAILS_REQUEST: sails.config.ACCOUNT_DETAILS,
  REQUEST_DELIVER_SANDBOX: sails.config.REQUEST_DELIVER_SANDBOX,
  INCOME_ATTRIBUTES: sails.config.INCOME_ATTRIBUTES,
  USER_ANALYSIS: sails.config.USER_ANALYSIS,

  getRequestId: async function(loginId) {
    try {
      const url = `${this.BASE_URL_SANDBOX}${this.AUTHORIZE_URL_SANDBOX}`;
      const header = { "content-type": "application/json" };
      const body = {
        LoginId: loginId,
        MostRecentCached: true,
      };
      console.log("request=", body);
      const data = await Axios.post(url, body, { headers: header });
      const { RequestId } = data.data;
      return {
        data: { requestId: RequestId },
        ok: true,
      };
    } catch (error) {
      console.log("error=", error.response);
      return { ok: false, error: error.data.message };
    }
  },

  isAuthorized: async function(context) {
    try {
      const { username, password, bankName } = context;

      const url = `${this.BASE_URL_SANDBOX}${this.AUTHORIZE_URL_SANDBOX}`;
      const header = { "content-type": "application/json" };
      const body = {
        Username: username,
        Password: password,
        Institution: bankName,
        MostRecentCached: true,
      };

      const data = await Axios.post(url, body, { headers: header });

      const { RequestId, Login } = data.data;
      return {
        data: { requestId: RequestId, loginId: Login.Id },
        ok: true,
      };
    } catch (error) {
      sails.log.error(`FlinksService#::Err ::`, error);
      const errMsg =
        error.response?.data?.Message ||
        Object.values(error.response?.data?.ValidationDetails)[0][0];
      return { ok: false, error: errMsg };
    }
  },

  requestAccountDetails: async function(flinkCreds) {
    try {
      const { loginId, requestId, selectedAccountId } = flinkCreds;
      const header = { "content-type": "application/json" };
      const body = {
        LoginId: loginId,
        RequestId: requestId,
        AccountsFilter: [selectedAccountId],
      };

      const url = `${this.BASE_URL_SANDBOX}${this.ACCOUNT_DETAILS_REQUEST}`;

      const data = await Axios.post(url, body, { headers: header });
      // console.log("requestAccountDetails", data.data);
      return {
        data: data.data,
        status: data.status,
        ok: true,
      };
    } catch (error) {
      sails.log.error("FlinkService#requestAccountDetails:", error);
      const errMsg =
        error.response?.data?.Message ||
        error.response?.data?.ValidationDetails;
      return { ok: false, error: errMsg };
    }
  },

  getAccountDetails: async function(requestId) {
    try {
      const header = { "content-type": "application/json" };
      const url = `${this.BASE_URL_SANDBOX}${this.REQUEST_DELIVER_SANDBOX}/${requestId}`;
      const data = await Axios.get(url, { headers: header });

      return {
        data: data.data,
        status: data.status,
        ok: true,
      };
    } catch (error) {
      sails.log.error(`ERROR:getAccountDetails::${error}`);
      return { ok: false, error: error?.data?.message };
    }
  },

  getIncomeAttributes: async function(params, loginId) {
    try {
      const { requestId } = params;
      const header = { "content-type": "application/json" };
      const url = `${this.BASE_URL_SANDBOX}/insight/login/${loginId}/attributes/${requestId}${this.INCOME_ATTRIBUTES}`;

      const data = await Axios.get(url, { headers: header });

      return {
        data: data.data,
        ok: true,
      };
    } catch (error) {
      error = error.data ? error.data.message : error;
      sails.log.error("FlinkService#getIncomeAttributes:", error);
      return { ok: false, error };
    }
  },

  getUserAnalysisAttribute: async function(params) {
    try {
      const { requestId, loginId } = params;

      const header = { "content-type": "application/json" };
      const url = `${this.BASE_URL_SANDBOX}/insight/login/${loginId}/attributes/${requestId}${this.USER_ANALYSIS}`;

      const data = await Axios.get(url, { headers: header });

      return {
        data: data.data,
        ok: true,
      };
    } catch (error) {
      error = error.data ? error.data.message : error;
      sails.log.error("FlinkService#getUserAnalysisAttribute:", error);
      return { ok: false, error };
    }
  },

  storeAchAccount: async function(user, flinksAccountDetails, screenTrackingId) {
    try {
      const payload = {
        screenTrackingId: screenTrackingId,
        billingAddress1: `${user.street} ${user.state} ${user.city}`,
        billingCity: user.city,
        billingFirstName: user.firstName,
        billingLastName: user.lastName,
        billingState: user.state,
        billingZip: user.zipCode,
        routingNumber: flinksAccountDetails?.routingNumber, // not returned in Flinks tests
        accountNumber: flinksAccountDetails?.accountNumber,
        financialInstitution: flinksAccountDetails?.institution,
        isDefault: true,
      };

      const lmsBaseUrl = sails?.config?.appManagement.LMS_DEV_URL;

      await Axios.post(`${lmsBaseUrl}/api/application/addCard`, payload);

      return { ok: true };
    } catch (error) {
      sails.log.error("FlinksService#storeAchAccount::Error>>", error);
      return { ok: false, error };
    }
  },

  retryGetAccountDetails(flinkCreds, maxRetries = 6, interval = 10000) {
    try {
      return new Promise(async (resolve, reject) => {
        let {
          data: userAccountDetails,
          status: statusCode,
        } = await this.requestAccountDetails(flinkCreds);

        if (statusCode === 200) {
          sails.log.info("FlinksService#retryGetAccountDetails::done");
          return resolve(userAccountDetails);
        }

        if (statusCode === 202) {
          for (let retryCount = 1; retryCount < maxRetries; retryCount++) {
            sails.log.info("FlinksService#retryGetAccountDetails::retrying...");
            await delay(interval);

            const { data, status, ok } = await this.getAccountDetails(
              flinkCreds.requestId
            );

            if (!ok) {
              return reject(data);
            }

            if (status === 200) {
              sails.log.info("FlinksService#retryGetAccountDetails::done");
              return resolve(data);
            }
          }
        }

        reject("Unable to retrieve user account details!");
      });
    } catch (error) {
      sails.log.error("FlinksService#retryGetAccountDetails::Error>>", error);
      return { ok: false, error };
    }
  },
};

function delay(timeout) {
  return new Promise((resolve) => setTimeout(resolve, timeout));
}

module.exports = FlinkService;
