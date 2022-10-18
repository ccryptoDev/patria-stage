import React from "react";
import styled from "styled-components";
import Container from "../../../atoms/Container";
import moneyIcon from "../../../../assets/landing/payments/money.png";
import cardIcon from "../../../../assets/landing/payments/card.png";
import bankIcon from "../../../../assets/landing/payments/bank.png";
import dialogIcon from "../../../../assets/landing/payments/dialog.png";
import dollarIcon from "../../../../assets/landing/payments/dollar.png";
import Card from "../../../atoms/Cards/ContactCard";
import { H3, H4 } from "../../../atoms/Typography";
import Note from "../../../molecules/Note";

const Wrapper = styled.section`
  padding: 6rem 0;

  .notification {
    grid-column: 1/-1;
  }

  .loans-section {
    &-payments {
      padding: 6rem 0;

      &-layout {
        display: grid;
        grid-template-columns: 1fr 1fr;
        grid-gap: 4.8rem;
      }

      &-header {
        grid-column: 1/-1;
      }

      &-card {
        &-header h4 {
          color: var(--color-blue-1);
        }
        &-content {
          display: flex;
          align-items: center;
          width: 100%;
          justify-content: space-around;

          & li {
            display: flex;
            flex-direction: column;
            align-items: center;
            row-gap: 16px;
            font-weight: 600;

            & img {
              display: block;
            }
          }
          font-size: 1.4rem;
        }
      }

      &-header {
        & h3,
        &-subheading {
          text-align: center;
        }

        & h3 {
          color: var(--color-main-2);
        }
        &-subheading {
          color: var(--color-main-1);
          font-size: 1.8rem;
          font-weight: 600;
          line-height: 2;
        }
      }
    }
  }

  @media screen and (max-width: 767px) {
    padding: 3.6rem 0;
    .loans-section-payments-layout {
      grid-template-columns: 1fr;
      grid-gap: 20px;
    }

    .loans-section-payments-card-content {
      flex-wrap: wrap;
      gap: 1rem;
    }
  }
`;

const electronicPayments = [
  {
    img: cardIcon,
    text: "Debit Card",
  },
  {
    img: bankIcon,
    text: "ACH",
  },
];

const manualPayments = [
  {
    img: dollarIcon,
    text: "Personal Check",
  },
  {
    img: dialogIcon,
    text: "Cashier’s Check",
  },
  {
    img: moneyIcon,
    text: "Money Order",
  },
];

const notes = [
  <>
    ACH payments will be deducted from your account on your scheduled payment
    date according to your loan agreement terms. Any debits to your account for
    repayment that falls on a Saturday, Sunday, or banking holiday will be
    debited on the next business day.
  </>,
  <>
    {" "}
    Personal Checks, Cashier’s Check and Money Order payments must be received
    on or before your scheduled payment date by mailing to
    <b> Patria Lending, PO Box 668, Weatherford, OK 73096</b>.
  </>,
  <>
    You may change your payment method at any time prior to your due date by
    emailing Customer Service at{" "}
    <a href="mailto:CustomerCare@PatriaLending.com" className="link underline">
      CustomerCare@PatriaLending.com.
    </a>{" "}
    However, we require a minimum of five (5) business days’ notice to ensure
    your change is applied to the upcoming scheduled payment, otherwise your
    change may not take effect until the subsequent scheduled payment due date.
    Any late or non-payments may be subject to additional fees and/or collection
    activity.
  </>,
  <>
    This is a term installment loan with approximate, equal payments, but you
    have the right to prepay at any time. There are no pre-payment penalties,
    and we strongly encourage customers to pay back their loan as soon as
    possible to reduce the amount of finance charges.
  </>,
];

const Section = () => {
  return (
    <Wrapper>
      <Container className="loans-section-payments-layout">
        <div className="loans-section-payments-header">
          <H3>Installment Loan Re-Payment</H3>
          <div className="loans-section-payments-header-subheading">
            Payment Methods:
          </div>
        </div>

        <Card className="card">
          <div className="loans-section-payments-card-header">
            <H4>Automated Electronic Payments:</H4>
          </div>
          <ul className="loans-section-payments-card-content">
            {electronicPayments.map(({ img, text }) => {
              return (
                <li key={text}>
                  <div>
                    <img src={img} alt="card" />
                  </div>
                  {text}
                </li>
              );
            })}
          </ul>
        </Card>

        <Card className="card">
          <div className="loans-section-payments-card-header">
            <H4>Manual Payments:</H4>
          </div>
          <ul className="loans-section-payments-card-content">
            {manualPayments.map(({ img, text }) => {
              return (
                <li key={text}>
                  <div>
                    <img src={img} alt="card" />
                  </div>
                  {text}
                </li>
              );
            })}
          </ul>
        </Card>

        <Note content={notes} />
      </Container>
    </Wrapper>
  );
};

export default Section;
