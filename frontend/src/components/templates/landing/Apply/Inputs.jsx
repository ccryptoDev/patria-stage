import React, { useState } from "react";
import styled from "styled-components";
import FormattedField from "../../../molecules/Form/Fields/FormattedField";
import Options from "../../../molecules/Form/Fields/Select/Default";

const OptionsWrapper = styled.div`
  & select {
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
  }

  @media screen and (max-width: 500px) {
    & select {
      border-radius: 0.8rem;
      border-right: 1px solid;
      border: 1px solid var(--color-secondary-2);
    }
  }
`;

export const OptionsField = (props) => {
  return (
    <OptionsWrapper>
      <Options {...props} />
    </OptionsWrapper>
  );
};

const AmountWrapper = styled.div`
  position: relative;
  font-size: 1.4rem;
  &:before {
    position: absolute;
    content: "$";
    color: var(--color-blue-1);
    font-weight: 600;
    top: 50%;
    left: 1.6rem;
    transform: translateY(-50%);
    z-index: 3;
  }

  & input {
    padding-left: 3rem;
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
    border-right: none;
  }

  @media screen and (max-width: 500px) {
    & input {
      border-radius: 0.8rem;
      border-right: 1px solid;
      border: 1px solid var(--color-secondary-2);
    }
  }
`;

export const AmountField = (props) => {
  return (
    <AmountWrapper>
      <FormattedField {...props} />
    </AmountWrapper>
  );
};
