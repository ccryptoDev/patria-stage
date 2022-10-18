import React from "react";
import styled from "styled-components";
import Arrow from "../../atoms/Icons/SvgIcons/Chevron";

const Button = styled.button`
  display: flex;
  column-gap: 10px;
  align-items: center;
  color: var(--color-grey);
  background: transparent;
  border: none;
  margin-left: auto;

  & svg path {
    fill: var(--color-grey);
  }

  &:disabled {
    opacity: 0.3;
  }
`;

const NextButton = ({ children, disabled, onClick }: any) => {
  return (
    <Button type="button" disabled={disabled} onClick={onClick}>
      {children}
      <Arrow />
    </Button>
  );
};

export default NextButton;
