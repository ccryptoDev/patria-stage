import React from "react";
import Wrapper from "../../atoms/Table/Details-horizontal";

type ITableHorizontal = {
  children: any;
  thead: any[];
};

const Table = ({ children, thead = [] }: ITableHorizontal) => {
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
        <tbody>{children}</tbody>
      </table>
    </Wrapper>
  );
};

export default Table;
