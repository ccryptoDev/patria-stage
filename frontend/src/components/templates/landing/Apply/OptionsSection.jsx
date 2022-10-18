import React from "react";
import styled from "styled-components";
import Button from "../../../atoms/Buttons/LinkButton";
import arrow from "../../../../assets/landing/arrow-right-white.png";
import Card from "../../../atoms/Cards/ContactCard";
import { H2, H5 } from "../../../atoms/Typography";
import Container from "../../../atoms/Container";
import ProfileIcon from "../../../atoms/Icons/SvgIcons/Landing/Profile";
import OptionsIcon from "../../../atoms/Icons/SvgIcons/Landing/Options";
import CreditCardIcon from "../../../atoms/Icons/SvgIcons/Landing/Card";

const Wrapper = styled.section`
  padding: 6rem 0;

  h2 {
    text-align: center;
  }

  .layout {
    display: flex;
    flex-direction: column;
    align-items: center;
    row-gap: 4.8rem;
  }

  .cards {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    width: 100%;
    grid-column-gap: 10px;
  }

  @media screen and (max-width: 650px) {
    row-gap: 3.2rem;

    .cards {
      grid-template-columns: 1fr;
      grid-row-gap: 10px;
    }
  }
`;

const cards = [
  {
    title: "Tell us about yourself",
    img: <ProfileIcon />,
    description:
      "We just need a little bit of information to access your offer.",
  },
  {
    title: "Choose your loan amount",
    img: <OptionsIcon />,
    description: "If you qualify, you can borrow up to $2,500",
  },
  {
    title: "Get your maney",
    img: <CreditCardIcon />,
    description:
      "Your money can be in your account as soon as the same business day!",
  },
];

const OptionsSeciton = () => {
  return (
    <Wrapper className="section-options">
      <Container>
        <div className="layout">
          <H2>Flexible Options In Three Easy Steps</H2>

          <ul className="cards">
            {cards.map(({ img, title, description }) => {
              return (
                <Card key={title}>
                  <div className="card-header">
                    <div className="img-wrapper">{img}</div>
                    <H5>{title}</H5>
                  </div>
                  <p>{description}</p>
                </Card>
              );
            })}
          </ul>
          <div className="button-wrapper">
            <Button to="/application" className="button-contained">
              Let’s Get Started
              <img src={arrow} alt="->" />
            </Button>
          </div>
        </div>
      </Container>
    </Wrapper>
  );
};

export default OptionsSeciton;
