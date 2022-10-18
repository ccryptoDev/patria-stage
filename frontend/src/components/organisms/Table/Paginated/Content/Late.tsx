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
  dueDate: Date;
};

const statusColor = (date: Date) => {
  const dayDif = (date1: Date, date2: Date) =>
    Math.ceil(Math.abs(date1.getTime() - date2.getTime()) / 86400000);

  const result = dayDif(new Date(date), new Date());
  if (result) {
    switch (true) {
      case result >= 1 && result <= 5:
        return <div className="success">{result}</div>;
      case result > 5 && result <= 29:
        return <div className="link-color">{result}</div>;
      case result > 30 && result < 60:
        return <div className="orange">{result}</div>;
      case result >= 60 && result < 90:
        return <div className="danger">{result}</div>;
      default:
        return <div className="purple">{result}</div>;
    }
  } else {
    return <div className="silver">{result}</div>;
  }
};

const leadsTable = {
  thead: [
    { title: "Loan Reference", key: 0 },
    { title: "Name", key: 1 },
    { title: "Requested Amount", key: 2 },
    { title: "Date Created", key: 3 },
    { title: "Days Late", key: 4 },
    { title: "Phone Number", key: 5 },
    { title: "Email Address", key: 6 },
    { title: "Location", key: 7 },
  ],
  row: ({
    dateCreated = "--",
    email = "--",
    dueDate = new Date(),
    location = "--",
    name = "--",
    phone = "--",
    screenTrackingId,
    loanReference,
    selectedAmount,
  }: IProps) => {
    return [
      <TableCell key={name} minwidth="10rem">
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
      <TableCell key={dateCreated}>{statusColor(dueDate)}</TableCell>,
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
