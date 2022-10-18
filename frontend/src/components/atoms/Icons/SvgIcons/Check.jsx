import React from "react";

const Check = ({ size = "25", fill = "none", color = "#28293D" }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 25 25"
      fill={fill}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M9.66666 16.4729L5.49666 12.3029L4.07666 13.7129L9.66666 19.3029L21.6667 7.30294L20.2567 5.89294L9.66666 16.4729Z"
        fill={color}
      />
    </svg>
  );
};

export default Check;
