import React from "react";
import styled from "styled-components";
import InlineSVG from "./svg-template";
import { table } from "../svgs";

const Wrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: transparent;
  border: none;
  cursor: pointer;
  outline: none;
  color: var(--blue-dark);
  padding: 0 1rem;

  .icon {
    width: 1.6rem;
    height: 1.6rem;
    stroke-width: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    stroke: currentColor;
    & path {
      fill: var(--blue-dark);
    }
  }
  span {
    margin-left: 1rem;
    font-size: 1.6rem;
  }
`;

export const AddItemButton = ({ children }) => (
  <Wrapper>
    <InlineSVG d={table.add} viewBox="0 0 17 17" className="icon" fill="#5a7da1" />
    <span>{children}</span>
  </Wrapper>
);
