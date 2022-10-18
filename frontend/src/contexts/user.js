/* eslint-disable */
import React, { useState, useEffect } from "react";
import {
  getUserInfo,
  triggerIdentityVerificationApi,
} from "../api/application";
import { getJWT } from "../api/requester";

export const UserContext = React.createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState({ data: null, isAuthorized: false });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); //  useState({ message: '' });
  const [verificationType, setVerificationType] = useState({
    isOtpRequested: false,
    isKbaRequested: false,
  });
  const screenId = user?.data?.id;
  const lastLevel = user?.data?.lastlevel;

  // USER AUTHORIZATION
  async function fetchUser() {
    try {
      setLoading(true);
      const result = await getUserInfo();
      if (result) {
        setUser({ data: result, isAuthorized: true });

        if (result?.id) {
          triggerIdentityVerification(result?.id);
        }

        setLoading(false);
        return { data: result, isAuthorized: true };
      }
      setError({ message: "server error" });
      setUser({ data: null, isAuthorized: false });
      setLoading(false);
      return null;
    } catch (err) {
      setUser({ data: null, isAuthorized: false });
      setLoading(false);
      return null;
    }
  }

  useEffect(() => {
    // apply/newUser creates JWT, after the token is added to localstorage the user auth can be run
    if (getJWT()) {
      fetchUser();
    } else {
      // THE LAODING SET INITIALLY TO TRUE
      setLoading(false);
    }
  }, []);

  // IDENTITY VERIFICATION
  async function triggerIdentityVerification(screenTrackingId) {
    const result = await triggerIdentityVerificationApi(screenTrackingId);
    if (result) {
      if (result.isKbaRequested) {
        setVerificationType({
          isOtpRequested: false,
          isKbaRequested: true,
        });
      } else if (result.isOtpRequested) {
        setVerificationType({
          isOtpRequested: true,
          isKbaRequested: false,
        });
      }
    }
    // CHECK IF ONE OF THE CONDITIONS IS TRUE TO SET FURTHER CONDITIONS ON RESPONSE
    return result.isKbaRequested || result.isOtpRequested;
  }

  const expose = {
    user,
    loading,
    error,
    screenId,
    isAuthorized: user.isAuthorized,
    verificationType,
    lastLevel,
    triggerIdentityVerification,
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
