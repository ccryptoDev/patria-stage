import React from "react";
import { Route, Switch } from "react-router-dom";
import { routes as route } from "./routes";
import UserInformation from "../../pages/borrower/UserInformation";
import DocumentCenter from "../../pages/borrower/DocumentCenter";
import LoanInformation from "../../pages/borrower/LoanInformation";
import { UserProvider } from "../../contexts/user";
import NotFound from "../../pages/borrower/NotFound";

const Routes = () => {
  return (
    <UserProvider>
      <Switch>
        <Route
          path={route.USER_INFORMATION}
          exact
          component={UserInformation}
        />
        <Route path={route.DOCUMENT_CENTER} exact component={DocumentCenter} />
        <Route
          path={route.LOAN_INFORMATION}
          exact
          component={LoanInformation}
        />
        <Route component={NotFound} />
      </Switch>
    </UserProvider>
  );
};

export default Routes;
