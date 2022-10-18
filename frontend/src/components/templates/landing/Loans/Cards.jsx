import React from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import Container from "../../../atoms/Container";
import shieldIcon from "../../../../assets/landing/shield.png";
import { H3 } from "../../../atoms/Typography";

const Wrapper = styled.section`
  background-color: var(--color-blue-1);
  padding: 6rem 0 8.4rem;

  .layout h3 {
    text-align: center;
    color: #fff;
    font-size: 2.4rem;
    line-height: 1.5;
  }

  .cards {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr 1fr;
    grid-column-gap: 2.4rem;
    margin-top: 4.8rem;
    & li {
      display: flex;
      flex-direction: column;
      row-gap: 12px;
      text-align: center;
      align-items: center;
      padding: 2.4rem;
      & img {
        width: 3.3rem;
        height: 4rem;
      }

      & p,
      & a {
        color: var(--color-blue-3);
        font-weight: 600;
      }
    }
  }

  @media screen and (max-width: 650px) {
    .cards {
      grid-template-columns: 1fr 1fr;
    }
  }

  @media screen and (max-width: 450px) {
    .cards {
      grid-template-columns: 1fr;
    }
  }
`;

const config = [
  { content: "Loan terms are 6, 9 and 12 months" },
  { content: "Weekly loan repayment frequency" },
  { content: "Early payoffs are encouraged. No prepayment penalty." },
  {
    content: (
      <>
        Interest rates vary, based on customer credit worthiness. Click{" "}
        <Link to="/rates" className="link underline">
          here
        </Link>
        .
      </>
    ),
  },
];

const Section = () => {
  return (
    <Wrapper>
      <Container className="layout">
        <H3>
          Applying for a Patria Lending loan is simple and only takes a few
          minutes
        </H3>
        <ul className="cards">
          {config.map((item) => {
            return (
              <li key={item.content}>
                <img src={shieldIcon} alt="shield" />
                <p>{item.content}</p>
              </li>
            );
          })}
        </ul>
      </Container>
    </Wrapper>
  );
};

export default Section;
