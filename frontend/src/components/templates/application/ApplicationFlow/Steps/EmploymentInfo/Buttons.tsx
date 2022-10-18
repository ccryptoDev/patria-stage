import React from "react";
import styled from "styled-components";
import Button from "../../../../../atoms/Buttons/Button";
import { UNDERWRITING_STATUS } from "../../../../../../utils/underwritingStatus";
import ErrorMessage from "../../../../../molecules/Form/Elements/FormError";

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  column-gap: 10px;
  .errorMessage {
    padding: 0;
    margin: 0;
    justify-content: end;
  }
`;

const RenderButton = ({
  underwritingStatus,
}: {
  underwritingStatus: string;
}) => {
  const goToPortal = () => {
    window.location.href = "/borrower";
  };

  if (underwritingStatus === UNDERWRITING_STATUS.FAILED) {
    return (
      <Button type="button" variant="primary" onClick={goToPortal}>
        Visit Portal
      </Button>
    );
  }
  if (underwritingStatus === UNDERWRITING_STATUS.RETTRY) {
    return (
      <Button type="submit" variant="primary">
        Re-try
      </Button>
    );
  }

  return (
    <Button type="submit" variant="primary">
      Confirm
    </Button>
  );
};

const Buttons = ({ underwritingStatus, error }: any) => {
  return (
    <Wrapper>
      <RenderButton underwritingStatus={underwritingStatus} />
      <ErrorMessage message={error} />
    </Wrapper>
  );
};

export default Buttons;
