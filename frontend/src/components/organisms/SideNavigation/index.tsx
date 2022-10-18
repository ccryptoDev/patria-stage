import React from "react";
import Wrapper, { NavList } from "./Styles";
import NavItem, {
  INavButtonProps,
} from "../../molecules/Buttons/NavigationButton";

const SideNav = ({ navItems }: { navItems: INavButtonProps[] }) => {
  return (
    <Wrapper className="layout-sidenav">
      <NavList className="sidenav-menu">
        {navItems.map((item: INavButtonProps) => (
          <NavItem key={item.title} item={item} />
        ))}
      </NavList>
    </Wrapper>
  );
};

export default SideNav;
