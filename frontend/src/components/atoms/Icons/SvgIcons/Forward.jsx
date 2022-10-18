import React from "react";

export default function Folder({
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
        d="M14 14C14 14 12.9682 13.9766 11.0449 14C6.36999 13.7699 4.46625 18.1773 4 19C4 17.7372 4 14 6.36999 11C8.73998 8 14 8 14 8V5L20 11L14 17V14Z"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
