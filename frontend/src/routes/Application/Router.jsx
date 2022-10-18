import React from "react";
import { Route, Switch } from "react-router-dom";
import { routes as route } from "./routes";
import Login from "../../pages/application/authorization/login";
import MagicLogin from "../../pages/application/authorization/magicLogin";
import Registration from "../../pages/application/authorization/registration";
import NotFound from "../../pages/application/notfound";
import ForgotPassword from "../../pages/application/authorization/forgotPassword";
import { UserProvider } from "../../contexts/user";
import Application from "../../pages/application/applicationflow";
import Declined from "../../pages/application/declined";

const Routes = () => {
  return (
    <UserProvider>
      <Switch>
        <Route path={route.THANKYOU} exact component={Declined} />
        <Route path={route.HOME} exact component={Application} />
        <Route path={route.LOGIN} exact component={Login} />
        <Route path={route.MAGIC_LOGIN} exact component={MagicLogin} />
        <Route path={route.REGISTRATION} exact component={Registration} />
        <Route path={route.FORGOT_PASSWORD} exact component={ForgotPassword} />
        <Route component={NotFound} />
      </Switch>
    </UserProvider>
  );
};

export default Routes;
