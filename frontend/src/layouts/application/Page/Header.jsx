import React from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import Button from "./Button";
import logo from "../../../assets/svgs/logo-dark.svg";

const Wrapper = styled.header`
  background: #fff;
  box-shadow: 0px 0.5px 1.75px rgba(0, 0, 0, 0.039),
    0px 1.85px 6.25px rgba(0, 0, 0, 0.19);
  height: 74px;

  .logo img {
    height: 50px;
  }

  .nav {
    padding: 5px 20px;
    height: 100%;
    max-width: 1200px;
    width: 100%;
    margin: auto;
    display: flex;
    align-items: center;
    justify-content: space-between;

    & button {
      box-shadow: none;
    }
  }

  @media screen and (max-width: 767px) {
    .logo img {
      height: 30px;
    }
  }
`;

const Header = ({ route }) => {
  return (
    <Wrapper>
      <nav className="nav">
        <div className="logo">
          <Link to="/">
            <img src={logo} alt="partria-lending" />
          </Link>
        </div>
        <Button route={route} />
      </nav>
    </Wrapper>
  );
};

export default Header;
