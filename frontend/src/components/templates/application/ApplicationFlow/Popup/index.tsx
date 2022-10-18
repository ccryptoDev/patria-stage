import React, { useState, useEffect } from "react";
import Modal from "../../../../organisms/Modal/Regular";
import KBA from "./KBA";
import OTP from "./OTP";
import { useUserData } from "../../../../../contexts/user";
import { useStepper } from "../../../../../contexts/steps";

interface IContentType {
  isKbaRequested?: boolean;
  isOtpRequested: boolean;
}

const renderScreen = ({ isOtpRequested }: IContentType) => {
  if (isOtpRequested) {
    return OTP;
  }

  return KBA;
};

// #itentityVerificationModal

const Popup = () => {
  const { screenId, verificationType, fetchUser } = useUserData();
  const { moveToNextStep } = useStepper();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // CALL CHECK ON EVERY AUTHORIZED SCREEN
    if (verificationType.isOtpRequested || verificationType.isKbaRequested) {
      setOpen(true);
    }
  }, [verificationType]);

  return (
    <div>
      <Modal
        modalContent={renderScreen(verificationType)}
        open={open}
        state={{ screenId, moveToNextStep, fetchUser }}
        handleClose={() => setOpen(false)}
        onBackdropClose={false}
      />
    </div>
  );
};

export default Popup;
