import React from "react";
import styled from "styled-components";

const Wrapper = styled.div`
  min-height: calc(100vh - var(--header-height) - var(--footer-height));
  display: flex;

  .iframe-wrapper {
    flex-grow: 1;
  }

  iframe {
    height: 100%;
    width: 100%;
    border: none;
  }
`;

const Component = ({ pdf }) => {
  return (
    <Wrapper>
      <div className="iframe-wrapper">
        <iframe src={pdf} title="pdf" />
      </div>
    </Wrapper>
  );
};

export default Component;
