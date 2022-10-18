import React from "react";
import { Link } from "react-router-dom";
import moment from "moment";
import { Email, PhoneNumber, TableCell } from "../../../../atoms/Table/Table-paginated";
import { dateFormat } from "../../../../../utils/formats";

type IProps = {
  registerStatus: string;
  createdDate: string;
  email: string;
  location: string;
  name: string;
  phone: string;
  userReference: string;
  screenTrackingId: string;
};

const Accounts = {
  thead: [
    { title: "Name on Card", key: 1 },
    { title: "Default", key: 2 },
    { title: "Last 4 digits", key: 3 },
    { title: "Card expiration", key: 4 },
    { title: "Added/Updated", key: 5 },
  ],
  row: ({ registerStatus, createdDate = "--", email = "--", location = "--", name = "--", phone = "--", userReference = "--", screenTrackingId }: IProps) => {
    return [
      <TableCell key={userReference} minwidth="11rem">
        <Link to={`/loan-details/${screenTrackingId}`}>{userReference}</Link>
      </TableCell>,
      <TableCell key={name} minwidth="15rem">
        {name}
      </TableCell>,
      <Email key={email}>{email}</Email>,
      <PhoneNumber key={phone}>{phone}</PhoneNumber>,
      <TableCell key={registerStatus} width="14rem">
        {registerStatus}
      </TableCell>,
      <TableCell key={location} minwidth="10rem">
        {location}
      </TableCell>,
      <TableCell key={createdDate} minwidth="11rem">
        {moment(createdDate).utc().format(dateFormat)}
      </TableCell>,
    ];
  },
};

export default Accounts;
