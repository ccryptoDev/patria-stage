import React from "react";
import BannerWrapper from "../../../atoms/Landing/Banner";
import Container from "../../../atoms/Container";
import { H2 } from "../../../atoms/Typography";

const Section = () => {
  return (
    <div>
      <BannerWrapper className="resources-section-banner">
        <Container>
          <div className="layout">
            <H2>Resources</H2>
          </div>
        </Container>
      </BannerWrapper>
    </div>
  );
};

export default Section;
