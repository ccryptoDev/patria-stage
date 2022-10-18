import React from "react";

export default function Mail({
  size = "2.4rem",
  fill = "none",
  color = "#28293D",
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={fill}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M4 6L12 13L20 6V18H4V6H20"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        opacity="0.3"
        d="M14 16H18"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
