import React, { useState, useEffect } from "react";
import { cloneDeep } from "lodash";
import styled from "styled-components";
import { updateCreditRulesApi } from "../../../../../api/admin-dashboard";
import Buttons from "../../../../molecules/Buttons/SubmitForm";
import Button from "../../../../atoms/Buttons/Button";
import { renderRuleForm, rule, validateForm } from "./config";
import ErrorMessage from "../../../../molecules/Form/Elements/FormError";
import Loader from "../../../../molecules/Loaders/LoaderWrapper";

const Styles = styled.div`
  padding: 2rem;
  .heading {
    margin-bottom: 1rem;
    text-align: center;
  }

  .checkbox {
    margin: 2rem 0;
    font-size: 1.6rem;
    display: block;
  }

  .textField {
    margin-bottom: 1rem;
    & input {
      line-height: 1.5rem;
    }
  }
`;

const Form = ({ state: { ruleForm }, closeModal, cb }) => {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(rule(ruleForm));
  const [error, setError] = useState("");

  useEffect(() => {
    if (ruleForm) setForm(rule(cloneDeep(ruleForm)));
  }, [ruleForm]);

  // SUBMIT THE FORM AND MAKE AN HTTP REQUEST
  const updateCreditRulesHandler = async () => {
    // 1. VALIDATE THE FORM
    const [isValid, validatedForm] = validateForm(form);
    if (isValid) {
      // 2. CREATE REQUEST BODY
      const payload = {
        newRules: {
          [ruleForm.name]: {
            ...validatedForm,
          },
        },
      };
      setLoading(true);
      // 3. SEND THE REQUEST
      const result = await updateCreditRulesApi(payload);
      if (result && result.data && !result.error) {
        // 4. SEND THE RESULT (UPDATED FORM) TO THE PAGE COMPONENT
        cb(result.data);
        closeModal(true);
      } else if (result.error) {
        setError(result.error.message || "something went wrong");
      }
      setLoading(false);
    } else {
      // DISPLAY INVALID FORM MESSAGE
      setForm(validatedForm);
    }
  };
  const onSubmit = (e) => {
    e.preventDefault();
    updateCreditRulesHandler();
  };

  // UPDATE FORM FIELDS
  const onChangeHandler = (e) => {
    const { name, value } = e.target;
    setForm((prevState) => ({
      ...prevState,
      [name]: { ...prevState[name], value, message: "" },
    }));
  };
  return (
    <Styles>
      <div className="heading">{ruleForm?.ruleId}</div>
      <Loader loading={loading}>
        <form onSubmit={onSubmit}>
          {form
            ? renderRuleForm(form).map(({ component: Component, ...item }) => {
                return (
                  <div key={item.name}>
                    <Component onChange={onChangeHandler} {...item} />
                  </div>
                );
              })
            : ""}
          <ErrorMessage message={error} />
          <Buttons>
            <Button type="button" variant="primary" onClick={closeModal}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Submit
            </Button>
          </Buttons>
        </form>
      </Loader>
    </Styles>
  );
};

export default Form;
