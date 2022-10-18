import React from "react";
import styled from "styled-components";
import TnLDesk from "./TruthInLending";
import TnLMobile from "./TruthInLendingMobile";

const Wrapper = styled.div`
  .tnl-sm {
    display: none;
  }
  @media screen and (max-width: 850px) {
    .tnl-lg {
      display: none;
    }
    .tnl-sm {
      display: block;
    }
  }
`;

const TrustInLending = ({ paymentData = {} }) => {
  return (
    <Wrapper>
      <TnLDesk paymentData={paymentData} />
      <TnLMobile paymentData={paymentData} />
    </Wrapper>
  );
};

export default TrustInLending;
