import React, { useEffect } from "react";
import styled from "styled-components";
import Tabs from "../Components/Tabs";
import Header from "../Components/Header";
import Section from "./Accordion";
import Financing from "./Financing";
import FinancingDetails from "./FinancingDetails";
import PaymentSchedule from "./PaymentSchedule";
import { useUserData } from "../../../../contexts/user";

const Wrapper = styled.div`
  .content {
    padding: 16px;
  }

  .section:not(:last-child) {
    margin-bottom: 12px;
  }
`;

interface PropsType {
  route: string;
}
const UserInformation = (props: PropsType) => {
  const { route } = props;
  const { user: borrowerData, fetchUser, loading }: any = useUserData();

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <Wrapper>
      <Tabs activeRoute={route} tabName="Loan Information" />
      <Header>Loan Information</Header>
      <div className="content">
        <Section title="Financing">
          <Financing borrowerData={borrowerData} />
        </Section>
        <Section title="Financing Details">
          <FinancingDetails borrowerData={borrowerData} />
        </Section>
        <Section title="Payment Schedule">
          <PaymentSchedule />
        </Section>
      </div>
    </Wrapper>
  );
};

export default UserInformation;
