const validate = (form) => {
  const newForm = { ...form };
  let isValid = true;

  Object.keys(newForm).forEach((key) => {
    if (!newForm[key].value.trim().length && newForm[key].required) {
      newForm[key].message = "This field is required";
      isValid = false;
    } else {
      newForm[key].message = "";
    }
  });

  return { isValid, validatedForm: { ...newForm } };
};

export default validate;
