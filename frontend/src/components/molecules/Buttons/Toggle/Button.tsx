import React, { useState } from "react";
import styled from "styled-components";

const Wrapper = styled.div`
  border: 1px solid #144376;
  border-radius: 2.5rem;
  padding: 3px;
  width: 30rem;
  margin: 0 auto;

  button {
    padding: 0.7rem 2.4rem;
    border-radius: 2.5rem;
    border: 1px solid transparent;
    background: transparent;
    color: #212529;
  }

  .active {
    background-color: #144376;
    color: white;
    border: 1px solid #144376;
  }
`;

const buttons = {
  PERSONAL_LOAN: "PERSONAL_LOAN",
  SALARY_ADVANCE: "SALARY_ADVANCE",
};

export default function Toggle({ onChange }: { onChange?: any }) {
  const [active, setActive] = useState<string>(buttons.PERSONAL_LOAN);

  const toggleButton = (e: React.MouseEvent<HTMLButtonElement>) => {
    const { name } = e.target as HTMLTextAreaElement;
    setActive(name);
    onChange(name);
  };
  return (
    <Wrapper>
      <button style={{ marginRight: "-4px" }} type="button" className={active === buttons.PERSONAL_LOAN ? "active" : ""} name={buttons.PERSONAL_LOAN} onClick={toggleButton}>
        Personal Loan
      </button>
      <button type="button" style={{ marginLeft: "-4px" }} className={active === buttons.SALARY_ADVANCE ? "active" : ""} name={buttons.SALARY_ADVANCE} onClick={toggleButton}>
        Salary Advance
      </button>
    </Wrapper>
  );
}
