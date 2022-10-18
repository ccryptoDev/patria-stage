import { cloneDeep } from "lodash";

const validateRoutingNumber = (item, form, name) => {
  const updatedItem = { ...item };
  updatedItem.value = updatedItem.value.trim();
  if (updatedItem.value.length < 4) {
    updatedItem.valid = false;
  } else {
    updatedItem.valid = true;
    updatedItem.message = "";
  }
  return { ...form, [name]: { ...updatedItem } };
};

const validateNumber = (item, form, name) => {
  const updatedItem = { ...item };
  updatedItem.value = updatedItem.value.trim();
  if (updatedItem.value.length < 10) {
    updatedItem.valid = false;
  } else {
    updatedItem.valid = true;
    updatedItem.message = "";
  }
  return { ...form, [name]: { ...updatedItem } };
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
  switch (name) {
    case "routingNumber":
      return validateRoutingNumber(item, form, "routingNumber");
    case "accountNumber":
      return validateNumber(item, form, "accountNumber");
    default:
      return validateTextField(item, form, name);
  }
};

// VALIDATE FORM ON SUBMIT
export const validateForm = (form) => {
  let isValid = true;
  const updatedForm = cloneDeep(form);

  Object.keys(updatedForm).forEach((field) => {
    switch (updatedForm[field]) {
      case updatedForm.bankName:
        if (!updatedForm[field].valid) {
          updatedForm[field].message = "enter a valid name";
          isValid = false;
        } else {
          updatedForm[field].message = "";
        }
        break;
      case updatedForm.accountNumber:
        if (!updatedForm[field].valid) {
          updatedForm[field].message = "enter a valid account number";
          isValid = false;
        } else {
          updatedForm[field].message = "";
        }
        break;
      case updatedForm.routingNumber:
        if (!updatedForm[field].valid) {
          updatedForm[field].message = "Enter a valid number";
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
    return { parsedForm: { ...parsedForm }, isValid: true };
  }
  return { isValid: false, parsedForm: updatedForm };
};
