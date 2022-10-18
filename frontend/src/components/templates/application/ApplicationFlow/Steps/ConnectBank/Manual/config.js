import TextField from "../../../../../../molecules/Form/Fields/TextField";
import FormattedField from "../../../../../../molecules/Form/Fields/FormattedField";

export const initForm = () => {
  return {
    bankName: { value: "", message: "" },
    accountHolder: { value: "", message: "" },
    routingNumber: { value: "", message: "" },
    accountNumber: { value: "", message: "" },
    confirmAccountNumber: { value: "", message: "" },
  };
};

export const renderFormFields = (form) => [
  {
    value: form.bankName.value,
    name: "bankName",
    component: TextField,
    placeholder: "Bank Name",
    message: form.bankName.message,
  },
  {
    value: form.accountHolder.value,
    name: "accountHolder",
    component: TextField,
    placeholder: "Primary Account Holder",
    message: form.accountHolder.message,
  },
  {
    value: form.routingNumber.value,
    name: "routingNumber",
    component: FormattedField,
    placeholder: "Routing Number",
    format: "#########",
    message: form.routingNumber.message,
  },
  {
    value: form.accountNumber.value,
    name: "accountNumber",
    component: FormattedField,
    placeholder: "Account Number",
    format: "############",
    message: form.accountNumber.message,
  },
  {
    value: form.confirmAccountNumber.value,
    name: "confirmAccountNumber",
    component: FormattedField,
    placeholder: "Confirm Account Number",
    format: "############",
    message: form.confirmAccountNumber.message,
  },
];

export const validateForm = (form) => {
  const newForm = { ...form };
  let isValid = true;
  Object.keys(newForm).forEach((key) => {
    if (key === "accountHolder" && newForm[key].value.trim().length < 3) {
      isValid = false;
      newForm[key].message = "enter first name and last name";
    } else if (
      key === "bankName" &&
      !/^[0-9A-Za-z\s]+$/.test(newForm[key].value.trim())
    ) {
      isValid = false;
      newForm[key].message = "enter a valid bank";
    } else if (key === "routingNumber" && newForm[key].value.length !== 9) {
      isValid = false;
      newForm[key].message = "enter a valid routing number";
    } else if (
      key === "accountNumber" &&
      !!(newForm[key].value.length < 5 || !!(newForm[key].value.length > 15))
    ) {
      isValid = false;
      newForm[key].message = "enter a valid bank account number";
    } else if (
      key === "confirmAccountNumber" &&
      !newForm.accountNumber.message &&
      newForm.accountNumber.value !== newForm.confirmAccountNumber.value
    ) {
      isValid = false;
      newForm[key].message = "this field should match the account number";
    }
  });

  return [isValid, newForm];
};
