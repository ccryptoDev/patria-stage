import React from "react";
import ActiveContracts from "../../../atoms/Icons/SvgIcons/SideNav/folder-dot";
import DeniedApplications from "../../../atoms/Icons/SvgIcons/SideNav/folder-minus";
import Archived from "../../../atoms/Icons/SvgIcons/SideNav/folder-arrow-down";
import Completed from "../../../atoms/Icons/SvgIcons/SideNav/folder-check";
import Chargedoff from "../../../atoms/Icons/SvgIcons/SideNav/folder-slider";
import Settled from "../../../atoms/Icons/SvgIcons/SideNav/folder-dots";
import { routes } from "../../../../routes/Admin/routes";

const color = "#fff";
const {
  CONTRACTS_ACTIVE,
  APPLICATIONS_DENIED,
  APPLICATIONS_ARCHIVED,
  CONTRACTS_COMPLETED,
  APPLICATIONS_CHARGEDOFF,
  APPLICATIONS_SETTLED,
} = routes;

export const renderCubes = (applicationCount) => [
  {
    title: "Active Contracts",
    icon: <ActiveContracts color={color} />,
    color: "#58B69F",
    counter: applicationCount?.activeContracts || 0,
    link: CONTRACTS_ACTIVE,
  },
  {
    title: "Denied Applications",
    icon: <DeniedApplications color={color} />,
    color: "#E9727E",
    counter: applicationCount?.deniedContracts || 0,
    link: APPLICATIONS_DENIED,
  },
  {
    title: "Archived Open Applications",
    icon: <Archived color={color} />,
    color: "#CD88EC",
    counter: 0,
    link: APPLICATIONS_ARCHIVED,
  },
  {
    title: "Completed Contracts",
    icon: <Completed color={color} />,
    color: "#88C8EC",
    counter: applicationCount?.completedContracts || 0,
    link: CONTRACTS_COMPLETED,
  },
  {
    title: "Charged Off Applications",
    icon: <Chargedoff color={color} />,
    color: "#E2AE46",
    counter: 0,
    link: APPLICATIONS_CHARGEDOFF,
  },
  {
    title: "Settled Applications",
    icon: <Settled color={color} />,
    color: "#EDA6D1",
    counter: 0,
    link: APPLICATIONS_SETTLED,
  },
];
