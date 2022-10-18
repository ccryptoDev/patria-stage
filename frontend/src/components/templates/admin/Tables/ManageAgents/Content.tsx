import React from "react";
import { FlexCenter, TableCell } from "../../../../atoms/Table/Table-paginated";
import { formatDate } from "../../../../../utils/formats";
import EditIcon from "../../../../atoms/Icons/SvgIcons/Edit";
import Modal from "../../../../organisms/Modal/Regular/ModalAndTriggerButton";
import TriggerButton from "../../../../atoms/Buttons/TriggerModal/Trigger-button-edit";
import Form from "../../Forms/addUpdateUser/UpdateUser";
import Field from "../../../../molecules/Form/Fields/CompactField";

type IProps = {
  createdDate: string;
  email: string;
  location: string;
  role: string;
  phone: string;
  userName: string;
  id: string;
};

const leadsTable = {
  thead: [
    { title: "User Name", key: 1 },
    { title: "Email Address", key: 2 },
    { title: "Phone Number", key: 3 },
    { title: "Location", key: 4 },
    { title: "Created Date", key: 5 },
    { title: "Action", key: 6 },
  ],
  row: ({
    createdDate = "--",
    email = "--",
    location = "--",
    id,
    phone = "--",
    userName = "--",
  }: IProps) => {
    return [
      <TableCell key={userName} minwidth="8rem">
        <Field value={userName} />
      </TableCell>,
      <TableCell key={email}>
        <Field value={email} />
      </TableCell>,
      <TableCell key={phone}>{phone}</TableCell>,
      <TableCell key={location} minwidth="10rem">
        {location}
      </TableCell>,
      <TableCell key={createdDate} minwidth="8rem">
        {formatDate(createdDate)}
      </TableCell>,
      <FlexCenter key="edit-button">
        <Modal
          button={
            <TriggerButton style={{ width: "3rem" }}>
              <EditIcon />
            </TriggerButton>
          }
          modalContent={Form}
          state={{ data: { email, userName, phoneNumber: phone, id } }}
          modalTitle="Update Agent"
        />
      </FlexCenter>,
    ];
  },
};

export default leadsTable;
