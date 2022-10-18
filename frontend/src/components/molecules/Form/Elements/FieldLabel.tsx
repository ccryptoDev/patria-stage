import React from "react";
import styled from "styled-components";

const Wrapper = styled.label`
  color: #28293d;
  margin: 2px 0 0.8rem;
  font-size: 1.4rem;
  display: inline-block;
`;

type IProps = {
  label: string;
  htmlFor?: string;
};

const Component = ({ label = "", htmlFor }: IProps) => {
  return (
    <Wrapper className="field-label" htmlFor={htmlFor}>
      {label}
    </Wrapper>
  );
};

export default Component;
