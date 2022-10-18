import styled from "styled-components";

const Footer = styled.footer`
  background: #58595b;
  font-family: Spartan;
  padding: 30px 20px 24px;
  height: var(--footer-height);

  .section-contacts {
    & li {
      text-align: center;
    }
  }

  .footer-logo {
    height: 12rem;
  }

  .section-header {
    margin-bottom: 24px;
    height: 35px;
    display: flex;
    align-items: flex-end;
  }

  .placeholder {
    height: 35px;
  }

  .news {
    &-heading {
      font-size: 18px;
      font-weight: 600;
      color: var(--color-grey-light);
      margin-bottom: 24px;
    }
    &-search {
      & form {
        position: relative;
        & input {
          width: 280px;
          padding: 20px 40px 20px 16px;
          font-size: 14px;
          outline: none;
          background-color: transparent;
          border-radius: 8px;
          border: 1px solid var(--color-border);
          color: #28293d;
          box-sizing: border-box;
          position: relative;
          font-weight: 400;
          z-index: 2;
          background-color: white;
        }
        & button {
          background: transparent;
          border: none;
          position: absolute;
          z-index: 100;
          top: 50%;
          right: 0;
          transform: translate(-20px, -50%);
          display: flex;
          align-items: center;
          cursor: pointer;
        }
      }
    }
  }

  & .nav {
    margin: auto;
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    justify-content: space-between;
    height: 100%;
    max-width: 1200px;
    width: 100%;
  }

  & ul {
    display: flex;
    align-items: center;
    list-style: none;
    flex-direction: column;

    & li {
      width: 100%;
      &:first-child {
        padding-left: 0;
      }

      &:not(:last-child) .link-button,
      &:not(:last-child) .nav-button {
        margin-bottom: 8px;
      }

      &:first-child .link-button,
      &:first-child .nav-button {
        margin-bottom: 24px;
      }
      & .link-button,
      & .nav-button {
        color: var(--color-grey-light);
        font-weight: 700;
        font-size: 12px;
        text-decoration: none;
        cursor: pointer;
        display: block;
      }

      .nav-button {
        background: transparent;
        border: none;
      }

      .socials {
        display: flex;
        align-items: center;
        column-gap: 10px;
        cursor: pointer;

        & a {
          width: 24px;
          height: 24px;
        }
      }
    }
  }

  @media screen and (max-width: 900px) {
    height: auto;
    .nav {
      & ul:nth-of-type(2),
      & ul:nth-of-type(4) {
        align-self: end;
      }
      & ul:nth-of-type(1) {
        order: 1;
      }
      & ul:nth-of-type(2) {
        order: 3;
      }
      & ul:nth-of-type(3) {
        order: 2;
      }
      & ul:nth-of-type(4) {
        order: 4;
      }
      & ul:nth-of-type(5) {
        order: 5;
      }
    }
  }

  @media screen and (max-width: 650px) {
    .policies-socials {
      align-items: flex-end;
      & li {
        display: flex;
        align-items: flex-end;
      }
    }
  }

  @media screen and (max-width: 600px) {
    .footer-container {
      max-width: 400px;
    }
    .news {
      width: 100%;
    }
  }

  @media screen and (max-width: 530px) {
    .nav {
      display: grid;
      grid-template-columns: 1fr 1fr;

      & ul:nth-of-type(3),
      & ul:nth-of-type(4) {
        margin-left: auto;
      }

      & ul:nth-of-type(5) {
        grid-column: 1 / -1;
      }
    }
  }

  @media screen and (max-width: 350px) {
    .footer-container {
      flex-direction: column;

      .policies-list {
        & li {
          text-align: left;
        }
      }
    }
  }
`;

export default Footer;
