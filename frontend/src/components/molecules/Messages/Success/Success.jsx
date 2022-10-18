import React from "react";
import styled from "styled-components";

const Wrapper = styled.div``;

function SuccessMessage({ message }) {
  return <Wrapper>{message}</Wrapper>;
}

export default SuccessMessage;
