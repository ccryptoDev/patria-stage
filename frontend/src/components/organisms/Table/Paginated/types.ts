import { IData } from "../../../../contexts/Table/types";

export type IProps = {
  content: {
    thead: {
      title: string;
      key: string | number;
    }[];
    row: Function;
  };
  query: {
    search?: string;
    perPage?: number;
    page?: number;
    status?: string | string[];
    source?: string;
    screetTrackingId?: string;
  };
  api: Function;
  variant?: string;
};

export type IHookProps = { data: IData; getPageNumber: Function; setTableQuery: Function };
