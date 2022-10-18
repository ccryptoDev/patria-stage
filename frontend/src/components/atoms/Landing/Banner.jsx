import React from "react";
import styled from "styled-components";
import applyBg from "../../../assets/landing/backgrounds/bg-loan.png";
import aboutBg from "../../../assets/landing/backgrounds/bg-about-us.png";
import contactBg from "../../../assets/landing/backgrounds/bg-contact-us.png";
import loansBg from "../../../assets/landing/backgrounds/bg-our-loans.png";
import faqBg from "../../../assets/landing/backgrounds/bg-faq.png";
import privacyNoticeBg from "../../../assets/landing/backgrounds/bg-online-privacy-notice.png";
import privacyBg from "../../../assets/landing/backgrounds/bg-privacy.png";
import ratesBg from "../../../assets/landing/backgrounds/bg-rates.png";
import resourcesBg from "../../../assets/landing/backgrounds/bg-resources.png";
import termsofuseBg from "../../../assets/landing/backgrounds/bg-terms-of-use.png";

const Banner = styled.div`
  // GENERAL CONFIG

  background-size: cover !important;
  background-position: center !important;
  background-repeat: no-repeat !important;

  & span,
  & a,
  & a:visited {
    color: #fff;
    font-weight: 600;
  }
  & h1,
  & h2,
  & p,
  & a {
    color: #fff;
  }

  & a.link {
    color: var(--color-blue-1);
  }

  & .layout {
    display: flex;
    flex-direction: column;
    justify-content: center;
    row-gap: 3.2rem;
    height: 100%;
    padding: 6rem 0;
  }

  // ABOUT US PAGE
  &.about-section-banner {
    height: 40vh;
    background: url(${aboutBg});

    & .layout {
      max-width: 767px;
    }
  }

  // APPLY PAGE
  &.section-start-application {
    background: url(${applyBg});
    width: 100%;

    & .layout {
      padding: 6rem 0 15rem;
      flex-direction: row;
    }
  }

  &.section-apply-about-us-banner {
    background: url(${aboutBg});
  }

  // CONTACT US PAGE
  &.contact-section-banner {
    height: 40vh;
    background: url(${contactBg});
  }

  // OUR LOANS PAGE
  &.loans-section-banner {
    background: url(${loansBg}) no-repeat;

    & .layout {
      row-gap: 24px;
      max-width: 767px;
      padding: 23rem 0 11rem;
    }
  }

  // FAQ PAGE
  &.faq-section-banner {
    height: 40vh;
    background: url(${faqBg});
  }

  // PRIVACY NOTICE PAGE
  &.privacy-notice-section-banner {
    height: 20vh;
    background: url(${privacyNoticeBg});
  }

  // PRIVACY PAGE
  &.privacy-section-banner {
    height: 40vh;
    background: url(${privacyBg});
  }

  // RATES PAGE
  &.rates-section-banner {
    height: 40vh;
    background: url(${ratesBg});
  }

  // RESOURCES PAGE
  &.resources-section-banner {
    height: 40vh;
    background: url(${resourcesBg});
  }

  // TERMS OF USE PAGE
  &.terms-section-banner {
    height: 40vh;
    background: url(${termsofuseBg});
  }

  @media screen and (max-width: 767px) {
    height: auto !important;
    .layout {
      padding: 2rem 0 !important;
    }
  }
`;

export default Banner;
