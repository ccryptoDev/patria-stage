/* eslint no-underscore-dangle:0 */
import React, { useState } from "react";

export const UserContext = React.createContext();

export const AppContextProvider = ({ children }) => {
  const [data, setData] = useState({});

  const expose = {
    data,
    saveData: setData,
  };
  return <UserContext.Provider value={expose}>{children}</UserContext.Provider>;
};

export const useAppContextData = () => {
  const context = React.useContext(UserContext);

  if (context === undefined) {
    throw new Error("component must be used within a AppContextProvider");
  }
  return context;
};
