import React from "react";
import { Redirect, Route } from "react-router-dom";
import { routes } from "../routes";

const Portal = ({ isAgent = false, userRole, props, component: Component }) => {
  // checking if the component has userRole
  if (userRole !== "agent" && isAgent) {
    // REDIRECT TO THE AGENTS ROUTE
    return <Redirect to="/agents/" />;
  }
  if (userRole === "agent" && !isAgent) {
    // REDIRECT TO THE ADMIN ROUTE
    return <Redirect to="/admin/" />;
  }
  return <Component {...props} />;
};

const PrivateRoute = ({
  component,
  loading,
  isAuthorized,
  user,
  userRole,
  ...rest
}) => {
  // eslint-disable-next-line
  const isAgent = user?.data?._doc?.isAgent;
  return (
    <Route
      {...rest}
      render={(props) =>
        !loading && isAuthorized ? (
          <Portal
            userRole={userRole}
            component={component}
            props={props}
            isAgent={isAgent}
          />
        ) : (
          <Redirect to={routes.LOGIN} />
        )
      }
    />
  );
};

export default PrivateRoute;
