import React from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import Container from "../../../atoms/Container";
import fraudulentActivityIcon from "../../../../assets/landing/resources/fraudulentActivity.png";
import moneyOrderIcon from "../../../../assets/landing/resources/moneyOrder.png";
import financialLiteracyIcon from "../../../../assets/landing/resources/financialLiteracy.png";
import linkIcon from "../../../../assets/landing/resources/link.png";
import protectionIcon from "../../../../assets/landing/resources/protection.png";
import loanIcon from "../../../../assets/landing/resources/loan.png";
import documentIcon from "../../../../assets/landing/resources/document.png";
import ratingIcon from "../../../../assets/landing/resources/rating.png";
import { ButtonALink } from "../../../atoms/Buttons/LinkButton";
import { H5 } from "../../../atoms/Typography";

const Wrapper = styled.section`
  padding: 6rem 0;
  .button-wrapper {
    display: flex;
  }
  .resources-section {
    &-cards {
      padding: 6rem 0;
    }

    &-list {
      &-item {
        background: var(--color-bg-3);
        padding: 2.4rem;
        border-radius: 1.4rem;
        display: flex;
        column-gap: 2.4rem;
        &:not(:first-child) {
          margin-top: 2.4rem;
        }
        &-content {
          display: flex;
          flex-direction: column;
          row-gap: 2.4rem;

          & h5 {
            line-height: 1.4;
          }

          & .button-inverted {
            border: 1px solid var(--color-blue-1);
            background: transparent;
          }
        }
      }
    }
  }
`;

const config = [
  {
    img: fraudulentActivityIcon,
    heading: "Fraudulent Activity or Identity Theft",
    link: null,
    content: (
      <>
        To report fraudulent activity or deceptive lending practices, please
        contact the OLA Consumer Hotline at{" "}
        <a href="tel:1-866-299-7585" className="link">
          1-866-299-7585
        </a>{" "}
        or visit the{" "}
        <a
          href="https://onlinelendersalliance.org/consumer-resources/ola-consumer-hotline/"
          target="_blank"
          className="link"
          rel="noreferrer"
        >
          OLA Consumer Hotline{" "}
        </a>
        page for more information.
      </>
    ),
  },
  {
    img: moneyOrderIcon,
    heading: "Money Smart",
    link: "https://www.fdic.gov/resources/consumers/money-smart/index.html",
    content: (
      <>
        FDIC program helps people of all ages enhance their financial skills and
        create positive banking relationships. First released in 2001 and
        regularly updated since then, Money Smart has a long track-record of
        success.
      </>
    ),
  },
  {
    img: financialLiteracyIcon,
    heading: "NAFSA’s Financial Literacy Program",
    link: "https://nafsa.everfi-next.net/welcome/nafsa-achieve",
    content: (
      <>
        The Native American Financial Services Association is proud to provide
        educational content as a resource that encourages all people to take
        control of their finances and empowers them to understand how their
        finances work.
      </>
    ),
  },
  {
    img: linkIcon,
    heading: "MyMoney.Gov",
    link: "https://www.mymoney.gov/",
    content: (
      <>
        {" "}
        The federal government’s website dedicated to helping Americans
        understand more about their money — how to save it, invest it, and
        manage it to meet their personal goals.
      </>
    ),
  },
  {
    img: protectionIcon,
    heading: "Consumer Protection",
    link: "https://www.usa.gov/",
    content: (
      <>
        Your everyday guide to help you prevent identity theft, understand
        credit and be a smarter shopper. This information is available at
        USA.gov which you can access by clicking the link below.
      </>
    ),
  },
  {
    img: loanIcon,
    heading: "Debt Assistance",
    link: null,
    content: (
      <>
        If you are struggling with debt, reach out for help. You can contact an
        NFCC member organization through{" "}
        <a
          href="https://www.nfcc.org"
          target="_blank"
          rel="noreferrer"
          className="link"
        >
          www.nfcc.org
        </a>{" "}
        or by calling{" "}
        <a href="tel:1-800-388-2227" className="link">
          1-800-388-2227
        </a>
        .
      </>
    ),
  },
  {
    img: ratingIcon,
    heading: "5 Tips: Improving your credit score",
    link: "https://www.federalreserve.gov/pubs/creditscore/creditscoretips_2.pdf?hsCtaTracking=50eb8b4c-7195-46ed-bab2-f27e587b355b%7C91903346-442e-45cb-b40d-586430c72003",
    content: <>Board of Governors of the Federal Reserve System.</>,
  },
  {
    img: documentIcon,
    heading: "Free Credit Report",
    link: "https://www.annualcreditreport.com/index.action",
    content: <>This is the official site to obtain a free credit report.</>,
  },
];

const Section = () => {
  return (
    <Wrapper>
      <Container>
        <ul className="resources-section-list">
          {config.map(({ img, heading, link, content }) => {
            return (
              <li className="resources-section-list-item" key={heading}>
                <div>
                  <img src={img} alt={heading} />
                </div>
                <div className="resources-section-list-item-content">
                  <H5>{heading}</H5>
                  <p>{content}</p>
                  {link ? (
                    <div className="button-wrapper">
                      <ButtonALink
                        href={link}
                        target="_blank"
                        className="button-inverted"
                        rel="noreferrer"
                      >
                        Learn more
                      </ButtonALink>
                    </div>
                  ) : (
                    ""
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </Container>
    </Wrapper>
  );
};

export default Section;
