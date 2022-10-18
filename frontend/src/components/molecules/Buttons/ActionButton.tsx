import React from "react";
import styled from "styled-components";
import EditIcon from "../../atoms/Icons/SvgIcons/Edit";
import { Chevron } from "../../atoms/Icons/SvgIcons/Chevron";
import SaveIcon from "../../atoms/Icons/SvgIcons/Ok";
import CancelIcon from "../../atoms/Icons/SvgIcons/Not";
import Logout from "../../atoms/Icons/SvgIcons/Logout";
import BellIcon from "../../atoms/Icons/SvgIcons/Bell";
import Settings from "../../atoms/Icons/SvgIcons/Settings";
import BurgerMenu from "../../atoms/Icons/SvgIcons/BurgerMenu";
import PrintIcon from "../../atoms/Icons/SvgIcons/Print";

const Button = styled.button`
  padding: 8px;
  border-radius: 8px;
  border: 1px solid var(--color-secondary-2);
  background: #fff;
  width: 42px;
  height: 42px;
  display: flex;
  align-items: center;
  justify-content: center;

  & .chevron-icon {
    transform: rotate(180deg);
    font-weight: 700;
  }
`;

const ActionButton = ({
  onClick,
  type,
}: {
  onClick?: any;
  type:
    | "goback"
    | "edit"
    | "cancel"
    | "save"
    | "logout"
    | "notifications"
    | "settings"
    | "menu"
    | "print";
}) => {
  const renderIcon = () => {
    if (type === "edit") {
      return <EditIcon color="var(--color-primary)" />;
    }
    if (type === "goback") {
      return <Chevron color="var(--color-primary)" />;
    }
    if (type === "save") {
      return <SaveIcon color="var(--color-primary)" />;
    }

    if (type === "cancel") {
      return <CancelIcon color="var(--color-primary)" />;
    }
    if (type === "logout") {
      return <Logout color="var(--color-primary)" />;
    }
    if (type === "notifications") {
      return <BellIcon color="var(--color-primary)" />;
    }
    if (type === "settings") {
      return <Settings color="var(--color-primary)" />;
    }
    if (type === "menu") {
      return <BurgerMenu color="var(--color-primary)" />;
    }
    if (type === "print") {
      return <PrintIcon />;
    }
    return <></>;
  };
  return (
    <Button type="button" onClick={onClick} className="action-button">
      {renderIcon()}
    </Button>
  );
};

export default ActionButton;
