import React from "react";
import Layout from "../../layouts/borrower";
import { routes } from "../../routes/Borrower/routes";
import PrivateRoute from "../../routes/Application/PrivateRoute";
import Content from "../../components/molecules/PageNotFound";

const MyProfile = () => {
  const route = routes.HOME;

  return (
    <Layout route={route}>
      <PrivateRoute route={route}>
        <Content />
      </PrivateRoute>
    </Layout>
  );
};

export default MyProfile;
