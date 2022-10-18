const Joi = require("joi");

const UserService = {
  validateFundingMethod: async function (methodData) {
    try {
      const fundingSchema = Joi.object({
        cardNumber: Joi.string().trim().required().allow('', null),
        fullName: Joi.string().trim().required().allow('', null),
        expirationDate: Joi.string().trim().required().allow('', null),
        securityCode: Joi.string().required().allow('', null),
        firstName: Joi.string().required().allow('', null),
        lastName: Joi.string().required().allow('', null),
        street: Joi.string().required().allow('', null),
        city: Joi.string().required().allow('', null),
        state: Joi.string().required().allow('', null),
        zipCode: Joi.string().required().allow('', null),
        routingNumber: Joi.string().required().allow('', null),
        accountNumber: Joi.string().required().allow('', null),
        reaccountNumber: Joi.string().allow('', null),
        financialInstitution: Joi.string().required().allow('', null),
        accountType: Joi.string().required().allow('', null),
        manualPayment: Joi.boolean().required().allow('', null),
      });
      await fundingSchema.validateAsync(methodData);
      return null;
    } catch (error) {
      return error.message;
    }
  }
};

module.exports = UserService;
