import React from "react";
import PaymentScheduleTable from "../../../../../organisms/Table/PaymentSchedule";

const PaymentSchedule = ({ state, fetchLoanData }) => {
  return (
    <div>
      {state && state?.paymentManagement?.paymentSchedule?.length > 0 ? (
        <PaymentScheduleTable
          accounts={state?.screenTracking?.user?.bankAccounts}
          paymentManagement={state.paymentManagement}
          cb={fetchLoanData}
          heading="Payment Schedule Information"
        />
      ) : (
        ""
      )}
    </div>
  );
};

export default PaymentSchedule;
