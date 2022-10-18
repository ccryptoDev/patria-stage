import React from "react";
import styled from "styled-components";
import Container from "../../../atoms/Container";
import Card from "../../../atoms/Cards/ContactCard";
import ProfileIcon from "../../../atoms/Icons/SvgIcons/Landing/Profile";
import AccountIcon from "../../../atoms/Icons/SvgIcons/Landing/Account";
import ContactIcon from "../../../atoms/Icons/SvgIcons/Landing/Contact";
import { H5 } from "../../../atoms/Typography";
import Note from "../../../molecules/Note";
import LoginButton from "../../../molecules/Buttons/Login";

const Wrapper = styled.section`
  padding: 6rem 0;
  .cards {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    grid-gap: 2rem;
    width: 100%;

    & .card {
      align-items: start;
      text-align: left;
      row-gap: 3.8rem;
      &-header {
        flex-direction: row;
        align-items: center;
        column-gap: 12px;
        & h5 {
          font-size: 1.8rem;
        }
        & .img-wrapper {
          height: 24px;
          & svg {
            height: 100%;
          }
        }
      }

      & p {
        padding-left: 3.2rem;
      }
    }
  }

  .layout {
    display: flex;
    flex-direction: column;
    row-gap: 4.8rem;
  }

  @media screen and (max-width: 767px) {
    .cards {
      grid-template-columns: 1fr 1fr;
      padding: 0;
    }
  }

  @media screen and (max-width: 500px) {
    .cards {
      grid-template-columns: 1fr;
    }
  }
`;

const config = [
  {
    headImg: <ProfileIcon />,
    title: "Customer Care Inquiries",
    text: (
      <p>
        For general account inquiries, please call{" "}
        <a href="tel:(800) 640-2093" className="link underline">
          (800) 640-2093
        </a>
        , or email us at{" "}
        <a
          href="mailto:CustomerCare@PatriaLending.com"
          className="link underline"
        >
          CustomerCare@PatriaLending.com.
        </a>
      </p>
    ),
  },
  {
    headImg: <AccountIcon />,
    title: "Account Resolution",
    text: (
      <p>
        To manage a past due balance please contact us by phone at{" "}
        <a href="tel:(800) 640-2093" className="link underline">
          (800) 640-2093
        </a>{" "}
        or by email at{" "}
        <a
          href="mailto:CustomerCare@PatriaLending.com"
          className="link underline"
        >
          {" "}
          CustomerCare@PatriaLending.com
        </a>
      </p>
    ),
  },
  {
    headImg: <ContactIcon />,
    title: "Questions or Concerns",
    text: (
      <p>
        Please send an email to{" "}
        <a
          href="mailto:CustomerCare@PatriaLending.com"
          className="link underline"
        >
          CustomerCare@PatriaLending.com
        </a>
        . For basic information on your account visit the{" "}
        <LoginButton className="link underline">My Account login</LoginButton>.
      </p>
    ),
  },
];

const Section = () => {
  return (
    <Wrapper>
      <Container className="layout">
        <ul className="cards">
          {config.map(({ headImg, title, text }) => {
            return (
              <Card key={title} className="card">
                <div className="card-header">
                  <div className="img-wrapper">{headImg}</div>
                  <H5>{title}</H5>
                </div>
                {text}
              </Card>
            );
          })}
        </ul>

        <Note
          content={[
            <b key="1">
              Note: for your protection, please do not include sensitive
              personal information such as your social security number or bank
              account number in your message.
            </b>,
          ]}
        />
      </Container>
    </Wrapper>
  );
};

export default Section;
