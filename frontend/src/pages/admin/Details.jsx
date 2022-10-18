import React from "react";
import Layout from "../../layouts/admin/main";
import { routes } from "../../routes/Admin/routes";
import Card from "../../components/atoms/Cards/Large";
import Details from "../../components/templates/admin/LoanDetails";

const DetailsPage = () => {
  return (
    <Layout route={routes.LOAN_DETAILS}>
      <Card>
        <Details />
      </Card>
    </Layout>
  );
};

export default DetailsPage;
