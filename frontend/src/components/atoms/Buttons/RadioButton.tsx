import styled from "styled-components";

const RadioButton = styled.div`
  background: transparent;
  border: 1px solid var(--color-primary);
  border-radius: 50%;
  position: relative;
  width: 16px;
  height: 16px;
  &:before {
    content: "";
    background: transparent;
    width: 100%;
    height: 100%;
    position: absolute;
    border-radius: 50%;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    height: 10px;
    width: 10px;
  }
  &.active {
    &:before {
      background: var(--color-primary);
    }
  }
`;
export default RadioButton;
