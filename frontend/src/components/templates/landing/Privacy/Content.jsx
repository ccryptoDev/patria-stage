import React from "react";
import styled from "styled-components";
import { Link } from "react-router-dom";
import Container from "../../../atoms/Container";
import { H5 } from "../../../atoms/Typography";
import { routes } from "../../../../routes/Landing/routes";

const Wrapper = styled.section`
  padding: 6rem 0;
  .list {
    & > li {
      padding: 4.8rem 0;
      &:not(:first-child) {
        border-top: 1px solid var(--color-secondary-2);
      }

      &:first-child {
        padding-top: 0;
      }

      &:last-child {
        padding-bottom: 0;
      }

      & h5 {
        color: var(--color-blue-1);
        font-weight: 700;
        font-size: 2rem;
        margin-bottom: 2.4rem;
      }

      & ul {
        display: flex;
        flex-direction: column;
        row-gap: 1.2rem;
      }

      & .minimin-requirements-list {
        margin-left: 2rem;
        list-style: disc;
      }
    }
  }

  .paragraph {
    font-size: 1.4rem;
  }
`;

const Section = () => {
  return (
    <Wrapper>
      <Container>
        <ul className="list">
          <li>
            <H5>Privacy Policy</H5>
            <div className="paragraph">
              To learn about the types of personal information we collect and
              share depending on the product or service you have with us, please
              click{" "}
              <Link
                to={routes.PRIVACY_NOTICE}
                className="link underline"
                target="_blank"
              >
                here
              </Link>
              .
            </div>
          </li>

          <li>
            <H5>Online Privacy Notice</H5>
            <p>
              To learn how we manage, collect, and protect your information when
              you visit our website, please click{" "}
              <Link
                to={routes.ONLINE_PRIVACY_NOTICE}
                className="link underline"
                target="_blank"
              >
                here
              </Link>
              .
            </p>
          </li>

          <li>
            <H5>Terms of Use</H5>
            <div className="paragraph">
              PLEASE READ THE FOLLOWING TERMS CAREFULLY. Your access and use of
              any domains and websites (collectively, a &quot;Site&quot;), which
              are operated by Patria Lending LLC dba Patria and Patria Lending
              (&quot;Patria Lending&quot; or &quot;Lender&quot;), and your
              access and use of any of the services that Patria Lending provides
              or offers through a Site (collectively &quot;Services&quot;) are
              covered by and subject to these{" "}
              <Link
                to={routes.TERMS_OF_USE}
                className="link underline"
                target="_blank"
              >
                Terms of Use
              </Link>
              .
            </div>
          </li>

          <li>
            <H5>Communication Preferences</H5>
            <p>
              Patria Lending provides valuable services via email, telephone,
              and automated voice messages. These services may include account
              notifications, promotions, discounts/coupons, and valuable
              financial resources. While we present these services on a limited
              basis, if at any time you wish to unsubscribe from all or a single
              type of communication, you may do so by following the instructions
              listed below.
            </p>
          </li>

          <li>
            <H5>Unsubscribe options</H5>
            <ul>
              <li>
                <p>
                  If you wish to unsubscribe from promotional communications,
                  please contact Customer Service via email at{" "}
                  <a
                    href="mailto:CustomerCare@PatriaLending.com"
                    className="link"
                  >
                    CustomerCare@PatriaLending.com
                  </a>{" "}
                  or by calling{" "}
                  <a href="tel:(800) 640-209" className="link">
                    (800) 640-209
                  </a>{" "}
                  .
                </p>
              </li>
              <li>
                <p>
                  Alternatively, all communications we send offer ways to opt
                  out directly. Follow the instructions below to opt out of each
                  communication separately.
                </p>
              </li>
            </ul>
          </li>

          <li>
            <H5>Email opt-out</H5>
            <p>
              You may unsubscribe directly from any promotional email message.
              All promotional messages include an easily accessible link to
              unsubscribe from future messages. You can also opt out by sending
              an email to{" "}
              <a href="mailto:OptOut@PatriaLending.com" className="link">
                OptOut@PatriaLending.com
              </a>{" "}
              .
            </p>
          </li>

          <li>
            <H5>Email terms & conditions</H5>
            <p>
              By providing Patria Lending with your email address(es) you
              consent that we may send email messages to your email address(es).
              Please add{" "}
              <a href="mailto:CustomerCare@PatriaLending.com" className="link">
                CustomerCare@PatriaLending.com
              </a>{" "}
              to your safe sender list or email address book. Email services are
              provided on an &quot;as is&quot; basis. You may unsubscribe from
              promotional messages at any time.
            </p>
          </li>

          <li>
            <H5>Prescreened Offers</H5>
            <p>
              You can choose to stop receiving prescreened offers of credit from
              Patria Lending and other companies by calling toll-free{" "}
              <a href="tel:1-888-567-8688" className="link">
                1-888-567-8688
              </a>{" "}
              .
            </p>
          </li>
        </ul>
      </Container>
    </Wrapper>
  );
};

export default Section;
