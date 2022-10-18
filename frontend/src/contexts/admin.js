import React, { useState, useEffect } from "react";
import { isAuthenticated } from "../api/admin-dashboard/requester";

export const UserContext = React.createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState({ user: null, isAuthorized: false });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); //  useState({ message: '' });

  // FETCH USER AUTH
  async function fetchUser() {
    setLoading(true);
    const result = await isAuthenticated();
    if (result) {
      setUser({ user: result, isAuthorized: true });
    } else {
      setError({ message: "server error" });
      setUser({ user: null, isAuthorized: false });
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchUser();
    // eslint-disable-next-line
  }, []);

  const expose = {
    user,
    loading,
    error,
    setUser,
    setLoading,
    setError,
    fetchUser,
  };
  return <UserContext.Provider value={expose}>{children}</UserContext.Provider>;
};

export const useUserData = () => {
  const context = React.useContext(UserContext);

  if (context === undefined) {
    throw new Error("component must be used within a UserProvider");
  }
  return context;
};
