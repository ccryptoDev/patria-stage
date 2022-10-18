import React from "react";
import styled from "styled-components";
import Card from "../../components/templates/admin/StatusCard";

const Wrapper = styled.div`
  width: 30rem;
  button {
    min-width: 12rem;
  }
`;

export default {
  title: "Example/Admin/Elements",
  component: Card,
};

export const StatusCard = () => (
  <Wrapper>
    <Card count="108" heading="denied" loading />
  </Wrapper>
);
