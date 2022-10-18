import React from "react";
import { v4 as uuidv4 } from "uuid";
import Wrapper from "../../../atoms/Table/Details-horizontal";
import {
  formatDate,
  formatCurrency,
  parsePaymentStatus,
} from "../../../../utils/formats";

const Table = ({ rows = [] }) => {
  return (
    <Wrapper>
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Unpaid Principal Balance</th>
            <th>Principal</th>
            <th>Interest</th>
            <th>Fees</th>
            <th>Amount</th>
            <th>Schedule Date</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(
            (
              {
                startPrincipal,
                principal,
                status,
                interest,
                fees,
                amount,
                date,
              },
              index
            ) => {
              return (
                <tr key={uuidv4()}>
                  <td>{index + 1}</td>
                  <td>{formatCurrency(startPrincipal.toFixed(2))}</td>
                  <td>{formatCurrency(principal.toFixed(2))}</td>
                  <td>{formatCurrency(interest.toFixed(2))}</td>
                  <td>{formatCurrency(fees.toFixed(2))}</td>
                  <td>{formatCurrency(amount.toFixed(2))}</td>
                  <td>{formatDate(date)}</td>
                  <td>{parsePaymentStatus(status)}</td>
                </tr>
              );
            }
          )}
        </tbody>
      </table>
    </Wrapper>
  );
};

export default Table;
