import React from "react";
import styled from "styled-components";

const Wrapper = styled.div`
  color: red;
  font-size: 1.2rem;
`;

const Component = ({ message }: { message: string }) => {
  return <>{message ? <Wrapper className="error">{message}</Wrapper> : ""}</>;
};

export default Component;
