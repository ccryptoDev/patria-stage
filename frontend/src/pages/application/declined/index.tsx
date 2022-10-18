import React from "react";
import PageLayout from "../../../layouts/application/Page/Layout";
import Content from "../../../components/templates/application/Declined";
import { routes } from "../../../routes/Application/routes";
import PrivateRoute from "../../../routes/Application/PrivateRoute";

const Declined = () => {
  return (
    <PrivateRoute route={routes.THANKYOU}>
      <PageLayout route={routes.THANKYOU}>
        <Content />
      </PageLayout>
    </PrivateRoute>
  );
};

export default Declined;
