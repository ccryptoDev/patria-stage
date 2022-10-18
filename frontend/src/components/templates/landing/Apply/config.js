import FormattedField from "../../../molecules/Form/Fields/FormattedField";
import TextField from "../../../molecules/Form/Fields/TextField";
import { AmountField, OptionsField } from "./Inputs";
import { reasons } from "../../../../utils/select-options";

export const formInit = () => {
  return {
    email: { value: "", message: "", required: true },
    requestedLoan: { value: "", message: "", required: true },
    reason: { value: reasons[0].value, message: "", required: true },
    firstName: { value: "", message: "", required: true },
    lastName: { value: "", message: "", required: true },
    phoneNumber: { value: "", message: "", required: true },
  };
};

export const renderFields = (form) => [
  {
    value: form.requestedLoan.value,
    name: "requestedLoan",
    placeholder: "Loan Amount",
    message: form.requestedLoan.message,
    thousandSeparator: true,
    component: AmountField,
  },
  {
    value: form.reason.value,
    name: "reason",
    placeholder: "Select a reason",
    message: form.reason.message,
    thousandSeparator: true,
    component: OptionsField,
    options: reasons,
  },
];

export const renderCredentialsFields = (form) => [
  {
    value: form.firstName.value,
    name: "firstName",
    placeholder: "First Name",
    message: form.firstName.message,
    thousandSeparator: true,
    component: TextField,
  },
  {
    value: form.lastName.value,
    name: "lastName",
    placeholder: "Last Name",
    message: form.lastName.message,
    thousandSeparator: true,
    component: TextField,
  },
  {
    value: form.email.value,
    name: "email",
    placeholder: "Email",
    message: form.email.message,
    thousandSeparator: true,
    component: TextField,
  },
  {
    value: form?.phoneNumber?.value,
    name: "phoneNumber",
    placeholder: "+1 (***) *** ****",
    message: form?.phoneNumber?.message || "",
    component: FormattedField,
    format: "+1 (###) ### ####",
    mask: "_",
  },
];
