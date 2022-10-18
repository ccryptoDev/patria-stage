import styled from "styled-components";
import MenuItem from "@material-ui/core/MenuItem";
import Popper from "@material-ui/core/Popper";

export const Wrapper = styled.div`
  .MuiButtonBase-root {
    border-radius: 50%;
    min-width: 4rem;
    &:hover {
      border-radius: 50%;
      background: #fff;
    }
  }

  .avatar {
    width: 4.6rem;
    height: 4.6rem;
    display: flex;
    overflow: hidden;
    position: relative;
    font-size: 1.2rem;
    align-items: center;
    flex-shrink: 0;
    font-family: "Spartan", "Helvetica", "Arial", sans-serif;
    line-height: 1;
    user-select: none;
    border-radius: 50%;
    justify-content: center;
    background: #fff;
    padding: 3px;
    box-sizing: border-box;
    border-radius: 50%;
    border: 1px solid var(--color-border);

    & img {
      color: transparent;
      width: 100%;
      height: 100%;
      object-fit: cover;
      text-align: center;
      text-indent: 10000px;
      border-radius: 50%;
    }
  }
`;

// dropdown li element
export const ListItem = styled(MenuItem)`
  & .item-wrapper a,
  & .item-wrapper button {
    display: flex;
    align-items: center;
    text-decoration: none;
    color: #000;
    background: transparent;
    height: 3.2rem;
    border: none;
    padding: 0;
    line-height: 2rem;
    font-size: 1.4rem;
  }

  & svg {
    margin-right: 5px;
  }

  & button svg {
    margin-left: 2px;
  }

  & .item-wrapper .MuiListItemText-root .MuiTypography-body1 {
    font-size: 1.4rem;
    font-weight: normal;
  }
`;

export const DropDown = styled(Popper)`
  background: #fff;
  z-index: 999;

  /* style the dropdown li element */
  .MuiButtonBase-root {
    border-radius: 0;
    transition: all 0.1s;
  }

  .MuiButtonBase-root:hover {
    background: var(--light-02);
    border-radius: 0;
  }
`;
