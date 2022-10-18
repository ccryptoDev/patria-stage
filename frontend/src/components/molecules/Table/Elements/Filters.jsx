import React from "react";
import styled from "styled-components";

const Wrapper = styled.div`
  display: flex;

  button {
    background: transparent;
    cursor: pointer;
    font-size: 1.8rem;
    color: #444444;
    border: none;
    padding: 0px 2rem;
    &:not(:first-child) {
      border-left: 2px solid #c0c0c0;
    }
  }

  .active {
    color: #034376;
  }
`;
const Filters = ({ items, filterHandler }) => {
  return (
    <Wrapper>
      {items
        ? items.map((item) => (
            <button
              key={item.status}
              className={item.active ? "active" : ""}
              type="button"
              onClick={() => filterHandler(item.name)}
            >
              {item.name}
            </button>
          ))
        : ""}
    </Wrapper>
  );
};

export default Filters;
