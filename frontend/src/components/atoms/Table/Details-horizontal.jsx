import styled from "styled-components";

export default styled.table`
  border-collapse: collapse;
  font-size: 14px;
  width: 100%;

  tbody td,
  thead th {
    border-bottom: 1px solid var(--color-border);
    text-align: left;
    padding: 12px 0;
  }

  .index {
    width: 50px;
  }

  thead th {
    padding-top: 0;
    font-weight: 600;
  }

  tbody tr:last-child {
    & td {
      padding-bottom: 0;
      border-bottom: none;
    }
  }

  .half-width {
    width: 50%;
  }
`;
