import styled from "styled-components";

export default styled.div`
  display: block;
  border: none;
  border-radius: 0.8rem;
  cursor: pointer;
  outline: none;
  transition: all 0.4s;
  padding: ${(props) => props.padding || "0.7rem"};
  border: 1px solid transparent;
  background: #0f8be1;
  color: #fff;

  &:hover {
    box-shadow: 3px 3px 5px 0 rgb(0 47 94 / 11%);
    transition: all 0.1s;
  }

  &:active {
    transform: scale(0.98);
    box-shadow: none;
  }
`;
