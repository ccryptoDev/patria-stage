import React from "react";
import styled from "styled-components";
import Container from "../../../atoms/Container";
import Card from "../../../atoms/Cards/ContactCard";
import { H5 } from "../../../atoms/Typography";
import PhoneIcon from "../../../atoms/Icons/SvgIcons/Landing/Phone";
import EmailIcon from "../../../atoms/Icons/SvgIcons/Landing/Email";
import ClockIcon from "../../../atoms/Icons/SvgIcons/Landing/Clock";
import LocationIcon from "../../../atoms/Icons/SvgIcons/Landing/Location";

const Wrapper = styled.section`
  .cards {
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-gap: 2rem;
    padding: 6rem 0;

    & .card {
      &-header {
        text-transform: uppercase;
        row-gap: 1.4rem;
      }
    }
  }

  @media screen and (max-width: 500px) {
    .cards {
      grid-template-columns: 1fr;
      padding: 0;
    }
  }
`;

const config = [
  {
    headImg: <PhoneIcon />,
    title: "Phone",
    text: (
      <a href="tel:(800) 640-2093" className="link underline">
        (800) 640-2093
      </a>
    ),
  },
  {
    headImg: <EmailIcon />,
    title: "Email",
    text: (
      <a
        href="mailto:CustomerCare@PatriaLending.com"
        className="link underline"
      >
        CustomerCare@PatriaLending.com
      </a>
    ),
  },
  {
    headImg: <LocationIcon />,
    title: "Mail",
    text: "Patria Lending, 8151 Highway 177, Red Rock, OK 74651-0348",
  },
  {
    headImg: <ClockIcon />,
    title: "Lending Hours",
    text: "Online self-serve: 24 hours per day/7 days per week.",
  },
];

const Section = () => {
  return (
    <Wrapper>
      <Container>
        <ul className="cards">
          {config.map(({ headImg, title, text }) => {
            return (
              <Card className="card" key={title}>
                <div className="card-header">
                  {headImg}
                  <H5>{title}</H5>
                </div>
                <p>{text}</p>
              </Card>
            );
          })}
        </ul>
      </Container>
    </Wrapper>
  );
};

export default Section;
