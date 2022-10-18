import React from "react";
import styled from "styled-components";
import Tabs from "../Components/Tabs";
import Form from "./Form";
import { mockPersonalIngoForm } from "./config";

const Wrapper = styled.div``;

const UserInformation = ({ route }: { route: string }) => {
  return (
    <Wrapper>
      <Tabs activeRoute={route} tabName="User Information" />
      <Form data={mockPersonalIngoForm} />
    </Wrapper>
  );
};

export default UserInformation;
