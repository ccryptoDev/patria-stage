import React from "react";
import Tabs from "../../components/organisms/Tabs/Custom";

export default {
  title: "Example/Navigation/navTabs",
  component: Tabs,
};

const types = {
  tabOne: "tab one",
  tabTwo: "tab two",
  tabThree: "tab three",
};

const buttons = [
  { name: "Tab one", type: types.tabOne },
  { name: "Tab two", type: types.tabTwo },
  { name: "Tab three", type: types.tabThree },
];

const Conainer = ({ type }) => {
  switch (type) {
    case types.tabOne:
      return <div>{types.tabOne}</div>;
    case types.tabTwo:
      return <div> {types.tabTwo}</div>;
    case types.tabThree:
      return <div>{types.tabThree}</div>;
    default:
      return <></>;
  }
};

export const Nav = (args) => (
  <Tabs tabs={buttons} variant="agents-portal-main">
    {({ activeTab }) => {
      return (
        <div style={{ padding: "2rem 0" }}>
          <Conainer type={activeTab} />
        </div>
      );
    }}
  </Tabs>
);
