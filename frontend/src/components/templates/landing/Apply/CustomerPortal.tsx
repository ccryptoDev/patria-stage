import React from "react";
import styled from "styled-components";
import { H2 } from "../../../atoms/Typography";
import Container from "../../../atoms/Container";
import Button from "../../../atoms/Buttons/LinkButton";
import arrow from "../../../../assets/landing/arrow-right-blue.png";
import shield from "../../../../assets/landing/shield.png";
import document from "../../../../assets/landing/customer-portal/cp-documentCenter.png";
import user from "../../../../assets/landing/customer-portal/cp-userInfo.png";
import info from "../../../../assets/landing/customer-portal/cp-loanInfo.png";
import start from "../../../../assets/landing/customer-portal/startApp.png";

const Wrapper = styled.section`
  background: var(--color-blue-1);
  padding-top: 6rem;

  .section-header {
    display: flex;
    align-items: center;
    flex-direction: column;
    row-gap: 4.8rem;
    &,
    & h2 {
      color: #fff;
    }
    margin-bottom: 8rem;
  }

  .cards {
    display: flex;
    justify-content: space-between;
    width: 100%;
    column-gap: 10px;
  }
  .card {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    row-gap: 2rem;
    &-header {
      display: flex;
      flex-direction: column;
      row-gap: 12px;
      align-items: center;
      text-align: center;
      color: var(--color-blue-3);

      & img {
        height: 4rem;
        width: 3.3rem;
      }
    }

    &-content {
      img {
        width: 100%;
        display: block;
      }
    }
    p {
      font-size: 14px;
      font-weight: bold;
    }
  }

  @media screen and (max-width: 650px) {
    & .cards {
      flex-direction: column;
      row-gap: 20px;
    }
  }
`;

const config = [
  {
    headImg: shield,
    title: "Apply For a New Loan",
    img: start,
  },
  {
    headImg: shield,
    title: "Modify Your Information",
    img: user,
  },
  {
    headImg: shield,
    title: "Review All Signed Documents",
    img: document,
  },
  {
    headImg: shield,
    title: "Control Your Schedule",
    img: info,
  },
];

const CustormerPortalSeciton = () => {
  return (
    <Wrapper>
      <Container>
        <div className="section-header">
          <H2>Customer Portal</H2>
          <p>
            Once you become an active Patria Lending borrower, you can manage
            your account 24/7 using our online customer portal!
          </p>
          <div className="button-wrapper">
            <Button to="/application/login" className="button-inverted">
              Log In Here
              <img src={arrow} alt="->" />
            </Button>
          </div>
        </div>
        <ul className="cards">
          {config.map(({ headImg, title, img }) => {
            return (
              <li className="card" key={title}>
                <div className="card-header">
                  <img src={headImg} alt="shield" />
                  <p>{title}</p>
                </div>
                <div className="card-content">
                  <img src={img} alt="startApp" />
                </div>
              </li>
            );
          })}
        </ul>
      </Container>
    </Wrapper>
  );
};

export default CustormerPortalSeciton;
