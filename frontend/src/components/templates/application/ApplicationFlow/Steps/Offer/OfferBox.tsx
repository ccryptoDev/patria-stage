import React from "react";
import styled from "styled-components";
import { H2 as Heading } from "../../../../../atoms/Typography";
import { formatCurrency } from "../../../../../../utils/formats";
import Button from "../../../../../atoms/Buttons/Button";

const Wrapper = styled.div`
  border: 1px solid var(--color-border);
  padding: 24px;
  border-radius: 8px;
  .header {
    text-align: center;
    .offer-top-label {
      display: inline-block;
      border-radius: 20px;
      padding: 12px;
      color: #58595b;
      text-align: center;
      background: #f9f9f9;
      font-size: 14px;
      font-weight: 600;
    }
    .offer-heading {
      margin: 24px 0 0;
    }

    .offer-heading-label {
      color: #b7b7b7;
      font-size: 12px;
      line-height: 14px;
    }
  }

  .offer-details {
    margin: 24px 0;

    &-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      &:not(:last-child) {
        margin-bottom: 12px;
      }
    }

    &-name,
    &-value,
    & span {
      font-size: 12px;
      line-height: 14px;
      color: #b7b7b7;
      font-weight: 700;
    }
  }

  button {
    width: 100%;
  }
`;

export type IOfferProps = {
  apr: number;
  regularPayment: number;
  financedAmount: number;
  term: number;
  onClick: any;
};

const Offer = ({
  onClick,
  apr,
  financedAmount,
  regularPayment,
  term,
}: IOfferProps) => {
  return (
    <Wrapper>
      <div className="header">
        <div className="offer-top-label">Estimated Payment</div>
        <Heading className="offer-heading">
          {formatCurrency(regularPayment)}
        </Heading>
        <div className="offer-heading-label">per week</div>
      </div>
      <div className="offer-details">
        <div className="offer-details-row">
          <div className="offer-details-name">Loan Offer:</div>
          <div className="offer-details-value">
            {formatCurrency(financedAmount)}
          </div>
        </div>
        <div className="offer-details-row">
          <div className="offer-details-name">Term:</div>
          <div className="offer-details-value">
            {Math.floor(Number(term) * 4.348)} weeks
          </div>
        </div>
        <div className="offer-details-row">
          <div className="offer-details-name">APR:</div>
          <div className="offer-details-value">{apr}%</div>
        </div>
      </div>
      <Button type="button" onClick={onClick} variant="primary">
        Select Offer
      </Button>
    </Wrapper>
  );
};

export default Offer;
