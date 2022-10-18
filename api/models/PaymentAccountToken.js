const paymentTypes = {
  ACH: "ACH",
  CARD: "CARD",
};

module.exports = {
  attributes: {
    billingAddress1: {
      type: "string",
    },
    billingAddress2: {
      type: "string",
    },
    billingCity: {
      type: "string",
    },
    billingFirstName: {
      type: "string",
    },
    billingLastName: {
      type: "string",
    },
    billingState: {
      type: "string",
    },
    billingZip: {
      type: "string",
    },
    cardCode: {
      type: "string",
    },
    cardNumberLastFour: {
      type: "string",
    },
    customerToken: {
      type: "string",
    },
    expMonth: {
      type: "string",
    },
    expYear: {
      type: "string",
    },
    paymentMethodToken: {
      type: "string",
    },
    paymentType: {
      type: "string",
    },
    routingNumber: {
      type: "string",
    },
    accountNumber: {
      type: "string",
    },
    reaccountNumber: {
      type: "string",
    },
    financialInstitution: {
      type: "string",
    },
    nameOnCard: {
      type: "string",
    },
    accountType: {
      type: "string",
      //   enum: Object.values(paymentTypes).values(),
    },
    isDefault: {
      type: "boolean",
    },
    user: {
      model: "User",
    },
  },
  paymentTypes,

  addAchPaymentData: async function(
    achPaymentPayload,
    accountType = "CHECKING"
  ) {
    const payload = {
      ...achPaymentPayload,
      paymentType: "ACH",
      accountType,
    };

    await PaymentAccountToken.create(payload);
  },

  getOne: async function(query) {
    const result = await PaymentAccountToken.findOne(query);
    return result;
  },
};
