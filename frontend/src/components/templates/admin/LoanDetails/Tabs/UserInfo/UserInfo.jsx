import React from "react";
import Table from "../../../../../molecules/Table/Details-vertical";
import Heading from "../../../../../molecules/Typography/admin/DetailsHeading";
import renderRows from "./config";

const UserInfo = ({ state }) => {
  return (
    <div>
      <Heading text="User Information" />
      <Table
        rows={renderRows({
          ...state?.screenTracking?.user,
          ...state?.screenTracking,
          ...state?.paymentManagement,
        })}
      />
    </div>
  );
};

export default UserInfo;
