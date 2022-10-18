import TextField from "../../../molecules/Form/Fields/TextField";
import FormattedField from "../../../molecules/Form/Fields/FormattedField";
import Password from "../../../molecules/Form/Fields/Password";
import { IAccountForm, IForgotPasswordForm, IRegisterForm } from "../types";

export const initLoginForm = () => {
  return {
    email: { value: "", message: "" },
    password: { value: "", message: "" },
  };
};

export const initRegisterForm = () => {
  return {
    email: { value: "", message: "" },
    password: { value: "", message: "" },
    repassword: { value: "", message: "" },
  };
};

export const initRestorPasswordForm = () => {
  return {
    email: { value: "", message: "" },
    code: { value: "", message: "" },
  };
};

export const renderLoginFormFields = (form: IAccountForm) => [
  {
    value: form?.email?.value || "",
    name: "email",
    placeholder: "Email Address",
    message: form.email?.message || "",
    component: TextField,
  },
  {
    value: form?.password?.value || "",
    name: "password",
    placeholder: "Password",
    message: form?.password?.message || "",
    component: Password,
    type: "password",
    valid: form?.password?.valid,
  },
];

export const renderRegisterFormFields = (form: IRegisterForm) => [
  {
    value: form?.email?.value || "",
    name: "email",
    placeholder: "Email Address",
    message: form.email?.message || "",
    component: TextField,
  },
  {
    value: form?.password?.value || "",
    name: "password",
    placeholder: "Create Password",
    message: form?.password?.message || "",
    component: Password,
    type: "password",
  },
  {
    value: form?.repassword?.value || "",
    name: "repassword",
    placeholder: "Confirm Password",
    message: form?.password?.message || "",
    component: Password,
    type: "password",
  },
];

export const renderEmailField = (form: IForgotPasswordForm) => [
  {
    value: form?.email?.value || "",
    name: "email",
    placeholder: "Email Address",
    message: form.email?.message || "",
    component: TextField,
  },
];

export const renderCodeField = (form: IForgotPasswordForm) => [
  {
    value: form?.code?.value || "",
    name: "code",
    mask: "_",
    format: "######",
    placeholder: "Verification Code",
    message: form.code?.message || "",
    component: FormattedField,
  },
];
