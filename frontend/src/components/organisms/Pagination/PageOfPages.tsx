import React from "react";

type IProps = {
  numberOfItems: number;
  itemsPerPage: number;
  skip: number;
};
const Pages: React.FC<IProps> = ({ numberOfItems, itemsPerPage, skip = 0 }) => {
  const numberOfPages = Math.ceil(numberOfItems / itemsPerPage);
  const page = Math.floor(skip / itemsPerPage) + 1;
  return (
    <div className="pagesCounter">
      Page {page} of {numberOfPages}
    </div>
  );
};

export default Pages;
