import React from "react";

export default function Lock({
  size = "14px",
  fill = "none",
  color = "#58595B",
}) {
  return (
    <svg
      width="12"
      height="16"
      viewBox="0 0 12 16"
      fill={fill}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M6 2C7.23579 2 8.25 3.01421 8.25 4.25V6.5H3.75V4.25C3.75 3.01421 4.76421 2 6 2ZM9.75 6.5V4.25C9.75 2.18579 8.06421 0.5 6 0.5C3.93579 0.5 2.25 2.18579 2.25 4.25V6.5H1.5C0.671573 6.5 0 7.17157 0 8V14C0 14.8284 0.671574 15.5 1.5 15.5H10.5C11.3284 15.5 12 14.8284 12 14V8C12 7.17157 11.3284 6.5 10.5 6.5H9.75ZM1.5 8H10.5V14H1.5V8Z"
        fill={color}
      />
    </svg>
  );
}
