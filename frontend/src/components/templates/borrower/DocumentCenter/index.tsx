import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { connect } from "react-redux";
import Tabs from "../Components/Tabs";
import Document from "./Document";
import Header from "../Components/Header";
import { getBorrowerAgreements } from "../../../../api/borrower";
import { useUserData } from "../../../../contexts/user";

const Wrapper = styled.div`
  .fields-layout {
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-gap: 12px;
    padding: 16px;
  }

  @media screen and (max-width: 650px) {
    .fields-layout {
      grid-template-columns: 1fr;
    }
  }
`;

const mockData = [
  { name: "SMS Policy", size: 0.12 },
  { name: "E-Signature", size: 0.17 },
  { name: "Electronic funds transfer authorization", size: 0.14 },
  { name: "Retail installment contract", size: 0.21 },
  { name: "Contact", size: 0.21 },
];

interface PropsType {
  route: string;
}
const UserInformation = (props: PropsType) => {
  const [documents, setDocuments] = useState<any[]>([]);
  const { route } = props;
  const { user: borrowerData, fetchUser, loading }: any = useUserData();

  async function getDocuments() {
    const result = await getBorrowerAgreements(borrowerData?.id);
    if (result.ok) {
      setDocuments(result.data);
    }
  }
  useEffect(() => {
    fetchUser();
  }, []);

  useEffect(() => {
    if (borrowerData && borrowerData?.user) {
      getDocuments();
    }
  }, [borrowerData]);

  return (
    <Wrapper>
      <Tabs activeRoute={route} tabName="Document Center" />
      <Header>Document Center</Header>
      <div className="fields-layout">
        {documents.length
          ? documents.map(({ name, size, id }) => {
              return <Document key={name} name={name} size={size} id={id} />;
            })
          : ""}
      </div>
    </Wrapper>
  );
};

export default UserInformation;
