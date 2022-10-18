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
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M0.5 1.5C0.5 0.671574 1.17157 0 2 0H5.75C5.94891 0 6.13968 0.0790176 6.28033 0.21967L7.56066 1.5H14C14.8284 1.5 15.5 2.17157 15.5 3V10.5C15.5 11.3284 14.8284 12 14 12H2C1.17157 12 0.5 11.3284 0.5 10.5V1.5ZM5.43934 1.5L2 1.5V10.5H14V3H7.25C7.05109 3 6.86032 2.92098 6.71967 2.78033L5.43934 1.5ZM8 4.5C8.41421 4.5 8.75 4.83579 8.75 5.25V6H9.5C9.91421 6 10.25 6.33579 10.25 6.75C10.25 7.16421 9.91421 7.5 9.5 7.5H8.75V8.25C8.75 8.66421 8.41421 9 8 9C7.58579 9 7.25 8.66421 7.25 8.25V7.5H6.5C6.08579 7.5 5.75 7.16421 5.75 6.75C5.75 6.33579 6.08579 6 6.5 6H7.25V5.25C7.25 4.83579 7.58579 4.5 8 4.5Z"
        fill={color}
      />
    </svg>
  );
}
