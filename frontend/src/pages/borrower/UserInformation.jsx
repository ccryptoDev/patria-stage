import React, { useEffect } from "react";
import { connect } from "react-redux";
import Layout from "../../layouts/borrower";
import { routes } from "../../routes/Borrower/routes";
import PrivateRoute from "../../routes/Application/PrivateRoute";
import { useUserData } from "../../contexts/user";
import Main from "../../layouts/borrower/Main";
import Content from "../../components/templates/borrower/UserInformation";
import { getBorrowerData } from "../../api/borrower";

const UserInformation = (props) => {
  const { user } = useUserData();
  const route = routes.USER_INFORMATION;
  const { borrowerData } = props;

  const getUserInformation = async () => {
    try {
      const response = await getBorrowerData();
    } catch (error) {
      console.log("error", error);
    }
  };

  useEffect(() => {
    getUserInformation();
  }, []);

  return (
    <Layout>
      {/* <PrivateRoute route={route} id={user?.data?.id}> */}
      <Main>
        <Content route={route} borrowerData={borrowerData} />
      </Main>
      {/* </PrivateRoute> */}
    </Layout>
  );
};

export default UserInformation;
