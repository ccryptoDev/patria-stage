import TextField from "../../../../../../molecules/Form/Fields/TextField";
import Password from "../../../../../../molecules/Form/Fields/Password";

export const initForm = () => {
  return {
    username: { value: "", message: "" },
    password: { value: "", message: "" },
  };
};

export const renderFields = (form: any, userIsLogged = false) => {
  const fieldsLoggedUser = new Set(["username", "password"]);

  return [
    {
      value: form.username.value,
      name: "username",
      component: TextField,
      placeholder: "Enter Username",
      message: form.username.message,
    },
    {
      value: form.password.value,
      name: "password",
      component: Password,
      placeholder: "Enter Password",
      message: form.password.message,
    },
  ].filter(
    (formField) => !userIsLogged || fieldsLoggedUser.has(formField.name)
  );
};

export const validateForm = (form: any) => {
  const newForm = { ...form };
  let isValid = true;
  Object.keys(newForm).forEach((key) => {
    if (key === "username") {
      const usernameIsValid = newForm.username.value;
      if (usernameIsValid.length < 1) {
        newForm.username.message = "enter a valid username";
        isValid = false;
      }
    }
    if (key === "password") {
      const pswdIsValid = newForm.password.value;
      if (pswdIsValid.length < 3) {
        newForm.password.message = "enter a valid password";
        isValid = false;
      }
    }
  });
  return [isValid, newForm];
};
