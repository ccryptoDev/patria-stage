import styled from "styled-components";

export default styled.form`
  padding: 0 2rem 2rem;
  .layout {
    position: relative;
    display: grid;
    grid-template-columns: 2fr 2fr;
    grid-gap: 2rem;
    margin-bottom: 4rem;

    .errorMessage {
      position: absolute;
      top: 100%;
      padding: 0;
      margin-top: 1rem;
    }

    & .textField:nth-child(1) {
      grid-column: 1/-1;
    }
  }

  .checkbox-wrapper {
    & label {
      display: flex;
      align-items: center;
    }
  }
`;

export const PasswordWrapper = styled.div<{ show: boolean }>`
  .textField {
    opacity: ${(props) => (props.show && 1) || 0.4};
    margin-bottom: 2rem;
  }
`;
