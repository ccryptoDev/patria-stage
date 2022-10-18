import React from "react";
import styled from "styled-components";

const Wrapper = styled.div`
  display: flex;
  justify-content: center;

  .MuiButton-root {
    text-transform: revert;
  }

  & button:not(:first-child) {
    margin-left: 10px;
  }

  & button {
    font-size: 14px;
    box-shadow: 0px 0px 1px rgb(40 41 61 / 4%), 0px 2px 4px rgb(96 97 112 / 16%);
    opacity: 0.9;
    transition: all 0.2s;
    &:hover {
      opacity: 1;
    }
  }
`;

type IButtonsWrapper = {
  color?: string;
  children: any;
  className?: string;
};

const Buttons = ({ color, children, className }: IButtonsWrapper) => {
  return (
    <Wrapper className={className} color={color}>
      {children}
    </Wrapper>
  );
};

export default Buttons;
