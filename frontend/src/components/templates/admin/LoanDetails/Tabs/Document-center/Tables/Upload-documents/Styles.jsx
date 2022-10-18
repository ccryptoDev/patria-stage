import styled from "styled-components";

export const Select = styled.select`
  padding: 1rem 2rem;
  width: 100%;
  outline: 0;
  background-color: #ffffff;
  border-radius: 0.8rem;
  border: 1px solid #e0e0e0;
  font-size: 1.6rem;
  font-weight: 500;
  line-height: 1.11;
  text-align: left;
  color: #363636;

  &:valid {
    border-color: var(--color-success);
  }
`;

export const Form = styled.form`
  table {
    border-collapse: collapse;
    font-size: 1.6rem;
    width: 100%;
  }

  table,
  td,
  th {
    border: 1px solid #f4f4f4;
    text-align: left;
  }

  td,
  th {
    padding: 1.2rem;
  }

  th {
    width: 25rem;
  }

  a:link,
  a:active,
  a:visited {
    color: #034376;
    text-decoration: none;
  }

  a:hover {
    text-decoration: underline;
  }

  .submit-button-wrapper {
    display: flex;
    align-items: center;
    justify-content: center;

    & button {
      text-transform: uppercase;
      font-weight: bold;
      font-size: 1.4rem;
      min-width: 15rem;
      border-radius: 1.5rem;
      padding: 6px 1.2rem;
      line-height: 1.5;

      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
    }
  }
`;
