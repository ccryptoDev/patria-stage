import React from "react";
import Wrapper from "../../atoms/Table/Details-vertical";

type IDetailsTableProps = {
  rows: any[];
  children: any;
};

const Table = ({ rows = [], children }: IDetailsTableProps) => {
  if (typeof children !== "function")
    throw new Error("Pager child must be a function");
  return (
    <Wrapper>
      <table>
        <tbody>
          {rows.length > 0
            ? rows.map((item) => {
                return (
                  <tr key={item.label}>
                    <th>
                      <div className="label">{item.label}</div>
                    </th>
                    <td>{children({ item })}</td>
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
