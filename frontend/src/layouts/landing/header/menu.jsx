import React from "react";
import styled from "styled-components";
import Container from "../../../components/atoms/Container";
import Button from "./navButton";
import LinkButton from "../../../components/atoms/Buttons/LinkButton";

const Wrapper = styled.div`
  .menu {
    position: absolute;
    width: 100%;
    height: 0;
    min-height: 0;
    background: #fff;
    overflow: hidden;
    transition: all 0.3s;
    z-index: 1000;

    .button-wrapper {
      display: flex;
    }

    &.show {
      min-height: 135px;
    }

    .layout {
      border-top: 1px solid var(--color-secondary-2);
      padding: 24px 0 8px;
      display: flex;
      justify-content: space-between;

      nav ul {
        display: flex;
        flex-wrap: wrap;
        width: 200px;
        justify-content: end;
        row-gap: 36px;
        column-gap: 24px;
        padding: 12px;

        & .menu-item-sm {
          display: none;
        }
      }
    }

    &-start-app-card {
      background: var(--color-bg-3);
      padding: 12px;
      display: flex;
      flex-direction: column;
      row-gap: 12px;
      border-radius: 8px;
      max-width: 730px;
      width: 100%;
      box-sizing: border-box;
    }
  }

  .menu-backdrop {
    background: rgba(0, 0, 0, 0.2);
    position: absolute;
    top: var(--header-height);
    bottom: 0;
    width: 100%;
    opacity: 0;
    visibility: hidden;
    z-index: 888;
    color: transparent;

    &.show {
      opacity: 1;
      visibility: visible;
    }
  }

  @media screen and (max-width: 600px) {
    .menu .layout {
      flex-direction: column;
    }
    .menu .layout nav ul .menu-item-sm {
      display: block;
    }

    .menu.show {
      height: 230px;
    }

    .menu .layout nav ul {
      width: 100%;
      order: 1;
      justify-content: start;
    }

    .menu-start-app-card {
      order: 2;
    }
  }

  @media screen and (max-width: 600px) {
    & .menu .layout {
      padding: 0;
    }
  }

  @media screen and (max-width: 420px) {
    .menu.show {
      height: 270px;
    }
  }
`;

const Drawer = ({ isOpen = false, toggleMenu }) => {
  return (
    <Wrapper>
      <div className={`menu ${isOpen ? "show" : ""}`} id="menu-lg">
        <Container>
          <div className="layout">
            <div className="menu-start-app-card">
              <p>
                Applying is easy. Approvals are fast. Same business day funding
                may be available.
              </p>
              <div className="button-wrapper">
                <LinkButton to="/application" className="button-contained">
                  Start Application
                </LinkButton>
              </div>
            </div>
            <nav className="menu-links">
              <ul className="header-menu-list header-menu-list-lg">
                <li className="menu-item-sm">
                  <Button to="/about" className="navlink">
                    about us
                  </Button>
                </li>
                <li className="menu-item-sm">
                  <Button to="/loans" className="navlink">
                    our loans
                  </Button>
                </li>
                <li className="menu-item-sm">
                  <Button to="/" className="navlink">
                    apply
                  </Button>
                </li>
                <li className="menu-item-sm">
                  <Button to="/application/login" className="navlink">
                    my account
                  </Button>
                </li>

                <li>
                  <Button to="/resources" className="navlink">
                    Resources
                  </Button>
                </li>
                <li>
                  <Button to="/faq" className="navlink">
                    FAQs
                  </Button>
                </li>
                <li>
                  <Button to="/privacy" className="navlink">
                    Privacy
                  </Button>
                </li>
                <li>
                  <Button to="/contact" className="navlink">
                    Contact Us
                  </Button>
                </li>
              </ul>
            </nav>
          </div>
        </Container>
      </div>
      <div
        onClick={toggleMenu}
        onKeyDown={toggleMenu}
        role="button"
        tabIndex={0}
        className={`menu-backdrop ${isOpen ? "show" : ""}`}
        id="menu-backdrop"
      >
        0
      </div>
    </Wrapper>
  );
};

export default Drawer;
