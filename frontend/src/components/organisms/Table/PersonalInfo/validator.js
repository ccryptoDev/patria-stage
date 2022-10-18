import moment from "moment";
import { dateFormat } from "../../../../utils/formats";
import { validateEmail } from "../../../../utils/validators/email";

function validatePhone(phone) {
  const phoneNumber = { ...phone };
  if (phoneNumber.value.trim().length < 10) {
    phoneNumber.message = "enter a valid phone number";
  } else {
    phoneNumber.message = "";
  }
  return phoneNumber;
}

function validateDob(dateOfBirth) {
  const dob = { ...dateOfBirth };
  if (dob.value) {
    const birthday = moment(dob.value, "M.D.YYYY");
    const age = moment().diff(birthday, "years");
    if (age < 18) {
      dob.message = "you should be at least 18 years old";
    } else {
      dob.message = "";
    }
  } else {
    dob.message = "This field is required";
  }
  return dob;
}

const parseDob = (dob) => {
  if (dob) {
    const newDob = moment(dob).utc().format(dateFormat).split("/");
    return {
      dobMonth: newDob[0],
      dobDay: newDob[1],
      dobYear: newDob[2],
    };
  }
  return {
    dob_month: "",
    dob_day: "",
    dob_year: "",
  };
};

export const parseFormToRequest = ({ dob, ...form }) => {
  const { dobMonth, dobDay, dobYear } = parseDob(dob);
  return {
    dob_month: dobMonth,
    dob_day: dobDay,
    dob_year: dobYear,
    ...form,
  };
};

const validate = (form) => {
  let newForm = { ...form };
  let isValid = true;
  Object.keys(newForm).forEach((key) => {
    if (newForm[key].required) {
      if (key === "phone" || key === "phoneNumber") {
        newForm[key] = { ...validatePhone(newForm[key]) };
        isValid = newForm[key].message ? false : isValid;
      } else if (key === "dob") {
        newForm[key] = { ...validateDob(newForm[key]) };
        isValid = newForm[key].message ? false : isValid;
      } else if (key === "email") {
        const [emailIsValid, email] = validateEmail(newForm[key]);
        newForm[key] = email;
        isValid = !emailIsValid ? false : isValid;
      } else if (
        key === "ssnNumber" &&
        newForm[key].value.replace(/\D+/g, "").length < 4
      ) {
        newForm[key].message = "need to enter 4 digits number";
        isValid = false;
      } else if (
        newForm[key].value.trim().length < 2 &&
        newForm[key].required
      ) {
        newForm[key].message = "This field is required";
        isValid = false;
      } else {
        newForm[key].message = "";
      }
    }
  });
  if (isValid) {
    Object.keys(newForm).forEach((key) => {
      newForm[key] = newForm[key].value;
    });
    newForm = parseFormToRequest({ ...newForm });
  }

  return [isValid, { ...newForm }];
};

export default validate;
