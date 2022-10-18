// parses form back to api object format

export const parseFormToFormat = (form) => {
  const updatedForm = { ...form };
  Object.keys(updatedForm).forEach((item) => {
    updatedForm[item] = updatedForm[item].value;
  });
  return updatedForm;
};

export const parsePropsToForm = (state, form) => {
  const updatedForm = { ...form };
  if (state && updatedForm) {
    Object.keys(updatedForm).forEach((key) => {
      if (state[key]) {
        updatedForm[key].value = state[key];
      }
    });
  }
  return updatedForm;
};
