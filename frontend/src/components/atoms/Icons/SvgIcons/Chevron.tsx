import React from "react";
import styled from "styled-components";
import { IIConProps } from "./types";

const Wrapper = styled.span`
  display: flex;
  align-items: center;
`;

export default function Icon({
  size = "24px",
  fill = "none",
  color = "#58595B",
}) {
  return (
    <svg
      width="7"
      height="12"
      viewBox="0 0 7 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M0.96967 11.0303C0.676777 10.7374 0.676777 10.2626 0.96967 9.96967L4.93934 6L0.96967 2.03033C0.676776 1.73744 0.676776 1.26256 0.969669 0.96967C1.26256 0.676777 1.73744 0.676777 2.03033 0.96967L6.53033 5.46967C6.82322 5.76256 6.82322 6.23744 6.53033 6.53033L2.03033 11.0303C1.73744 11.3232 1.26256 11.3232 0.96967 11.0303Z"
        fill={color}
      />
    </svg>
  );
}

export const Chevron = ({ style, size, color }: IIConProps) => {
  return (
    <Wrapper className="chevron-icon" style={style}>
      <Icon size={size} color={color} />
    </Wrapper>
  );
};
