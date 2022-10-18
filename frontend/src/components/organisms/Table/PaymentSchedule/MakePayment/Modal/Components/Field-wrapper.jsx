import React from "react";
import styled from "styled-components";

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: 1.4rem;
  width: 100%;

  input {
    width: 100%;
  }

  .label {
    margin-bottom: 5px;
  }

  & input,
  select {
    border: 1px solid #ced4da;
    padding: 6px 1.2rem;
    border-radius: 5px;
  }
`;

const FieldWrapper = ({ children, label }) => {
  return (
    <Wrapper className="field-wrapper">
      <span className="label">{label}</span>
      {children}
    </Wrapper>
  );
};

export default FieldWrapper;
