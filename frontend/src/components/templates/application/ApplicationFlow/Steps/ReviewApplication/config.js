import TextField from "../../../../../molecules/Form/Fields/TextField";
import FormattedField from "../../../../../molecules/Form/Fields/FormattedField";
// import Select from "../../../../../molecules/Form/Fields/Select/Default";
// import {
//   incomeTypeOptions,
//   employerStatusOptions,
//   statesListOptions,
// } from "../../select-options";
// import { validateDob } from "../../../../../../utils/validators/dob";

export const initEmploymentForm = ({
  typeOfIncome = "",
  employerName = "",
  employerPhone = "",
  employerStatus = "",
  payFrequency = "",
  lastPayDate = "",
  nextPayDate = "",
  secondPayDate = "",
  isAfterHoliday: paymentBeforeAfterHolidayWeekend = "",
}) => {
  return {
    typeOfIncome: { value: typeOfIncome, message: "" },
    employerName: { value: employerName, message: "" },
    employerPhone: { value: employerPhone, message: "" },
    employerStatus: { value: employerStatus, message: "" },
    payFrequency: { value: payFrequency, message: "" },
    lastPayDate: { value: lastPayDate, message: "" },
    nextPayDate: { value: nextPayDate, message: "" },
    secondPayDate: { value: secondPayDate, message: "" },
    paymentBeforeAfterHolidayWeekend: {
      value: paymentBeforeAfterHolidayWeekend,
      message: "",
    },
  };
};

export const initPersonalInfo = ({
  firstName = "",
  lastName = "",
  email = "",
  dateOfBirth = "",
  ssnNumber: ssn = "",
  phoneNumber = "",
  street = "",
  city = "",
  zipCode = "",
  state = "",
}) => {
  return {
    firstname: { value: firstName, message: "" },
    lastname: { value: lastName, message: "" },
    email: { value: email, message: "" },
    dateOfBirth: { value: dateOfBirth, message: "" },
    ssn_number: { value: ssn, message: "" },
    phoneNumber: { value: phoneNumber, message: "" },
    street: { value: street, message: "" },
    city: { value: city, message: "" },
    zipCode: { value: zipCode, message: "" },
    state: { value: state, message: "" },
  };
};

export const renderPersonalInfoFields = (form) => [
  {
    value: form?.firstname?.value,
    name: "firstname",
    component: TextField,
    placeholder: "First Name",
    message: form?.firstname?.message,
  },
  {
    value: form?.lastname?.value,
    name: "lastname",
    component: TextField,
    placeholder: "Last Name",
    message: form?.lastname?.message,
  },
  {
    value: form?.phoneNumber?.value,
    name: "phoneNumber",
    component: FormattedField,
    placeholder: "Mobile Phone",
    mask: "_",
    format: "+1 (###) ### ####",
    message: form?.phoneNumber?.message,
  },
  {
    value: form?.ssn_number?.value,
    name: "ssn_number",
    component: FormattedField,
    placeholder: "Social Security Number",
    mask: "_",
    format: "### ## ####",
    message: form?.ssn_number?.message,
  },
  {
    value: form?.dateOfBirth?.value,
    name: "dateOfBirth",
    placeholder: "Birth Date",
    message: form.dateOfBirth?.message || "",
    mask: "_",
    format: "##/##/####",
    useFormatted: true,
    component: FormattedField,
  },
  {
    value: form?.email?.value,
    name: "email",
    component: TextField,
    placeholder: "Enter your Email",
    message: form?.email?.message,
    lockEditing: true,
  },
  {
    value: form.street.value,
    name: "street",
    component: TextField,
    placeholder: "Street",
    message: form.street.message,
  },
  {
    value: form.city.value,
    name: "city",
    component: TextField,
    placeholder: "City",
    message: form.city.message,
  },
  {
    value: form.zipCode.value,
    name: "zipCode",
    component: TextField,
    placeholder: "Zip Code",
    message: form.zipCode.message,
  },
  {
    value: form.state.value,
    name: "state",
    component: TextField,
    // options: statesListOptions,
    placeholder: "State",
    message: form.state.message,
  },
];

export const renderEmploymentFields = (form) => [
  {
    value: form.typeOfIncome.value,
    name: "typeOfIncome",
    component: TextField,
    // options: incomeTypeOptions,
    placeholder: "Income Type",
    message: form.typeOfIncome.message,
  },
  {
    value: form.employerName.value,
    name: "employerName",
    component: TextField,
    placeholder: "Employer Name",
    message: form.employerName.message,
  },
  {
    value: form.employerPhone.value,
    name: "employerPhone",
    component: FormattedField,
    placeholder: "Work Phone",
    mask: "_",
    format: "+1 (###) ### ####",
    message: form.employerPhone.message,
  },
  {
    value: form.employerStatus.value,
    name: "employerStatus",
    component: TextField,
    // options: employerStatusOptions,
    placeholder: "Employment Status",
    message: form.employerStatus.message,
  },
];
