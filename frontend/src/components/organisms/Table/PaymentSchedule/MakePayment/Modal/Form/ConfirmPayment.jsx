import React from "react";
import styled from "styled-components";
import { v4 as uuidv4 } from "uuid";
import { formatCurrency, formatDate } from "../../../../../../../utils/formats";
import Buttons from "../../../../../../molecules/Buttons/SubmitForm";
import Button from "../../../../../../atoms/Buttons/Button";

const tHead = ["Date", "Balance", "Payment", "Fees", "Interest", "Principal"];

const Wrapper = styled.div`
  table {
    max-height: 20rem;
    overflow: scroll;
    display: block;
    padding: 0;
    border: none;
  }

  table,
  td,
  th {
    border-collapse: collapse;
    border: 1px solid;
    padding: 1rem;
    text-align: center;
  }

  th {
    background: var(--light-02);
  }

  td:first-child {
    font-weight: bold;
  }

  tr:first-child td {
    background: lightcyan;
  }

  h3 {
    font-size: 2.4rem;
    font-weight: 500;
    margin-bottom: 1rem;
    text-align: center;
  }

  .subheading {
    text-align: center;
    margin-bottom: 1rem;
    font-size: 1.6rem;
  }
`;

const Row = ({
  item: { date, amount, payment, principal, fees, interest },
}) => {
  return (
    <tr>
      <td>{formatDate(date)}</td>
      <td>{formatCurrency(amount)}</td>
      <td>{formatCurrency(payment)} </td>
      <td>{formatCurrency(fees)} </td>
      <td>{formatCurrency(interest)} </td>
      <td>{formatCurrency(principal)} </td>
    </tr>
  );
};

const ConfirmPayment = ({ setPage, paymentSchedule = [] }) => {
  return (
    <Wrapper>
      <h3>Confirm Payment</h3>
      <div className="subheading">preview of remaining payment schedule</div>
      <table>
        <thead>
          <tr>
            {tHead.map((item) => (
              <th key={item}>{item}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {paymentSchedule.map((row) => (
            <Row item={row} key={uuidv4()} />
          ))}
        </tbody>
      </table>
      <Buttons color="#034376">
        <Button onClick={() => setPage(0)} variant="secondary" type="button">
          Back
        </Button>
        <Button type="submit" variant="primary">
          Submit
        </Button>
      </Buttons>
    </Wrapper>
  );
};

export default ConfirmPayment;
