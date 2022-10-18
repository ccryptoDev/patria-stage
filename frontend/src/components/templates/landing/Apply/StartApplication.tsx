import React from "react";
import styled from "styled-components";
import Form from "./Form";
import BannerWrapper from "../../../atoms/Landing/Banner";
import Container from "../../../atoms/Container";
import { H1, H5 } from "../../../atoms/Typography";

const Wrapper = styled.section`
  .text-container {
    display: flex;
    flex-direction: column;
    row-gap: 3.2rem;
    .application-description {
      color: #fff;
    }

    h1 {
      max-width: 45rem;
    }
  }
`;

const Layout = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  column-gap: 20px;

  .section-start-application {
    height: auto;
  }

  @media screen and (max-width: 767px) {
    &.layout {
      flex-direction: column !important;
    }
    row-gap: 2rem;

    .text-container {
      row-gap: 2rem;
      h1 {
        width: 100%;
        font-size: 3.2rem;
      }
    }
  }
`;

const Section = () => {
  return (
    <Wrapper>
      <BannerWrapper className="section-start-application">
        <Container>
          <Layout className="layout">
            <div className="text-container">
              <H1>Get the money you need in minutes</H1>
              <H5 className="application-description">
                Offering personal loans up to $2,500 to help manage life’s
                unexpected events. Big or small, we are always here to help you!
              </H5>
            </div>

            <Form />
          </Layout>
        </Container>
      </BannerWrapper>
    </Wrapper>
  );
};

export default Section;
