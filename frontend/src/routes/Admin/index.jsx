import React from "react";
import { UserProvider } from "../../contexts/admin";
import Router from "./Router";

const AppAdmin = () => {
  return (
    <UserProvider>
      <Router />
    </UserProvider>
  );
};

export default AppAdmin;
