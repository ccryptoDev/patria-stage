import React, { useEffect, useState } from "react";
import { getLoans } from "../../api/admin-dashboard";
import Layout from "../../layouts/admin/main";
import { routes } from "../../routes/Admin/routes";

const DeniedApplications = () => {
  const [deniedApplications, setDeniedApplications] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, perPage: 10 });

  useEffect(() => {
    getLoans({ status: "DENIED", ...pagination }).then(
      ({ data, error }) => !error && setDeniedApplications(data)
    );
  }, []);

  return (
    <Layout route={routes.APPLICATIONS_DENIED}>Denied Applications</Layout>
  );
};

export default DeniedApplications;
