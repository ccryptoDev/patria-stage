import React from "react";

export const parsePropString = (value) => {
  const regexp = new RegExp(value, "g");
  if (/.:\s/g.test(regexp)) {
    const val = value.split(":");
    return (
      <div>
        <span style={{ color: "#000" }}>{val[0]}:</span>
        <span>{val[1]}</span>
      </div>
    );
  }
  return value;
};

export const converter = (value) => {
  switch (true) {
    case typeof value === "boolean":
      return <div style={{ color: "blue" }}>{value ? "true" : "false"}</div>;
    case typeof value === "number":
      return <div style={{ color: "blue" }}>{value.toString()}</div>;
    case typeof value === "undefined":
      return <div style={{ color: "blue" }}>N/A</div>;
    default:
      return <div style={{ color: "#C41A16" }}>{value}</div>;
  }
};
