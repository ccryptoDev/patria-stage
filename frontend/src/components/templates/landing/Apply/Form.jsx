import React, { useState } from "react";
import styled from "styled-components";
import { useHistory } from "react-router-dom";
import { formInit, renderFields, renderCredentialsFields } from "./config";
import Button from "../../../atoms/Buttons/Button";
import arrow from "../../../../assets/landing/arrow-right-white.png";
import { H2 } from "../../../atoms/Typography";
import { useAppContextData } from "../../../../contexts/global";
import { parseFormToFormat } from "../../../../utils/form/parsers";

const Wrapper = styled.div`
  form {
    background: #fff;
    padding: 3.6rem;
    border-radius: 1.4rem;
    display: flex;
    width: 57rem;
    flex-direction: column;
    row-gap: 2.4rem;
    & h2 {
      color: var(--color-main-2);
    }

    & .terms-wrapper {
      font-size: 12px;
    }

    .fields {
      display: grid;
      grid-template-columns: 1fr 1fr;
    }

    .personal-info-fields {
      grid-gap: 1.2rem;
    }
  }
  @media screen and (max-width: 600px) {
    & form {
      width: 100%;
      & .fields {
        display: flex;
        flex-direction: column;
        row-gap: 1.2rem;
      }

      & select,
      & #loanAmount-wrapper #loanAmount {
        border-radius: 0.8rem;
        border-right: 1px solid;
        border: 1px solid var(--color-secondary-2);
      }
    }
  }
`;

const FormComponent = () => {
  const [form, setForm] = useState(formInit());
  const { saveData } = useAppContextData();
  const history = useHistory();

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prevState) => ({
      ...prevState,
      [name]: { ...prevState[name], value, message: "" },
    }));
  };

  const onSubmitHandler = (e) => {
    e.preventDefault();
    const payload = parseFormToFormat(form);
    saveData(payload);
    history.push("/application");
  };
  return (
    <Wrapper>
      <form onSubmit={onSubmitHandler}>
        <H2>Start Application</H2>

        <div className="fields">
          {renderFields(form).map(({ component: Component, ...field }) => {
            return (
              <Component key={field.name} {...field} onChange={onChange} />
            );
          })}
        </div>
        <div className="fields personal-info-fields">
          {renderCredentialsFields(form).map(
            ({ component: Component, ...field }) => {
              return (
                <Component key={field.name} {...field} onChange={onChange} />
              );
            }
          )}
        </div>
        <div className="button-wrapper">
          <Button type="submit" variant="primary" className="button-contained">
            Get Started
            <img src={arrow} alt="->" />
          </Button>
        </div>
      </form>
    </Wrapper>
  );
};

export default FormComponent;
