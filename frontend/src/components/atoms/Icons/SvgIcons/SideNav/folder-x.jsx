import React from "react";

export default function Dashboard({
  size = "14",
  fill = "none",
  color = "#58595B",
}) {
  return (
    <svg
      width="16"
      height="12"
      viewBox="0 0 16 12"
      fill={fill}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M8 8.25C8.82843 8.25 9.5 7.57843 9.5 6.75C9.5 5.92157 8.82843 5.25 8 5.25C7.17157 5.25 6.5 5.92157 6.5 6.75C6.5 7.57843 7.17157 8.25 8 8.25Z"
        fill={color}
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M2 0C1.17157 0 0.5 0.671574 0.5 1.5V10.5C0.5 11.3284 1.17157 12 2 12H14C14.8284 12 15.5 11.3284 15.5 10.5V3C15.5 2.17157 14.8284 1.5 14 1.5H7.56066L6.28033 0.21967C6.13968 0.0790176 5.94891 0 5.75 0H2ZM2 1.5L5.43934 1.5L6.71967 2.78033C6.86032 2.92098 7.05109 3 7.25 3H14V10.5H2V1.5Z"
        fill={color}
      />
    </svg>
  );
}
