import React, { useState } from "react";
import Wrapper from "./Style";

type ITabs = {
  defaultTab?: string;
  children: Function;
  variant?: string;
  tabs: {
    name: string; // button text
    type: string; // variable to set active
    style?: any;
  }[];
};

const Navigation = ({
  defaultTab = "",
  children,
  tabs = [],
  variant,
}: ITabs) => {
  if (typeof children !== "function")
    throw new Error("Tabs child must be a function");
  const [activeTab, setActiveTab] = useState<string>(
    defaultTab || tabs[0].type
  );
  const changeTabeHanlder = (active: string) => setActiveTab(active);
  return (
    <Wrapper variant={variant}>
      <div className="tabs">
        {tabs.map(({ name, type, style }) => {
          return (
            <button
              type="button"
              style={style}
              className={type === activeTab ? "active" : ""}
              key={type}
              onClick={() => changeTabeHanlder(type)}
            >
              {name}
            </button>
          );
        })}
      </div>
      <div className="container">{children({ activeTab })}</div>
    </Wrapper>
  );
};

export default Navigation;
