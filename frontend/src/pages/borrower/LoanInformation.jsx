import React from "react";
import Layout from "../../layouts/borrower";
import { routes } from "../../routes/Borrower/routes";
import PrivateRoute from "../../routes/Application/PrivateRoute";
import { useUserData } from "../../contexts/user";
import Main from "../../layouts/borrower/Main";
import Content from "../../components/templates/borrower/LoanInformation";

const LoanInformation = () => {
  const { user } = useUserData();
  const route = routes.LOAN_INFORMATION;

  return (
    <Layout>
      {/* <PrivateRoute route={route} id={user?.data?.id}> */}
      <Main>
        <Content route={route} />
      </Main>
      {/* </PrivateRoute> */}
    </Layout>
  );
};

export default LoanInformation;
