import styled from "styled-components";

export default styled.div`
  border-color: transparent;
  background: transparent;
  border-radius: 50%;
  padding: 3px;
  display: flex;
  align-items: center;

  &:hover {
    background: #fafafc;
    box-shadow: none;
  }

  &:active {
    transform: scale(0.95);
  }
`;
