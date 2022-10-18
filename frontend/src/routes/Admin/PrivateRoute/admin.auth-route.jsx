import React from "react";
import { Route, Redirect } from "react-router-dom";

const Portal = ({ isAgent = false }) => {
  const path = isAgent ? "/agents/" : "/admin/";
  return <Redirect to={path} />;
};

const AuthRoute = ({
  component: Component,
  isAuthorized,
  user,
  loading,
  ...rest
}) => {
  // eslint-disable-next-line
  const isAgent = user?.data?._doc?.isAgent;
  return (
    <Route
      {...rest}
      render={(props) =>
        isAuthorized && !loading ? (
          <Portal isAgent={isAgent} />
        ) : (
          <Component {...props} />
        )
      }
    />
  );
};

export default AuthRoute;
