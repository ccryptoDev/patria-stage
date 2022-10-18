import React, { useState, useEffect } from "react";
import { errorHandler } from "../utils/errorHandler";
import { getApplicationsCount } from "../api/agents";

export const cube = {
  APPROVED: "approved",
  INCOMPLETE: "incomplete",
  DENIED: "denied",
  FUNDED: "funded",
  DELIQUENCIES: "deliquencies",
};

export const CubesContext = React.createContext({
  cubes: {
    [cube.APPROVED]: 0,
    [cube.DELIQUENCIES]: 0,
    [cube.DENIED]: 0,
    [cube.FUNDED]: 0,
    [cube.INCOMPLETE]: 0,
  },
  cubesLoading: false,
});

export const CubesProvider = ({ children }) => {
  const [error, setError] = useState(null);
  const [cubes, setCubes] = useState({
    [cube.APPROVED]: 0,
    [cube.DELIQUENCIES]: 0,
    [cube.DENIED]: 0,
    [cube.FUNDED]: 0,
    [cube.INCOMPLETE]: 0,
  });
  const [loading, setLoading] = useState(false);

  const fetchCubes = async () => {
    setLoading(true);
    const result = await getApplicationsCount();
    setLoading(false);
    const success = errorHandler(result.data);
    if (success) {
      setCubes({ ...result.data });
    } else {
      setError(result.error);
    }
  };

  useEffect(() => {
    fetchCubes();
  }, []);

  // SEND REQUEST FROM THE TABLE OR TABLE MODAL WITH FURHTER TABLE UPDATE
  const expose = {
    cubes,
    error,
    fetchCubes,
    cubesLoading: loading,
  };
  return (
    <CubesContext.Provider value={expose}>{children}</CubesContext.Provider>
  );
};

export const useCubes = () => {
  const context = React.useContext(CubesContext);

  if (context === undefined) {
    throw new Error("table must be used within a TableProvider");
  }
  return context;
};
