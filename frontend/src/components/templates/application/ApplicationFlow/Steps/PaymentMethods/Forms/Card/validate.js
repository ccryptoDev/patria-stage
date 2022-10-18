import { creditCardValidateExpiry } from "../../../../../../../../utils/validators/card-expiration";

export const validate = (form) => {
  const newForm = { ...form };
  let isValid = true;
  Object.keys(newForm).forEach((key) => {
    if (key === "expirationDate") {
      const date = newForm[key].value.replace(
        /^([0-9]{2})([0-9]{2})$/,
        "$1/$2"
      );
      const card = creditCardValidateExpiry(date);
      if (!card.isValid) {
        newForm[key].message = card.message;
        isValid = false;
      }
    } else if (key === "securityCode") {
      if (newForm[key].value.length < 3) {
        newForm[key].message = "enter a 3 digit code";
        isValid = false;
      } else if (!/^\d+$/.test(newForm[key].value)) {
        newForm[key].message = "values should be numbers";
        isValid = false;
      }
    } else if (key === "cardNumber") {
      const isCardNubmerValid = /^(\d{10}|\d{16})$/.test(
        newForm[key].value.trim()
      );
      if (!isCardNubmerValid) {
        newForm[key].message = "Enter a valid number";
        isValid = false;
      }
    } else if (key === "fullName") {
      const isValidName = newForm[key].value.trim().length >= 3;
      if (!isValidName) {
        newForm[key].message = "enter full name";
        isValid = false;
      }
    }
  });
  return [isValid, newForm];
};
