import styled from "styled-components";

const Form = styled.form`
  .fields-wrapper {
    display: grid;
    grid-template-columns: 320px 320px;
    grid-gap: 12px;

    & .textField:nth-child(9) {
      grid-column: 1/-1;
    }
  }

  .tabs-wrapper {
    padding: 0;
    & .MuiTabs-root .MuiPaper-root .MuiButtonBase-root {
      width: auto !important;
    }

    & .MuiTabs-root .MuiButtonBase-root.MuiTab-root {
      width: auto;
    }

    & .MuiTabs-flexContainer {
      justify-content: start;
      column-gap: 30px;
    }

    & .MuiTab-root {
      text-transform: capitalize;
      font-size: 14px;
    }
  }

  @media screen and (max-width: 500px) {
    .textField:first-child {
      margin-top: 12px;
    }
  }
`;

export default Form;
