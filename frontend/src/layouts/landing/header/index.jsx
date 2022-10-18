import React from "react";
import { Link } from "react-router-dom";
import MenuIcon from "@mui/icons-material/Menu";
import styled from "styled-components";
import Container from "../../../components/atoms/Container";
import logo from "../../../assets/landing/logo-dark.svg";
import Button from "./navButton";

const Header = styled.header`
  position: relative;
  & .wrapper {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: var(--header-height);
    z-index: 999;
  }
  & #burder-menu-btn {
    background: transparent;
    border: none;
    cursor: pointer;
    padding: 0;
  }

  .logo img {
    height: 50px;
  }

  & nav {
    margin-top: 10px;
  }

  & nav {
    & ul {
      list-style: none;
      display: flex;
      align-items: center;
      column-gap: 2rem;
    }
  }

  @media screen and (max-width: 600px) {
    .logo img {
      height: 30px;
    }

    & nav {
      ul li:not(:last-child) {
        display: none;
      }
    }
  }
`;

const HeaderComponent = ({ toggleMenu }) => {
  return (
    <Header className="header">
      <Container>
        <div className="wrapper">
          <div className="logo">
            <Link to="/">
              <img src={logo} alt="patria-lending" />
            </Link>
          </div>
          <nav>
            <ul className="header-menu-list header-menu-list-lg">
              <li>
                <Button to="/about" className="navlink">
                  about us
                </Button>
              </li>
              <li>
                <Button to="/loans" className="navlink">
                  our loans
                </Button>
              </li>
              <li>
                <Button to="/" className="navlink">
                  apply
                </Button>
              </li>
              <li>
                <Button to="/application/login" className="navlink">
                  my account
                </Button>
              </li>
              <li>
                <button type="button" id="burder-menu-btn" onClick={toggleMenu}>
                  <MenuIcon sx={{ fontSize: 24 }} />
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </Container>
    </Header>
  );
};

export default HeaderComponent;
