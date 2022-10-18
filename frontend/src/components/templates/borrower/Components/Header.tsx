import React from "react";
import styled from "styled-components";
import { H5 as Heading } from "../../../atoms/Typography";

const Wrapper = styled.div`
  background: #f9f9f9;
  padding: 16px;
  border-bottom: 1px solid var(--color-border);

  .form-header-heading {
    margin: 0;
  }
`;

const Header = ({ children }: { children: string }) => {
  return (
    <Wrapper className="form-header">
      <Heading className="form-header-heading">{children}</Heading>
    </Wrapper>
  );
};

export default Header;
