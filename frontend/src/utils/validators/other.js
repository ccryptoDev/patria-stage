import brnv from "bank-routing-number-validator";
import {
  accountNumberRegexp,
  ssnRegexp,
  ssnLastFourRegexp,
  zipCodeRegexp,
} from "../regexp";

export const validateTIN = (value) => {
  if (value.trim().length !== 9) {
    return "enter 9 digit number";
  }
  return "";
};

export const validateSSN = (value) => {
  if (!ssnRegexp.test(value.trim())) {
    return "enter correct number";
  }
  return "";
};

export const validateSSNLastFour = (value) => {
  if (!ssnLastFourRegexp.test(value.trim())) {
    return "enter correct number";
  }
  return "";
};

export const validatePhone = (value) => {
  if (value.replace("_", "").trim().length !== 10) {
    return "Enter a valid phone number";
  }
  return "";
};

export const validateAccountNumber = (value) => {
  const regexp = new RegExp(accountNumberRegexp);
  if (!regexp.test(value.trim())) {
    return "enter correct number";
  }
  return "";
};

export const validateZipCode = (value) => {
  const regexp = new RegExp(zipCodeRegexp);
  if (!regexp.test(value.trim())) {
    return "enter correct number";
  }
  return "";
};

export const validateRoutingNumber = (value) => {
  const isVaild = brnv.ABARoutingNumberIsValid(value);
  if (!isVaild) {
    return "enter correct number";
  }
  return "";
};

export const validateLoanAmount = (value, state) => {
  if (!state) {
    return "Select your state";
  }

  switch (state) {
    case "NM":
      if (+value < 5001 || +value > 100000) {
        return "Amount should be between $5,001 and $100,000";
      }
      break;
    default: {
      if (+value < 2500 || +value > 100000)
        return "Amount should be between $2,500 and $100,000";
    }
  }

  return "";
};
