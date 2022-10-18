import React from "react";
import styled from "styled-components";
import Table from "../../../components/molecules/Table/Details-horizontal";

const Wrapper = styled.div`
  width: 60rem;
  button {
    min-width: 12rem;
  }
  .value {
    padding: 0.9rem 3.1rem 0.9rem 2.1rem;
  }
`;

export default {
  title: "Example/Tables/Horizontal",
  component: Table,
};

const rows = [
  { firstName: "first name", lastName: "Temeka", age: 20, id: "1" },
  { firstName: "first name", lastName: "Temeka", age: 20, id: "2" },
  { firstName: "first name", lastName: "Temeka", age: 20, id: "3" },
  { firstName: "first name", lastName: "Temeka", age: 20, id: "4" },
];

const thead = ["first name", "last name", "age"];

export const TableVerticalEbl = () => {
  return (
    <Wrapper>
      <Table thead={thead}>
        {rows.map(({ firstName, lastName, age, id }) => {
          return (
            <tr key={id}>
              <td>{firstName}</td>
              <td>{lastName}</td>
              <td>{age}</td>
            </tr>
          );
        })}
      </Table>
    </Wrapper>
  );
};
