import React from "react";
import styled from "styled-components";
import Button from "../../components/atoms/Buttons/Button";

const Wrapper = styled.div`
  padding: 50px;
  .flex {
    display: flex;
    justify-content: space-between;
  }
  .buttons {
    width: 200px;
    margin: 24px;
  }
`;

const StyleSheet = () => {
  return (
    <Wrapper>
      <div className="buttons flex">
        <Button type="button" variant="primary">
          Button
        </Button>
        <Button type="button" variant="primary" disabled>
          Button
        </Button>
      </div>
      <div className="buttons flex">
        <Button type="button" variant="secondary">
          Button
        </Button>
        <Button type="button" variant="secondary" disabled>
          Button
        </Button>
      </div>
    </Wrapper>
  );
};

export default StyleSheet;
