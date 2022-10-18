const Joi = require("joi");
const { SendError, ErrorHandler } = require("../../../services/ErrorHandling");

module.exports = (req, res, next) => {
  const VALID_INCOME_TYPES = [
    "disability",
    "ssn",
    "employed",
    "unemployed",
    "pension",
    "others",
  ];

  const VALID_EMPLOYMENT_STATUS = ["full-time", "part-time"];

  const dateValidation = (value, helpers) => {
    const DATE_FORMAT_REGEX = /^\d{4}\/\d{2}\/\d{2}$/;
      
    if (!value.match(DATE_FORMAT_REGEX)) {
      return helpers.error("custom.invalid_format");
    }
    
    const isValidDate = !!Date.parse(value);

    if (!isValidDate) {
      return helpers.error("custom.invalid_date");
    }

    return value;
  };

  const VALID_STATES = ['AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY']

  const LeadImportSchema = Joi.object({
    trueValidateSessionId: Joi.string().required(),
    loanAmount: Joi.number()
      .integer()
      .required(),
    personalInformation: Joi.object({
      firstName: Joi.string().required(),
      lastName: Joi.string().required(),
      phoneNumber: Joi.string().required(),
      ssnNumber: Joi.string().required(),
      birthday: Joi.string().custom(dateValidation).messages({
        "custom.invalid_format": "Date format is invalid. Expected format: YYYY/MM/DD",
        "custom.invalid_date": "Date is invalid",
      }).required(),
      email: Joi.string().required(),
      address: Joi.object({
        street: Joi.string().required(),
        city: Joi.string().required(),
        zipCode: Joi.string().required(),
        state: Joi.string().valid(...VALID_STATES).required(),
      }).required(),
    }).required(),
    employmentInformation: Joi.object({
      incomeType: Joi.string()
        .required()
        .valid(...VALID_INCOME_TYPES),
      annualIncome: Joi.number()
        .integer()
        .required(),
      employerName: Joi.string().required(),
      employerPhone: Joi.string().required(),
      employerStatus: Joi.string()
        .valid(...VALID_EMPLOYMENT_STATUS)
        .required(),
    }),
  });

  const { error } = LeadImportSchema.validate(req.body);

  if (error) {
    return SendError(new ErrorHandler(400, error), res);
  }

  return next();
};
