import React, { useEffect, useState } from "react";
import { Link, useHistory } from "react-router-dom";
import { toast } from "react-toastify";
import Buttons from "../../../../atoms/Form/Buttons-wrapper";
import Button from "../../../../atoms/Buttons/Button";
import { initLoginForm, renderLoginFormFields, validate } from "./config";
import { IAccountForm } from "../../types";
import { routes } from "../../../../../routes/Application/routes";
import { routes as borrowerRoutes } from "../../../../../routes/Borrower/routes";
import { login } from "../../../../../api/authorization";
import Loader from "../../../../molecules/Loaders/LoaderWrapper";
import ErrorMessage from "../../../../molecules/Form/Elements/FormError";
import { Note } from "../../../../atoms/Typography";
import Form, { FormWrapper } from "../styles";
import { useUserData } from "../../../../../contexts/user";

const FormComponent = () => {
  const [form, setForm] = useState<IAccountForm>(initLoginForm());
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const { fetchUser } = useUserData();
  const history = useHistory();

  useEffect(() => {
    const borrowerPortalLink = process.env.LMS_APP_BASE_URL;
    window.location.replace(
      String(borrowerPortalLink || "https://lms.patrialending.com").concat(
        "/login"
      )
    );
  }, []);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prevState: any) => ({
      ...prevState,
      [name]: { ...prevState[name], value, message: "" },
    }));
  };

  const onSubmitHandler = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const [isValid, updatedForm] = validate(form);
    if (isValid) {
      const payload = {
        email: form.email.value || "nafix+5611@gmail.com", //form.email.value,
        password: form.password.value || "123456A#a", //form.password.value,
      };
      setLoading(true);
      const result = await login(payload);
      if (result && !result.error) {
        window.location.href = borrowerRoutes.USER_INFORMATION;
      } else if (result?.error) {
        const message = result?.error?.message;
        setError(message);
        toast.error(message);
      }
      setLoading(false);
    } else {
      setForm(updatedForm);
    }
  };

  return (
    <FormWrapper>
      <Loader loading={loading}>
        {/* <Form onSubmit={onSubmitHandler}>
          <h2 className="heading">Log in to your account</h2>
          {renderLoginFormFields(form).map(
            ({ component: Component, ...field }) => {
              return (
                <Component {...field} onChange={onChange} key={field.name} />
              );
            }
          )}

          <Buttons>
            <Button type="submit" variant="secondary" className="wide">
              Log In
            </Button>
          </Buttons>
          <Note className="note">
            Forgot your password?{" "}
            <Link to={routes.FORGOT_PASSWORD} className="link">
              Restore
            </Link>
          </Note>
          <Note className="note">
            Don’t have an Account?{" "}
            <Link to={routes.REGISTRATION} className="link">
              Create Account
            </Link>
          </Note>
        </Form> */}
      </Loader>
    </FormWrapper>
  );
};

export default FormComponent;
