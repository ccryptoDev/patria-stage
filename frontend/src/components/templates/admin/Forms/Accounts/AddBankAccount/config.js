import TextField from "../../../../../molecules/Form/Fields/TextField";
import FortattedField from "../../../../../molecules/Form/Fields/FormattedField";
import RoutingNumberField from "../../../../../molecules/Form/Fields/RoutingNumber";

export const accountFormInit = {
  bankName: { value: "", valid: false, required: true, message: "" },
  routingNumber: { value: "", valid: false, required: true, message: "" },
  accountNumber: { value: "", valid: false, required: true, message: "" },
};

export const renderFormFields = (form) => [
  {
    value: form.bankName.value,
    name: "bankName",
    placeholder: "Enter bank Name",
    message: form.bankName?.message || "",
    component: TextField,
    valid: form.bankName?.valid,
    label: "Bank Name",
  },
  {
    value: form.accountNumber.value,
    name: "accountNumber",
    placeholder: "Enter account number",
    message: form.accountNumber?.message || "",
    component: FortattedField,
    valid: form.accountNumber?.valid,
    label: "Account Number",
    format: "############",
  },
  {
    value: form.routingNumber.value,
    name: "routingNumber",
    placeholder: "enter 4 digits",
    message: form.routingNumber?.message || "",
    component: RoutingNumberField,
    format: "####",
    valid: form.routingNumber?.valid,
    label: "Routing Number",
  },
];
