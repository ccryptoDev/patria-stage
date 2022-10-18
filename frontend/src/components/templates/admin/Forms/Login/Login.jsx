import React, { useState } from "react";
import { Link, useHistory } from "react-router-dom";
import PasswordField from "../../../../molecules/Form/Fields/Password";
import TextField from "../../../../molecules/Form/Fields/TextField";
import { validateLogin } from "../../../../../utils/validators/login";
import MailIcon from "../../../../atoms/Icons/SvgIcons/Mail";
import LockIcon from "../../../../atoms/Icons/SvgIcons/Lock";
import Form from "./Styles";
import { adminLogin } from "../../../../../api/admin-dashboard/login";
import { useUserData } from "../../../../../contexts/admin";
import ErrorMessage from "../../../../molecules/Form/Elements/FormError";
import Loader from "../../../../molecules/Loaders/LoaderWrapper";
import { routes } from "../../../../../routes/Admin/routes";

const FormComponent = () => {
  const { fetchUser, setUser } = useUserData();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const history = useHistory();
  const [form, setForm] = useState({
    password: { value: "123456A#a", message: "", required: true },
    email: {
      value: "bracken.mudrow@trustalchemy.com",
      message: "",
      required: true,
    },
  });
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
    const { isValid, validatedForm } = validateLogin(form);
    // if the form is valid the validated form will have the parsed format for the http request, otherwise it will keep the state's format
    if (!isValid) {
      // if not valid display the form with error messages
      setForm((prevState) => {
        return { ...prevState, ...validatedForm };
      });
    } else {
      setLoading(true);
      const result = await adminLogin(validatedForm);
      console.log("adminlogin", result);
      if (result && typeof result.adminToken === "string") {
        // after the token is set, check the user and trigger the dom tree to re-render;
        setUser({ user: result, isAuthorized: true });
        history.push(routes.DASHBOARD);
      } else if (result.error) {
        setError("Wrong credintials");
      }
      setLoading(false);
    }
  };
  return (
    <Loader loading={loading}>
      <Form onSubmit={onSubmitHandler}>
        <div className="form-item">
          <div className="form-item-icon">
            <MailIcon size="3.5rem" />
          </div>
          <TextField
            name="email"
            value={form.email.value}
            onChange={onChangeHanlder}
            message={form.email.message}
            placeholder="Email"
          />
        </div>
        <div className="form-item">
          <div className="form-item-icon">
            <LockIcon size="3.5rem" />
          </div>
          <PasswordField
            name="password"
            value={form.password.value}
            onChange={onChangeHanlder}
            message={form.password.message}
            placeholder="Password"
          />
        </div>
        <div className="forgotPasswordBtn">
          <Link to="/admin/forgot-password">Forgot password?</Link>
        </div>
        <ErrorMessage message={error} />
        <div className="button-wrapper">
          <button type="submit">Sign in</button>
        </div>
      </Form>
    </Loader>
  );
};

export default FormComponent;
