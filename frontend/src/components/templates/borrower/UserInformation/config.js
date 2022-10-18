/* eslint-disable camelcase */
import TextField from "../../../molecules/Form/Fields/TextField";
import FormattedField from "../../../molecules/Form/Fields/FormattedField";
import { validateDob } from "../../../../utils/validators/dob";
import { validateEmail } from "../../../../utils/validators/email";

export const mockPersonalIngoForm = {
  firstName: "Temeka",
  lastName: "Adams",
  phone: "+1234567890",
  dob: "12/12/2000",
  ssn: "123456789",
  email: "test@test.com",
};

export const initPersonalInfoForm = (context) => {
  if (!context) {
    // eslint-disable-next-line no-param-reassign
  }
  const {
    firstname = "",
    lastname = "",
    phoneNumber = "",
    dateOfBirth = "",
    ssn_number = "",
    email = "",
  } = context;
  return {
    firstName: { value: firstname || "", message: "" },
    lastName: { value: lastname || "", message: "" },
    phoneNumber: { value: phoneNumber || "", message: "" },
    dob: { value: dateOfBirth || "", message: "" },
    ssn: { value: ssn_number || "", message: "" },
    email: { value: email || "", message: "" },
  };
};

export const renderPersonalInfoFields = (form) => [
  {
    value: form.firstName.value,
    name: "firstName",
    component: TextField,
    placeholder: "First Name",
    message: form.firstName.message,
  },
  {
    value: form.lastName.value,
    name: "lastName",
    component: TextField,
    placeholder: "Last Name",
    message: form.lastName.message,
  },
  {
    value: form.phoneNumber.value,
    name: "phoneNumber",
    component: FormattedField,
    placeholder: "Mobile Phone",
    mask: "_",
    format: "+1 (###) ### ####",
    message: form.phoneNumber.message,
  },
  {
    value: form.ssn.value,
    name: "ssn",
    component: FormattedField,
    placeholder: "Social Security Number",
    mask: "_",
    format: "#########",
    message: form.ssn.message,
  },
  {
    value: form?.dob?.value,
    name: "dob",
    placeholder: "Birth Date",
    message: form.dob?.message || "",
    mask: "_",
    format: "##/##/####",
    component: FormattedField,
  },
  {
    value: form.email.value,
    name: "email",
    component: TextField,
    placeholder: "Enter your Email",
    message: form.email.message,
  },
];

export const validatePIForm = (form) => {
  const newForm = { ...form };
  let isValid = true;
  Object.keys(newForm).forEach((key) => {
    if (key === "dob") {
      const message = validateDob(newForm.dob.value);
      if (message) {
        isValid = false;
        newForm.dob.message = message;
      }
    } else if (
      key === "phone" &&
      newForm.phone.value.replace("_", "").replace("+", "").trim().length !== 10
    ) {
      isValid = false;
      newForm.phone.message = "enter a valid phone number";
    } else if (key === "email") {
      const emailIsValid = validateEmail(newForm.email.value);
      if (!emailIsValid) {
        newForm.email.message = "Enter a valid email";
        isValid = false;
      }
    } else if (
      key === "ssn" &&
      newForm.ssn.value.trim().replace("_", "").length !== 9
    ) {
      isValid = false;
      newForm.ssn.message = "Enter a valid number";
    } else if (
      key === "firstName" &&
      newForm.firstName.value.trim().length < 1
    ) {
      newForm.firstName.message = "This field is required";
      isValid = false;
    } else if (key === "lastName" && newForm.lastName.value.trim().length < 1) {
      newForm.lastName.message = "This field is required";
      isValid = false;
    }
  });

  return [isValid, newForm];
};
