import React, { useState } from "react";
import { useHistory, Redirect } from "react-router-dom";
import styled from "styled-components";
import Button from "../../../components/molecules/Buttons/ActionButton";
import { routes } from "../../../routes/Admin/routes";
import StartApplicationBtn from "../../../components/atoms/Buttons/LinkButton";
import SettingsButton from "../../../components/organisms/Buttons/Settings/Settings-popup";

const Wrapper = styled.nav`
  display: flex;
  align-items: center;
  column-gap: 12px;
`;

const Navigation = () => {
  const history = useHistory();
  const [isLogout, setIsLogout] = useState(false);

  const logoutHandler = () => {
    // eslint-disable-next-line no-undef
    localStorage.clear();
    setIsLogout(true);
    // history.push(routes.LOGIN);
  };

  if (isLogout) {
    return <Redirect to={routes.LOGIN} />;
  }
  return (
    <Wrapper>
      <SettingsButton />
      <Button type="notifications" />
      <StartApplicationBtn to={routes.NOTIFICATIONS}>
        Start Application
      </StartApplicationBtn>
      <Button type="logout" onClick={logoutHandler} />
    </Wrapper>
  );
};

export default Navigation;
