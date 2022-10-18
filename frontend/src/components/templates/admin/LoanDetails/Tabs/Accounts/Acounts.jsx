import React from "react";
import styled from "styled-components";
import Modal from "../../../../../organisms/Modal/Regular/ModalAndTriggerButton";
import TriggerButton from "../../../../../atoms/Buttons/TriggerModal/Trigger-button-default";
import AddBankAccountForm from "../../../Forms/Accounts/AddBankAccount/AddBankAccount";
import Table from "./Table";
import { H2 as Heading } from "../../../../../atoms/Typography";

const Wrapper = styled.div`
  .heading-wrapper {
    padding: 1.3rem 1rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
`;

const Accounts = ({ state, fetchLoanData }) => {
  return (
    <Wrapper>
      <div className="heading-wrapper">
        <Heading>Accounts</Heading>
        <Modal
          button={<TriggerButton>Add Bank Account</TriggerButton>}
          cb={fetchLoanData}
          state={state}
          modalContent={AddBankAccountForm}
          modalTitle=""
        />
      </div>
      {state && state?.screenTracking?.user?.bankAccounts?.length > 0 ? (
        <Table
          rows={state.screenTracking.user.bankAccounts}
          thead={["Bank Name", "Account Number", "Routing Number"]}
        />
      ) : (
        ""
      )}
    </Wrapper>
  );
};

export default Accounts;
