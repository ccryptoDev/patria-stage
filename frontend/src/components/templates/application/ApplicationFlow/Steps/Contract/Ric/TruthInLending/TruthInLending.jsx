/* eslint-disable react/no-unescaped-entities */
import React from "react";
import styled from "styled-components";
import { formatCurrency } from "../../../../../../../../utils/formats";

const Wrapper = styled.div`
  font-size: 14px;
  margin: 24px 0;

  .table {
    width: 100%;
    border-collapse: inherit;
    border-spacing: 10px;

    & td,
    & th {
      border: none;
      padding: 0;
    }

    & td {
      position: relative;
      width: 25%;
      padding-top: 25%;
    }
  }

  .table-cubes {
    position: absolute;
    top: 20px;
    left: 0;
  }

  .table-cubes-item {
    padding: 10px;
    border: 1px solid #000;
    word-break: break-word;
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: 100%;
    box-sizing: border-box;
    text-align: center;
    font-size: 14px;

    &-content {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      height: 100%;
      position: relative;
    }
    &-heading {
      text-align: left;
      font-weight: 700;
    }

    &-description {
      position: absolute;
      padding-top: 30%;
      text-align: left;
    }

    &-unit {
      text-align: center;
      width: 100%;
    }
  }

  .table {
    & tr td {
      &:nth-child(1) .table-cubes-item,
      &:nth-child(2) .table-cubes-item {
        background: var(--color-border);
        border: 2px solid;
      }
    }
  }
`;

function TruthInLending({ paymentData = {} }) {
  return (
    <Wrapper className="tnl-lg">
      <div className="table-container">
        <table className="table">
          <tbody>
            <tr>
              <td>
                <div className="table-cubes-item">
                  <div className="table-cubes-item-content">
                    <div className="table-cubes-item-heading">
                      ANNUAL PERCENTAGE RATE
                    </div>
                    <div className="table-cubes-item-description">
                      The cost of your credit as a yearly rate.
                    </div>
                    <div className="table-cubes-item-unit">
                      {paymentData?.apr}%
                    </div>
                  </div>
                </div>
              </td>
              <td>
                <div className="table-cubes-item">
                  <div className="table-cubes-item-content">
                    <div className="table-cubes-item-heading">
                      FINANCE CHARGE
                    </div>
                    <div className="table-cubes-item-description">
                      The dollar amount the credit will cost you.
                    </div>
                    <div className="table-cubes-item-unit">
                      {formatCurrency(
                        paymentData?.financialDetails?.financeCharge
                      )}
                    </div>
                  </div>
                </div>
              </td>
              <td>
                <div className="table-cubes-item">
                  <div className="table-cubes-item-content">
                    <div className="table-cubes-item-heading">
                      Amount Financed
                    </div>
                    <div className="table-cubes-item-description">
                      The amount of credit provided to you or on your behalf.
                    </div>
                    <div className="table-cubes-item-unit">
                      {formatCurrency(paymentData?.principalAmount)}
                    </div>
                  </div>
                </div>
              </td>
              <td>
                <div
                  className="table-cubes-item"
                  style={{ borderRight: "1px solid" }}
                >
                  <div className="table-cubes-item-content">
                    <div className="table-cubes-item-heading">
                      Total of Payments
                    </div>
                    <div className="table-cubes-item-description">
                      The amount you will have paid after you have made all
                      payments as scheduled.
                    </div>
                    <div className="table-cubes-item-unit">
                      {formatCurrency(
                        paymentData?.financialDetails?.totalLoanAmount
                      )}
                    </div>
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </Wrapper>
  );
}

export default TruthInLending;
