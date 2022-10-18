import React from "react";
import Layout from "../../layouts/admin/main";
import { routes } from "../../routes/Admin/routes";

const ChargedOffApplications = () => {
  return (
    <Layout route={routes.APPLICATIONS_CHARGEDOFF}>
      Charged off Applications
    </Layout>
  );
};

export default ChargedOffApplications;
