import React from "react";

import Layout from "../../layouts/admin/main";
import Details from "../../components/templates/admin/UserDetails";
import { H2 as Heading } from "../../components/atoms/Typography";

const DetailsPage = () => {
  return (
    <Layout>
      <Heading>User Details</Heading>
      <Details />
    </Layout>
  );
};

export default DetailsPage;
