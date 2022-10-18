import React from "react";
import styled from "styled-components";
import { H2, Note } from "../../../../../atoms/Typography";
import logo from "../../../../../../assets/svgs/success-logo.svg";
import Button from "../../../../../atoms/Buttons/Button";

const Wrapper = styled.div`
  .logo {
    margin: 30px 0;
  }
  .note {
    margin-bottom: 24px;
  }
`;

const SuccessMessage = ({
  onClick,
  btnName,
  note,
}: {
  onClick: any;
  btnName: string;
  note: string;
}) => {
  return (
    <Wrapper>
      <H2>Congratulations!</H2>
      <img src={logo} alt="success" className="logo" />
      <Note className="note">{note}</Note>
      <Button onClick={onClick} type="button" variant="primary">
        {btnName}
      </Button>
    </Wrapper>
  );
};

export default SuccessMessage;
