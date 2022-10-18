/* eslint-disable react/no-danger */
import React, { useEffect, useState } from "react";

interface PropsType {
  iframeUrl?: string;
  height?: string;
  onFetchLoginId?: any;
  screenId: string;
}

const FlinksWizard = ({
  iframeUrl,
  height,
  onFetchLoginId,
  screenId,
}: PropsType) => {
  const flinksListener = (e: any) => {
    if (e.data.loginId) {
      console.log("flink login id found==", e.data);
      onFetchLoginId({
        loginId: e.data.loginId,
        requestId: e.data.requestId,
        bankName: e.data.institution,
        accountId: e.data.accountId,
        screenTrackingId: screenId,
      });
      // postLoginId(e.data.loginId);
    }
  };
  useEffect(() => {
    if (screenId) {
      window.addEventListener("message", flinksListener);
    }
    return () => window.removeEventListener("message", flinksListener);
  }, [screenId]);

  return (
    <iframe
      style={{ zIndex: 10000, position: "relative" }}
      height={height}
      title="flinksWizard"
      src={iframeUrl}
      frameBorder="0"
    />
  );
};

export default FlinksWizard;
