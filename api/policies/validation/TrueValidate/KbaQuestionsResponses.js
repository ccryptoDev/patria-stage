const Joi = require("joi");

module.exports = (req, res, next) => {
  const OtpCodeSchema = Joi.array()
    .items(
      Joi.object({
        questionId: Joi.number()
          .integer()
          .required(),
        answerId: Joi.number()
          .integer()
          .required(),
      })
    )
    .min(1);

  const { error } = OtpCodeSchema.validate(req.body);

  if (error) {
    return SendError(new ErrorHandler(400, error), res);
  }

  return next();
};
