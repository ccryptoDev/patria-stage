import React, { useState } from "react";
import styled from "styled-components";
import { initForm, renderFormFields, validateForm } from "./config";
import { parseFormToRequest } from "../../../../../../../utils/parseForm";
import Button from "../../../../../../atoms/Buttons/Button";
import ActionButton from "../../../../../../molecules/Buttons/ActionButton";
import { H2 as Heading, Note } from "../../../../../../atoms/Typography";
import { mockRequest } from "../../../../utils";
import Loader from "../../../../../../molecules/Loaders/LoaderWrapper";
import { saveBankAccountApi } from "../../../../../../../api/application";
import { errorHandler } from "../../../../../../../utils/errorHandler";
import { ManualBank } from "../../../../../../../api/types";

const Form = styled.form`
  .textField {
    margin: 24px 0;
  }

  .subheading-wrapper {
    display: flex;
    align-items: center;
    margin: 24px 0;

    & .action-button {
      margin-right: 12px;
    }
  }

  @media screen and (max-width: 767px) {
    .textField {
      margin: 12px 0;
    }
  }
`;

const Manual = ({
  setActiveTab,
  setConnected,
  tabType,
  setSelectedBank,
  loginToBankHandler,
}: {
  setActiveTab: any;
  setConnected: any;
  tabType: { AUTO: string; MANUAL: string };
  setSelectedBank: any;
  loginToBankHandler: any;
}) => {
  const [form, setForm] = useState(initForm());
  const [loading, setLoading] = useState(false);

  const onSubmitHandler = async (e: any) => {
    try {
      e.preventDefault();
      const [isValid, validatedForm] = validateForm(form);
      const bankPayload: ManualBank = {
        bankName: form.bankName.value,
        accountHolder: form.accountHolder.value,
        routingNumber: form.routingNumber.value,
        accountNumber: form.accountNumber.value,
      };
      if (isValid) {
        setLoading(true);
        const response: any = await saveBankAccountApi(bankPayload);
        if (!response.ok) {
          throw new Error(response?.error?.message);
        }
        setConnected(true);
        loginToBankHandler();
      } else {
        setForm(validatedForm);
      }
    } catch (error: any) {
      console.log(error, "first", error.message);
      errorHandler({ error });
    } finally {
      setLoading(false);
    }
  };
  const onChangeHandler = (e: any) => {
    setForm((prevState) => ({
      ...prevState,
      [e.target.name]: { value: e.target.value, message: "" },
    }));
  };

  return (
    <Loader loading={loading}>
      <Form onSubmit={onSubmitHandler}>
        <Heading>Banking Information </Heading>
        {/* <div className="subheading-wrapper">
          <ActionButton
            type="goback"
            onClick={() => setActiveTab(tabType.AUTO)}
          />
          <Note>Manually Submit Banking Information</Note>
        </div> */}
        {renderFormFields(form).map(({ component: Component, ...field }) => {
          return (
            <Component key={field.name} {...field} onChange={onChangeHandler} />
          );
        })}

        <Button type="submit" variant="primary">
          Continue
        </Button>
      </Form>
    </Loader>
  );
};

export default Manual;
