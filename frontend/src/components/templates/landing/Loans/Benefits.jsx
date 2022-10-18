import React from "react";
import styled from "styled-components";
import Container from "../../../atoms/Container";
import fastIcon from "../../../../assets/landing/benefits/fast.png";
import easyIcon from "../../../../assets/landing/benefits/easy.png";
import safeIcon from "../../../../assets/landing/benefits/safe.png";
import { H3 } from "../../../atoms/Typography";

const Wrapper = styled.section`
  padding: 6rem 0;
  position: relative;
  .loans-section {
    &-benefits {
      position: relative;
      &-wrapper {
        display: flex;
      }
      &-left-bg {
        background: var(--color-bg-2);
        position: absolute;
        width: 50%;
        top: 0;
        bottom: 0;
        z-index: -1;
      }
      &-conditions {
        width: 50%;
        padding-right: 6rem;
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        row-gap: 4.8rem;
        &-item {
          display: flex;
          column-gap: 2.4rem;
          font-weight: 600;
          font-size: 1.8rem;
          align-items: start;

          &-heading {
            padding: 10px 0;
            line-height: 1.5;
            font-size: 1.8rem;
            text-transform: uppercase;
            font-weight: 600;
            color: var(--color-main-2);
          }

          &-content {
            display: flex;
            flex-direction: column;
            row-gap: 2.4rem;

            & p {
              color: var(--color-main-1);
              font-weight: 600;
            }
          }

          &-icon {
            display: flex;
            align-items: center;
            justify-content: center;
            background: var(--color-secondary-2);
            border-radius: 8px;
            padding: 11px;
          }
        }
      }

      &-save {
        padding-left: 6rem;

        & h3 {
          font-size: 2.4rem;
          color: var(--color-main-2);
          margin-top: 10px;
        }

        &-item {
          display: flex;
          align-items: center;
          column-gap: 2.4rem;
          padding: 4.8rem 0;

          & p {
            font-size: 14px;
          }

          &:not(:first-child) {
            border-top: 1px solid var(--color-secondary-2);
          }

          &-icon {
            width: 44px;
            height: 44px;
            display: flex;
            align-items: center;
            justify-content: center;
            box-sizing: border-box;
            border: 1px solid var(--color-secondary-2);
            border-radius: 8px;
            color: var(--color-secondary-1);
            font-weight: 700;
            font-size: 2rem;
            line-height: 2.2rem;
          }
        }
      }
    }
  }

  @media screen and (max-width: 767px) {
    padding: 0;
    .loans-section-benefits-save,
    .loans-section-benefits-conditions {
      padding: 2rem 0;
      width: auto;
    }

    .loans-section-benefits-left-bg {
      height: auto;
      width: 100%;
    }

    .loans-section-benefits-wrapper {
      flex-direction: column;
    }
  }

  @media screen and (max-width: 500px) {
    .loans-section-benefits-save,
    .loans-section-benefits-conditions {
      padding: 10px 0;
      row-gap: 0;
      & li {
        padding: 2rem 0;
      }
    }
  }
`;

const reasons = [
  {
    img: fastIcon,
    title: "Fast",
    text: "Loans can be funded by direct deposit to your debit card in minutes or via ACH the same/next business day.",
  },
  {
    img: easyIcon,
    title: "Easy",
    text: "Get the funds you need in the comfort of your home, online, and with your choice of customer service channel.",
  },
  {
    img: safeIcon,
    title: "Safe",
    text: "Your privacy is assured by our proven, secure underwriting and funding process.",
  },
];

const steps = [
  { content: "Borrow only the minimum amount needed." },
  { content: "Make extra payments toward your principal." },
  { content: "Pay off the entire balance early." },
];

const Section = () => {
  return (
    <Wrapper>
      <div className="loans-section-benefits-left-bg" />
      <Container>
        <div className="container loans-section-benefits-wrapper">
          <ul className="loans-section-benefits-conditions">
            {reasons.map(({ img, title, text }) => {
              return (
                <li
                  className="loans-section-benefits-conditions-item"
                  key={title}
                >
                  <div className="loans-section-benefits-conditions-item-icon">
                    <img src={img} alt={title} />
                  </div>

                  <div className="loans-section-benefits-conditions-item-content">
                    <div className="loans-section-benefits-conditions-item-heading">
                      {title}
                    </div>
                    <p>{text}</p>
                  </div>
                </li>
              );
            })}
          </ul>
          <div className="loans-section-benefits-save">
            <H3>How to save money on your loan</H3>
            <ul>
              {steps.map((item, index) => {
                return (
                  <li
                    className="loans-section-benefits-save-item"
                    key={item.content}
                  >
                    <div className="loans-section-benefits-save-item-icon">
                      {index + 1}
                    </div>
                    <p>{item.content}</p>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </Container>
    </Wrapper>
  );
};

export default Section;
