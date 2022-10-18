import styled from "styled-components";

const Container = styled.div`
  width: 100%;
  max-width: 724px;
  border: 1px solid var(--color-grey-light);
  border-radius: 14px;
  background: #fff;
  padding: 24px;

  @media screen and (max-width: 767px) {
    padding: 12px;
  }
`;

export default Container;
