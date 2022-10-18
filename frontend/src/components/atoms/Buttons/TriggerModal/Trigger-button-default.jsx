import styled from "styled-components";

export default styled.div`
  background: #034376;
  color: #fff;
  border-radius: 2rem;
  border: 1px solid #034376;
  padding: 1rem;
  transition: all 0.1s;
  font-size: 1.6rem;
  min-width: 15rem;

  &:hover {
    box-shadow: 0px 2px 4px -1px rgb(0 0 0 / 20%),
      0px 4px 5px 0px rgb(0 0 0 / 14%), 0px 1px 1rem 0px rgb(0 0 0 / 12%);
  }

  &:active {
    transform: scale(0.98);
    box-shadow: none;
  }
`;
