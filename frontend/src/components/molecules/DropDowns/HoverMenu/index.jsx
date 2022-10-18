import React from "react";
import styled from "styled-components";

const MenuWrapper = styled.div`
  height: 100%;
  &,
  ul {
    list-style: none;
    z-index: 999;
  }

  & > li {
    height: 100%;
  }

  position: relative;
  height: 7rem;
  box-sizing: border-box;
  padding: 2rem;
  cursor: pointer;
  .content {
    position: absolute;
    top: 100%;
    background: #fff;
    box-shadow: 0px 4px 4px rgb(0 0 0 / 25%);
    opacity: 0;
    visibility: hidden;
    transition: all 0.4s;
  }

  &:hover .content {
    opacity: 1;
    visibility: visible;
  }

  &:hover {
    .chevron-icon {
      transform: rotate(0);
    }
  }
`;

const Menu = ({ button: Button, MenuList: List }) => {
  return (
    <MenuWrapper className="menu">
      <li>
        <Button />
        <ul className="content">
          <List />
        </ul>
      </li>
    </MenuWrapper>
  );
};

export default Menu;
