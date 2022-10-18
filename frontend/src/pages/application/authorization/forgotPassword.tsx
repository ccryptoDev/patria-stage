import React from "react";
import PageLayout from "../../../layouts/application/Page/Layout";
import Form from "../../../components/templates/application/Authorization/RestorePassword";
import { routes } from "../../../routes/Application/routes";
import PrivateRoute from "../../../routes/Application/PrivateRoute";

const ForgotPassword = () => {
  const route = routes.FORGOT_PASSWORD;
  return (
    <PageLayout route={route}>
      <PrivateRoute route={route}>
        <Form />
      </PrivateRoute>
    </PageLayout>
  );
};

export default ForgotPassword;
