import React, { useState, useEffect } from "react";
import styled from "styled-components";
import ModalDialog from "./index";

const Wrapper = styled.div`
  display: inline-block;

  button {
    border: none;
    background: transparent;
  }
`;

export default function Modal({
  button = null, // button component that triggers the modal open
  modalContent, // modal content
  modalTitle = "", // modal heading
  state, //modal data
  triggerModal, // this prop opens the modal functionaly: e.g. on timer
  cb,
}: {
  button: JSX.Element | null;
  modalContent: any;
  modalTitle?: string;
  state?: any;
  triggerModal?: Function;
  cb?: Function;
}) {
  const [open, setOpen] = useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };

  useEffect(() => {
    // this prop opens the modal functionaly: e.g. on timer
    if (triggerModal) {
      setOpen(true);
    }
  }, [triggerModal]);

  return (
    <Wrapper className="modal">
      {button && (
        <button type="button" onClick={handleClickOpen}>
          {button}
        </button>
      )}
      <ModalDialog
        modalContent={modalContent}
        modalTitle={modalTitle}
        state={state}
        cb={cb}
        handleClose={handleClose}
        open={open}
      />
    </Wrapper>
  );
}
