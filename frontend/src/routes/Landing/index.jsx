import React from "react";
import styled from "styled-components";
import Router from "./Router";

const StyleWrapper = styled.div`
  & ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  h3 {
    color: var(--color-main-2);
  }

  hr {
    border: 0;
    margin: 0;
    border-top: 1px solid var(--color-secondary-2);
  }

  p {
    font-size: 1.4rem;
    line-height: 1.8rem;
  }
`;

// LANDING PAGE
const Landing = () => {
  return (
    <StyleWrapper>
      <Router />
    </StyleWrapper>
  );
};

export default Landing;
