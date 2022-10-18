export const creditCardValidateExpiry = (expiryDate) => {
  const ERROR_TEXT_INVALID_EXPIRY_DATE = "Expiry date is invalid";
  const ERROR_TEXT_MONTH_OUT_OF_RANGE =
    "Expiry month should be between 01 and 12";
  const ERROR_TEXT_YEAR_OUT_OF_RANGE = "Expiry year cannot be in the past";

  const EXPIRY_DATE_REGEX = /^(\d{2})\/(\d{4}|\d{2})$/;
  const MONTH_REGEX = /(0[1-9]|1[0-2])/;

  const splitDate = expiryDate.split("/");
  if (!EXPIRY_DATE_REGEX.test(expiryDate)) {
    return { isValid: false, message: ERROR_TEXT_INVALID_EXPIRY_DATE };
  }

  const expiryMonth = splitDate[0];
  if (!MONTH_REGEX.test(expiryMonth)) {
    return { isValid: false, message: ERROR_TEXT_MONTH_OUT_OF_RANGE };
  }

  const expiryYear = splitDate[1];
  let currentYear = new Date().getFullYear();
  currentYear = parseInt(
    expiryYear.length === 4 ? currentYear : currentYear.toString().substr(-2),
    10
  );
  if (currentYear > parseInt(expiryYear, 10)) {
    return { isValid: false, message: ERROR_TEXT_YEAR_OUT_OF_RANGE };
  }

  return { isValid: true, message: "" };
};
