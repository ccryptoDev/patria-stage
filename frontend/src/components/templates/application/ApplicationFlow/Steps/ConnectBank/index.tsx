import React, { useState } from "react";
import styled from "styled-components";
import Auto from "./Auto";
import Manual from "./Manual";
import Main from "./Main";
import { logoes } from "./logoes";
import Container from "../../styles";

const FormWrapper = styled(Container)`
  .note {
    font-weight: 400;
    font-size: 14px;
    line-height: 16px;
    margin-bottom: 12px;
  }

  .img-wrapper {
    margin-right: 40px;
  }
`;

const tabType = {
  AUTO: "AUTO",
  MANUAL: "MANUAL",
};

const renderScreen = (formProps: any, tab: any) => {
  switch (tab) {
    case tabType.AUTO:
      return <Auto {...formProps} />;
    case tabType.MANUAL:
      return <Manual {...formProps} />;
    default:
      return <Main {...formProps} />;
  }
};

const Component = () => {
  const [activeTab, setActiveTab] = useState("");
  const [selectedBank, setSelectedBank] = useState(logoes[4]);

  const formProps = {
    setActiveTab: (name: string) => setActiveTab(name),
    setSelectedBank,
    selectedBank,
    tabType,
  };

  return <FormWrapper>{renderScreen(formProps, activeTab)}</FormWrapper>;
};

export default Component;
