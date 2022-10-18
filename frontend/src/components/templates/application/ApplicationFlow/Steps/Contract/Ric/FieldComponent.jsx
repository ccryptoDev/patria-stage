import React from "react";
import styled from "styled-components";

const Wrapper = styled.div`
  padding: 20px;
  display: flex;
  align-items: end;
  column-gap: 10px;
  width: 100%;
  box-sizing: border-box;

  & div {
    display: inline-block;
  }
  & .label {
    white-space: nowrap;
  }
  & .value {
    border-bottom: 1px solid;
    width: 100%;
    padding: 0 5px;
  }

  @media screen and (max-width: 767px) {
    width: 100%;
    display: block;

    & img {
      bottom: 0;
      width: 100%;
    }
  }

  @media screen and (max-width: 500px) {
    & .label {
      white-space: initial;
    }
  }

  @media print {
    & .label {
      white-space: initial;
    }
  }
`;

const Field = ({ label, value }) => {
  return (
    <Wrapper className="field">
      <div className="label">{label}</div>
      <div className="value">{value}</div>
    </Wrapper>
  );
};

export default Field;
