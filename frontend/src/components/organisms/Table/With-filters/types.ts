export type IfiltersInit = { name: string; active: boolean; status: string | string[] }[];
export type IProps = {
  filtersInit: IfiltersInit;
  activeFilter?: Function;
  tableContent: { thead: { title: string; key: number }[]; row: Function };
  initStatus?: string | string[];
};
