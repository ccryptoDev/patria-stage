import React, { useState } from "react";
import styled from "styled-components";
import { useHistory } from "react-router-dom";
import { H2 as Heading, Note } from "../../../../atoms/Typography";
import Buttons from "../../../../atoms/Form/Buttons-wrapper";
import Button from "../../../../atoms/Buttons/Button";
import successImg from "../../../../../assets/svgs/success-logo.svg";
import failureImg from "../../../../../assets/svgs/failure-logo.svg";
import { routes } from "../../../../../routes/Borrower/routes";

const Wrapper = styled.div`
  margin: 0 auto;
  .box {
    border-radius: 14px;
    max-width: 400px;
    width: 100%;
    background: #fff;
    border: 1px solid var(--color-grey-light);
    padding: 24px;
    display: flex;
    flex-direction: column;
    align-items: center;
    margin: 50px auto;

    .note {
      margin: 50px 0;
      text-align: left;
    }
    button {
      width: 100%;
    }
  }
`;

const FormComponent = ({
  success,
  goBackToEmail,
}: {
  success: boolean;
  goBackToEmail: any;
}) => {
  const history = useHistory();

  const buttonHandler = () => {
    if (success) {
      history.push(routes.HOME);
    } else {
      goBackToEmail();
    }
  };
  return (
    <Wrapper>
      <Heading className="heading">
        {success ? "Thank you! Your Email is" : "Fail! Your Email is not"}
        <span>
          Verified<span>.</span>
        </span>
      </Heading>
      <div className="box">
        <img src={success ? successImg : failureImg} alt="success" />
        <Note className="note">
          {success
            ? "Your Email was successfully verified. You can enter into your customer portal."
            : "Something was wrong. Your Email was not verified. Please, retry verification"}
        </Note>
        <Buttons>
          <Button type="button" variant="primary" onClick={buttonHandler}>
            {success ? "Customer Portal" : "Retry Verification"}
          </Button>
        </Buttons>
      </div>
    </Wrapper>
  );
};

export default FormComponent;
