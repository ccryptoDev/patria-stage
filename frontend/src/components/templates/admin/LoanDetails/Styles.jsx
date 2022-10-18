import styled from "styled-components";

export const NavBarWrapper = styled.div`
  display: flex;
  padding: 1rem 1rem 0;
  border-bottom: 1px solid #dee2e6;

  button {
    padding: 0.8rem 1.6rem;
    border: 1px solid transparent;
    background: transparent;
    color: #034376;
    font-size: 1.6rem;
    transition: all 0.1s;
    margin-bottom: -1px;
  }

  .active,
  & button:hover {
    border-color: #dee2e6 #dee2e6 #ffffff;
    border-radius: 5px 5px 0 0;
  }

  & button:hover {
    color: #6895b9;
  }

  .active,
  .active:hover {
    color: #495057;
    border-bottom: 1px solid #ffffff;
  }
`;

export const TabContentWrapper = styled.div``;
