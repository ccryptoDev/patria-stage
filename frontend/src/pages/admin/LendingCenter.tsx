import React, { useState } from "react";
import Layout from "../../layouts/admin/main";
import { routes } from "../../routes/Admin/routes";
import { tFilter } from "../../utils/variables";
import { status, statusAll } from "../../utils/table-status.config";
import general from "../../components/organisms/Table/Paginated/Content/Primary";
import late from "../../components/organisms/Table/Paginated/Content/Late";
import Table from "../../components/organisms/Table/With-filters";
import { AgentsTableStyle } from "../../components/atoms/Table/Table-paginated";

type IfiltersInit = {
  name: string;
  active: boolean;
  status: string | string[];
}[];

// SET THE TABLE FILTER TABS CONFIG
const filtersInit: IfiltersInit = [
  { name: tFilter.UPCOMING, active: true, status: status.UPCOMING },
  { name: tFilter.APPROVED, active: false, status: status.APPROVED },
  { name: tFilter.FUNDED, active: false, status: status.FUNDED },
  { name: tFilter.LATE, active: false, status: status.LATE },
  { name: tFilter.PAID, active: false, status: status.PAID },
  { name: tFilter.ALL, active: false, status: statusAll },
];

const LCenter = () => {
  const [tableContent, setTableContent] = useState<any>(general);

  // SET TABLE CONTENT BASED ON SELECTED FILTER
  const activeFilterHandler = (filters: any) => {
    const active = filters.find((item: any) => item.active);
    if (active.status === status.LATE && tableContent !== late) {
      setTableContent(late);
    } else if (tableContent !== general) {
      setTableContent(general);
    }
  };

  return (
    <Layout route={routes.LENDING_CENTER} H2="Lending Center">
      <AgentsTableStyle>
        <Table
          filtersInit={filtersInit}
          activeFilter={activeFilterHandler}
          initStatus={status.REVIEW}
          tableContent={tableContent}
        />
      </AgentsTableStyle>
    </Layout>
  );
};

export default LCenter;
