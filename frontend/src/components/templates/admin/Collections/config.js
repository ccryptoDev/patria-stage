import React from "react";
import Circles from "../../../atoms/Icons/SvgIcons/Circles";
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

export const renderCubes = () => [
  {
    title: "All Collections",
    icon: <Circles color={color} />,
    color: "#439984",
    counter: 367,
    link: CONTRACTS_ACTIVE,
  },
  {
    title: "Pending Collections",
    icon: <Circles color={color} />,
    color: "#46A9E2",
    counter: 367,
    link: APPLICATIONS_DENIED,
  },
  {
    title: "My Collection Items",
    icon: <Circles color={color} />,
    color: "#E2AE46",
    counter: 367,
    link: APPLICATIONS_ARCHIVED,
  },
  {
    title: "Promise to Pay",
    icon: <Circles color={color} />,
    color: "#E9727E",
    counter: 367,
    link: CONTRACTS_COMPLETED,
  },
  {
    title: "Modified Loans",
    icon: <Circles color={color} />,
    color: "#CD88EC",
    counter: 367,
    link: APPLICATIONS_CHARGEDOFF,
  },
  {
    title: "Unassigned Collection",
    icon: <Circles color={color} />,
    color: "#B7B7B7",
    counter: 367,
    link: APPLICATIONS_SETTLED,
  },
];
