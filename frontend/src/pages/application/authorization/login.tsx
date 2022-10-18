import React from "react";
import PageLayout from "../../../layouts/application/Page/Layout";
import Form from "../../../components/templates/application/Authorization/Login";
import { routes } from "../../../routes/Application/routes";
import PrivateRoute from "../../../routes/Application/PrivateRoute";

const Login = () => {
  const route = routes.LOGIN;
  return (
    <PageLayout route={route}>
      <PrivateRoute route={route}>
        <Form />
      </PrivateRoute>
    </PageLayout>
  );
};

export default Login;
