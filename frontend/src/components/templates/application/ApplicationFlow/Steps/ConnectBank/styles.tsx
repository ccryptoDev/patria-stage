import styled from "styled-components";

export const Styled = styled.div`
  .providers-table-mobile {
    display: none;
  }
  table {
    width: 100%;

    .provider-name-col,
    .provider-location-lg {
      padding: 14px 20px;
    }
    .provider-name-col {
      display: flex;
      align-items: center;
      & img {
        margin-right: 12px;
        width: 22px;
        height: 22px;
      }
      & .provider-name {
        color: #1c1c1e;
        font-weight: 700;
        font-size: 14px;
        line-height: 16px;
      }
      & .provider-location-sm {
        display: none;
        font-weight: 700;
        font-size: 12px;
        line-height: 14px;
      }
    }

    .provider-location-lg {
      font-size: 14px;
      font-weight: 700;
      line-height: 16px;
    }

    .provider-location-lg,
    .provider-location-sm {
      color: #646668;
    }

    & .provider-select {
      background: none;
      border: none;
    }
  }

  @media screen and (max-width: 600px) {
    table .provider-name-col {
      padding-left: 10px;

      & img {
        width: 32px;
        height: 32px;
      }
      & .provider-name {
        font-size: 14px;
      }
      & .provider-location-sm {
        display: block;
      }
    }
    table .provider-location-lg {
      display: none;
    }
  }
`;

export const Form = styled.form`
  .textField {
    margin: 24px 0;
    width: 100%;
  }

  .update-providers {
    display: flex;
    align-items: center;

    button {
      margin-left: 5px;
    }
  }

  @media screen and (max-width: 767px) {
    .textField {
      margin: 12px 0;
    }
    .update-providers {
      display: block;

      button {
        margin-left: 0;
      }
    }
  }
`;

export const BankLogo = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  border: 1px solid #c6c6c8;
  border-radius: 14px;
  height: 64px;
  cursor: pointer;
`;
