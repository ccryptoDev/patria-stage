import styled from "styled-components";

export default styled.section`
  box-sizing: border-box;
  font-family: Spartan;
  padding: 24px;
  font-size: 14px;

  h2 {
    text-align: center;
  }

  h2,
  h3 {
    color: #222222;
  }

  h3 {
    margin-bottom: 24px;
  }

  p {
    text-align: justify;
    font-size: 14px;
    line-height: 1.5;
    margin: 10px 0;
    color: #000;
  }

  .text-center {
    text-align: center;
  }

  table {
    border-collapse: collapse;
    width: 100%;

    & td,
    & th {
      font-size: 14px;
    }
  }

  .link-string {
    word-break: break-word;
  }

  .table-footer-item:nth-child(3) {
    border-right: none;
  }

  @media screen and (max-width: 1024px) {
    padding: 12px;
  }

  @media print {
    .document-wrapper {
      background-color: white;
      padding: 2em 6em;
      width: 21cm;
      min-height: 29.7cm;
      font-size: 1.1em;
    }

    & {
      height: 11in;
      width: 8.5in;
    }

    .no-break {
      page-break-inside: avoid;
    }

    .new-page {
      page-break-before: always;
    }

    .signatures .signature-field .signature {
      width: 25% !important;
      height: auto;
    }

    .signature-img {
    }
  }

  @page {
    margin: 5mm;
  }
`;
