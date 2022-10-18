import React from "react";
import styled from "styled-components";
import PaymentScheduleTable from "./Table";
import Modal from "../../Modal/Regular/ModalAndTriggerButton";
import TriggerButton from "../../../atoms/Buttons/TriggerModal/Trigger-button-default";
import Form from "./MakePayment/Modal";
import { H2 as Heading } from "../../../atoms/Typography";

const HeadingWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.3rem 1rem;
`;

const PaymentSchedule = ({ paymentManagement, cb, accounts }) => {
  const unpaiedItems =
    paymentManagement?.paymentSchedule.filter(
      (item) => item.status !== "paid"
    ) || [];
  const showButton = unpaiedItems?.length > 0;
  return (
    <div>
      <HeadingWrapper>
        <Heading>Loan #{paymentManagement.loanReference}</Heading>
        {showButton ? (
          <Modal
            button={<TriggerButton>Make Payment</TriggerButton>}
            state={{ paymentManagement, accounts }}
            cb={cb}
            modalContent={Form}
            modalTitle="Make Payment"
          />
        ) : (
          ""
        )}
      </HeadingWrapper>
      {paymentManagement && paymentManagement?.paymentSchedule?.length > 0 ? (
        <PaymentScheduleTable rows={paymentManagement?.paymentSchedule} />
      ) : (
        ""
      )}
    </div>
  );
};

export default PaymentSchedule;
