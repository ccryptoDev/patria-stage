import React from "react";
import { useHistory } from "react-router-dom";
import { H2 } from "../../atoms/Typography";
import Buttons from "../../atoms/Form/Buttons-wrapper";
import Button from "../../atoms/Buttons/Button";

const PageNotFound = () => {
  const history = useHistory();
  return (
    <div>
      <H2 style={{ marginTop: "20%" }}>Page Not Found</H2>
      <Buttons>
        <Button
          variant="primary"
          type="button"
          onClick={() => history.goBack()}
        >
          Go Back
        </Button>
      </Buttons>
    </div>
  );
};

export default PageNotFound;
