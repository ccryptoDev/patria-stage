import TextField from "../../../../../molecules/Form/Fields/TextField";
import FormattedField from "../../../../../molecules/Form/Fields/FormattedField";
import Password from "../../../../../molecules/Form/Fields/Password";
import { statesListOptions } from "../../../../../../utils/select-options";
import Select from "../../../../../molecules/Form/Fields/Select/Default";

export const initForm = ({
  firstName = "",
  lastName = "",
  phoneNumber = "",
  email = "",
  requestedLoan = "",
  ssn_number: ssn = "",
  dateOfBirth = "",
  street = "",
  city = "",
  state = "",
  zipCode = "",
}) => {
  return {
    firstName: { value: firstName, message: "" },
    lastName: { value: lastName, message: "" },
    requestedLoan: { value: requestedLoan, message: "" },
    phoneNumber: { value: phoneNumber, message: "" },
    dateOfBirth: { value: dateOfBirth, message: "" },
    ssn_number: { value: ssn, message: "" },
    email: { value: email, message: "" },
    password: { value: "", message: "" },
    repassword: { value: "", message: "" },
    street: { value: street, message: "" },
    city: { value: city, message: "" },
    zipCode: { value: zipCode, message: "" },
    state: { value: state, message: "" },
  };
};

export const renderFields = (form, editing = false) => {
  const fieldsEditing = new Set([
    "firstName",
    "lastName",
    "requestedLoan",
    "phoneNumber",
    "ssn_number",
    "dateOfBirth",
    "email",
    "street",
    "city",
    "zipCode",
    "state",
  ]);

  return [
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
      value: form.requestedLoan.value,
      name: "requestedLoan",
      component: FormattedField,
      placeholder: "Loan Amount",
      thousandSeparator: true,
      prefix: "$",
      message: form.requestedLoan.message,
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
      value: form.ssn_number.value,
      name: "ssn_number",
      component: FormattedField,
      placeholder: "Social Security Number",
      mask: "_",
      format: "### ## ####",
      message: form.ssn_number.message,
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
      value: form.email.value,
      name: "email",
      component: TextField,
      placeholder: "Enter your Email",
      message: form.email.message,
      lockEditing: editing,
    },
    {
      value: form.password.value,
      name: "password",
      component: Password,
      placeholder: "Create Password",
      message: form.password.message,
    },
    {
      value: form.repassword.value,
      name: "repassword",
      component: Password,
      placeholder: "Repeat Password",
      message: form.repassword.message,
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
      maxLength: "5",
    },
    {
      value: form.state.value,
      name: "state",
      component: Select,
      options: statesListOptions,
      placeholder: "State",
      message: form.state.message,
    },
  ].filter((formField) => !editing || fieldsEditing.has(formField.name));
};
