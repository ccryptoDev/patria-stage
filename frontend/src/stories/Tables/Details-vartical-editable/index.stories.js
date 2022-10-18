import React, { useState } from "react";
import styled from "styled-components";
import Table from "../../../components/molecules/Table/Details-vertiacal-editable";
import { renderFormFields, initialForm } from "./config";
import TableRow from "./Row";

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
  title: "Example/Tables/vertical-editable",
  component: Table,
};

export const TableVerticalEbl = () => {
  const [edit, setEdit] = useState(false);
  const [form, setForm] = useState({ ...initialForm });

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prevState) => ({
      ...prevState,
      [name]: { ...prevState[name], value, message: "" },
    }));
  };

  return (
    <Wrapper>
      <button type="button" onClick={() => setEdit(!edit)}>
        Edit
      </button>
      <Table rows={renderFormFields({ ...form })}>
        {({ item }) => {
          return <TableRow edit={edit} onChange={onChange} {...item} />;
        }}
      </Table>
    </Wrapper>
  );
};
