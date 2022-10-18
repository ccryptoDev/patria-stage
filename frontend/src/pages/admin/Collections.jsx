import React from "react";
import Layout from "../../layouts/admin/main";
import { routes } from "../../routes/Admin/routes";
import Component from "../../components/templates/admin/Collections";

const Collections = () => {
  return (
    <Layout route={routes.COLLECTIONS}>
      <Component />
    </Layout>
  );
};

export default Collections;
