import TextField from "../../../../../../molecules/Form/Fields/TextField";

export const accountTypes = {
  SAVING: "SAVING",
  CHECKING: "CHECKING",
};

export const initForm = ({
  cardNumber = "",
  fullName = "",
  expirationDate = "",
  securityCode = "",
  routingNumber = "",
  accountNumber = "",
  financialInstitution = "",
}) => {
  return {
    cardNumber: { value: cardNumber, message: "" },
    fullName: { value: fullName, message: "" },
    expirationDate: { value: expirationDate, message: "" },
    securityCode: { value: securityCode, message: "" },
    routingNumber: { value: routingNumber, message: "" },
    accountNumber: { value: accountNumber, message: "" },
    financialInstitution: { value: financialInstitution, message: "" },
    accountType: { value: accountTypes.SAVING, message: "" },
    manualPayment: { value: false, message: "" },
  };
};

export const inintAddressForm = ({
  city = "",
  firstName = "",
  lastName = "",
  street = "",
  state = "",
  zipCode = "",
}) => {
  return {
    firstName: { value: firstName, message: "" },
    lastName: { value: lastName, message: "" },
    street: { value: street, message: "" },
    city: { value: city, message: "" },
    state: { value: state, message: "" },
    zipCode: { value: zipCode, message: "" },
  };
};

export const renderBillingAddress = (form) => [
  {
    value: form.firstName.value,
    name: "firstName",
    component: TextField,
    placeholder: "First Name",
    message: form.firstName.message,
    disabled: true,
  },
  {
    value: form.lastName.value,
    name: "lastName",
    component: TextField,
    placeholder: "Last Name",
    message: form.lastName.message,
    disabled: true,
  },
  {
    value: form.street.value,
    name: "street",
    component: TextField,
    placeholder: "Street",
    message: form.street.message,
    disabled: true,
  },
  {
    value: form.city.value,
    name: "city",
    component: TextField,
    placeholder: "City",
    message: form.city.message,
    disabled: true,
  },
  {
    value: form.state.value,
    name: "state",
    component: TextField,
    message: form.state.message,
    disabled: true,
  },
  {
    value: form.zipCode.value,
    name: "zipCode",
    component: TextField,
    placeholder: "Zip Code",
    message: form.zipCode.message,
    disabled: true,
  },
];
