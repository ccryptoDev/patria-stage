import React, { useState } from "react";
import styled from "styled-components";
import { toast } from "react-toastify";
import { Form, BankLogo } from "../styles";
import Button from "../../../../../../atoms/Buttons/Button";
import { useStepper } from "../../../../../../../contexts/steps";
import Header from "../../../../Components/FormHeader";
import { renderFields, initForm, validateForm } from "./config";
import Loader from "../../../../../../molecules/Loaders/LoaderWrapper";
import { useUserData } from "../../../../../../../contexts/user";
import { verifyBankCredentials } from "../../../../../../../api/application";
import { BankCredential } from "../../../../../../../api/types";
import { errorHandler } from "../../../../../../../utils/errorHandler";

const Wrapper = styled.div`
  .logo {
    max-width: 100%;
    width: 100%;
  }
`;

const ButtonsWrapper = styled.div`
  max-width: 342px;
  width: 100%;
  margin-top: 24px;

  .login-buttons {
    display: flex;
    align-items: center;
    column-gap: 12px;
  }

  .btn {
    &-continue {
      width: 164px;
    }
    &-relogin {
      border: none;
      background: transparent;
      color: var(--color-primary);
      font-weight: 600;
      font-size: 14px;
      padding: 20px;
      min-width: 170px;
    }
    &-manual {
      margin-top: 12px;
      width: 100%;
    }
  }

  @media screen and (max-width: 400px) {
    .login-buttons {
      flex-wrap: wrap;

      & button {
        width: 100%;
      }
    }
  }
`;

interface propsType {
  setActiveTab: any;
  tabType: { AUTO: string; MANUAL: string };
  selectedBank: any;
}

const Connected = (props: propsType) => {
  const { fetchUser, screenId, triggerIdentityVerification } = useUserData();
  const { moveToNextStep } = useStepper();
  const [form, setForm] = useState(initForm());
  const [loading, setLoading] = useState(false);
  const { selectedBank, setActiveTab, tabType } = props;

  const loginToBankHandler = async () => {
    if (screenId) {
      const payload: BankCredential = {
        username: form.username.value,
        bankName: selectedBank.name,
        password: form.password.value,
      };
      const response = await verifyBankCredentials({
        // payload,
        screenTrackingId: screenId,
      });

      if (!response.ok) {
        errorHandler({ error: response?.error });
        return false;
      }
      return true;
    }
    toast.error("screenTracking id is missing");
    return false;
  };

  const onSubmitHandler = async (e: any) => {
    e.preventDefault();
    const [isValid, validatedForm] = validateForm(form);
    if (!isValid) {
      setForm(validatedForm);
    } else {
      setLoading(true);
      const isVerified: boolean = await loginToBankHandler();

      // IF ID VERIFICATION IS REQUIRED IT WILL TRIGGER MODAL VIA USER CONTEXT AND SET FURTHER ACTIONS FROM THE MODAL
      // -- search: #itentityVerificationModal
      const isIdentiryVerificatonRequired = await triggerIdentityVerification(
        screenId
      );

      if (isVerified && !isIdentiryVerificatonRequired) {
        await fetchUser();
        moveToNextStep();
      }
      setLoading(false);
    }
  };

  const onChangeHandler = (e: any) => {
    setForm((prevState) => ({
      ...prevState,
      [e.target.name]: { value: e.target.value, message: "" },
    }));
  };

  const goToMain = () => {
    setActiveTab("");
  };

  const title = "Banking Information";
  const note = "Login to your bank account to get the best offer.";
  const userIsLogged = true;
  return (
    <Wrapper>
      <Loader loading={loading}>
        <Form onSubmit={onSubmitHandler}>
          <Header title={title} note={note} />

          <BankLogo key={selectedBank.name} className="logo">
            <img src={selectedBank.img} alt={selectedBank.name} />
          </BankLogo>

          {renderFields(form, userIsLogged).map(
            ({ component: Component, ...field }) => {
              return (
                <Component
                  key={field.name}
                  {...field}
                  onChange={onChangeHandler}
                />
              );
            }
          )}

          <ButtonsWrapper>
            <div className="login-buttons">
              <Button type="submit" variant="primary" className="btn-continue">
                Continue
              </Button>

              <button type="button" onClick={goToMain} className="btn-relogin">
                Re-login to bank
              </button>
            </div>
          </ButtonsWrapper>
        </Form>
      </Loader>
    </Wrapper>
  );
};

export default Connected;
