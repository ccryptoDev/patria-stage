import React from "react";
import styled from "styled-components";
import { TableWrapper } from "../components/styles";
import { formatCurrency } from "../../../../../../../utils/formats";

const Wrapper = styled.div`
  padding: 20px 0;
  display: flex;
  column-gap: 40px;

  & p {
    line-height: 1.5;
    font-size: 14px;
    margin-top: 20px;
  }

  .col {
    width: 50%;
    h3 {
      margin: 0;
      font-weight: bold;
    }

    table {
      & td {
        width: 50%;

        &:last-child {
          text-align: right;
        }
      }
    }
  }

  @media screen and (max-width: 992px) {
    display: block;
    .col {
      width: 100%;
    }
  }
`;

const Itemization = ({ paymentData = {} }) => {
  return (
    <Wrapper className="new-page">
      <div className="col">
        <p>
          <b>Late Charge: </b>
          If a payment is late, you may be charged a $20.00 late fee.
        </p>
        <p>
          <b>Returned Payment Fee: </b>
          If a payment is returned, you may be charged a $20.00 returned payment
          fee.
        </p>
      </div>
      <TableWrapper className="col no-break">
        <h3>ITEMIZATION OF AMOUNT FINANCED</h3>
        <table>
          <tbody>
            <tr>
              <td>
                <b>Amount Given to You Directly</b>
              </td>
              <td>
                <b>{formatCurrency(paymentData?.principalAmount)}</b>
              </td>
            </tr>
            <tr>
              <td>
                <b>Amount paid to other(s) on your behalf:</b>
              </td>
              <td>
                <b>$0</b>
              </td>
            </tr>
            <tr>
              <td>
                <b>Amount Financed</b>
                <br />
                (Total Amount Provided)
              </td>
              <td>{formatCurrency(paymentData?.principalAmount)}</td>
            </tr>
            <tr>
              <td>Prepaid finance charges (Origination Fee)</td>
              <td>+ $0.00</td>
            </tr>
            <tr>
              <td>Total Loan Amount</td>
              <td>
                = <b>{formatCurrency(paymentData?.principalAmount)}</b>
              </td>
            </tr>
          </tbody>
        </table>
      </TableWrapper>
    </Wrapper>
  );
};

export default Itemization;
