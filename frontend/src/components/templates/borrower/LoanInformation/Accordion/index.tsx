import React, { useState } from "react";
import styled from "styled-components";
import Accordion from "../../../../molecules/DropDowns/Accordion-Mui";
import { Chevron } from "../../../../atoms/Icons/SvgIcons/Chevron";

const Styles = styled.div`
  cursor: auto;
  & .chevron-icon {
    transition: all 0.3s;
    margin-left: 10px;
  }

  .accordion {
    background: #f9f9f9;
    padding: 16px;
    border: 1px solid var(--color-border);
    border-radius: 14px;
  }

  & .header {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    & .chevron-icon {
      transform: rotate(180deg);
    }
    .active {
      & .chevron-icon {
        transform: rotate(0deg);
      }
    }

    & .trigger-btn {
      width: 100%;
      background: transparent;
      text-align: left;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border: none;

      &-text {
        font-size: 14px;
        font-weight: 600;
      }
    }
  }
`;
const Schedule = ({ children, title }: { children: any; title: string }) => {
  const [open, setOpen] = useState(false);

  return (
    <Styles className="section">
      <Accordion
        expanded={open}
        button={
          <div className="header">
            <button
              type="button"
              className={`trigger-btn ${open ? "active" : ""}`}
              onClick={() => setOpen(!open)}
            >
              <div className="trigger-btn-text">{title}</div>
              <Chevron size="24" />
            </button>
          </div>
        }
        content={children}
      />
    </Styles>
  );
};

export default Schedule;
