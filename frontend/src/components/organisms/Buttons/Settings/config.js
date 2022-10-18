import React from "react";
import { routes } from "../../../../routes/Admin/routes";
import Admin from "../../../atoms/Icons/SvgIcons/SideNav/person";
import Lock from "../../../atoms/Icons/SvgIcons/Lock";
import Settings from "../../../atoms/Icons/SvgIcons/Settings";

export const renderSettings = [
  {
    route: routes.MANAGE_ADMINS,
    title: "admin manage users",
    icon: <Admin />,
    arrow: false,
  },
  {
    route: routes.MANAGE_LEADS,
    title: "manage leads",
    icon: <Settings color="#58595B" />,
    arrow: false,
  },
  {
    route: routes.SETTINGS_CREDENTIALS,
    title: "credentials settings",
    icon: <Lock />,
    arrow: false,
  },
];
