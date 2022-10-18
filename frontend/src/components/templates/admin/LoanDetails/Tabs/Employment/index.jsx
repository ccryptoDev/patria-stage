import React from "react";
import Table from "../../../../../molecules/Table/Details-vertical";
import { fields, pay, profile } from "./confg";
import Heading from "../../../../../molecules/Typography/admin/DetailsHeading";

const Employment = ({ state = {} }) => {
  return (
    <div>
      {state?.employment?.argyleResponse ? (
        <>
          <Heading text="Payment" />
          <Table
            rows={pay(state?.employment?.argyleResponse?.employment?.base_pay)}
          />
          <Heading text="Employment" />
          <Table rows={fields(state?.employment?.argyleResponse?.employment)} />
          <Heading text="Profile" />
          <Table rows={profile(state?.employment?.argyleResponse?.profile)} />
        </>
      ) : (
        ""
      )}
    </div>
  );
};

export default Employment;
