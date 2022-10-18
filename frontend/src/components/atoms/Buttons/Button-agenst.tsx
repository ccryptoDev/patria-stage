import styled, { css } from "styled-components";

export default styled.button<{
  variant?: "primary" | "secondary" | "lightgrey" | "grey";
  margin?: string;
  width?: string;
  height?: string;
  padding?: string;
  transparent?: boolean;
  transparentBlueTxt?: boolean;
  hoverDark?: boolean;
  hoverPrimary?: boolean;
  fontsize?: string;
  boxshadow?: string;
}>`
  display: block;
  border: none;
  border-radius: 0.8rem;
  cursor: pointer;
  outline: none;
  transition: all 0.4s;
  padding: ${(props) => props.padding || "1rem"};
  border: 1px solid transparent;

  ${(props) =>
    props.variant === "primary" &&
    css`
      background: #0f8be1;
      color: #fff;
    `}
  ${(props) =>
    props.variant === "secondary" &&
    css`
      font-weight: 600;
      background: transparent;
      color: #5a7da1;
      border: 1px solid #cbdae9;
    `}
  ${(props) =>
    props.variant === "grey" &&
    css`
      background: #d4e1e6;
      color: #5a7da1;
    `}

  ${(props) =>
    props.variant === "lightgrey" &&
    css`
      background: #efefef;
      color: #5a7da1;
    `}
    
      ${(props) =>
    props.hoverPrimary &&
    css`
      &:hover {
        background: #0f8be1;
        color: #fff;
      }
    `}
    ${(props) =>
    props.hoverDark &&
    css`
      &:hover {
        background: #d4e1e6;
        color: #1a3855;
        border: 1px solid #d4e1e6;
      }
    `}

  margin: ${(props) => props.margin};
  width: ${(props) => props.width || "100%"};
  height: ${(props) => props.height};
  padding: ${(props) => props.padding || "1rem"};
  font-size: ${(props) => props.fontsize || "1.6rem"};
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &:hover {
    box-shadow: 3px 3px 5px 0 rgb(0 47 94 / 11%);
    transition: all 0.1s;
  }

  &:active {
    transform: scale(0.98);
    box-shadow: none;
  }
`;
