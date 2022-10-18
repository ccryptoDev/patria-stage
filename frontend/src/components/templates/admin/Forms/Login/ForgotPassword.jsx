import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import { toast } from "react-toastify";
import TextField from "../../../../molecules/Form/Fields/TextField";
import MailIcon from "../../../../atoms/Icons/SvgIcons/Mail";
import Form from "./Styles";
import { validateEmail } from "../../../../../utils/validators/email";
import { forgotPasswordApi } from "../../../../../api/application";

const FormComponent = () => {
  const history = useHistory();
  const [form, setForm] = useState({
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
    const [isValid, validatedForm] = validateEmail(form.email);
    if (isValid) {
      const email = validatedForm?.value;
      await forgotPasswordApi({ email });
      toast.success("Email with a new password has been sent!");
    } else {
      setForm((prevState) => ({ ...prevState, email: { ...validatedForm } }));
    }
  };
  return (
    <Form onSubmit={onSubmitHandler}>
      <div className="form-item">
        <div className="form-item-icon">
          <MailIcon size="3rem" />
        </div>
        <TextField
          name="email"
          value={form.email.value}
          onChange={onChangeHanlder}
          message={form.email.message}
          placeholder="Email"
        />
      </div>
      <div className="button-wrapper">
        <button type="button" onClick={() => history.goBack()}>
          Go Back
        </button>
        <button type="submit">Send Email</button>
      </div>
    </Form>
  );
};

export default FormComponent;
