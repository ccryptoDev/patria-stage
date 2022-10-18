import styled from "styled-components";

export const Form = styled.form`
  @media screen and (max-width: 767px) {
    .textField {
      margin: 12px 0;
    }

    & .fixedRate {
      grid-template-columns: 1fr;
    }

    .offer-calculator-wrapper {
      display: block;

      button {
        margin-left: 0;
      }
    }
  }

  @media screen and (max-width: 500px) {
    .buttons-wrapper {
      display: block;

      & button:last-child {
        margin-top: 12px;
      }
    }
  }
`;
