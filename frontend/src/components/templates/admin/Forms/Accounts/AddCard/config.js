import TextField from "../../../../../molecules/Form/Fields/TextField";
import FortattedField from "../../../../../molecules/Form/Fields/FormattedField";

export const cardDetailsInit = {
  cardNumber: { value: "", valid: false, required: true, message: "" },
  fullName: { value: "", valid: false, required: true, message: "" },
  expiration: { value: "", valid: false, required: true, message: "" },
  cardCode: { value: "", valid: false, required: true, message: "" },
};

export const billingInit = {
  billingFirstName: { value: "", valid: false, required: true, message: "" },
  billingLastName: { value: "", valid: false, required: true, message: "" },
  billingAddress1: { value: "", valid: false, required: true, message: "" },
  billingCity: { value: "", valid: false, required: true, message: "" },
  billingState: { value: "", valid: false, required: true, message: "" },
  billingZip: { value: "", valid: false, required: true, message: "" },
};

export const renderCardDetails = (form) => [
  {
    value: form.cardNumber.value,
    name: "cardNumber",
    placeholder: "Card Number",
    message: form.cardNumber?.message || "",
    component: FortattedField,
    format: "#### #### #### ####",
    valid: form.cardNumber?.valid,
  },
  {
    value: form.fullName.value,
    name: "fullName",
    placeholder: "Full Name",
    message: form.fullName?.message || "",
    component: TextField,
    valid: form.fullName?.valid,
  },
  {
    value: form.expiration.value,
    name: "expiration",
    placeholder: "Expiration (MM/YY)",
    message: form.expiration?.message || "",
    component: FortattedField,
    format: "##/##",
    mask: ["M", "M", "Y", "Y"],
    valid: form.expiration?.valid,
  },
  {
    value: form.cardCode.value,
    name: "cardCode",
    placeholder: "Security Code",
    message: form.cardCode?.message || "",
    component: FortattedField,
    format: "###",
    valid: form.cardCode?.valid,
    type: "password",
  },
];

export const renderBillingDetails = (form) => [
  {
    value: form.billingFirstName.value,
    name: "billingFirstName",
    placeholder: "First Name",
    message: form.billingFirstName?.message || "",
    component: TextField,
    valid: form.billingFirstName?.valid,
  },
  {
    value: form.billingLastName.value,
    name: "billingLastName",
    placeholder: "Last Name",
    message: form.billingLastName?.message || "",
    component: TextField,
    valid: form.billingLastName?.valid,
  },
  {
    value: form.billingAddress1.value,
    name: "billingAddress1",
    placeholder: "Street Address",
    message: form.billingAddress1?.message || "",
    component: TextField,
    valid: form.billingAddress1?.valid,
  },
  {
    value: form.billingCity.value,
    name: "billingCity",
    placeholder: "Enter your city",
    message: form.billingCity?.message || "",
    component: TextField,
    valid: form.billingCity?.valid,
  },
  {
    value: form.billingState.value,
    name: "billingState",
    placeholder: "Enter your state",
    message: form.billingState?.message || "",
    component: TextField,
    valid: form.billingState?.valid,
  },
  {
    value: form.billingZip.value,
    name: "billingZip",
    placeholder: "Zip Code",
    message: form.billingZip?.message || "",
    component: TextField,
    valid: form.billingZip?.valid,
  },
];
