import { validatePassword } from "../../../../../../utils/validators/password";
import { validateDob } from "../../../../../../utils/validators/dob";
import { validateEmail } from "../../../../../../utils/validators/email";

export const validateForm = (form, editing) => {
  const newForm = { ...form };
  const zipCodeRegex = /^[0-9]{5}(?:-?[0-9]{4})?$/;
  Object.keys(newForm).forEach((key) => {
    if (!editing && key === "password") {
      const [isPasswordValid, passwordMessage, repasswordMessage] =
        validatePassword({
          password: newForm[key].value,
          repassword: newForm.repassword.value,
        });

      if (!isPasswordValid) {
        newForm.password.message = passwordMessage;
        newForm.repassword.message = repasswordMessage;
      }
    } else if (key === "dateOfBirth") {
      const message = validateDob(newForm.dateOfBirth.value);
      if (message) {
        newForm.dateOfBirth.message = message;
      }
    } else if (
      key === "phoneNumber" &&
      newForm?.phoneNumber?.value?.replace("_", "").trim().length !== 10
    ) {
      newForm.phoneNumber.message = "Enter a valid phoneNumber number";
    } else if (key === "email") {
      const emailIsValid = validateEmail(newForm.email.value);
      if (!emailIsValid) {
        newForm.email.message = "Enter a valid email";
      }
    } else if (
      key === "ssn_number" &&
      newForm?.ssn_number?.value?.trim().replace("_", "").length !== 9
    ) {
      newForm.ssn_number.message = "Enter a valid number";
    } else if (
      key === "firstName" &&
      newForm.firstName.value.trim().length < 1
    ) {
      newForm.firstName.message = "This field is required";
    } else if (key === "requestedLoan") {
      if (!newForm.requestedLoan.value || +newForm.requestedLoan.value <= 0) {
        newForm.requestedLoan.message = "This field is required";
      } else if (newForm.requestedLoan.value > 2500) {
        newForm.requestedLoan.message = "loan amount offers is upto $2500";
      }
    } else if (
      key === "lastName" &&
      newForm?.lastName?.value?.trim().length < 1
    ) {
      newForm.lastName.message = "This field is required";
    } else if (key === "street" && newForm?.street?.value?.trim().length < 1) {
      newForm.street.message = "This field is required";
    } else if (key === "city" && newForm?.city?.value?.trim().length < 1) {
      newForm.city.message = "This field is required";
    } else if (
      key === "zipCode" &&
      !zipCodeRegex.test(newForm?.zipCode?.value?.trim())
    ) {
      newForm.zipCode.message = "Enter a valid zip code";
    } else if (key === "state" && newForm?.state?.value?.trim().length < 1) {
      newForm.state.message = "This field is required";
    }
  });

  const isValid = !Object.values(newForm).some((val) => val.message.length > 0);
  return [isValid, newForm];
};
