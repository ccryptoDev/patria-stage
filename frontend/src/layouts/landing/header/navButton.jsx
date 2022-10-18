import React from "react";
import styled from "styled-components";
import { Link, useHistory } from "react-router-dom";

const Button = styled(Link)`
  font-size: 12px;
  font-weight: 700;
  transition: all 0.2s;

  &,
  &:visited {
    text-decoration: none;
    line-height: 1.5;
    color: var(--color-main-2);
    text-transform: uppercase;
  }

  &.selected {
    color: var(--color-blue-1);
  }
`;

const NavButton = ({ to, children, className }) => {
  const history = useHistory();
  const isActive = history.location.pathname === to;

  return (
    <Button className={`${className} ${isActive ? "selected" : ""}`} to={to}>
      {children}
    </Button>
  );
};

export default NavButton;
