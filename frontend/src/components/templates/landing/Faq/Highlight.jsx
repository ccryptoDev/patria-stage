import React from "react";
import { v4 as uuid } from "uuid";

const Highlighted = ({ text = "", regexp = "" }) => {
  if (!regexp) {
    return <span>{text}</span>;
  }
  const parts = text.split(regexp);
  return (
    <>
      {parts.filter(String).map((part, i) => {
        return regexp.test(part) ? (
          <span className="highlighted" key={uuid()}>
            {part}
          </span>
        ) : (
          part
        );
      })}
    </>
  );
};

export default Highlighted;
