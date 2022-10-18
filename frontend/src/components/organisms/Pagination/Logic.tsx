import React, { useState, useEffect } from "react";
import ButtonsWrapper from "../../atoms/Pagination";

// this component receives the total number of items in the data table, and
// returns an object of properties { totalItems, currentPage, pageSize, totalPages, startPage: startPage,
// endPage, startIndex, endIndex, pages }

// this component shouldn't go as a sibling of data table

type IProps = {
  numberOfItems: number;
  onChangePage: Function;
  pageSize: number;
};

const Pagination: React.FC<IProps> = ({
  numberOfItems,
  onChangePage,
  pageSize = 25,
}) => {
  const [state, setState] = useState<{
    pager: { totalPages?: number; currentPage?: number; pages?: number[] };
  }>({ pager: {} });

  function getPager(totalItems: number, currentPage = 1) {
    // calculate total pages
    const totalPages = Math.ceil(totalItems / pageSize);

    let startPage: number;
    let endPage: number;
    if (totalPages <= 10) {
      // less than 10 total pages so show all
      startPage = 1;
      endPage = totalPages;
    } // more than 10 total pages so calculate start and end pages
    else if (currentPage <= 6) {
      startPage = 1;
      endPage = 10;
    } else if (currentPage + 4 >= totalPages) {
      startPage = totalPages - 9;
      endPage = totalPages;
    } else {
      startPage = currentPage - 5;
      endPage = currentPage + 4;
    }

    // calculate start and end item indexes
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = Math.min(startIndex + pageSize - 1, totalItems - 1);

    // create an array of pages to ng-repeat in the pager control
    const pages = [...Array(endPage + 1 - startPage).keys()].map(
      (i) => startPage + i
    );
    // return object with all pager properties required by the view
    return {
      totalItems,
      currentPage,
      pageSize,
      totalPages,
      startPage,
      endPage,
      startIndex,
      endIndex,
      pages,
    };
  }

  function setPage(page = 1) {
    const items = numberOfItems;
    let { pager }: any = state;

    if (page < 1 || page > pager?.totalPages) {
      return;
    }

    // get new pager object for specified page
    pager = getPager(items, page);

    // get new page of items from items array
    // let pageOfItems = items.slice(pager.startIndex, pager.endIndex + 1);

    // update state
    setState({ pager });

    // call change page function in parent component
    onChangePage(pager);
  }

  useEffect(() => {
    // set a new pagination board on every table change
    if (numberOfItems) {
      setPage(state?.pager?.currentPage);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [numberOfItems]);

  const { pager }: any = state;

  if (!pager.pages || pager.pages.length <= 1) {
    // don't display pager if there is only 1 page
    return null;
  }

  return (
    <ButtonsWrapper>
      <li className={pager.currentPage === 1 ? "disabled" : ""}>
        <button type="button" onClick={() => setPage(1)}>
          First
        </button>
      </li>
      <li className={pager.currentPage === 1 ? "disabled" : ""}>
        <button type="button" onClick={() => setPage(pager.currentPage - 1)}>
          Previous
        </button>
      </li>
      {pager.pages.map((page: any) => (
        <li key={page} className={pager.currentPage === page ? "active" : ""}>
          <button type="button" onClick={() => setPage(page)}>
            {page}
          </button>
        </li>
      ))}
      <li className={pager.currentPage === pager.totalPages ? "disabled" : ""}>
        <button type="button" onClick={() => setPage(pager.currentPage + 1)}>
          Next
        </button>
      </li>
      <li className={pager.currentPage === pager.totalPages ? "disabled" : ""}>
        <button type="button" onClick={() => setPage(pager.totalPages)}>
          Last
        </button>
      </li>
    </ButtonsWrapper>
  );
};

export default Pagination;
