export type ITable = { items: any[]; total: number } | null;
export type IQuery = { skip: number; itemsPerPage: number; status?: string; search?: string };
export type IError = null | any;
export type IData = {
  tableItems: any | [];
  error: IError;
  status: string;
  itemsPerPage: number;
  query: IQuery;
  loading: boolean;
  numberOfItems: number;
};
