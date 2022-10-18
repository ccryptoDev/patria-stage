import React, { useState } from "react";
import { toast } from "react-toastify";
import styled from "styled-components";
import { validateEmail } from "../../../../../utils/validators/email";
import { initRestorPasswordForm } from "../config";
import EmailForm from "./Email";
import CodeForm from "./Code";
import Final from "./Response";

const Wrapper = styled.div`
  display: flex;
  align-items: flex-start;
  button[type="submit"] {
    width: 100%;
  }
  .note {
    text-align: center;
    & button {
      color: var(--color-primary);
      font-weight: 700;
      font-size: 14px;
      background: transparent;
      border: none;
      display: inline;
    }
  }

  @media screen and (max-width: 500px) {
    .heading {
      padding-left: 60px;
      text-align: left;
    }

    .action-button {
      position: absolute;
    }
  }
`;

function FormComponent() {
  const [form, setForm] = useState(initRestorPasswordForm());
  const [step, setStep] = useState(1);
  const [success, setSuccess] = useState(true);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prevState) => ({
      ...prevState,
      [name]: { ...prevState[name], value, message: "" },
    }));
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    if (step === 1) {
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    }
    // const [isValid, validatedForm] = validateEmail(form.email);
    // if (isValid) {

    //   toast.success("Email with a new password has been sent!");
    // } else {
    //   setForm((prevState) => ({ ...prevState, email: { ...validatedForm } }));
    // }
  };

  const resendCode = () => {
    console.log("resend code");
  };

  const renderScreen = () => {
    const config = {
      form,
      onSubmitHandler,
      onChange,
      resendCode,
    };
    switch (step) {
      case 1:
        return <EmailForm {...config} />;
      case 2:
        return <CodeForm {...config} goBackToEmail={() => setStep(1)} />;
      case 3:
        return <Final success={success} goBackToEmail={() => setStep(1)} />;
      default:
        return <EmailForm />;
    }
  };

  return <Wrapper>{renderScreen()}</Wrapper>;
}

export default FormComponent;
