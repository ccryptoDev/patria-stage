import React from "react";
import styled from "styled-components";
import { H2, Note } from "../../../atoms/Typography";
import PageContainer from "../ApplicationFlow/styles";
import { useUserData } from "../../../../contexts/user";
import logo from "../../../../assets/svgs/logo-dark.svg";

const Container = styled(PageContainer)`
  margin: 5vh auto;
`;

const Wrapper = styled.div`
  .logo {
    margin: 0 auto 10px;
    display: block;
  }
  .note {
    margin-bottom: 24px;
    font-size: 16px;
    line-height: 1.5;
    text-align: center;
  }

  img {
    & svg path {
      fill: red !important;
    }
  }
`;

const DeclineMessage = () => {
  const { user, loading } = useUserData();

  if (loading && !user.isAuthorized) {
    return (
      <Container>
        <Wrapper>
          <H2>Loading...</H2>
        </Wrapper>
      </Container>
    );
  }
  return (
    <Container>
      <Wrapper className="wrapper">
        <img src={logo} alt="patria-lending" className="logo" />
        <Note className="note">
          We are processing your application and you will receive notification
          of your application status shortly.
        </Note>
      </Wrapper>
    </Container>
  );
};

export default DeclineMessage;
