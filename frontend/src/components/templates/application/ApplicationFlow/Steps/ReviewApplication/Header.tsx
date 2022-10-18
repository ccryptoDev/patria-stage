import React from "react";
import styled from "styled-components";
import ActionButton from "../../../../../molecules/Buttons/ActionButton";
import Button from "../../../../../atoms/Buttons/Button";
import { H3 } from "../../../../../atoms/Typography";

const Wrapper = styled.div`
  margin: 24px 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 46px;

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
  enableEditing?: boolean;
};

// THIS IS A SIMPLE HEADING WITH NO EDIT FUNCTIONALITY
export const Heading = ({ heading }: { heading: string }) => {
  return (
    <Wrapper>
      <H3>{heading}</H3>
    </Wrapper>
  );
};

// THIS HEADING INCLUDES EDIT FORM FUNCTIONALITY
const Header = ({
  onEdit,
  onCancel,
  onSave,
  edit,
  heading,
  enableEditing = true,
}: IReviewInfoHeader) => {
  return (
    <Wrapper>
      <H3>{heading}</H3>
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
        enableEditing && <ActionButton onClick={onEdit} type="edit" />
      )}
    </Wrapper>
  );
};

export default Header;
