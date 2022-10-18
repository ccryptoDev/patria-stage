import React from "react";
import styled from "styled-components";
import Button, {
  INavButtonProps,
} from "../../../molecules/Buttons/NavigationButton";
import LogoutBtn from "./LogoutButton";
import Settings from "../../Buttons/Settings/Settings-accordion";
import Bell from "../../../atoms/Icons/SvgIcons/Bell";
import { routes } from "../../../../routes/Admin/routes";
import StartApplication from "../../../atoms/Buttons/LinkButton";

const Wrapper = styled.aside`
  border-right: 1px solid var(--color-border);
  border-top: 1px solid var(--color-border);
  .sidenav-menu {
    list-style: none;
    padding: 24px;
    display: flex;
    flex-direction: column;
    row-gap: 12px;
  }
`;

const SideNav = ({ items }: { items: INavButtonProps[] }) => {
  return (
    <Wrapper className="sidenav">
      <ul className="sidenav-menu">
        {items.map((item: any) => (
          <Button key={item.title} item={item} />
        ))}
        <Settings />
        <Button
          item={{
            title: "Notifications",
            icon: <Bell />,
            route: routes.NOTIFICATIONS,
          }}
        />
        <LogoutBtn />
        <StartApplication to={routes.START_APPLICATION}>
          Start Application
        </StartApplication>
      </ul>
    </Wrapper>
  );
};

export default SideNav;
