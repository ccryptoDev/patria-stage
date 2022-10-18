import React from "react";
import styled from "styled-components";

const Button = styled.button`
  width: 3rem;
  height: 3rem;
  background: transparent;
  border: none;
  position: relative;
  cursor: pointer;

  .menu {
    position: relative;

    &,
    &:before,
    &:after {
      background: #000;
      width: 100%;
      height: 3px;
    }

    &:before,
    &:after {
      content: "";
      position: absolute;
      left: 0;
      right: 0;
    }

    &:before {
      top: 0.8rem;
    }

    &:after {
      bottom: 0.8rem;
    }
  }
`;

const MenuButton = ({ onClick }) => {
  return (
    <Button type="button" onClick={onClick}>
      <div className="menu" />
    </Button>
  );
};

export default MenuButton;
