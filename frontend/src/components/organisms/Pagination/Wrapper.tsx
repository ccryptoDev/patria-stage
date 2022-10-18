import React from "react";
import Pagination from "./Logic";

type IProps = {
  data: {
    numberOfItems: number;
    itemsPerPage: number;
  };
  getPageNumber: Function;
};

const Wrapper: React.FC<IProps> = ({
  data: { numberOfItems, itemsPerPage },
  getPageNumber,
}) => {
  return (
    <div>
      <div className="container">
        <div className="text-center">
          {numberOfItems ? (
            <Pagination
              numberOfItems={numberOfItems}
              onChangePage={getPageNumber}
              pageSize={itemsPerPage}
            />
          ) : (
            ""
          )}
        </div>
      </div>
    </div>
  );
};

export default Wrapper;
