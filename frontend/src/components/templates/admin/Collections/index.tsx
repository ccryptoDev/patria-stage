import React from "react";
import styled from "styled-components";
import MainHeader from "../Components/Main-Header";
import { routes } from "../../../../routes/Admin/routes";
import Cube from "../Components/Cube";
import Container from "../Components/ContentContainer";
import { renderCubes } from "./config";

const Wrapper = styled.div`
  .cubes-container {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr 1fr;
    grid-gap: 17px;

    @media screen and (max-width: 1430px) {
      grid-template-columns: 1fr 1fr 1fr;
    }

    @media screen and (max-width: 1170px) {
      grid-template-columns: 1fr 1fr;
      grid-gap: 16px;
    }

    @media screen and (max-width: 992px) {
      grid-template-columns: 1fr 1fr 1fr;
    }

    @media screen and (max-width: 820px) {
      grid-template-columns: 1fr 1fr;
    }

    @media screen and (max-width: 560px) {
      grid-template-columns: 1fr;
    }
  }
`;

const Collections = () => {
  const crumbs = [
    { text: "Home", route: routes.DASHBOARD },
    { text: "Collections", route: routes.COLLECTIONS },
  ];
  return (
    <Wrapper>
      <MainHeader
        crumbs={crumbs}
        heading="Collections"
        backgroundColor="#1E84BE"
      />
      <Container>
        <div className="cubes-container">
          {renderCubes().map((cube) => {
            return <Cube {...cube} key={cube.title} />;
          })}
        </div>
      </Container>
    </Wrapper>
  );
};

export default Collections;
