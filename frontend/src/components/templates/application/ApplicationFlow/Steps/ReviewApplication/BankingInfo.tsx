import React, { useState, useEffect } from "react";
import styled from "styled-components";
import Header from "./Header";
import { BankLogo } from "../ConnectBank/styles";
import { logoes } from "../ConnectBank/logoes";

const Wrapper = styled.div`
  margin-bottom: 24px;
  .bank-logo {
    width: 100%;
    max-width: 100%;
    cursor: auto;
  }
`;

const BankingInfo = ({
  goToStep,
  bankName,
}: {
  goToStep: any;
  bankName: string;
}) => {
  const [selectedBank, setSelectedBank] = useState(logoes[1]);
  const setBankLogo = () => {
    const logo = logoes.find((bank) => bank.name === bankName);
    if (logo) setSelectedBank(logo);
  };

  useEffect(() => {
    if (bankName) {
      setBankLogo();
    }
  }, [bankName]);

  return (
    <Wrapper>
      <Header
        onEdit={() => goToStep(3)}
        edit={false}
        heading="Banking Information"
        enableEditing={false}
      />
      {selectedBank ? (
        <BankLogo className="bank-logo">
          <img src={selectedBank.img} alt={selectedBank?.name} />
        </BankLogo>
      ) : (
        ""
      )}
    </Wrapper>
  );
};

export default BankingInfo;
