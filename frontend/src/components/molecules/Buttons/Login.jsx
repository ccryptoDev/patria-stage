import React from "react";
import styled, { css } from "styled-components";
import { adminBaseUrl } from "../../../app.config";

const link = css`
  border: none;
  color: var(--color-primary);
  background: transparent;
`;

const button = css`
  border-radius: 8px;
  border: 1px solid;
  transition: all 0.3s;
  box-sizing: border-box;
  padding: 12px 26px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  cursor: pointer;
  font-family: Spartan;
  font-size: 14px;
  font-weight: 600;
  column-gap: 12px;
  border: none;
  background: var(--color-primary);
  color: #fff;

  &:hover {
    background: var(--color-primary-hover);
  }

  &:active {
    background: linear-gradient(0deg, rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.2)),
      #1e84be;
  }

  &:disabled {
    background: #b5dcf2;
  }
`;

const Button = styled.button`
  &.link {
    ${link}
  }

  &.button {
    ${button}
  }
`;

const ButtonComponent = ({ className, children }) => {
  const goToPortal = () => {
    const borrowerPortalLink = process.env.LMS_APP_BASE_URL;
    window.location.replace(
      String(borrowerPortalLink || adminBaseUrl).concat("/login")
    );
  };

  return (
    <Button type="button" className={className} onClick={goToPortal}>
      {children}
    </Button>
  );
};

export default ButtonComponent;
