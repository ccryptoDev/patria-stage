import React from "react";
import styled from "styled-components";
import ActionButton from "../../../molecules/Buttons/ActionButton";
import Button from "../../../atoms/Buttons/Button";
import { H5 as Heading } from "../../../atoms/Typography";

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  background: #f9f9f9;
  border-bottom: 1px solid var(--color-border);

  .edit-mode-buttons {
    &-lg {
      display: flex;
    }
    &-mobile {
      display: none;
    }
    &-lg,
    &-mobile {
      align-items: center;
      column-gap: 12px;
    }
  }

  @media screen and (max-width: 767px) {
    .edit-mode-buttons {
      &-lg {
        display: none;
      }
      &-mobile {
        display: flex;
      }
    }
  }
`;

type IReviewInfoHeader = {
  onEdit: any;
  onCancel?: any;
  onSave?: any;
  edit: boolean;
  heading: string;
  onContinueApplication?: any;
};

const Header = ({
  onEdit,
  onCancel,
  onSave,
  edit,
  heading,
  onContinueApplication,
}: IReviewInfoHeader) => {
  return (
    <Wrapper>
      <Heading>{heading}</Heading>
      {edit ? (
        <div className="edit-mode-buttons">
          <div className="edit-mode-buttons-mobile">
            <ActionButton onClick={onCancel} type="cancel" />
            <ActionButton onClick={onSave} type="save" />
          </div>
          <div className="edit-mode-buttons-lg">
            <Button type="button" variant="primary" onClick={onSave}>
              Save
            </Button>
            <Button type="button" variant="secondary" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <>
          <div className="edit-mode-buttons-mobile">
            <ActionButton onClick={onEdit} type="edit" />
          </div>
          <div className="edit-mode-buttons-lg">
            <Button
              type="button"
              variant="secondary"
              onClick={onContinueApplication}
            >
              Continue Application
            </Button>
          </div>
          {/* <div className="edit-mode-buttons-lg">
            <Button type="button" variant="secondary" onClick={onEdit}>
              Edit
            </Button>
          </div> */}
        </>
      )}
    </Wrapper>
  );
};

export default Header;
