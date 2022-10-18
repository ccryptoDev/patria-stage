import { passwordRegexp } from "../regexp";

export const validatePassword = ({ password, repassword }) => {
  let isValid = true;
  let passwordMessage = "";
  let repasswordMessage = "";
  // check if the password matches the format
  if (passwordRegexp.test(password)) {
    // check if the passwords match if there is repassword field
    if (repassword !== undefined && repassword !== password) {
      isValid = false;
      repasswordMessage = "passwords should match";
    }
    passwordMessage = "";
  } else {
    isValid = false;
    passwordMessage =
      "Minimum 8 characters, at least 1 letter, 1 number and 1 special character";
  }

  return [isValid, passwordMessage, repasswordMessage];
};
