import React from "react";
import LogoutIcon from "../../../atoms/Icons/SvgIcons/Logout";
import { Button as ItemWrapper } from "../Styles";

const LogoutBtn = () => {
  const logoutHandler = () => {
    console.log("logout");
  };
  return (
    <ItemWrapper className="listItem">
      <button className="content" type="button" onClick={logoutHandler}>
        <div className="listItem-left">
          <LogoutIcon />
          Logout
        </div>
      </button>
    </ItemWrapper>
  );
};

export default LogoutBtn;
