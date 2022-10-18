import styled from "styled-components";

export const TableWrapper = styled.div`
  overflow-x: auto;

  table {
    & tr,
    & th,
    & td {
      border: none;
      text-align: left;
      border: 1px solid;
      padding: 10px;
    }

    & th {
      background: var(--color-border);
    }
  }
`;
