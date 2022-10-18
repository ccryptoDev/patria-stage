import styled, { css } from "styled-components";
import MenuItem from "@material-ui/core/MenuItem";

export const ListItem = styled(MenuItem)`
  font-size: 1.4rem !important;
  line-height: 1.6rem !important;
  margin: 5px !important;
`;

export const Wrapper = styled.div<{ error: boolean }>`
  .MuiInput-root {
    width: 100%;
    padding: 0.8rem 3rem 0.8rem 2rem;
    font-size: 1.4rem;
    outline: none;
    background-color: #ffffff;
    border-radius: 0.8rem;
    border: 1px solid #e0e0e0;
    color: #28293d;
    box-sizing: border-box;
    position: relative;
    white-space: pre-wrap;
    max-width: 32rem;

    &::placeholder {
      color: #8f90a6;
    }

    &:focus + .underline {
      background: #034376;
      width: 100%;
    }

    & + .underline {
      content: "";
      width: 0;
      height: 2px;
      transition: all 0.1s;
      position: absolute;
      background: #d2d2d2;
      bottom: 0;
      left: 0;
      right: 0;
    }

    ${(props) =>
      props.error &&
      css`
        &:focus + .underline {
          background: red;
          width: 100%;
        }

        border-bottom: 1px solid red;
      `};
  }

  .MuiInput-underline:before,
  .MuiInput-underline:after {
    all: unset;
  }
  .MuiSelect-select:focus {
    background: unset;
  }
  .MuiSelect-select.MuiSelect-select {
    padding: unset;
  }
`;
