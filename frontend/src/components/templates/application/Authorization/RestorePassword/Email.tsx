import React from "react";
import { useHistory } from "react-router-dom";
import { renderEmailField } from "../config";
import { H2 as Heading } from "../../../../atoms/Typography";
import Buttons from "../../../../atoms/Form/Buttons-wrapper";
import Button from "../../../../atoms/Buttons/Button";
import Form from "../styles";
import ActionButton from "../../../../molecules/Buttons/ActionButton";
import { routes } from "../../../../../routes/Application/routes";

const FormComponent = ({
  form,
  onSubmitHandler,
  onChange,
}: {
  form: any;
  onSubmitHandler: any;
  onChange: any;
}) => {
  const history = useHistory();
  return (
    <>
      <ActionButton onClick={() => history.push(routes.LOGIN)} type="goback" />
      <Form onSubmit={onSubmitHandler}>
        <Heading className="heading">
          Recover Your{" "}
          <span>
            Password<span>.</span>
          </span>
        </Heading>
        {renderEmailField(form).map(({ component: Component, ...field }) => {
          return <Component {...field} onChange={onChange} key={field.name} />;
        })}

        <Buttons>
          <Button type="submit" variant="primary">
            Continue
          </Button>
        </Buttons>
      </Form>
    </>
  );
};

export default FormComponent;
