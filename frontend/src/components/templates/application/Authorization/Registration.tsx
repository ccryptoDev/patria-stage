import React, { useState } from "react";
import { Link, useHistory } from "react-router-dom";
import Buttons from "../../../atoms/Form/Buttons-wrapper";
import Button from "../../../atoms/Buttons/Button";
import { initRegisterForm, renderRegisterFormFields } from "./config";
import validate from "./validation";
import { IRegisterForm } from "../types";
import { routes } from "../../../../routes/Application/routes";
import { routes as borrowerRoutes } from "../../../../routes/Borrower/routes";
import { login } from "../../../../api/authorization";
import Loader from "../../../molecules/Loaders/LoaderWrapper";
import ErrorMessage from "../../../molecules/Form/Elements/FormError";
import { H2 as Heading, Note } from "../../../atoms/Typography";
import Form from "./styles";

function FormComponent() {
  const [form, setForm] = useState<IRegisterForm>(initRegisterForm());
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const history = useHistory();

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prevState: any) => ({
      ...prevState,
      [name]: { ...prevState[name], value, message: "" },
    }));
  };

  const onSubmitHandler = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const { isValid, validatedForm } = validate(form);
    if (isValid) {
      const { email, password } = validatedForm;
      setLoading(true);
      const result = await login({
        email: email.value,
        password: password.value,
      });
      if (result && !result.error) {
        history.push(borrowerRoutes.HOME);
      } else if (result?.error) {
        const message = result?.error?.message;
        setError(message);
      }
      setLoading(false);
    } else {
      setForm((prevState) => ({ ...prevState, ...validatedForm }));
    }
  };

  return (
    <Loader loading={loading}>
      <Form onSubmit={onSubmitHandler}>
        <h2 className="heading">
          Create{" "}
          <span>
            Account<span>.</span>
          </span>
        </h2>

        {renderRegisterFormFields(form).map(
          ({ component: Component, ...field }) => {
            return (
              <Component {...field} onChange={onChange} key={field.name} />
            );
          }
        )}

        <Buttons>
          <Button type="submit" variant="primary" className="wide">
            Create Account
          </Button>
        </Buttons>
        <Note className="note">
          Forgot your password?{" "}
          <Link to={routes.FORGOT_PASSWORD} className="link">
            Restore
          </Link>
        </Note>
        <Note className="note">
          Already have an Account?{" "}
          <Link to={routes.LOGIN} className="link">
            Log In
          </Link>
        </Note>
      </Form>
    </Loader>
  );
}

export default FormComponent;
