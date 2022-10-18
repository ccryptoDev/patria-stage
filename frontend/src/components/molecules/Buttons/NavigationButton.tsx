import React from "react";
import { Link, useHistory } from "react-router-dom";
import { Button } from "../../organisms/SideNavigation/Styles";
import { Chevron } from "../../atoms/Icons/SvgIcons/Chevron";

export type INavButtonProps = {
  route: string;
  icon?: any;
  title: string;
  arrow?: boolean;
};

const NavItem = ({
  item: { route, icon, title, arrow = false },
}: {
  item: INavButtonProps;
}) => {
  const history = useHistory();
  const isActive = history?.location.pathname === route;
  return (
    <Button key={route} className="listItem">
      <Link to={route} className={`${isActive ? "active" : ""}`}>
        <div className="listItem-left">
          {icon}
          {title}
        </div>
        {arrow ? <Chevron /> : ""}
      </Link>
    </Button>
  );
};

export default NavItem;
