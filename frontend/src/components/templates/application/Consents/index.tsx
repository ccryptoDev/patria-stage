/* eslint no-underscore-dangle:0 */
import React, { useRef } from "react";
import { useReactToPrint } from "react-to-print";
import { Layout as Wrapper } from "./Style";
import Button from "../../../molecules/Buttons/ActionButton";
import ESignatureConsent from "./ESignature";
import PrivacyPolicyConsent from "./PrivacyPolicy";
import TermsOfUseConsent from "./TermsOfUse";
import OnlinePrivacyNoticeConsent from "./OnlinePrivaceNotice";

const FormComponent = ({ content: TextContent }: { content: any }) => {
  const textContent = useRef<any>();

  const handlePrint = useReactToPrint({
    content: () => textContent.current,
  });

  if (!TextContent) return <></>;
  return (
    <Wrapper>
      <div className="form-layout">
        <div ref={textContent}>
          <TextContent />
        </div>
        <Button type="print" onClick={handlePrint} />
      </div>
    </Wrapper>
  );
};

export const ESignature = () => {
  return <FormComponent content={ESignatureConsent} />;
};

export const PrivacyPolicy = () => {
  return <FormComponent content={PrivacyPolicyConsent} />;
};

export const TermsOfUse = () => {
  return <FormComponent content={TermsOfUseConsent} />;
};

export const OnlinePrivacyNotice = () => {
  return <FormComponent content={OnlinePrivacyNoticeConsent} />;
};
export default FormComponent;
