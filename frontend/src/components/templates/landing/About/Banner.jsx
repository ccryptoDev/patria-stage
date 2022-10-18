import React from "react";
import { Link } from "react-router-dom";
import BannerWrapper from "../../../atoms/Landing/Banner";
import Container from "../../../atoms/Container";
import { H2 } from "../../../atoms/Typography";

const Section = () => {
  return (
    <div>
      <BannerWrapper className="about-section-banner">
        <Container>
          <div className="layout">
            <H2>About Us</H2>
            <p>
              We are here <b>to help the 40+ million Americans </b> who do not
              have access to short-term credit through conventional banks each
              year. These underserved customers deserve an option to manage
              their unforeseen expenses. Best-in-class technology and analytics
              enables us to provide a Fast, Secure and Private way to solve your
              financial needs. <b>Apply today</b> and you may
              <b> get your funds in minutes </b> via your debit card or
              same/next business day funding via ACH.
            </p>
            <p>
              We are <b>Patria Lending. </b> We offer online small dollar credit
              products that help our borrowers bridge the gap between
              today&apos;s unexpected expenses and tomorrow&apos;s
              opportunities. We are owned by and operated by the Otoe-Missouria
              Tribe. For more information about the Otoe-Missouria Tribe, please
              click <Link to="/about#article">here</Link>.
            </p>
          </div>
        </Container>
      </BannerWrapper>
    </div>
  );
};

export default Section;
