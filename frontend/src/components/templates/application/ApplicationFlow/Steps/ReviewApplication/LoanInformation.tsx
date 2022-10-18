import React, { useState, useEffect } from "react";
import styled from "styled-components";
import Header from "./Header";
import { formatCurrency } from "../../../../../../utils/formats";

const Wrapper = styled.div`
  & > .heading-wrapper {
    display: flex;
    align-items: center;
    & .heading {
      font-size: 24px;
      line-height: 27px;
      color: #58595b;
      font-weight: 700;
    }
  }

  .details {
    display: flex;
    column-gap: 24px;
    padding: 24px;
    background: #fbfbff;
    margin: 24px 0;
    &-amount {
      & h4 {
        color: #222222;
        font-size: 20px;
        line-height: 22px;
        font-weight: 700;
      }

      &-label {
        font-size: 12px;
        line-height: 14px;
        font-weight: bold;
        color: #222222;
        text-align: center;
      }
    }
    &-item {
      &-name,
      &-value {
        &,
        & span {
          color: #222222;
          font-weight: bold;
          font-size: 14px;
          line-height: 16px;
        }
      }

      &-name {
        font-weight: bold;
        margin-bottom: 4px;
      }
    }
  }
`;

const LoanInformation = ({
  goToStep,
  data,
  isActive,
}: {
  goToStep: any;
  data: any;
  isActive: boolean;
}) => {
  const [offer, setOffer] = useState({
    regularPayment: "",
    financedAmount: "",
    term: "",
    apr: "",
  });

  useEffect(() => {
    if (data && isActive) setOffer(data);
  }, [data, isActive]);

  return (
    <Wrapper>
      <Header
        onEdit={() => goToStep(3, true)}
        edit={false}
        heading="Loan Information"
      />
      <div className="details">
        <div className="details-amount">
          <h4>${parseFloat(offer?.regularPayment).toFixed(2)}</h4>
          <div className="details-amount-label">per week</div>
        </div>
        <div className="details-item">
          <div className="details-item-name">Loan Offer:</div>
          <div className="details-item-value">
            {formatCurrency(offer?.financedAmount)}
          </div>
        </div>
        <div className="details-item">
          <div className="details-item-name">Term:</div>
          <div className="details-item-value">
            {Math.floor(Number(offer?.term) * 4.348)} payments
          </div>
        </div>
        <div className="details-item">
          <div className="details-item-name">APR:</div>
          <div className="details-item-value">{offer?.apr}%</div>
        </div>
      </div>
    </Wrapper>
  );
};

export default LoanInformation;
