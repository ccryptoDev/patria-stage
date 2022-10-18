import React from "react";
import styled from "styled-components";
import Indicator from "../../atoms/Buttons/RadioButton";

const Button = styled.button`
  background: transparent;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  column-gap: 5px;
`;

interface IRadioButton {
  children?: any;
  onClick: any;
  active: boolean;
}

const RadioButton = ({ children, onClick, active }: IRadioButton) => {
  return (
    <Button className="radio-button" type="button" onClick={onClick}>
      <Indicator
        className={`radio-button-indicator ${active ? "active" : ""}`}
      />{" "}
      {children}
    </Button>
  );
};

export default RadioButton;
