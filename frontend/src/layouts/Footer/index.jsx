import React, { useState } from "react";
import { Link } from "react-router-dom";
import arrowright from "../../assets/svgs/arrow-right.svg";
import FooterWrapper from "./styles";
import { routes } from "../../routes/Application/routes";
import nafsa from "../../assets/png/Logoes/nafsa.png";
import ola from "../../assets/png/Logoes/ola.png";

const Footer = () => {
  const [email, setEmail] = useState("");
  const submitHandler = (e) => {
    e.preventDefault();
  };
  return (
    <FooterWrapper>
      <div className="nav">
        <ul className="section-application">
          <li>
            <div className="section-header">
              <Link to="/">
                <img src="/images/Logo-Patria-Light.svg" alt="PatriaLending" />
              </Link>
            </div>
          </li>
          <li>
            <Link to={routes.REGISTRATION} className="link-button">
              Create Account
            </Link>
          </li>
          <li>
            <Link to={routes.LOGIN} className="link-button">
              Sign In
            </Link>
          </li>
          <li>
            <Link to={routes.HOME} className="link-button">
              Start Application
            </Link>
          </li>
        </ul>
        <ul>
          <li>
            <img src={nafsa} alt="NAFSA" className="footer-logo" />
          </li>
        </ul>
        <ul className="section-contacts policies-socials">
          <li>
            <div className="placeholder section-header" />
          </li>
          <li>
            <Link
              to={routes.TERMS_OF_USE}
              target="_blank"
              className="link-button"
            >
              Terms of Use
            </Link>
          </li>
          <li>
            <Link
              to={routes.PRIVACY_NOTICE}
              target="_blank"
              className="link-button"
            >
              Privacy Notice
            </Link>
          </li>
          <li>
            <Link to="/contact" className="link-button">
              Contact us
            </Link>
          </li>
        </ul>
        <ul>
          <li>
            <img src={ola} alt="OLA" className="footer-logo" />
          </li>
        </ul>
        <ul className="news">
          <li className="news-heading section-header">
            News And Special Offers
          </li>
          <li className="news-search">
            <form onSubmit={submitHandler}>
              <button type="submit">
                <img src={arrowright} alt="submit" />
              </button>
              <input
                type="email"
                name="email"
                placeholder="Email"
                onChange={(e) => setEmail(e.target.value)}
              />
            </form>
          </li>
        </ul>
      </div>
    </FooterWrapper>
  );
};

export default Footer;
