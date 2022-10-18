import React from "react";
import styled from "styled-components";

const Wrapper = styled.div`
  padding: 50px 15px;
  .heading {
    margin-bottom: 50px;
    text-align: left;
    font-size: 32px;
    font-weight: 700;
  }

  .section {
    &-wrapper {
      border: 1px solid #b7b7b7;
      box-sizing: border-box;
      border-radius: 14px;
      background: #fff;
      overflow: hidden;
    }
  }

  @media screen and (max-width: 767px) {
    & {
      padding: 16px;
    }
    .heading {
      margin-bottom: 24px;
    }
  }
`;

const Main = ({ children }: { children: any }) => {
  return (
    <Wrapper>
      <h2 className="heading">Personal customer portal</h2>
      <section className="section-wrapper">{children}</section>
    </Wrapper>
  );
};

export default Main;
