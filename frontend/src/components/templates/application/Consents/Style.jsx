import styled from "styled-components";

export const Wrapper = styled.div`
  padding: 1rem;
  font-size: 1.4rem;
  line-height: 1.5;
  .header {
    text-align: center;
    margin-bottom: 1rem;
    display: none;
  }

  .signatures,
  .signatures td {
    border: none;
  }

  .signatures {
    display: none;
  }

  .no-break {
    page-break-inside: avoid;
  }

  p,
  ul li {
    margin: 1rem 0;
    line-height: 2.6rem;
  }

  ul {
    padding: 0 2rem;
  }

  @media print {
    .header,
    .signatures {
      display: block;
    }
  }

  .dark {
    background: #444440;
  }

  .medium {
    background: #888888;
  }

  .light {
    background: #ccccc0;
  }
  table,
  table td {
    border: 1px solid;
  }

  table tr {
    page-break-inside: avoid;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    & .cell {
      padding: 1rem;
    }
  }

  .privacyPoplicy td:first-child {
    width: 30%;
  }
`;

export const Layout = styled.form`
  .heading {
    margin-bottom: 2rem;
  }

  .form-layout {
    height: 50vh;
    overflow-y: scroll;
    padding: 1rem;
    .buttons {
      display: flex;
      width: 27rem;
      justify-content: space-between;
      padding: 1rem;
    }

    .action-button {
      display: block;
      margin-top: 2rem;
    }
  }

  @page {
    margin: 10mm;
  }

  button {
    &:hover {
      box-shadow: none;
    }
  }
`;
