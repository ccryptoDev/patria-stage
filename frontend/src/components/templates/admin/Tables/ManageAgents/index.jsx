import React, { useState } from "react";
import styled from "styled-components";
import { TableProvider } from "../../../../../contexts/Table/table";
import Table from "../../../../organisms/Table/Paginated";
import { getAdmins } from "../../../../../api/admin-dashboard";
import content from "./Content";
import SearchField from "../../../../molecules/Search/TableSearch";
import Modal from "../../../../organisms/Modal/Regular/ModalAndTriggerButton";
import Form from "../../Forms/addUpdateUser/AddUser";
import TriggerButton from "../../../../atoms/Buttons/TriggerModal/Trigger-button-default";
import { AgentsTableStyle } from "../../../../atoms/Table/Table-paginated";

const Navigation = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 2rem 1rem;
`;

const TableControls = () => {
  const [search, setSearch] = useState("");

  const searchHanlder = (value) => setSearch(value);

  return (
    <TableProvider>
      <AgentsTableStyle>
        <Navigation>
          <Modal
            button={<TriggerButton>Add agent</TriggerButton>}
            state={{ data: { isAgent: true } }}
            modalContent={Form}
            modalTitle="Add agent"
          />
          <SearchField searchHanlder={searchHanlder} />
        </Navigation>
        <Table
          content={content}
          api={getAdmins}
          query={{ isAgent: true, search: search.trim(), perPage: 25, page: 1 }}
        />
      </AgentsTableStyle>
    </TableProvider>
  );
};

export default TableControls;
