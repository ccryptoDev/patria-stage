const Joi = require("joi");

module.exports = (req, res, next) => {
  const otpCustomValidation = (value, helper) => {
    const isNumbersOnly = value.match(/^[0-9]+$/);

    if (!isNumbersOnly) {
      return helper.message("custom.numbers_only");
    }

    if (value.length !== 5) {
      return helper.message("custom.invalid_length");
    }

    return value;
  };

  const OtpCodeSchema = Joi.object({
    code: Joi.string()
      .custom(otpCustomValidation)
      .messages({
        "custom.numbers_only": "OTP code must be numbers only",
        "custom.invalid_length": "OTP code must be 5 digits long",
      })
      .required(),
  });

  const { error } = OtpCodeSchema.validate(req.body);

  if (error) {
    return SendError(new ErrorHandler(400, error), res);
  }

  return next();
};
