import React from "react";
import { v4 as uuid } from "uuid";
import styled from "styled-components";
import warningIcon from "../../../assets/landing/warning.png";

const Wrapper = styled.div`
  display: flex;
  align-items: start;
  column-gap: 12px;
  padding: 12px;
  border-radius: 14px;
  border: 1px solid var(--color-orange-3);
  & ul {
    display: flex;
    flex-direction: column;
    row-gap: 2.6rem;
    list-style: none;
    & li p {
      color: var(--color-orange-1);
      font-size: 12px;
    }
  }
`;

const Note = ({ content = [] }) => {
  return (
    <Wrapper className="notification">
      <img src={warningIcon} alt="warning" />
      <ul>
        {content.map((item) => {
          return (
            <li key={uuid()}>
              <p>{item}</p>
            </li>
          );
        })}
      </ul>
    </Wrapper>
  );
};

export default Note;
