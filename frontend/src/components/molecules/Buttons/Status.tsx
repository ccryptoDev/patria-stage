import React from "react";
import styled from "styled-components";
import CheckIcon from "@mui/icons-material/Check";

const ButtonWrapper = styled.button`
  width: 100px;
  height: 43px;
  border-radius: 5px;
  box-sizing: border-box;
  background: transparent;
  border: 1px solid #eee;
  transition: all 0.2s;

  .button-title {
    display: flex;
    align-items: center;
    column-gap: 10px;
    justify-content: center;
  }
  &.active {
    background: #eee;
  }
`;

const StatusButton = ({
  onChange,
  active,
}: {
  onChange: any;
  active: boolean;
}) => {
  return (
    <ButtonWrapper
      type="button"
      onClick={onChange}
      className={active ? "active" : ""}
    >
      {active ? (
        <div className="button-title">
          Active
          <CheckIcon sx={{ fontSize: 24 }} />
        </div>
      ) : (
        <div className="button-title">Inactive</div>
      )}
    </ButtonWrapper>
  );
};

export default StatusButton;
