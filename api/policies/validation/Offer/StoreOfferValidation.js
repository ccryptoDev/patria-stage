const Joi = require("joi");
const { SendError, ErrorHandler } = require("../../../services/ErrorHandling");

module.exports = (req, res, next) => {
  const OfferSchema = Joi.object({
    term: Joi.number().required(),
    interestRate: Joi.number(),
    apr: Joi.number().required(),
    id: Joi.string()
      .optional()
      .allow(null, ""),
    regularPayment: Joi.number().required(),
    financedAmount: Joi.number().required(),
    loanCost: Joi.number().required(),
    totalPaid: Joi.number().required(),
  });

  const { error } = OfferSchema.validate(req.body);

  if (error) {
    return SendError(new ErrorHandler(400, error), res);
  }

  return next();
};
