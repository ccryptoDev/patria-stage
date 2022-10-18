import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import styled from "styled-components";
import NavButton from "../../../../molecules/Buttons/NavigationButton";
import Button from "../../../../molecules/Buttons/ActionButton";
import { renderSettings } from "../config";
import Not from "../../../../atoms/Icons/SvgIcons/Not";

const Wrapper = styled.div`
  position: relative;
  .menu {
    position: absolute;
    width: 325px;
    background: #fff;
    border-radius: 14px;
    padding: 16px;
    z-index: 900;
    box-shadow: 0px 4px 18px rgba(0, 0, 0, 0.12);
    list-style: none;
    display: flex;
    flex-direction: column;
    row-gap: 16px;
    align-items: flex-end;
    transform: translate(-95%, -25px);

    & .btn-close {
      background: none;
      border: none;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }
`;

const SettingsButton = () => {
  const [open, setOpen] = useState(false);
  const history = useHistory();
  useEffect(() => {
    if (open) {
      setOpen(false);
    }
  }, [history?.location?.pathname]);

  return (
    <Wrapper>
      <Button type="settings" onClick={() => setOpen(!open)} />
      {open ? (
        <div className="menu">
          <button
            type="button"
            className="btn-close"
            onClick={() => setOpen(false)}
          >
            <Not color="#222222" size="20px" />
          </button>
          {renderSettings.map((item) => (
            <NavButton
              activeRoute={history?.location?.pathname}
              key={item.title}
              item={item}
            />
          ))}
        </div>
      ) : (
        ""
      )}
    </Wrapper>
  );
};

export default SettingsButton;
