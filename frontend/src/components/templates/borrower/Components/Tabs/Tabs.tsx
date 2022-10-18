import React from "react";
import { Link } from "react-router-dom";
import { TabsWrapper as Wrapper } from "./styles";

const Tabs = ({ activeRoute, tabs }: { activeRoute: string; tabs: any[] }) => {
  return (
    <Wrapper className="tabs tabs-wrapper-lg">
      {tabs.map(({ text, route }) => (
        <Link
          key={text}
          to={route}
          className={`${activeRoute === route ? "active" : ""} tabs-button`}
        >
          {text}
        </Link>
      ))}
    </Wrapper>
  );
};

export default Tabs;
