import React from "react";
import { JsxElement } from "typescript";
import { TableFooter } from "../../../atoms/Table/Table-paginated";
import Loader from "../../../molecules/Loaders/Circle";
import Pagination from "../../Pagination/Wrapper";
import PageOfPages from "../../Pagination/PageOfPages";
import { IData } from "../../../../contexts/Table/types";

type IContent = {
  thead: { key: number | string; title: string }[];
  row: Function | any;
};

type IProps = {
  content: IContent;
  data: IData;
  getPageNumber: Function;
};

const TableView: React.FC<IProps> = ({
  data,
  content = { thead: [], row: [] },
  getPageNumber,
}) => {
  const { tableItems, loading } = data;
  const array = tableItems || [];
  const { thead, row } = content;

  const renderTable = () => {
    if (array.length && Array.isArray(array)) {
      return (
        <table>
          <thead>
            <tr>
              {thead.map((item: { key: string | number; title: string }) => {
                return <th key={item.key}>{item.title}</th>;
              })}
            </tr>
          </thead>
          <tbody>
            {array.map((item: any) => {
              return (
                <tr key={Math.random()}>
                  {row({ ...item }).map((Component: JsxElement) => {
                    return <td key={Math.random()}>{Component}</td>;
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      );
    }

    if (loading) {
      return (
        <div className="noTable">
          <Loader position="center" size="7" />
        </div>
      );
    }

    if (!loading && array.length === 0) {
      return <div className="noTable">There are no items here yet</div>;
    }

    return <></>;
  };
  return (
    <>
      <div className="table-wrapper">{renderTable()}</div>
      {data.numberOfItems > data.itemsPerPage ? (
        <TableFooter>
          <PageOfPages
            numberOfItems={data.numberOfItems}
            itemsPerPage={data.itemsPerPage}
            skip={data.query.skip}
          />
          <Pagination data={data} getPageNumber={getPageNumber} />
        </TableFooter>
      ) : (
        ""
      )}
    </>
  );
};
export default TableView;
