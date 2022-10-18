import React, { useState, useEffect, useCallback } from "react";
import { errorHandler } from "../../utils/errorHandler";
import { ITable, IQuery, IError, IData } from "./types";

export const TableContext = React.createContext({
  data: {
    tableItems: [],
    error: null,
    status: "",
    itemsPerPage: 25,
    query: { skip: 0, itemsPerPage: 25 },
    loading: false,
    numberOfItems: 0,
  },
});

export const TableProvider = ({ children }: React.PropsWithChildren<any>) => {
  const [query, setQuery] = useState<IQuery>({ skip: 0, itemsPerPage: 25 });
  const [table, setTable] = useState<ITable>(null);
  const [error, setError] = useState<IError>(null);
  const [loading, setLoading] = useState(false);
  const [httpRequestPath, setHttpRequestPath] = useState({});

  const fetchTable = async (data: IQuery) => {
    if (typeof httpRequestPath === "function") {
      setLoading(true);
      const result = await httpRequestPath({ ...query, ...data }); // calling the api cb and passing the endpoint query data
      setLoading(false);
      const success = errorHandler(result.data);
      if (success) {
        setTable(result.data);
      } else {
        setError(result.error);
      }
    }
  };
  useEffect(() => {
    fetchTable(query);
    // eslint-disable-next-line
  }, [query]);

  // UPDATE TABLE ON PAGE CHANGE
  const getPageNumber = async (pager: { startIndex: number }) => {
    if (query.skip !== pager.startIndex) {
      setQuery({ ...query, skip: pager.startIndex });
    }
  };

  // SET TABLE QUERY REQUEST
  const setTableQuery = useCallback(async ({ requestData, api }) => {
    setTable(null);
    setHttpRequestPath(() => api); // save the api cb in the state as a function
    setQuery((prevState) => {
      return {
        ...prevState,
        ...requestData,
      };
    });
  }, []);

  // SEND REQUEST FROM THE TABLE OR TABLE MODAL WITH FURHTER TABLE UPDATE

  const actionRequest = async ({ payload, cb }: { payload: any; cb: any }) => {
    if (typeof cb === "function") {
      const result = await cb(payload);
      if (result && !result.error) {
        await fetchTable(query);
        return result;
      }
      return {
        error: { message: result?.error?.message || "something went wrong" },
      };
    }
    return { error: { message: "callback is not a function" } };
  };
  type IExpose = {
    data: IData;
    getPageNumber?: Function;
    setTableQuery?: Function;
    actionRequest?: Function;
    fetchTable?: Function;
  };
  const expose: IExpose = {
    data: {
      tableItems: table && table?.items ? table?.items : [],
      error,
      numberOfItems: table && table?.total ? table?.total : 0,
      status: query && query?.status ? query.status : "",
      itemsPerPage: query?.itemsPerPage ? query.itemsPerPage : 25,
      query,
      loading,
    },
    getPageNumber,
    setTableQuery,
    actionRequest,
    fetchTable,
  };
  return (
    <TableContext.Provider value={expose}>{children}</TableContext.Provider>
  );
};

export const useTable = (): any => {
  const context = React.useContext(TableContext);

  if (context === undefined) {
    throw new Error("table must be used within a TableProvider");
  }
  return context;
};
