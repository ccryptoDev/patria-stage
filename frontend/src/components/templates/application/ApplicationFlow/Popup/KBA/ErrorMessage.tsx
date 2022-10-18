import React from "react";
import styled from "styled-components";

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  column-gap: 20px;

  .error-message {
    color: red;
    margin: 5px 0;
    font-size: 12px;
  }
`;

const ErrorMessage = ({ message }: { message: string }) => {
  return (
    <div>
      {message ? (
        <Wrapper>
          <div className="error-message">{message}</div>
        </Wrapper>
      ) : (
        ""
      )}
    </div>
  );
};

export default ErrorMessage;
