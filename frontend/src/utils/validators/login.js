import { validateEmail } from "./email";
import { validatePassword } from "./password";
import { emailRegexp, passwordRegexp } from "../regexp";

export const validateLogin = (form) => {
  const newForm = { ...form };
  let isValid = true;
  const parsedForm = {};

  // check if the password has right formatting
  if (passwordRegexp.test(newForm?.password?.value)) {
    parsedForm.password = newForm.password.value;
  } else {
    isValid = false;
    newForm.password.message =
      "Minimum 8 characters, 1 letter, 1 number and 1 special character";
  }

  // check if the email has the right formatting
  const validEmail = emailRegexp.test(
    String(newForm.email?.value).toLowerCase()
  );
  if (validEmail) {
    parsedForm.email = newForm.email.value;
  } else {
    newForm.email.message = "Enter a valid email";
    isValid = false;
  }

  // return the validation result
  if (!isValid) {
    return { validatedForm: newForm, isValid };
  }
  return { validatedForm: parsedForm, isValid };
};

export const validateRegisterForm = (form) => {
  let newForm = { ...form };
  let isValid = true;

  // text all fields except for:
  const exclude = ["email", "password", "repassword"];

  Object.keys(newForm).forEach((key) => {
    if (
      newForm[key].required &&
      !newForm[key].value &&
      !exclude.includes(key)
    ) {
      newForm[key].message = "This field is required";
      isValid = false;
    }
  });

  // test email
  const [emaildIsValid, validatedEmail] = validateEmail(newForm);
  if (!emaildIsValid) {
    isValid = emaildIsValid;
  }
  newForm.email = validatedEmail.email;
  // email validation ends

  // test password fields
  const [passwordIsValid, validatedPassword] = validatePassword(
    newForm,
    isValid
  );
  if (!passwordIsValid) {
    isValid = passwordIsValid;
  }
  newForm = { ...newForm, ...validatedPassword };
  // password validation ends

  if (!isValid) {
    return { updatedForm: newForm, isValid };
  }
  const updatedForm = {};
  delete newForm.repassword;
  Object.keys(newForm).forEach((key) => {
    updatedForm[key] = newForm[key].value;
  });
  return { isValid, updatedForm };
};
