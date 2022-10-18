import React, { useEffect, useState } from "react";
import { getLoans } from "../../api/admin-dashboard";
import Layout from "../../layouts/admin/main";
import { routes } from "../../routes/Admin/routes";

const SettledApplications = () => {
  const [settledApplications, setSettledApplications] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, perPage: 10 });

  useEffect(() => {
    getLoans({ status: "SETTLED", ...pagination }).then(
      ({ data, error }) => !error && setSettledApplications(data)
    );
  }, []);

  return (
    <Layout route={routes.APPLICATIONS_SETTLED}>Applications Settled</Layout>
  );
};

export default SettledApplications;
