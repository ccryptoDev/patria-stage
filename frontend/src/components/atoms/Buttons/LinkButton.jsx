import { Link } from "react-router-dom";
import styled from "styled-components";

const Button = styled(Link)`
  font-size: 14px;
  font-weight: 600;
  padding: 14px 26px;
  background: var(--color-blue-dark);
  border-radius: 8px;
  text-decoration: none;
  color: #fff;
  text-align: center;
  display: flex;
  column-gap: 12px;
  &.button-outlined {
    background: transparent;
    border: 1px solid #fff;
  }
  &.button-inverted {
    background: #fff;
    color: var(--color-blue-1);
  }
`;

export const ButtonALink = styled(Button).attrs({ as: "a" })``;

export default Button;
