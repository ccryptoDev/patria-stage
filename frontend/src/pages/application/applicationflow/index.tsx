import React from "react";
import PageLayout from "../../../layouts/application/Page/Layout";
import { routes } from "../../../routes/Application/routes";
import PrivateRoute from "../../../routes/Application/PrivateRoute";
import Content from "../../../components/templates/application/ApplicationFlow";

const ApplicationFlow = () => {
  const route = routes.HOME;
  return (
    <PageLayout route={route}>
      <PrivateRoute route={route}>
        <Content />
      </PrivateRoute>
    </PageLayout>
  );
};

export default ApplicationFlow;
