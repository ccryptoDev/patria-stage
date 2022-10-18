import React from "react";
import { routes } from "../../../routes/Admin/routes";
import Dashboard from "../../../components/atoms/Icons/SvgIcons/SideNav/cubes";
import LeadsFresh from "../../../components/atoms/Icons/SvgIcons/SideNav/folder-plus";
import LeadsRejected from "../../../components/atoms/Icons/SvgIcons/SideNav/folder-x";
import ContractsActive from "../../../components/atoms/Icons/SvgIcons/SideNav/folder-dot";
import ApplicationsDenied from "../../../components/atoms/Icons/SvgIcons/SideNav/folder-minus";
import Archived from "../../../components/atoms/Icons/SvgIcons/SideNav/folder-arrow-down";
import Completed from "../../../components/atoms/Icons/SvgIcons/SideNav/folder-check";
import ChargedOff from "../../../components/atoms/Icons/SvgIcons/SideNav/folder-slider";
import Settled from "../../../components/atoms/Icons/SvgIcons/SideNav/folder-dots";
import Bankruptsy from "../../../components/atoms/Icons/SvgIcons/SideNav/folder-dot-arrow";
import Collections from "../../../components/atoms/Icons/SvgIcons/SideNav/collections";
import Reports from "../../../components/atoms/Icons/SvgIcons/SideNav/reports";

export const sidenav = [
  {
    route: routes.DASHBOARD,
    title: "Dashboard",
    icon: <Dashboard />,
    arrow: true,
  },
  {
    route: routes.LEADS_FRESH,
    title: "Fresh Leads",
    icon: <LeadsFresh />,
    arrow: false,
  },
  {
    route: routes.LEADS_REJECTED,
    title: "Rejected Leads",
    icon: <LeadsRejected />,
    arrow: false,
  },
  {
    route: routes.CONTRACTS_ACTIVE,
    title: "Active Contracts",
    icon: <ContractsActive />,
    arrow: false,
  },
  {
    route: routes.APPLICATIONS_DENIED,
    title: "Denied Applications",
    icon: <ApplicationsDenied />,
    arrow: false,
  },
  {
    route: routes.APPLICATIONS_ARCHIVED,
    title: "Archived Open Applications",
    icon: <Archived />,
    arrow: false,
  },
  {
    route: routes.CONTRACTS_COMPLETED,
    title: "Completed Contracts",
    icon: <Completed />,
    arrow: false,
  },
  {
    route: routes.APPLICATIONS_CHARGEDOFF,
    title: "Charged Off Applications",
    icon: <ChargedOff />,
    arrow: false,
  },
  {
    route: routes.APPLICATIONS_SETTLED,
    title: "Settled Applications",
    icon: <Settled />,
    arrow: false,
  },
  {
    route: routes.CONTRACTS_BANKRUPTSY,
    title: "Bankruptsy Contracts",
    icon: <Bankruptsy />,
    arrow: false,
  },
  {
    route: routes.COLLECTIONS,
    title: "Collections",
    icon: <Collections />,
    arrow: true,
  },
  {
    route: routes.REPORTS,
    title: "Reports",
    icon: <Reports />,
    arrow: false,
  },
];
