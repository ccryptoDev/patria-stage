import {
  validateAccountNumber,
  validateRoutingNumber,
} from "../../../../../../../../utils/validators/other";

export const validate = (form) => {
  const newForm = { ...form };
  let isValid = true;
  Object.keys(newForm).forEach((key) => {
    if (key === "accountNumber") {
      const message = validateAccountNumber(newForm[key].value);
      if (message) {
        isValid = false;
        newForm[key].message = message;
      }
    } else if (key === "routingNumber") {
      const message = validateRoutingNumber(newForm[key].value);
      if (message) {
        isValid = false;
        newForm[key].message = message;
      }
    } else if (key === "financialInstitution") {
      const isValidInstitution = newForm[key].value.trim().length > 0;
      if (!isValidInstitution) {
        isValid = false;
        newForm[key].message = "This field is required";
      }
    }
  });
  return [isValid, newForm];
};
