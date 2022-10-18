import styled, { css } from "styled-components";

export default styled.button<{
  variant: "primary" | "secondary" | "icon";
}>`
  border-radius: 8px;
  border: 1px solid;
  transition: all 0.3s;
  box-sizing: border-box;
  padding: 12px 26px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  cursor: pointer;
  font-family: Spartan;
  font-size: 14px;
  font-weight: 600;
  column-gap: 12px;

  &:disabled {
    cursor: not-allowed;
  }

  ${(props) =>
    props.variant === "primary" &&
    css`
      border: none;
      background: var(--color-primary);
      color: #fff;

      &:hover {
        background: var(--color-primary-hover);
      }

      &:active {
        background: linear-gradient(
            0deg,
            rgba(0, 0, 0, 0.2),
            rgba(0, 0, 0, 0.2)
          ),
          #1e84be;
      }

      &:disabled {
        background: #b5dcf2;
      }
    `}

  ${(props) =>
    props.variant === "secondary" &&
    css`
      border-color: var(--color-primary);
      background: #fff;
      color: var(--color-primary);
      &:active {
        background: rgba(0, 0, 0, 0.05);
      }
    `}
`;
