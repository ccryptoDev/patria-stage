import React from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import Button from "../../../components/molecules/Buttons/ActionButton";

const Wrapper = styled.header`
  background: #fff;
  height: 70px;
  display: block;

  .container {
    height: 100%;
    padding: 0 24px;
    width: 100%;
    margin: auto;
    display: flex;
    align-items: center;
    column-gap: 16px;
    .logo img {
      height: 52px;
    }

    .user {
      &-wrapper {
        display: flex;
        align-items: center;
        column-gap: 12px;
        font-size: 14px;
        line-height: 1.5;
      }
      &-name-wrapper {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
      }
    }
  }
  @media screen and (max-width: 767px) {
    display: block;
    .logo img {
      height: 25px;
    }
    .user-name-wrapper {
      font-size: 12px;
    }
  }
`;

const Header = ({ toggleMenu }: { toggleMenu: any }) => {
  return (
    <Wrapper>
      <div className="container">
        <Button onClick={toggleMenu} type="menu" />
        <div className="logo">
          <Link to="/borrower/">
            <img src="/images/logo-patria.svg" alt="PatriaLending" />
          </Link>
        </div>
      </div>
    </Wrapper>
  );
};

export default Header;
