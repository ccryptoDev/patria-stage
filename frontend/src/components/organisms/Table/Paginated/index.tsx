import React, { useEffect } from "react";
import { IProps, IHookProps } from "./types";
import Table from "./Table";
import { useTable } from "../../../../contexts/Table/table";

const TableContainer: React.FC<IProps> = ({
  content = { thead: [], row: [] },
  query = {},
  api = "",
}) => {
  const { data, getPageNumber, setTableQuery }: IHookProps = useTable();
  useEffect(() => {
    setTableQuery({
      requestData: query,
      api,
    });
    // eslint-disable-next-line
  }, [query, api]);
  return <Table data={data} content={content} getPageNumber={getPageNumber} />;
};
export default TableContainer;
