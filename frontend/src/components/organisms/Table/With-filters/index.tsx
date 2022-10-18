import React, { useState } from "react";
import styled from "styled-components";
import { TableProvider } from "../../../../contexts/Table/table";
import Table from "../Paginated";
import { getLoans } from "../../../../api/admin-dashboard";
import Filters from "../../../molecules/Table/Elements/Filters";
import SearchField from "../../../molecules/Search/TableSearch";
import { IfiltersInit, IProps } from "./types";

const Navigation = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 2rem 1rem;
`;

const TableControls = ({
  filtersInit = [],
  tableContent,
  activeFilter,
  initStatus = "",
}: IProps) => {
  const [status, setStatus] = useState<string | string[]>(initStatus);
  const [filters, setFilters] = useState<IfiltersInit>([...filtersInit]);
  const [search, setSearch] = useState<string>("");

  // TABLE FILTERS
  const filterHandler = (clickedTabName: string) => {
    // HIGHTLIGHT THE ACTIVE TAB
    const updatedFilters = filters.map((item) =>
      item.name === clickedTabName
        ? { ...item, active: true }
        : { ...item, active: false }
    );
    // SEE IF THE CURRENT STATUS HAS CHANGED
    const updatedStatus = updatedFilters.find((item) => item.active);
    if (updatedStatus?.status && status !== updatedStatus?.status) {
      setStatus(updatedStatus?.status);
    }
    // SET A CALLBACK TO SHOW WHICH FILTER IS SELECTED
    setFilters(updatedFilters);
    if (typeof activeFilter === "function") {
      activeFilter(updatedFilters);
    }
  };
  // ----

  const searchHanlder = (value: string) => setSearch(value);

  return (
    <TableProvider>
      <Navigation>
        <Filters items={filters} filterHandler={filterHandler} />
        <SearchField searchHanlder={searchHanlder} />
      </Navigation>
      <Table
        content={tableContent}
        api={getLoans}
        query={{
          search: search.trim(),
          perPage: 25,
          page: 1,
          status,
          source: "",
        }}
      />
    </TableProvider>
  );
};

export default TableControls;
