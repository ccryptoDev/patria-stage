import React from "react";
import { TabContentWrapper as Wrapper } from "./Styles";
import { types } from "./config";
import Account from "./Tabs/Accounts/Acounts";
import Employment from "./Tabs/Employment";
import CreditReport from "./Tabs/Credit-report/Credit-report";
import DocumentCenter from "./Tabs/Document-center/Document-center";
import PaymentSchedule from "./Tabs/Payment-schedule";
import RulesDetails from "./Tabs/Rules-details";
import UserInfo from "./Tabs/UserInfo/UserInfo";
import Comments from "./Tabs/Comments";

const renderComponent = ({ activeTab, state, fetchLoanData, docsData }) => {
  const props = { state, fetchLoanData, docsData };
  switch (activeTab) {
    case types.ACCOUNTS:
      return <Account {...props} />;
    case types.EMPLOYMENT:
      return <Employment {...props} />; //Argyle
    case types.CREDIT_REPORT:
      return <CreditReport {...props} />;
    case types.DOCUMENT_CENTER:
      return <DocumentCenter {...props} />;
    case types.COMMENTS:
      return <Comments {...props} />;
    case types.PAYMENT_SCHEDULE:
      return <PaymentSchedule {...props} />;
    case types.REULES_DETAILS:
      return <RulesDetails {...props} />;
    case types.USER_INFO:
      return <UserInfo {...props} />;
    default:
      return <></>;
  }
};

const RenderTab = ({ activeTab, state, fetchLoanData, docsData }) => {
  return (
    <Wrapper>
      {renderComponent({ activeTab, state, fetchLoanData, docsData })}
    </Wrapper>
  );
};

export default RenderTab;
