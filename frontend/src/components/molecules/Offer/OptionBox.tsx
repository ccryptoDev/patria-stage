import React from "react";
import styled, { css } from "styled-components";
import Button from "../../atoms/Buttons/Button";

export const OptionBox = styled.div<{ active?: boolean }>`
  background: transparent;
  padding: 2.5rem 1.6rem;
  width: 18rem;
  box-sizing: border-box;
  margin: 0.8rem 0;
  border: 2px solid transparent;
  box-shadow: 0px 1px 3rem rgb(0 0 0 / 25%);
  border-radius: 5px;
  display: flex;
  align-items: center;
  flex-direction: column;
  justify-content: space-between;
  ${(props) =>
    props.active &&
    css`
      border-color: #034376;
      box-shadow: 0px 1px 5px rgba(0, 0, 0, 0.25);
    `}

  &:hover {
    transition: all 0.2s;
    box-shadow: 0px 1px 5px rgba(0, 0, 0, 0.25) !important;
  }

  .item {
    position: relative;
    margin-bottom: 2rem;
  }

  .term {
    color: #034376;
    font-size: 1.6rem;
    font-weight: 700;
  }

  .payment {
    text-align: center;
    & p {
      color: #50585d;
      font-size: 1.4rem;
      line-height: 3.2rem;
    }
    & .amount,
    .amount span {
      font-size: 1.8rem;
      color: #034376;
      font-weight: bold;
    }
  }

  .apr {
    color: #50585d;
    margin-bottom: 1rem;
  }
`;

type IOptionProps = {
  children: any;
  onClick: any;
  buttonText: string;
  disabled?: boolean;
};

const OptionComponent = ({
  children,
  buttonText,
  onClick,
  disabled = false,
}: IOptionProps) => {
  return (
    <OptionBox className="optionBox">
      {children}
      <Button
        disabled={disabled}
        variant="primary"
        className="optionBox-btn"
        type="button"
        onClick={onClick}
      >
        {buttonText}
      </Button>
    </OptionBox>
  );
};

export default OptionComponent;
