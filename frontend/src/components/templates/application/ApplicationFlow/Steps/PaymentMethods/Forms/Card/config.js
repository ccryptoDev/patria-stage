import TextField from "../../../../../../../molecules/Form/Fields/TextField";
import FormattedField from "../../../../../../../molecules/Form/Fields/FormattedField";
import Password from "../../../../../../../molecules/Form/Fields/Password";

export const renderCardDetail = (form) => [
  {
    value: form.cardNumber.value,
    name: "cardNumber",
    component: FormattedField,
    format: "################",
    placeholder: "Card Number",
    message: form.cardNumber.message,
  },
  {
    value: form.fullName.value,
    name: "fullName",
    component: TextField,
    placeholder: "Full Name",
    message: form.fullName.message,
  },
  {
    value: form.expirationDate.value,
    name: "expirationDate",
    component: FormattedField,
    format: "##/##",
    placeholder: "Expiration Date",
    message: form.expirationDate.message,
  },
  {
    value: form.securityCode.value,
    name: "securityCode",
    component: Password,
    maxLength: 3,
    placeholder: "Security Code",
    message: form.securityCode.message,
  },
];
