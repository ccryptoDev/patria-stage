import TextField from "../../../../../../../molecules/Form/Fields/TextField";
import FormattedField from "../../../../../../../molecules/Form/Fields/FormattedField";

export const renderACHPayment = (form) => [
  {
    value: form?.routingNumber?.value,
    name: "routingNumber",
    component: TextField,
    // format: "#########",
    // mask: "_",
    placeholder: "Routing Number",
    message: form?.routingNumber?.message,
    editable: true,
  },
  {
    value: form?.financialInstitution?.value,
    name: "financialInstitution",
    component: TextField,
    placeholder: "Financial Institution",
    message: form?.financialInstitution?.message,
    editable: false,
  },
  {
    value: form?.accountNumber?.value,
    name: "accountNumber",
    component: TextField,
    // format: "#################",
    placeholder: "Account Number",
    message: form?.accountNumber?.message,
    editable: false,
  },
];
