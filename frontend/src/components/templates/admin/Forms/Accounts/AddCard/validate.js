import { cloneDeep } from "lodash";

const thisYear = new Date().getFullYear();
const thisMonth = new Date().getMonth() + 1;

// VALIDATE FORM ON SUBMIT
export default (form) => {
  let isValid = true;
  const updatedForm = cloneDeep(form);

  Object.keys(updatedForm).forEach((field) => {
    switch (updatedForm[field]) {
      case updatedForm.cardNumber:
        updatedForm[field].value = updatedForm[field].value.replaceAll(" ", "").trim();
        if ((updatedForm[field].value.length < 16 && updatedForm[field].required) || !updatedForm[field].valid) {
          updatedForm[field].message = "card number is required";
          isValid = false;
        } else {
          updatedForm[field].message = "";
        }
        break;
      case updatedForm.fullName:
      case updatedForm.billingFirstName:
      case updatedForm.billingLastName:
        updatedForm[field].value = updatedForm[field].value.trim();
        if ((updatedForm[field].value.length < 2 && updatedForm[field].required) || !updatedForm[field].valid) {
          updatedForm[field].message = "name should be at least 2 chars";
          isValid = false;
        } else {
          updatedForm[field].message = "";
        }
        break;
      case updatedForm.expiration:
        updatedForm[field].value = updatedForm[field].value.replaceAll(" ", "").trim();
        if ((updatedForm[field].value.length < 4 && updatedForm[field].required) || !updatedForm[field].valid) {
          updatedForm[field].message = "expiration date is required";
          isValid = false;
        } else {
          updatedForm[field].message = "";
        }

        break;
      case updatedForm.securityCode:
        updatedForm[field].value = updatedForm[field].value.replaceAll(" ", "").trim();
        if ((updatedForm[field].value.length < 3 && updatedForm[field].required) || !updatedForm[field].valid) {
          updatedForm[field].message = "security code is required";
          isValid = false;
        } else {
          updatedForm[field].message = "";
        }

        break;
      case updatedForm.billingAddress1:
      case updatedForm.billingCity:
      case updatedForm.billingState:
      case updatedForm.billingZip:
        updatedForm[field].value = updatedForm[field].value.trim();
        if ((updatedForm[field].value.length < 2 && updatedForm[field].required) || !updatedForm[field].valid) {
          updatedForm[field].message = "This field is required";
          isValid = false;
        } else {
          updatedForm[field].message = "";
        }

        break;
      default:
        updatedForm[field].message = "";
    }
  });

  if (isValid) {
    const parsedForm = {};
    Object.keys(updatedForm).forEach((key) => {
      parsedForm[key] = updatedForm[key].value;
    });
    const [expMonth, expYear] = parsedForm.expiration.split("/");
    return { parsedForm: { ...parsedForm, expMonth, expYear }, isValid };
  }
  return { isValid, parsedForm: updatedForm };
};

// VALIDATE FORM FIELDS ON INPUT CHANGE
const validateExpiration = (item, form) => {
  const updatedItem = { ...item };
  const [month, year] = updatedItem.value.split("/");
  if (+month > 12 || +month < 1) {
    updatedItem.valid = false;
    updatedItem.message = "month is invalid";
  } else if (+year + 2000 < thisYear || (+year + 2000 === thisYear && +month < thisMonth)) {
    updatedItem.valid = false;
    updatedItem.message = "card has expired";
  } else if (Number.isNaN(+month) || Number.isNaN(+year)) {
    updatedItem.valid = false;
    updatedItem.message = "enter valid date";
  } else {
    updatedItem.valid = true;
    updatedItem.message = "";
  }
  return { ...form, expiration: { ...updatedItem } };
};

const validateCardCode = (item, form) => {
  const updatedItem = { ...item };
  updatedItem.value = updatedItem.value.replaceAll(" ", "");
  if (updatedItem.value.length < 3) {
    updatedItem.valid = false;
    updatedItem.message = "enter 3 digit code";
  } else {
    updatedItem.valid = true;
    updatedItem.message = "";
  }
  return { ...form, cardCode: { ...updatedItem } };
};

const validateNumber = (item, form) => {
  const updatedItem = { ...item };
  updatedItem.value = updatedItem.value.replaceAll(" ", "");
  if (updatedItem.value.length < 16) {
    updatedItem.valid = false;
    updatedItem.message = "enter valid card number";
  } else {
    updatedItem.valid = true;
    updatedItem.message = "";
  }
  return { ...form, cardNumber: { ...updatedItem } };
};

const validateTextField = (item, form, name) => {
  const updatedItem = { ...item };
  if (updatedItem.value.trim().length < 2) {
    updatedItem.valid = false;
  } else {
    updatedItem.valid = true;
    updatedItem.message = "";
  }
  return { ...form, [name]: { ...updatedItem } };
};

export const validateInput = (form, name) => {
  const item = form[name];
  if (name === "expiration") {
    return validateExpiration(item, form);
  }
  if (name === "cardCode") {
    return validateCardCode(item, form);
  }
  if (name === "cardNumber") {
    return validateNumber(item, form);
  }
  return validateTextField(item, form, name);
};
