import React from "react";
import styled from "styled-components";
import imageIcon from "../../../../../../assets/png/image-icon.png";
import { formatDate } from "../../../../../../utils/formats";
import { Note } from "../../../../../atoms/Typography";
import trashIcon from "../../../../../../assets/png/trash-icon.png";

const Li = styled.li`
  display: flex;
  justify-content: space-between;
  column-gap: 10px;
  &:not(:first-child) {
    margin-top: 12px;
  }

  .file {
    &-info-wrapper {
      display: flex;
      align-items: center;
      column-gap: 12px;
    }

    &-icon {
      height: 18px;
      width: 21px;
    }

    &-name {
      color: var(--color-primary);
      margin-bottom: 2px;
    }

    &-date {
      color: var(--color-grey-light);
      font-size: 10px;
      line-height: 12px;
    }
  }

  .remove-btn {
    border: none;
    background: transparent;
  }
`;

const ListItem = ({
  onRemove,
  name,
  date,
}: {
  onRemove: any;
  name: string;
  date: string;
}) => {
  return (
    <Li>
      <div className="file-info-wrapper">
        <img src={imageIcon} alt={name} className="file-icon" />
        <div className="file-name-box">
          <Note className="file-name">{name}</Note>
          <div className="file-date">{formatDate(date)}</div>
        </div>
      </div>
      <button type="button" onClick={onRemove} className="remove-btn">
        <img src={trashIcon} alt="remove" />
      </button>
    </Li>
  );
};

export default ListItem;
