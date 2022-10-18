import React from "react";
import Congratulations from "../Congratulations";
import Container from "../../styles";

const LastStep = () => {
  const congratulationsNote =
    "Your loan has been submitted for funding.  Please monitor your bank account to verify that you have received the money.  Please contact us with any questions.";
  const goToPortal = () => {
    const borrowerPortalLink = process.env.LMS_APP_BASE_URL;
    window.location.replace(
      String(borrowerPortalLink || "https://lms.patrialending.com").concat(
        "/login"
      )
    );
  };
  return (
    <Container>
      <Congratulations
        onClick={goToPortal}
        note={congratulationsNote}
        btnName="Customer Portal"
      />
    </Container>
  );
};

export default LastStep;
