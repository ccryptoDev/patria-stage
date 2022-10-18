import TextField from "../../../components/molecules/Form/Fields/TextField";

export const initialForm = {
  firstName: { value: "Temeka", valid: false, required: false, message: "" },
  lastName: { value: "Adams", valid: false, required: true, message: "" },
  ssnNumber: { value: "3344", valid: false, required: true, message: "" },
};

export const renderFormFields = (form) => [
  {
    value: form?.firstName?.value,
    name: "firstName",
    placeholder: "Enter First Name",
    message: form.firstName?.message || "",
    component: TextField,
    label: "First Name",
  },
  {
    value: form?.lastName?.value,
    name: "lastName",
    placeholder: "Enter last name",
    message: form?.lastName?.message || "",
    component: TextField,
    valid: form?.lastName?.valid,
    label: "Last Name",
  },
  {
    value: form?.ssnNumber?.value,
    name: "ssnNumber",
    placeholder: "Enter First Name",
    message: form.ssnNumber?.message || "",
    component: TextField,
    label: "Socian Security Number",
  },
];
