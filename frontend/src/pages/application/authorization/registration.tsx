import React from "react";
import PageLayout from "../../../layouts/application/Page/Layout";
import Form from "../../../components/templates/application/Authorization/Registration";
import { routes } from "../../../routes/Application/routes";
import PrivateRoute from "../../../routes/Application/PrivateRoute";

const Registeration = () => {
  const route = routes.REGISTRATION;
  return (
    <PageLayout route={route}>
      <PrivateRoute route={route}>
        <Form />
      </PrivateRoute>
    </PageLayout>
  );
};

export default Registeration;
