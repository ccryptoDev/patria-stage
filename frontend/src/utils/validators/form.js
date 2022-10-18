import { emailRegexp } from "../regexp";
// validate generic forms
export const validateForm = (form) => {
  const newForm = { ...form };
  let isValid = true;
  Object.keys(newForm).forEach((key) => {
    if (newForm[key].required && !newForm[key].value && key !== "email") {
      newForm[key].message = "This field is required";
      isValid = false;
    }
  });

  const validEmail = emailRegexp.test(String(newForm.email?.value).toLowerCase());
  if (!validEmail && newForm.email?.required) {
    newForm.email.message = "Enter a valid email";
    isValid = false;
  }

  return { isValid, validatedForm: newForm };
};
