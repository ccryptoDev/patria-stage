import React, { useEffect, useState } from "react";
import { getLoans } from "../../api/admin-dashboard";
import Layout from "../../layouts/admin/main";
import { routes } from "../../routes/Admin/routes";

const ArchivedOpenApplications = () => {
  const [archivedOpenApplications, setArchivedOpenApplications] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, perPage: 10 });

  useEffect(() => {
    getLoans({ status: "DENIED", ...pagination }).then(
      ({ data, error }) => !error && setArchivedOpenApplications(data)
    );
  }, []);

  return (
    <Layout route={routes.APPLICATIONS_ARCHIVED}>Applications Archived</Layout>
  );
};

export default ArchivedOpenApplications;
