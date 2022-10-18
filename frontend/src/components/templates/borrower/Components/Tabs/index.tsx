import React from "react";
import styled from "styled-components";
import { routes } from "../../../../../routes/Borrower/routes";
import Tabs from "./Tabs";
import TabsMobile from "./MobileTabs";

const Container = styled.div`
  padding: 16px;
  background: #f9f9f9;
  border-bottom: 1px solid var(--color-border);
  .tabs-wrapper-mobile {
    display: none;
  }
  @media screen and (max-width: 767px) {
    .tabs-wrapper-mobile {
      display: block;
    }
    .tabs-wrapper-lg {
      display: none;
    }
  }
`;

const renderTabs = [
  { route: routes.USER_INFORMATION, text: "User Information" },
  { route: routes.DOCUMENT_CENTER, text: "Document Center" },
  { route: routes.LOAN_INFORMATION, text: "Loan Information" },
];

const TabsComponent = ({
  activeRoute,
  tabName,
}: {
  activeRoute: string;
  tabName: string;
}) => {
  return (
    <Container className="tabs-container">
      <Tabs activeRoute={activeRoute} tabs={renderTabs} />
      <TabsMobile
        activeRoute={activeRoute}
        tabs={renderTabs}
        tabName={tabName}
      />
    </Container>
  );
};

export default TabsComponent;
