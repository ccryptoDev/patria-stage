import React from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import BorrowerRoutes from "./Borrower/Router";
import ApplicationRoutes from "./Application/Router";
import AdminApp from "./Admin";
import StylesSheet from "../pages/styles";
import Landing from "./Landing";

const Routes = () => {
  return (
    <Router>
      <Switch>
        <Route path="/styles" component={StylesSheet} />
        <Route path="/admin" component={AdminApp} />
        <Route path="/borrower" component={BorrowerRoutes} />
        <Route path="/application" component={ApplicationRoutes} />
        <Route path="/" component={Landing} />
      </Switch>
    </Router>
  );
};

export default Routes;
