import React from "react";
import { buttons } from "./config";
import { NavBarWrapper as Wrapper } from "./Styles";

const NavBar = ({ getActiveTabHanler, activeTab }) => {
  const clickHandler = (type) => {
    if (type) {
      getActiveTabHanler(type);
    }
  };
  return (
    <Wrapper>
      {buttons.map(({ name, type, style }) => {
        return (
          <button
            type="button"
            style={style}
            className={type === activeTab ? "active" : ""}
            key={type}
            onClick={() => clickHandler(type)}
          >
            {name}
          </button>
        );
      })}
    </Wrapper>
  );
};

export default NavBar;
