import React from "react";
import styled from "styled-components";
import Card from "../../components/atoms/Cards/Large";

const Wrapper = styled.div`
  .content {
    width: 100%;
  }

  .card {
    display: flex;
    padding: 24px;
  }

  @media screen and (max-width: 767px) {
    .card {
      display: block;
      padding: 12px;
    }
  }
`;

const Component = ({ children }: { children: any }) => {
  return (
    <Wrapper>
      <Card className="card">
        <div className="content">{children}</div>
      </Card>
    </Wrapper>
  );
};

export default Component;
