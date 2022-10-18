import styled from "styled-components";

export default styled.aside`
  background-color: #fff;
  color: #fff;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  overflow: hidden;
  box-sizing: border-box;
  border-right: 1px solid var(--color-border);
  border-top: 1px solid var(--color-border);
  width: 340px;

  @media (max-width: 510px) {
    display: none;
  }
`;

export const NavList = styled.ul`
  list-style: none;
  padding: 24px;
  margin: 0;
  display: flex;
  flex-direction: column;
  row-gap: 12px;
`;

export const Button = styled.li`
  width: 100%;
  & a:hover,
  button:hover,
  .active {
    background: var(--color-blue-dark);
    color: #fff;

    & svg path {
      fill: #fff;
    }
  }

  button {
    background: transparent;
    width: 100%;
  }
  a,
  button {
    padding: 18px;
    border-radius: 8px;
    border: 1px solid var(--color-border);
    font-size: 12px;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: space-between;
    text-decoration: none;
    transition: all 0.1s;
    color: var(--color-grey);

    & .listItem-left {
      display: flex;
      align-items: center;
      column-gap: 20px;
      text-transform: uppercase;
      font-size: 12px;
      font-weight: 700;
      line-height: 14px;
    }
  }
`;
