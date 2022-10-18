import styled from "styled-components";

const Card = styled.li`
  width: 100%;
  padding: 2.4rem;
  border-radius: 1.4rem;
  background: var(--color-card-bg);
  display: flex;
  flex-direction: column;
  row-gap: 5.6rem;
  align-items: center;
  text-align: center;
  box-sizing: border-box;

  & .card-content {
    img {
      width: 100%;
      display: block;
    }
  }
  & .card-header {
    display: flex;
    flex-direction: column;
    align-items: center;
    row-gap: 17px;

    & img {
      height: 3rem;
    }

    & h5 {
      color: var(--color-blue-1);
      font-size: 1.4rem;
    }
  }
`;

export default Card;
