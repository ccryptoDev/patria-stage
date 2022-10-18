import React from "react";
import styled from "styled-components";
import Dialog from "@material-ui/core/Dialog";
import IconButton from "@material-ui/core/IconButton";
import CloseIcon from "@material-ui/icons/Close";

// THIS IS A REUSABLE MODAL COMPONENT:
// YOU NEED TO CONNECT IT TO THE COMPONENT THAT IS TO TRIGGER IS
// YOU CAN GO THE STORYBOOK TO SEE HOW IT IS USED

const Modal = styled(Dialog)`
  .MuiDialog-container .MuiDialog-paperWidthSm {
    max-width: 967px;
    padding: 4.8rem;
    border-radius: 1.4rem;
  }

  z-index: 10000 !important;

  .MuiDialog-scrollPaper {
    align-items: start;
  }

  @media screen and (max-width: 600px) {
    .MuiDialog-container .MuiDialog-paperWidthSm {
      border-radius: 0;
      padding: 20px 10px 10px;
    }

    .MuiDialog-paper {
      margin: 0;
    }
  }
`;

const TitleWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 4.8rem;

  .MuiIconButton-root {
    padding: 2px;
    border: 1px solid;
    color: #000;
  }

  .heading {
    font-size: 2.4rem;
    text-align: center;
    flex-grow: 1;
    font-weight: 700;
  }
`;

const DialogTitle = ({
  onClose,
  children,
}: {
  onClose: any;
  children: any;
}) => {
  return (
    <TitleWrapper>
      <div className="heading"> {children}</div>
      {onClose ? (
        <IconButton aria-label="close" onClick={onClose}>
          <CloseIcon />
        </IconButton>
      ) : null}
    </TitleWrapper>
  );
};

type IModalDialog = {
  open: boolean;
  modalContent: any;
  modalTitle?: string;
  showHideButton?: boolean;
  state?: any;
  cb?: Function;
  handleClose: any;
  onBackdropClose?: boolean;
};

const ModalDialog = ({
  modalContent: Content,
  state,
  cb,
  open,
  handleClose,
  showHideButton = false,
  modalTitle,
  onBackdropClose = true,
}: IModalDialog) => {
  return (
    <Modal
      onClose={onBackdropClose ? handleClose : () => {}}
      aria-labelledby="customized-dialog-title"
      open={open}
    >
      {modalTitle || showHideButton ? (
        <DialogTitle onClose={handleClose}>{modalTitle}</DialogTitle>
      ) : (
        ""
      )}
      <Content closeModal={handleClose} state={state} cb={cb} />
    </Modal>
  );
};

export default ModalDialog;
