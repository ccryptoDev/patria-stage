import React from "react";
import styled from "styled-components";
import Checkbox from "../../molecules/Form/Fields/Checkbox/Custom";
import TriggerButton from "../../atoms/Buttons/TriggerModal/Trigger-button-edit";
import Modal from "../Modal/Regular/ModalAndTriggerButton";
import {
  PrivacyPolicy,
  ESignature,
} from "../../templates/application/Consents";
import ErrorMessage from "../../molecules/Form/Elements/FormError";

const TermsWrapper = styled.div`
  position: relative;
  display: flex;
  color: #50585d;
  font-size: 1.3rem;
  font-weight: 400;
  margin: 0 0 4rem;
  text-align: justify;

  .errorMessage {
    position: absolute;
    top: 100%;
    width: 100%;
    padding: 0;
  }
`;

const LinkBtn = styled.div`
  display: inline-block;
  button {
    text-decoration: underline;
  }
`;

type ITermsAndConditionsForm = {
  name: string;
  onChange?: any;
  value: boolean;
  message?: string;
};

const TermsAndConditions = ({
  value = false,
  name,
  onChange,
  message = "",
}: ITermsAndConditionsForm) => {
  return (
    <TermsWrapper className="terms-and-conditions">
      <div>
        <Checkbox
          className="terms"
          onChange={onChange}
          value={value}
          name={name}
        />
      </div>
      <div>
        I have read and agree by electronic signature to the
        <LinkBtn>
          <Modal
            button={<TriggerButton>Terms of Use</TriggerButton>}
            modalContent={PrivacyPolicy}
            modalTitle="Terms of Use"
          />
        </LinkBtn>
        and
        <LinkBtn>
          <Modal
            button={<TriggerButton>Electronic Consent</TriggerButton>}
            modalContent={ESignature}
            modalTitle="Electronic Consent"
          />
        </LinkBtn>
        , which includes your consent for us to send you emails about our
        products and services, the Data Terms of Use,
        <LinkBtn>
          <Modal
            button={<TriggerButton>Privacy Policy</TriggerButton>}
            modalContent={PrivacyPolicy}
            modalTitle="Privacy Policy"
          />
        </LinkBtn>
        , Credit Report Authorization, and TCPA Authorization
      </div>
      <ErrorMessage message={message} />
    </TermsWrapper>
  );
};

export default TermsAndConditions;
