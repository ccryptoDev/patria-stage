import React from "react";
import { Switch, Route } from "react-router-dom";
import { routes as route } from "./routes";
import Dashboard from "../../pages/admin/Dashboard";
import LeadsFresh from "../../pages/admin/Leads-fresh";
import LeadsRejected from "../../pages/admin/Leads-rejected";
import ContractsActive from "../../pages/admin/Contracts-active";
import ApplicationsDenied from "../../pages/admin/Applications-denied";
import ApplicationsArchived from "../../pages/admin/Applications-archived";
import ContractsCompleted from "../../pages/admin/Contracts-completed";
import ApplicationsChargedOff from "../../pages/admin/Applications-chargedoff";
import ApplicationsSettled from "../../pages/admin/Applications-settled";
import ContractsBankruptsy from "../../pages/admin/Contracts-bankruptsy";
import Collections from "../../pages/admin/Collections";
import Reports from "../../pages/admin/Reports";
import Login from "../../pages/admin/Login";
import ResetPassword from "../../pages/admin/Reset-password";
import { useUserData } from "../../contexts/admin";
import LoginRoute from "./PrivateRoute/admin.auth-route";
import PrivateRoute from "./PrivateRoute/admin.private-route";
import LoanDetails from "../../pages/admin/Details";
import NotFound from "../../pages/admin/NotFound";
import ForgotPassword from "../../pages/admin/Forgot-password";
import UserDetails from "../../pages/admin/UserDetails";

const routes = [
  { key: route.DASHBOARD, path: route.DASHBOARD, component: Dashboard },
  {
    key: route.LEADS_FRESH,
    path: route.LEADS_FRESH,
    component: LeadsFresh,
  },
  {
    key: route.LEADS_REJECTED,
    path: route.LEADS_REJECTED,
    component: LeadsRejected,
  },
  {
    key: route.CONTRACTS_ACTIVE,
    path: route.CONTRACTS_ACTIVE,
    component: ContractsActive,
  },
  {
    key: route.APPLICATIONS_DENIED,
    path: route.APPLICATIONS_DENIED,
    component: ApplicationsDenied,
  },
  {
    key: route.RESET_PASSWORD,
    path: route.RESET_PASSWORD,
    component: ResetPassword,
  },
  {
    key: route.APPLICATIONS_ARCHIVED,
    path: route.APPLICATIONS_ARCHIVED,
    component: ApplicationsArchived,
  },
  {
    key: route.CONTRACTS_COMPLETED,
    path: `${route.CONTRACTS_COMPLETED}`,
    component: ContractsCompleted,
  },
  {
    key: route.APPLICATIONS_CHARGEDOFF,
    path: `${route.APPLICATIONS_CHARGEDOFF}`,
    component: ApplicationsChargedOff,
  },
  {
    key: route.APPLICATIONS_SETTLED,
    path: `${route.APPLICATIONS_SETTLED}`,
    component: ApplicationsSettled,
  },
  {
    key: route.CONTRACTS_BANKRUPTSY,
    path: `${route.CONTRACTS_BANKRUPTSY}`,
    component: ContractsBankruptsy,
  },
  {
    key: route.COLLECTIONS,
    path: `${route.COLLECTIONS}`,
    component: Collections,
  },
  {
    key: route.REPORTS,
    path: `${route.REPORTS}`,
    component: Reports,
  },
  {
    key: route.LOAN_DETAILS,
    path: `${route.LOAN_DETAILS}/:id`,
    component: LoanDetails,
  },
  {
    key: route.USER_DETAILS,
    path: `${route.USER_DETAILS}/:id`,
    component: UserDetails,
  },
  { key: "notfound", component: NotFound },
];

const Routes = () => {
  const {
    user: { isAuthorized, user },
    loading,
  } = useUserData();
  if (!loading) {
    return (
      <Switch>
        <Route component={ForgotPassword} path={route.FORGOT_PASSWORD} exact />
        <LoginRoute
          exact
          component={Login}
          path={route.LOGIN}
          isAuthorized={isAuthorized}
          user={user}
          loading={loading}
        />
        {routes.map((props) => (
          <PrivateRoute
            key={props.key}
            userRole="admin"
            isAuthorized={isAuthorized}
            user={user}
            loading={loading}
            exact
            {...props}
          />
        ))}
      </Switch>
    );
  }
  return <></>;
};

export default Routes;
