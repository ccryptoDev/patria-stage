import React from "react";
import { Link } from "react-router-dom";
import { TableCell } from "../../../../atoms/Table/Table-paginated";
import { formatDate, formatCurrency } from "../../../../../utils/formats";
import { routes } from "../../../../../routes/Admin/routes";
import Field from "../../../../molecules/Form/Fields/CompactField";

type IProps = {
  approvedUpTo: number;
  dateCreated: string;
  email: string;
  location: string;
  name: string;
  phone: string;
  loanReference: string;
  userReference: string;
  screenTrackingId: string;
  selectedAmount: number;
};

const leadsTable = {
  thead: [
    { title: "Loan Reference", key: 0 },
    { title: "Name", key: 1 },
    { title: "Requested Amount", key: 2 },
    { title: "Date Created", key: 3 },
    { title: "Phone Number", key: 4 },
    { title: "Email Address", key: 5 },
    { title: "Location", key: 6 },
  ],
  row: ({
    dateCreated = "--",
    email = "--",
    location = "--",
    name = "--",
    phone = "--",
    screenTrackingId,
    loanReference,
    selectedAmount,
  }: IProps) => {
    return [
      <TableCell key={name} minwidth="8rem">
        <Link to={`${routes.LOAN_DETAILS}/${screenTrackingId}`}>
          {loanReference || "View details"}
        </Link>
      </TableCell>,
      <TableCell key={selectedAmount}>
        <Field value={name} />{" "}
      </TableCell>,
      <TableCell key={selectedAmount}>
        {formatCurrency(selectedAmount)}{" "}
      </TableCell>,
      <TableCell key={dateCreated}>{formatDate(dateCreated)}</TableCell>,
      <TableCell key={phone}>{phone}</TableCell>,
      <TableCell key={email}>
        <Field value={email} />
      </TableCell>,
      <TableCell key={location} minwidth="10rem">
        {location}
      </TableCell>,
    ];
  },
};

export default leadsTable;
