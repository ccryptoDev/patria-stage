import React from "react";

export default function Arrow({
  size = "100%",
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
        d="M8 16L11.9895 20L12 4V20L16 16"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
