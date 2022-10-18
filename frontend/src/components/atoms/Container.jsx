import styled from "styled-components";

const Container = styled.div`
  max-width: 1200px;
  box-sizing: border-box;
  padding: 0 20px;
  margin: 0 auto;
  width: 100%;
  height: 100%;

  @media screen and (max-width: 400px) {
    & {
      padding: 0 6px;
    }
  }
`;

export default Container;
