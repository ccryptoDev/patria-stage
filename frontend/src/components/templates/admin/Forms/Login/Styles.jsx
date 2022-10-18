import styled from "styled-components";

export default styled.form`
  & .form-item {
    display: flex;
    align-items: center;
    margin: 2.4rem 0;

    & input {
      line-height: 1.5;
    }

    & .form-item-icon {
      padding-right: 1rem;
    }
  }
  & .textField {
    width: 225px;
    text-align: left;
  }

  .forgotPasswordBtn {
    padding: 1rem 5px;
    & a {
      font-size: 1.3rem;
      text-decoration: none;

      &,
      &:visited,
      &:active {
        color: #034376;
      }
    }
  }

  & .button-wrapper {
    display: flex;
    justify-content: center;
    margin: 1.5rem;
    & button {
      padding: 1rem;
      border-radius: 5px;
      border: 1px solid #034376;
      background: transparent;
      font-family: "Spartan";
      outline: none;
      transition: box-shadow 0.2s cubic-bezier(0.4, 0, 1, 1),
        background-color 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      cursor: pointer;
      &:not(:first-child) {
        margin-left: 1rem;
      }
      &:hover {
        border-color: red;
      }
    }
  }

  .errorMessage {
    padding: 0;
  }
`;
