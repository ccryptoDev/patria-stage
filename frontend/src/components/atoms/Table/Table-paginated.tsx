import styled, { css } from "styled-components";

// table wrapper, table and the table content structure
export const AdminTableWrapper = styled.div<{ variant?: string }>`
  position: relative;
  min-width: 10rem;
  width: 100%;
  overflow: auto;
  font-family: "Spartan";

  .table-wrapper {
    overflow-x: auto;
  }

  table {
    border-collapse: separate;
    border-spacing: 0;
    box-sizing: border-box;
    font-size: 1.4rem;
    margin-bottom: 1rem;
    width: 100%;
    min-width: 110rem;
  }

  tr:last-child td:first-child {
    border-bottom-left-radius: 1rem;
  }

  th {
    border: none;
    font-family: "Spartan";
    font-size: 1.6rem;
    padding: 0.75rem;
    color: rgb(54, 54, 54);
  }

  th,
  td {
    padding: 2rem 1rem;
    text-align: left;
  }

  tbody tr {
    border-top: 1px solid #ccc;
    &:nth-child(even) {
      background: #fafafc;
    }
    .reminder {
      padding: 1rem 0.5rem;
      min-width: 16rem;
    }

    .details {
      padding: 1rem 0.5rem;
      width: 13rem;
    }
  }

  .noTable {
    font-size: 2rem;
    text-align: center;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 8rem;
    position: relative;
  }
`;

export const AgentsTableStyle = styled.div`
  position: relative;
  overflow-x: auto;
  padding: 1rem 0;
  max-width: 110rem;
  min-width: 10rem;

  .table-wrapper {
    overflow-x: auto;
  }

  table {
    border-collapse: separate;
    border-spacing: 0;
    box-sizing: border-box;
    font-size: 1.3rem;
    width: 1090px;
    padding-right: 1rem;
    font-family: "Spartan";
    margin-bottom: 1rem;
  }

  td,
  th {
    border: 1px solid #ccc;
    border-style: none solid solid none;
  }

  th {
    font-weight: 600;
  }

  tr th:first-child {
    padding-left: 1.5rem;
  }

  tr td:first-child div a {
    color: rgb(15, 139, 225);
    font-weight: bold;
    text-decoration: none;
  }

  tr:first-child td:first-child {
    border-top-left-radius: 1rem;
  }
  tr:first-child td:last-child {
    border-top-right-radius: 1rem;
  }
  tr:last-child td:first-child {
    border-bottom-left-radius: 1rem;
  }
  tr:last-child td:last-child {
    border-bottom-right-radius: 1rem;
  }
  tr:first-child td {
    border-top-style: solid;
  }
  tr td:first-child {
    border-left-style: solid;
  }

  tr:last-child td:first-child {
    border-bottom-left-radius: 1rem;
  }

  th {
    border: none;
    color: #1a3855;
    font-family: "Spartan";
    font-size: 1.3rem;
    padding: 0.5rem;
    text-transform: uppercase;
    text-align: left;
  }

  tbody {
    border-radius: 1rem;
    box-shadow: 4px 5px 0.9rem rgba(0, 47, 94, 0.11);
  }

  tbody tr {
    :nth-of-type(even) {
      background-color: #f3faff;
    }

    :nth-of-type(odd) {
      background-color: #fff;
    }

    .reminder {
      padding: 1px 5px;
      min-width: 16rem;
    }

    .details {
      padding: 1rem 5px;
      width: 13rem;
    }
  }

  .noTable {
    font-size: 2rem;
    text-align: center;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 4rem;
    position: relative;
  }
`;

export const TableFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;

  .pagesCounter {
    padding: 1rem;
  }
`;

export const Name = styled.div<{ width?: string; minwidth?: string }>`
  font-weight: bold;
  text-align: left;
  width: ${(props) => props.width || "auto"};
  min-width: ${(props) => props.minwidth || "auto"};
  a {
    text-decoration: none;
    color: #0f8be1;
  }
`;

export const TableCell = styled.div<{
  center?: boolean;
  width?: string;
  minwidth?: string;
}>`
  min-width: ${(props) => props.minwidth || "auto"};
  width: ${(props) => props.width || "auto"};
  align-items: center;
  font-size: 1.4rem;
  padding: 1.4rem;
  button {
    width: 100%;
  }
  .agent-view-button {
    text-transform: unset;
  }
  a {
    text-decoration: none;
    &:link,
    &:visited {
      color: #034376;
    }
  }

  ${(props) =>
    props.center &&
    css`
      text-align: center;
    `}
`;

export const Email = styled.div<{ width?: string }>`
  word-break: break-all;
  text-align: left;
  width: ${(props) => props.width};
`;

export const Amount = styled.div<{ edit?: boolean; width?: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: right;
  width: ${(props) => props.width || "8rem"};
  ${(props) =>
    props.edit &&
    css`
      color: #0f8be1;
      font-weight: bold;
    `}
`;

export const AmountEditable = styled.div<{ edit?: boolean; width?: string }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: ${(props) => props.width || "auto"};
  ${(props) =>
    props.edit &&
    css`
      color: #0f8be1;
      font-weight: bold;
    `}
`;

export const CreatedAt = styled.div<{ width?: string }>`
  width: ${(props) => props.width || "10rem"};
  text-align: center;
`;

export const ProcedureDate = styled.div<{ width?: string }>`
  width: ${(props) => props.width || "100%"};
  display: flex;
  align-items: center;
  justify-content: space-around;
`;

export const PhoneNumber = styled.div<{ width?: string }>`
  width: ${(props) => props.width || "auto"};
  min-width: 12rem;
  word-break: break-word;
`;

export const FlexCenter = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
`;

export const TableButton = styled.button<{
  kind?: "primary" | "secondary";
  width?: string;
  toolTip: boolean;
}>`
  border-radius: var(--border-radius-sm);
  border: none;
  cursor: pointer;
  font-size: 1.4rem;
  outline: none;
  padding: 0.7rem 1.2rem;
  width: ${(props) => props.width};
  position: relative;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &:active {
    transform: scale(0.98);
    box-shadow: none;
  }

  &:hover {
    box-shadow: 1px 1px 3px 0 rgb(0 47 94 / 11%);
    transition: all 0.1s;
  }

  ${(props) =>
    props.toolTip &&
    css`
      &:hover:after {
        content: attr(data-description);
        position: absolute;
        top: 105%;
        left: 50%;
        transform: translateX(-50%);
        background: #f6e58d;
        width: 80%;
        font-size: 1.2rem;
        border: 1px solid #ccc;
        padding: 2px;
        color: #000;
      }
    `}

  ${(props) =>
    props.kind === "primary" &&
    css`
      color: var(--button-text-primary);
      background: var(--color-secondary);
    `}

  ${(props) =>
    props.kind === "secondary" &&
    css`
      color: var(--button-text-secondary);
      background: transparent;
      border: 1px solid #d4e1e6;
    `}
`;

export const Expiry = styled.div<{ width?: string }>`
  width: ${(props) => props.width};
`;

export const Progress = styled.div<{ width?: string }>`
  width: ${(props) => props.width};
`;

export const Status = styled.div<{ width?: string }>`
  width: ${(props) => props.width};
`;

export const TableBoundary = styled.div<{ variant: "primary" | "creditors" }>`
  ${(props) =>
    props.variant === "primary" &&
    css`
      table {
        width: 110rem;
      }
    `}

  ${(props) =>
    props.variant === "creditors" &&
    css`
      table {
        width: 75rem;
        & th,
        & td {
          padding: 5px;
          font-size: 1.2rem;
          text-transform: inherit;
        }
      }
    `}
`;
