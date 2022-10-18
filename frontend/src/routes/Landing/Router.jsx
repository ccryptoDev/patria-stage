import React from "react";
import { Route, Switch } from "react-router-dom";
import { routes as route } from "./routes";
import { UserProvider } from "../../contexts/user";
import Layout from "../../layouts/landing";
import Apply from "../../pages/landing/apply";
import Contact from "../../pages/landing/contact";
import About from "../../pages/landing/about";
import Loans from "../../pages/landing/loans";
import Rates from "../../pages/landing/rates";
import Resources from "../../pages/landing/resources";
import Faq from "../../pages/landing/faq";
import Privacy from "../../pages/landing/privacy";
import TermsOfUse from "../../pages/landing/termsOfUse";
import PrivacyNotice from "../../pages/landing/privacyNotice";
import OnlinePrivacyNotice from "../../pages/landing/onlinePrivacyNotice";
import Ordinance from "../../pages/landing/ordinance";
import License from "../../pages/landing/license";

const Routes = () => (
  <UserProvider>
    <Layout>
      <Switch>
        <Route path={route.APPLY} exact component={Apply} />
        <Route path={route.CONTACT} exact component={Contact} />
        <Route path={route.ABOUT} exact component={About} />
        <Route path={route.LOANS} exact component={Loans} />
        <Route path={route.RATES} exact component={Rates} />
        <Route path={route.RESOURCES} exact component={Resources} />
        <Route path={route.FAQ} exact component={Faq} />
        <Route path={route.PRIVACY} exact component={Privacy} />
        <Route path={route.TERMS_OF_USE} exact component={TermsOfUse} />
        <Route path={route.PRIVACY_NOTICE} exact component={PrivacyNotice} />
        <Route path={route.ORDINANCE} exact component={Ordinance} />
        <Route path={route.LICENSE} exact component={License} />
        <Route
          path={route.ONLINE_PRIVACY_NOTICE}
          exact
          component={OnlinePrivacyNotice}
        />
      </Switch>
    </Layout>
  </UserProvider>
);

export default Routes;
