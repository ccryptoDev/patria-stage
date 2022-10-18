import styled from "styled-components";

export default styled.form`
  & .form-field {
    display: flex;
    align-items: center;
    margin-bottom: 3rem;
    width: 30rem;

    & .form-item-icon {
      padding: 0 1.5rem;
    }
  }

  & .form-btns button {
    width: 45%;
  }
  & .textField {
    width: 100%;
    text-align: left;
  }

  & .button-wrapper {
    display: flex;
    justify-content: center;
    margin: 1.5rem;
    & button {
      padding: 1.8rem 3.6rem;
      border-radius: 5px;
      width: 20rem;
      border: 1px solid #034376;
      background: transparent;
      text-transform: uppercase;
      outline: none;
      transition: box-shadow 0.2s cubic-bezier(0.4, 0, 1, 1),
        background-color 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      cursor: pointer;
      font-weight: bold;
      &:hover {
        border-color: red;
      }
    }
  }
`;
