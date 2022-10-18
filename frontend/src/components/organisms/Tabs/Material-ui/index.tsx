import React from "react";
import styled from "styled-components";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";

interface ITab {
  value: string;
  button: any;
}

// fix styles that conflict with another mui components
const TabsWrapper = styled.div`
  & .MuiTabs-root .MuiButtonBase-root.MuiTab-root {
    min-height: 48px;
    text-transform: capitalize;
  }
`;

const BasicTabs = ({ buttons, onChange, activeTab, scrollable }: { buttons: ITab[]; onChange: any; activeTab: string; scrollable?: boolean }) => {
  const active = buttons.findIndex((item: ITab) => item.value === activeTab);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    onChange(buttons[newValue].value);
  };

  return (
    <TabsWrapper>
      <Tabs value={active} onChange={handleChange} aria-label="basic tabs example" variant={scrollable ? "scrollable" : "standard"}>
        {buttons.map((tab: ITab) => (
          <Tab label={tab.button} key={tab.value} />
        ))}
      </Tabs>
    </TabsWrapper>
  );
};

export default BasicTabs;
