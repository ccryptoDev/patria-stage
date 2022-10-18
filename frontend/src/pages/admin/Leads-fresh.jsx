import React from "react";
import Layout from "../../layouts/admin/main";
import { routes } from "../../routes/Admin/routes";

const FreshLeads = () => {
  return <Layout route={routes.LEADS_FRESH}>fresh leads</Layout>;
};

export default FreshLeads;
