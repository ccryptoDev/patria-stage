import React from "react";
import styled from "styled-components";
import { TableWrapper } from "../components/styles";
import { formatCurrency, formatDate } from "../../../../../../../utils/formats";

const Wrapper = styled.section`
  border-bottom: 1px solid var(--color-grey-light);
  h4 {
    margin: 0;
    font-weight: bold;
    line-height: 1.5;
    text-transform: upperCase;
  }

  .payment-schedule-table {
    min-width: 600px;

    & th {
      text-align: center;
    }
  }

  .notes-wrapper {
    margin: 24px 0;
    display: flex;
    column-gap: 40px;
    & .note-col {
      width: 50%;
    }
    & p {
      &:not(:last-child) {
        margin-bottom: 10px;
      }
      &:first-child {
        margin-bottom: 24px;
      }
      &:not(:first-child) {
        max-width: 700px;
      }
      & span {
        font-weight: 600;
        color: #222222;
      }
    }
  }
`;

const PaymentItem = styled.tr`
  td:first-child {
    width: 200px;
  }

  td:nth-child(2) {
    width: 30%;
  }
`;

const Itemization = ({ paymentData = {} }) => {
  const payLength = paymentData?.paymentSchedule?.length - 1;

  if (!paymentData?.paymentSchedule?.length) return null;
  return (
    <Wrapper>
      <h3>Your Payment Schedule will be:</h3>
      <TableWrapper className="schedule-table">
        <table className="payment-schedule-table">
          <thead>
            <tr>
              <th>
                <b>Number of Payments</b>
              </th>
              <th>
                <b>Amount of Payments</b>
              </th>
              <th>
                <b>When Payments Are Due</b>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{1 || "N/A"}</td>
              <td>
                {formatCurrency(paymentData?.paymentSchedule[0]?.amount) ||
                  "N/A"}
              </td>
              <td>
                {formatDate(paymentData?.paymentSchedule[0]?.date) || "N/A"}
              </td>
            </tr>
            <tr>
              <td>{payLength || "N/A"}</td>
              <td>
                {formatCurrency(
                  paymentData?.paymentSchedule[payLength]?.amount
                ) || "N/A"}
              </td>
              <td>
                {paymentData?.paymentSchedule[1]?.date
                  ? `weekly starting on ${formatDate(
                      paymentData?.paymentSchedule[1]?.date
                    )}`
                  : "N/A"}
              </td>
            </tr>
          </tbody>
        </table>
      </TableWrapper>
      <div className="notes-wrapper">
        <div className="note-col">
          <p>
            <span>Prepayment: </span>
            If you pay the Loan off early, you will not have to pay a penalty.
          </p>
          <p>
            <span>Fixed Interest Rate: </span>
            This is a Fixed Interest Rate transaction. Your Fixed Interest Rate
            is {paymentData?.apr}% Your Fixed Interest Rate will not change over
            the term of the Loan.
          </p>
        </div>
        <div className="note-col">
          <p>
            <span> Estimates: </span>
            All numerical calculations are estimates.See your Loan agreement for
            any additional information about nonpayment, default, any required
            payment in full before the scheduled date and prepayment refunds and
            penalties.
          </p>
        </div>
      </div>
    </Wrapper>
  );
};

export default Itemization;
