import React from "react";
import BannerWrapper from "../../../atoms/Landing/Banner";
import Container from "../../../atoms/Container";
import { H2 } from "../../../atoms/Typography";

const Section = () => {
  return (
    <div>
      <BannerWrapper className="loans-section-banner">
        <Container>
          <div className="layout">
            <H2>Our Loans</H2>
            <p>Our Loan Process is Simple</p>
            <p>
              We offer loans that allow you to stretch your monthly budget when
              the unexpected happens. <b>Ranging from $300 to $2,500</b>, our
              installment loans are a secure and convenient alternative to
              payday or title loans. Our loans are unsecured and typically
              require only three steps for fast results.
            </p>
          </div>
        </Container>
      </BannerWrapper>
    </div>
  );
};

export default Section;
