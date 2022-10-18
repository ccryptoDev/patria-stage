import React, { useState } from "react";

const Pager = ({ children }) => {
  if (typeof children !== "function")
    throw new Error("Pager child must be a function");
  const [page, setPage] = useState(0);
  const changePage = (number) => setPage(number);

  return <div>{children({ page, changePage })}</div>;
};

export default Pager;
