import React from "react";
import Layout from "../../layouts/admin/main";
import { routes } from "../../routes/Admin/routes";
import Content from "../../components/templates/admin/Dashboard";

const Dashboard = () => {
  return (
    <Layout route={routes.DASHBOARD}>
      <Content />
    </Layout>
  );
};

export default Dashboard;
