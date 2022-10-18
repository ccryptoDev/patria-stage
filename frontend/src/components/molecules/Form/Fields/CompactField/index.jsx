import React from "react";
import styled from "styled-components";

const Input = styled.input`
  background: transparent;
  border: none;
  cursor: auto;
  width: 100%;
`;
const Field = ({ value }) => {
  return <Input type="text" value={value} disabled />;
};

export default Field;
