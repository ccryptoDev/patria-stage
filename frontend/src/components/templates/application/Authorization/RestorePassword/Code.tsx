import React from "react";
import { renderCodeField } from "../config";
import { Note } from "../../../../atoms/Typography";
import Buttons from "../../../../atoms/Form/Buttons-wrapper";
import Button from "../../../../atoms/Buttons/Button";
import Form from "../styles";
import ActionButton from "../../../../molecules/Buttons/ActionButton";

const FormComponent = ({
  form,
  onSubmitHandler,
  onChange,
  resendCode,
  goBackToEmail,
}: {
  form: any;
  onSubmitHandler: any;
  onChange: any;
  resendCode: any;
  goBackToEmail: any;
}) => {
  return (
    <>
      <ActionButton onClick={goBackToEmail} type="goback" />
      <Form onSubmit={onSubmitHandler}>
        <h2 className="heading">
          Recover Your{" "}
          <span>
            Password<span>.</span>
          </span>
        </h2>
        {renderCodeField(form).map(({ component: Component, ...field }) => {
          return <Component {...field} onChange={onChange} key={field.name} />;
        })}

        <Buttons>
          <Button type="submit" variant="primary">
            Continue
          </Button>
        </Buttons>
        <Note className="note">
          Didn’t receive the code?{" "}
          <button type="button" onClick={resendCode}>
            Resend
          </button>
        </Note>
      </Form>
    </>
  );
};

export default FormComponent;
