import React from "react";
import styled from "styled-components";

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: 1.4rem;
  width: 100%;

  .label {
    margin-bottom: 5px;
  }

  select {
    width: 100%;
  }

  margin-bottom: 1rem;
`;

const Card = ({ value = "", options = [], onChange }) => {
  return (
    <Wrapper className="debit-card-select">
      <select value={value} onChange={onChange}>
        {options.length > 0 &&
          options.map((item) => {
            return (
              <option key={item.id} value={item.id}>
                {item.value}
              </option>
            );
          })}
      </select>
    </Wrapper>
  );
};

export default Card;
