import React from "react";
import { useHistory } from "react-router-dom";
import { useUserData } from "../../../contexts/user";
import Loader from "../../../components/molecules/Loaders/LoaderWrapper";
import { routes } from "../../../routes/Application/routes";
import Button from "../../../components/atoms/Buttons/Button";

const RenderButton = ({ route }: { route: string }) => {
  const history = useHistory();
  const {
    loading,
    user: { isAuthorized },
  } = useUserData();

  const goToPortal = () => {
    window.location.href = routes.BORROWER_PORTAL;
  };

  // if the user IS authorized
  if (isAuthorized) {
    return (
      <></>
      // <Button type="button" variant="primary" onClick={goToPortal}>
      //   Save Application
      // </Button>
    );
  }

  // if the user IS NOT authorized
  if (!loading && !isAuthorized) {
    switch (route) {
      case routes.LOGIN:
      case routes.FORGOT_PASSWORD:
        return (
          <Button
            type="button"
            variant="primary"
            onClick={() => history.push(routes.HOME)}
          >
            Start Application
          </Button>
        );

      default:
        return (
          <Button
            type="button"
            variant="primary"
            onClick={() => history.push(routes.LOGIN)}
          >
            Log in
          </Button>
        );
    }
  }

  // checking auth
  return (
    <div>
      <Loader loading size="4">
        <div />
      </Loader>
    </div>
  );
};

export default RenderButton;
