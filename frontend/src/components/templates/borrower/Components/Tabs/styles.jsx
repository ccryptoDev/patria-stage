import styled from "styled-components";

export const TabsWrapper = styled.div`
  display: flex;
  align-items: center;
  column-gap: 8px;
  .tabs {
    &-button {
      background: linear-gradient(
          0deg,
          rgba(0, 0, 0, 0.05),
          rgba(0, 0, 0, 0.05)
        ),
        #f9f9f9;
      color: var(--color-grey);
      font-weight: 600;
      font-size: 14px;
      border-radius: 8px;
      padding: 10px 12px;
      text-decoration: none;
      cursor: pointer;
    }
  }
  .active {
    color: var(--color-primary);
  }
`;

export const TabsMobileWrapper = styled.div`
  position: relative;
  z-index: 100;
  .dropmenu {
    position: absolute;
    border-radius: 4px;
    width: 100%;
    opacity: 0;
    visibility: hidden;
    display: none;
    transition: all 0.3s;
    background: #fff;
    box-shadow: 0px 0.5px 5px rgba(0, 0, 0, 0.039),
      0px 3.75px 11px rgba(0, 0, 0, 0.19);
    border-radius: 4px;
    padding: 8px;
    & .tabs-button {
      padding: 8px;
      display: block;
      text-decoration: none;
      color: var(--color-grey);
      font-weight: 600;
    }
  }
  button {
    display: flex;
    align-items: center;
    justify-content: center;
    column-gap: 12px;
    width: 100%;
    padding: 10px;
    color: #1e84be;
    & .chevron-icon {
      transform: rotate(180deg);
    }
    & span {
      font-weight: 600;
      font-size: 14px;
    }
    background: linear-gradient(0deg, rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.1)),
      #f9f9f9;
    border-radius: 8px;
    border: none;
  }

  button:hover + .dropmenu,
  .dropmenu:hover {
    opacity: 1;
    visibility: visible;
    display: block;
  }
`;
