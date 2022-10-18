import React, { useEffect, useState } from "react";
import { Redirect, useLocation } from "react-router-dom";
import PageLayout from "../../../layouts/application/Page/Layout";
import { routes } from "../../../routes/Application/routes";
import LoaderComponent from "../../../components/molecules/Loaders/Loader";
import { validateUserToken } from "../../../api/authorization";
import { useUserData } from "../../../contexts/user";

const MagicLogin = () => {
  const { search } = useLocation();
  const [loading, setLoading] = useState(true);
  const [userValidated, setUserValidated] = useState(false);
  const { fetchUser } = useUserData();

  useEffect(() => {
    const token = new URLSearchParams(search).get("userToken") || "";
    validateUserToken(token)
      .then(({ screenTrackingId }) => {
        localStorage.setItem("userToken", token);
        localStorage.setItem("screenTrackingId", screenTrackingId);
        setUserValidated(true);
        fetchUser();
      })
      .catch(console.log)
      .finally(() => setLoading(false));
  }, []);

  const route = routes.MAGIC_LOGIN;
  return (
    <PageLayout route={route}>
      {loading && <LoaderComponent position="center" size="18" />}
      {userValidated && <Redirect to="/application" />}
    </PageLayout>
  );
};

export default MagicLogin;
