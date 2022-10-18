import { validateZipCode } from "../../../../../../../utils/validators/other";

export const validate = (form) => {
  const newForm = { ...form };
  let isValid = true;
  Object.keys(newForm).forEach((key) => {
    if (
      (key === "firstName" ||
        key === "lastName" ||
        key === "street" ||
        key === "city" ||
        key === "state") &&
      newForm[key].value.trim().length < 1
    ) {
      isValid = false;
      newForm[key].message = "This field is required";
    } else if (key === "zipCode") {
      const message = validateZipCode(newForm[key].value);
      if (message) {
        isValid = false;
        newForm[key].message = "Enter a valid zip code";
      }
    }
  });
  return [isValid, newForm];
};
