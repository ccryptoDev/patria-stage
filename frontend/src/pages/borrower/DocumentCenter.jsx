import React from "react";
import Layout from "../../layouts/borrower";
import PrivateRoute from "../../routes/Application/PrivateRoute";
import Main from "../../layouts/borrower/Main";
import Content from "../../components/templates/borrower/DocumentCenter";
import { routes } from "../../routes/Borrower/routes";
import { useUserData } from "../../contexts/user";

const DocumentCenter = () => {
  const { user } = useUserData();
  const route = routes.DOCUMENT_CENTER;

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

export default DocumentCenter;
