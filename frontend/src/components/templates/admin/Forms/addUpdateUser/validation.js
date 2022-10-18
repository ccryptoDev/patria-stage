import { validateEmail } from "../../../../../utils/validators/email";
import { validatePassword } from "../../../../../utils/validators/password";

export const validateForm = (form) => {
  const newForm = { ...form };
  let isValid = true;

  if (newForm.password.required) {
    const [passwordValid, password, repassword] = validatePassword({
      formPassword: newForm.password,
      formRePassword: newForm.repassword,
    });
    newForm.password = { ...password };
    newForm.repassword = { ...repassword };
    if (!passwordValid) {
      isValid = false;
    }
  }
  const [emailValid, email] = validateEmail(newForm.email);
  if (!emailValid) {
    isValid = false;
  }

  Object.keys(newForm).forEach((key) => {
    if (
      newForm[key].required &&
      !newForm[key].value &&
      key !== "email" &&
      key !== "password" &&
      key !== "repassword"
    ) {
      newForm[key].message = "This field is required";
      isValid = false;
    }
  });

  newForm.email = { ...email };
  if (isValid) {
    // PARSE FORM TO REQUEST BODY FORMAT
    Object.keys(newForm).forEach((item) => {
      newForm[item] = newForm[item].value;
    });
    delete newForm.repassword;
  }
  return [isValid, newForm];
};
