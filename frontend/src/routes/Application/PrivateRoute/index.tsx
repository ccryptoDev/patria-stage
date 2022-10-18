/* eslint-disable*/
import React from "react";
import { useHistory, useParams } from "react-router-dom";
import { useUserData } from "../../../contexts/user";
import { privateRoutes } from "./routes";
import { checkUnderwriting } from "../../../utils/underwritingStatus";
type IProps = {
  children: any;
  route: string;
};

const PrivateRoute = ({ children, route }: IProps) => {
  const { user, loading } = useUserData();
  const history = useHistory();

  const { declined } = checkUnderwriting(
    user?.data?.underwritingDecision?.status
  );

  const userApplicationDeclinedUrl = "/application/thankyou";
  // debugger;

  // redirect the authorized user on the declined page screen
  if (
    !loading &&
    user?.isAuthorized &&
    declined &&
    history?.location?.pathname !== userApplicationDeclinedUrl
  ) {
    history.push(userApplicationDeclinedUrl);
    return <></>;
  } else if (
    !loading &&
    user?.isAuthorized &&
    !declined &&
    history?.location?.pathname === userApplicationDeclinedUrl
  ) {
    history.push("/application");
    return <></>;
  }

  // redirect unauthorized user from a private page to the public home page
  if (!user?.isAuthorized && !loading && privateRoutes.indexOf(route) !== -1) {
    history.push("/application");
    return <></>;
  }

  // otherwise load the route that matches the current url
  return children;
};

export default PrivateRoute;
