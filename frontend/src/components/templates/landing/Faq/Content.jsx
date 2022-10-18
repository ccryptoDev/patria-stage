import React from "react";
import { v4 as uuid } from "uuid";
import styled from "styled-components";
import Container from "../../../atoms/Container";
import { H5 } from "../../../atoms/Typography";
import { list } from "./Text";

const Wrapper = styled.section`
  padding: 6rem 0;
  .list {
    & > li {
      padding: 4.8rem 0;
      &:not(:first-child) {
        border-top: 1px solid var(--color-secondary-2);
      }

      &:first-child {
        padding-top: 0;
      }

      &:last-child {
        padding-bottom: 0;
      }

      & h5,
      & h5 span {
        color: var(--color-blue-1);
        font-weight: 700;
        font-size: 2rem;
        margin-bottom: 2.4rem;
      }

      & ul {
        display: flex;
        flex-direction: column;
        row-gap: 1.2rem;
      }

      & .minimin-requirements-list {
        margin-left: 2rem;
        list-style: disc;
      }
    }
  }

  .highlighted {
    background: var(--color-orange-3);
  }
`;

const Section = ({ regexp }) => {
  return (
    <Wrapper>
      <Container>
        <ul className="list">
          {list(regexp).map(({ title, content }) => {
            return (
              <li key={uuid()}>
                <H5>{title}</H5>
                {content}
              </li>
            );
          })}
        </ul>
      </Container>
    </Wrapper>
  );
};

export default Section;
