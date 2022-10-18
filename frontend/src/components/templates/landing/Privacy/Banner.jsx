import React from "react";
import BannerWrapper from "../../../atoms/Landing/Banner";
import Container from "../../../atoms/Container";
import { H1 } from "../../../atoms/Typography";

const Section = () => {
  return (
    <div>
      <BannerWrapper className="privacy-section-banner">
        <Container>
          <div className="layout">
            <H1>Privacy</H1>
          </div>
        </Container>
      </BannerWrapper>
    </div>
  );
};

export default Section;
