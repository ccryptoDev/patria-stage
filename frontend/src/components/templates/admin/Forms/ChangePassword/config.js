import PasswordField from "../../../../molecules/Form/Fields/Password";

export const initialForm = {
  password: { value: "", message: "", required: true },
  repassword: { value: "", message: "", required: true },
};

export const fields = (form) => [
  {
    value: form.password?.value || "",
    placeholder: "Enter new password",
    label: "Password",
    message: form.password?.message || "",
    name: "password",
    component: PasswordField,
  },
  {
    value: form.repassword?.value || "",
    placeholder: "Repeat password",
    label: "Repeat password",
    message: form.repassword?.message || "",
    name: "repassword",
    component: PasswordField,
  },
];
