import React from "react";
import { Link } from "react-router-dom";
import moment from "moment";
import { TableCell } from "../../../../atoms/Table/Table-paginated";
import { dateFormat } from "../../../../../utils/formats";
import { routes } from "../../../../../routes/Admin/routes";
import Field from "../../../../molecules/Form/Fields/CompactField";

type IProps = {
  registerStatus: string;
  createdDate: string;
  email: string;
  state: string;
  name: string;
  phone: string;
  userReference: string;
  userId: string;
};

const leadsTable = {
  thead: [
    { title: "User Reference", key: 1 },
    { title: "Name", key: 2 },
    { title: "Email Address", key: 3 },
    { title: "Phone Number", key: 4 },
    { title: "Registration Status", key: 5 },
    { title: "Location", key: 6 },
    { title: "Created Date", key: 7 },
  ],
  row: ({
    registerStatus,
    createdDate = "--",
    email = "--",
    state = "--",
    name = "--",
    phone = "--",
    userReference = "--",
    userId,
  }: IProps) => {
    return [
      <TableCell key={userReference} minwidth="11rem">
        <Link to={`${routes.USER_DETAILS}/${userId}`}>{userReference}</Link>
      </TableCell>,
      <TableCell key={name} minwidth="15rem">
        <Field value={name} />
      </TableCell>,
      <TableCell key={email}>
        <Field value={email} />
      </TableCell>,
      <TableCell key={phone}>
        <Field value={phone} />
      </TableCell>,
      <TableCell key={registerStatus} width="14rem">
        {registerStatus}
      </TableCell>,
      <TableCell key={state} minwidth="10rem">
        {state}
      </TableCell>,
      <TableCell key={createdDate} minwidth="11rem">
        {moment(createdDate).utc().format(dateFormat)}
      </TableCell>,
    ];
  },
};

export default leadsTable;
