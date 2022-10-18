import styled from "styled-components";

export default styled.table`
  border-collapse: collapse;
  font-size: 14px;
  width: 100%;

  .label {
    padding: 1rem;
    border: 1px solid transparent;
  }

  td,
  th {
    border-bottom: 1px solid var(--color-border);
    text-align: left;
    padding: 16px 0;
  }

  td:first-child {
    font-weight: 600;
  }

  tr:first-child {
    & th,
    & td {
      padding-top: 0;
    }
  }

  tr:last-child {
    & th,
    & td {
      padding-bottom: 0;
      border-bottom: none;
    }
  }

  .half-width {
    width: 50%;
  }

  .text-center {
    text-align: center;
  }
`;
