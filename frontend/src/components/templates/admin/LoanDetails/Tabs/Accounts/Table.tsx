import React from "react";
import Wrapper from "../../../../../atoms/Table/Details-horizontal";

type IBankAccountsTable = {
  thead: string[];
  rows: {
    name: string;
    accountNumber: number;
    routingNumber: number;
  }[];
};

const Table = ({ rows = [], thead }: IBankAccountsTable) => {
  return (
    <Wrapper>
      <table>
        <thead>
          <tr>
            {thead.map((item) => (
              <th key={item}>{item}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length > 0
            ? rows.map(({ name, accountNumber, routingNumber }) => {
                return (
                  <tr key={accountNumber}>
                    <td>
                      <div>{name}</div>
                    </td>
                    <td>{accountNumber}</td>
                    <td>XXXX - XX - {routingNumber}</td>
                  </tr>
                );
              })
            : ""}
        </tbody>
      </table>
    </Wrapper>
  );
};

export default Table;
