import React from "react";
import Layout from "../../layouts/admin/main";
import { routes } from "../../routes/Admin/routes";

const RejectedLeads = () => {
  return <Layout route={routes.LEADS_REJECTED}>rejected leads</Layout>;
};

export default RejectedLeads;
