import React, { useEffect, useState } from "react";
import { getLoans } from "../../api/admin-dashboard";
import Layout from "../../layouts/admin/main";
import { routes } from "../../routes/Admin/routes";

const ActiveContracts = () => {
  const [activeContracts, setActiveContracts] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, perPage: 10 });

  useEffect(() => {
    getLoans({ status: "ACTIVE", ...pagination }).then(
      ({ data, error }) => !error && setActiveContracts(data)
    );
  }, []);

  return <Layout route={routes.CONTRACTS_ACTIVE}>Active Contracts</Layout>;
};

export default ActiveContracts;
