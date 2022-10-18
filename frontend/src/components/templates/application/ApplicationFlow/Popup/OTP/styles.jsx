import styled from "styled-components";

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  row-gap: 30px;
  .otp-container {
    & .input-container {
      & input {
        border-radius: 8px;
        border: 1px solid var(--color-border);
        color: var(--color-grey);
        color: #000;
        font-weight: 400;
        font-size: 16px;

        &:focus {
          outline: none;
          background: #f9f9f9;
          border-color: #f9f9f9;
        }
      }
      & span {
        margin: 0 10px;
      }
    }

    & .error-message {
      color: red;
      font-size: 12px;
      margin-top: 16px;
    }
  }

  .form-heading {
    display: flex;
    align-items: baseline;
    column-gap: 10px;
    font-size: 16px;
    & span {
      font-weight: 600;
    }
  }

  .form-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    column-gap: 10px;
  }
`;

export const Button = styled.button`
  background: none;
  border: none;
  color: var(--color-primary);
  font-weight: 600;
  font-size: 14px;
`;

export default Wrapper;
