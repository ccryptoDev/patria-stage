import moment from "moment";

export const validatePersonalInfoForm = (form) => {
  const newForm = { ...form };
  let isValid = true;
  Object.keys(newForm).forEach((key) => {
    if (key === "dateOfBirth") {
      const message = validateDob(newForm.dateOfBirth.value);
      if (message) {
        isValid = false;
        newForm.dateOfBirth.message = message;
      }
    } else if (
      key === "phoneNumber" &&
      newForm.phoneNumber.value.trim().length !== 10
    ) {
      isValid = false;
      newForm.phoneNumber.message = "enter a valid phone number";
    } else if (
      key === "ssn_number" &&
      newForm.ssn_number.value.trim().length !== 9
    ) {
      isValid = false;
      newForm.ssn_number.message = "Enter a valid number";
    } else if (
      key === "firstname" &&
      newForm.firstname.value.trim().length < 1
    ) {
      newForm.firstname.message = "This field is required";
    } else if (key === "lastname" && newForm.lastname.value.trim().length < 1) {
      newForm.lastname.message = "This field is required";
    }
  });
  return [isValid, newForm];
};

const isDateValid = (date) => {
  return moment(date).isValid();
};

export const validateEIForm = (form) => {
  const newForm = { ...form };
  let isValid = true;
  Object.keys(newForm).forEach((key) => {
    if (
      key === "employerPhone" &&
      newForm.employerPhone.value.replace("_", "").replace("+", "").trim()
        .length !== 10
    ) {
      isValid = false;
      newForm.employerPhone.message = "enter a valid phone number";
    } else if (
      key === "lastPayDate" &&
      !isDateValid(newForm.lastPayDate.value)
    ) {
      newForm.lastPayDate.message = "enter a valid date";
      isValid = false;
    } else if (
      key === "nextPayDate" &&
      !isDateValid(newForm.nextPayDate.value)
    ) {
      newForm.nextPayDate.message = "enter a valid date";
      isValid = false;
    } else if (
      key === "secondPayDate" &&
      !isDateValid(newForm.secondPayDate.value)
    ) {
      newForm.secondPayDate.message = "enter a valid date";
      isValid = false;
    } else if (String(newForm[key].value).trim().length < 1) {
      newForm[key].message = "This field is required";
      isValid = false;
    }
  });

  return [isValid, newForm];
};
