import React, { useState } from "react";
import { toast } from "react-toastify";
import { cloneDeep } from "lodash";
import { useHistory } from "react-router-dom";
import Form from "./Styles";
import Buttons from "../../../../molecules/Buttons/SubmitForm";
import ErrorMessage from "../../../../molecules/ErrorMessage/FormError";
import Loader from "../../../../molecules/Loaders/LoaderWrapper";
import { initialForm, fields } from "./config";
import Button from "../../../../atoms/Buttons/Button";
import { useUserData } from "../../../../../contexts/admin";
import { validatePassword } from "../../../../../utils/validators/password";
import { updateAdminById } from "../../../../../api/admin-dashboard";

const FormComponent = () => {
  const [form, setForm] = useState(cloneDeep(initialForm));
  const {
    user: { user },
  } = useUserData();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const history = useHistory();

  const onChangeHanlder = (e) => {
    setForm((prevState) => {
      return {
        ...prevState,
        [e.target.name]: {
          ...prevState[e.target.name],
          value: e.target.value,
          message: "",
        },
      };
    });
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    // validate and parse the form to the request format
    const [isValid, password, repassword] = validatePassword({
      formPassword: form.password,
      formRePassword: form.repassword,
    });
    // if the form is valid the validated form will have the parsed format for the http request, otherwise it will keep the state's format
    if (!isValid && user?.data?.id) {
      // if not valid display the form with error messages
      setForm({ password, repassword });
    } else {
      setLoading(true);
      const result = await updateAdminById({
        id: user.data?.id,
        password: password.value,
      });
      if (result && !result.error) {
        toast.success("password has been updated");
      } else {
        toast.error("sorry, we failed to reset your password!");
        setMessage("something went wrong...");
      }
      setLoading(false);
    }
  };
  return (
    <>
      <Loader loading={loading}>
        <Form onSubmit={onSubmitHandler}>
          {fields(form).map((item) => {
            const Component = item.component;
            return (
              <div className="form-field" key={item.name}>
                <Component
                  error={item.message}
                  {...item}
                  onChange={onChangeHanlder}
                />
              </div>
            );
          })}
          {message ? <ErrorMessage message={message} /> : ""}
          <Buttons color="#034376" className="form-btns">
            <Button
              type="button"
              variant="secondary"
              onClick={() => history.goBack()}
            >
              Go back
            </Button>
            <Button type="submit" variant="primary">
              Submit
            </Button>
          </Buttons>
        </Form>
      </Loader>
    </>
  );
};

export default FormComponent;
