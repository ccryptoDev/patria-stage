export const parseFormToRequest = (form) => {
  const newForm = { ...form };
  const validForm = {};
  Object.keys(newForm).forEach((key) => {
    validForm[key] = newForm[key].value;
  });
  return validForm;
};
