import React from "react";
import styled from "styled-components";
import Icon from "../../../atoms/Icons/SvgIcons/Error-solid";

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 80%;
  padding: 2rem 0 1rem;
  margin: 0 auto;

  .message {
    color: red;
    margin-left: 1rem;
  }
`;

const ErrorMessage = ({ message = "" }: { message: string | undefined }) => {
  return (
    <>
      {message ? (
        <Wrapper className="errorMessage">
          <Icon />
          <span className="message">{message}</span>
        </Wrapper>
      ) : (
        ""
      )}
    </>
  );
};

export default ErrorMessage;
