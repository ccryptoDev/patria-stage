import React, { useEffect, useState } from "react";
import { getLoans } from "../../api/admin-dashboard";
import Layout from "../../layouts/admin/main";
import { routes } from "../../routes/Admin/routes";

const CompletedContracts = () => {
  const [activeContracts, setActiveContracts] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, perPage: 10 });

  useEffect(() => {
    getLoans({ status: "COMPLETED_CONTRACT", ...pagination }).then(
      ({ data, error }) => !error && setActiveContracts(data)
    );
  }, []);

  return (
    <Layout route={routes.CONTRACTS_COMPLETED}>Completed contracts</Layout>
  );
};

export default CompletedContracts;
