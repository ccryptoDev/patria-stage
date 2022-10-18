import React from "react";

type IEditable = {
  children: any;
  show: boolean;
};

const Editable = ({ children, show = false }: IEditable) => {
  return <div>{show ? children : ""}</div>;
};

export default Editable;
