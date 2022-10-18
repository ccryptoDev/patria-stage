import React from "react";
import styled from "styled-components";
import { formatCurrency, formatDate, parsePaymentStatus } from "../../../../../../../utils/formats";
import Modal from "../../../../../../organisms/Modal/Regular";
import TriggerButton from "../../../../../../atoms/Buttons/TriggerModal/Trigger-button-default";
import ChangeAmountForm from "../../../../Forms/PaymentSchedule/ChangeAmount/ChangeAmount";

const ChangeAmountWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

export const renderPaymentPreview = ({ updateTable, loanStartDate, principalAmount, interestApplied, loanTermCount = "--", maturityDate, minimumPaymentAmount, payOffAmount, nextPaymentSchedule, promoTermCount = "--", currentPaymentAmount, status = "--", promoStatus = "--" }) => [
  { label: "Financing Start Date", value: formatDate(loanStartDate) },
  { label: "Financing Amount", value: formatCurrency(principalAmount) },
  { label: "Payoff Amount", value: formatCurrency(payOffAmount) },
  { label: "APR", value: interestApplied ? `${interestApplied}%` : " --" },
  { label: "Financing Term", value: loanTermCount },
  { label: "Promo Term", value: promoTermCount },
  { label: "Financing Status", value: parsePaymentStatus(status) },
  { label: "Promo Status", value: promoStatus },
  { label: "Maturity Date", value: formatDate(maturityDate) },
  { label: "Next Payment Schedule Date", value: formatDate(nextPaymentSchedule) },
  { label: "Minimum payment amount", value: formatCurrency(minimumPaymentAmount) },
  {
    label: "Current payment amount",
    value: (
      <ChangeAmountWrapper>
        {formatCurrency(currentPaymentAmount)}
        <Modal button={<TriggerButton>Change Amount</TriggerButton>} modalContent={ChangeAmountForm} cb={updateTable} modalTitle="Change Payment Amount" />
      </ChangeAmountWrapper>
    ),
  },
];
