import React, { useState } from "react";
import Button from "../../components/atoms/Buttons/Button";
import Buttons from "../../components/atoms/Form/Buttons-wrapper";
import { ModalDialog } from "../../components/organisms/Modal/ForArgyle/Modal";
import { Wrapper, Logo } from "../../components/molecules/Argyle/Popup";

export default {
  title: "Example/Modals/Argyle",
  component: ModalDialog,
};

const Form = ({ closeModal }) => {
  return (
    <Wrapper>
      <Logo />
      <Buttons className="buttons-wrapper">
        <Button type="button" variant="primary" onClick={closeModal}>
          Close modal
        </Button>
      </Buttons>
    </Wrapper>
  );
};

export const Modal = () => {
  const [open, setOpen] = useState(false);
  return (
    <Buttons className="buttons-wrapper">
      <Button type="button" variant="primary" onClick={() => setOpen(true)}>
        Open modal
      </Button>
      <ModalDialog
        modalContent={Form}
        handleClose={() => setOpen(false)}
        open={open}
        state={{ data: null }}
      />
    </Buttons>
  );
};
