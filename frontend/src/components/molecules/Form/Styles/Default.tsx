import styled, { css } from "styled-components";

export const InputWrapper = styled.div<{ error: boolean; valid?: boolean }>`
  background: transparent;
  display: flex;
  flex-direction: column;
  position: relative;
  height: 100%;

  .icon {
    position: absolute;
    top: 50%;
    transform: translate(-10px, -50%);
    right: 0;
  }

  input,
  select,
  textarea {
    width: 100%;
    padding: 2rem 1.6rem;
    font-size: 1.4rem;
    outline: none;
    background-color: #fff;
    border-radius: 8px;
    border: 1px solid var(--color-border);
    color: var(--color-grey);
    box-sizing: border-box;
    position: relative;
    font-weight: 400;
    z-index: 2;
    &::placeholder {
      color: #58595b;
    }
  }

  input,
  select {
    &:hover:not(:focus) {
      box-shadow: 0px 2px 12px rgba(0, 0, 0, 0.08);
    }
    &:focus {
      outline: none;
      background: #f9f9f9;
      border-color: #f9f9f9;
    }
  }

  .filled {
    border-color: #be881e;
    background: #fefcf8;
  }

  /* select styles */
  select {
    appearance: none;
    height: 100%;
  }
  .select-wrapper {
    background: #fff;
    border: transparent;
    position: relative;
    height: 100%;
  }
  .select-wrapper::before {
    content: "";
    position: absolute;
    height: 2.4rem;
    width: 2.4rem;
    right: 0;
    top: 50%;
    transform: translate(-50%, -50%);
    background: url("${process.env.PUBLIC_URL}/images/chevron.svg") no-repeat;
    pointer-events: none;
    z-index: 10;
  }

  ${(props) =>
    props.valid &&
    css`
      & input,
      & textarea {
        border-color: transparent;
        border-radius: 6px;
        box-shadow: 0 0 0 2px #06c270;

        &:focus {
          border-color: transparent;
          box-shadow: 0 0 0 2px #06c270;
        }
      }
    `}

  ${(props) =>
    props.error &&
    css`
      & input,
      & select,
      & textarea {
        border-color: #be1e2d;
        border-radius: 8px;
        background: linear-gradient(
            0deg,
            rgba(255, 255, 255, 0.9),
            rgba(255, 255, 255, 0.9)
          ),
          #f3b4ba;

        &:focus {
          border-color: transparent;
          box-shadow: 0 0 0 2px rgba(253, 121, 168, 0.4);
        }
      }
    `}

  .valid input:focus, .valid textarea:focus {
    box-shadow: var(--bshadow-success);
  }

  .invalid input:focus,
  .invalid textarea:focus {
    box-shadow: var(--bshadow-error);
  }

  .input-password {
    padding-right: 35px;
  }

  .error {
    margin: 5px 0 0 5px;
  }
`;

export const PlaceholderLabel = styled.div`
  position: relative;
  .field-label {
    position: absolute;
    top: 50%;
    transform: translate(20px, -50%);
    left: 0;
    font-size: 1.6rem;
    line-height: 1.8rem;
    margin: 0;
    transition: all 0.2s;
    z-index: 1;
    background: transparent;
  }

  /* in case there is a placeholder so it doesnt interfere with the label */
  & input::placeholder {
    color: transparent;
  }

  /* disable chrome autofill */
  input:-webkit-autofill,
  input:-webkit-autofill:hover,
  input:-webkit-autofill:focus,
  input:-webkit-autofill:active,
  select:-webkit-autofill,
  select:-webkit-autofill:hover,
  select:-webkit-autofill:focus,
  select:-webkit-autofill:active {
    -webkit-box-shadow: 0 0 0 30px #fefcf8 inset !important;
  }

  & input:focus + .field-label,
  & select:focus + .field-label,
  & input:not(:placeholder-shown) + .field-label,
  & .selected + .field-label {
    top: 0;
    background: #fff;
    padding: 2px 4px;
    z-index: 3;
    font-size: 0.7em;
    transform: translate(12px, -50%);
  }

  & .dob-input:focus {
    &::placeholder {
      color: #ccc;
    }
  }
`;
