import React, { useEffect } from "react";
import BannerWrapper from "../../../atoms/Landing/Banner";
import Container from "../../../atoms/Container";
import { H1 } from "../../../atoms/Typography";
import { scrollTop } from "../../../../utils/scroll";

const Section = () => {
  useEffect(() => {
    scrollTop();
  }, []);

  return (
    <div>
      <BannerWrapper className="contact-section-banner">
        <Container>
          <div className="layout">
            <H1>Contact Us</H1>
          </div>
        </Container>
      </BannerWrapper>
    </div>
  );
};

export default Section;
