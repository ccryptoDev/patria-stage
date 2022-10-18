import React, { useEffect } from "react";
import styled from "styled-components";

const Wrapper = styled.div``;

const Counter = ({ count, setCount }) => {
  useEffect(() => {
    const interval = setInterval(() => {
      setCount((prevState) => prevState - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return <Wrapper>Resend in {count} seconds</Wrapper>;
};

export default Counter;
