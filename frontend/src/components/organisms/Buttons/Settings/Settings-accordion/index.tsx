import React, { useState } from "react";
import styled from "styled-components";
import SettingsIcon from "../../../../atoms/Icons/SvgIcons/Settings";
import { Button as ItemWrapper, NavList } from "../../../SideNavigation/Styles";
import Accordion from "../../../../molecules/DropDowns/Accordion-Mui";
import Button from "../../../../molecules/Buttons/NavigationButton";
import { Chevron } from "../../../../atoms/Icons/SvgIcons/Chevron";
import { renderSettings } from "../config";

const Wrapper = styled(ItemWrapper)`
  .chevron-icon {
    transform: rotate(90deg);
    transition: all 0.2s;
  }
  .settings-open {
    & .chevron-icon {
      transform: rotate(-90deg);
    }
  }
`;

const List = styled(NavList)`
  padding: 12px 0 0 50px;
`;

const SettingsBtn = () => {
  const [open, setOpen] = useState(false);

  const Btn = (
    <Wrapper className="listItem">
      <button
        className={`content ${open ? "settings-open" : ""}`}
        type="button"
        onClick={() => setOpen(!open)}
      >
        <div className="listItem-left">
          <SettingsIcon />
          Settings
        </div>
        <Chevron />
      </button>
    </Wrapper>
  );

  const Content = (
    <List>
      {renderSettings.map((item) => (
        <Button key={item.title} item={item} />
      ))}
    </List>
  );

  return <Accordion button={Btn} content={Content} expanded={open} />;
};

export default SettingsBtn;
