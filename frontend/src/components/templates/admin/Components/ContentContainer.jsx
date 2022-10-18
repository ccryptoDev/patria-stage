import styled from "styled-components";

const Container = styled.div`
  padding: 0 24px 24px;
  transform: translateY(-24px);

  @media screen and (max-width: 767px) {
    padding: 0 16px 16px;
  }
`;

export default Container;
