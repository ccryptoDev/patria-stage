import React from "react";
import styled from "styled-components";
import RadioButton from "../../../../../../../../molecules/Buttons/RadioButton";
import { accountTypes } from "./config";

const Wrapper = styled.div`
  margin: 20px 0;
  position: relative;
  .heading {
    color: var(--color-gray-1);
    font-size: 12px;
    font-weight: 700;
    position: absolute;
    top: 0;
    background: #fff;
    padding: 2px 4px;
    z-index: 3;
    left: 0;
    transform: translate(12px, -50%);
  }
  .buttons-wrapper {
    display: flex;
    align-items: center;
    column-gap: 10px;
    border: 1px solid var(--color-gray-1);
    padding: 20px 16px;
    font-size: 14px;
    width: 320px;
  }
`;

// CANCELLED BY THE CLIENT - %cancelled%
const AccountType = ({
  onClick,
  accountType,
}: {
  onClick: any;
  accountType: string;
}) => {
  return (
    <Wrapper>
      <div className="buttons-wrapper">
        <div className="heading">ACCOUNT TYPE</div>
        <RadioButton
          onClick={() => onClick(accountTypes.SAVING)}
          active={accountTypes.SAVING === accountType}
        >
          Saving
        </RadioButton>
        <RadioButton
          onClick={() => onClick(accountTypes.CHECKING)}
          active={accountTypes.CHECKING === accountType}
        >
          Checking
        </RadioButton>
      </div>
    </Wrapper>
  );
};
export default AccountType;
