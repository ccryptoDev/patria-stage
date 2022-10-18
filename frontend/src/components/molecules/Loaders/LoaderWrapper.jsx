import React from "react";
import styled from "styled-components";
import Loader from "./Circle";

const Wrapper = styled.div`
  position: relative;
  width: 100%;
`;

const Content = styled.div``;

const PageLoader = ({
  children,
  size = "7",
  position = "center",
  loading,
  type = "opacity",
}) => {
  return (
    <Wrapper>
      {loading && <Loader size={size} position={position} />}
      <Content
        style={{
          opacity: loading && type === "opacity" ? 0.2 : 1,
          visibility: loading && type === "hide" ? "hidden" : "visible",
          display: loading && type === "hide" ? "hidden" : "visible",
        }}
      >
        {children}
      </Content>
    </Wrapper>
  );
};
export default PageLoader;
