/* eslint no-underscore-dangle:0 */
import React, { useState, useRef, useEffect } from "react";
import styled from "styled-components";
import { useReactToPrint } from "react-to-print";
import { toast } from "react-toastify";
import PromissoryNote from "./Ric";
import SignaturePad from "./SignaturePad";
import {
  saveSignature,
  getUserSignatureContent,
  createSignedDocuments,
  acceptTerm,
  getUserLoanDocuments,
} from "../../../../../../api/application";
import { useUserData } from "../../../../../../contexts/user";
import Loader from "../../../../../molecules/Loaders/LoaderWrapper";
import ErrorMessage from "../../../../../molecules/Form/Elements/FormError";
import Button from "../../../../../atoms/Buttons/Button";
import {
  generatePdf,
  downloadRicPdf,
} from "../../../../../../utils/generatePdf";

const Styles = styled.div`
  width: 100%;
  border: 1px solid var(--color-grey-light);
  border-radius: 14px;
  background: #fff;
  padding: 24px;
  .note {
    font-weight: 400;
    font-size: 14px;
    line-height: 16px;
    margin-bottom: 12px;
  }

  .img-wrapper {
    margin-right: 40px;
  }
  @media screen and (max-width: 1024px) {
    padding: 12px;
  }
`;

const Form = styled.form`
  .heading {
    margin-bottom: 20px;
  }

  .form-layout {
    margin-bottom: 20px;

    .buttons {
      display: flex;
      width: 270px;
      justify-content: space-between;
      padding: 10px;
    }

    .printButton {
      display: block;
      margin: 0 auto;
    }
  }

  button {
    &:hover {
      box-shadow: none;
    }
  }
`;
const Continue = styled(Button)`
  margin-top: 10px !important;
`;

function FormComponent({
  moveToNextStep,
  isActive,
}: {
  moveToNextStep: any;
  isActive: boolean;
}) {
  const [signature, setSignature] = useState<string | null>(null);
  const sigCanvas = useRef<any>({});
  const ricContent = useRef<any>();
  const { user, fetchUser, screenId } = useUserData();
  const [loanDocData, setLoanDocData] = useState<any>(null);
  const [error, setError] = useState("");
  const [savingSignature, setSavingSignature] = useState(false);
  const [loading, setLoading] = useState(false);
  const [savingContract, setSavingContract] = useState(false);
  const [pdf, setPdf] = useState("");

  const contractProps = {
    loanDocData: user?.data || loanDocData,
    paymentData: loanDocData?.paymentData || {},
    userSignature: signature,
  };

  useEffect(() => {
    if (
      user?.data?.userSignaturePath &&
      !user?.data?.signatureContent &&
      isActive
    ) {
      getUserSignatureContent(screenId).then((res) => {
        setSignature(`data:image/png;base64,${res.data.content}`);
      });
    }
  }, [user, isActive]);

  useEffect(() => {
    const fetchDocuments = async () => {
      if (!loanDocData && user?.data && isActive) {
        setLoading(true);
        const result = await getUserLoanDocuments(user.data.id);
        setLoading(false);
        if (result && !result.error) {
          setLoanDocData(result?.data?.data);
        } else if (result.error) {
          setError(result.error.message || "failed to fetch documents");
        }
      }
    };
    fetchDocuments();
  }, [loanDocData, user, isActive]);

  const save = async () => {
    if (!sigCanvas.current.isEmpty()) {
      const sigURI = sigCanvas.current.getTrimmedCanvas().toDataURL();
      const fileTypeRegex = /data:(.*);base64/gi;

      const [imageMeta, base64Content] = sigURI.split(",");
      const [, fileType = ""] = fileTypeRegex.exec(imageMeta) || [];
      const payload = {
        fileType,
        data: base64Content,
      };
      setSavingSignature(true);
      await saveSignature({ payload, screenTrackingId: screenId });
      await acceptTerm({
        documentType: "patriaAgreement",
        screenTrackingId: screenId,
      });
      setSignature(sigURI);
      toast.success("signature has been saved");
      setSavingSignature(false);
    }
  };

  const continueToNextStep = async () => {
    setSavingContract(true);
    await fetchUser();
    const result = await generatePdf({
      component: <PromissoryNote {...contractProps} isPdf />,
      screenId,
    });
    if (result && !result.error) {
      moveToNextStep();
    }
    await createSignedDocuments(screenId, "consumerLoanAgreement", result);
    setSavingContract(false);
  };

  const handlePrint = useReactToPrint({
    content: () => ricContent.current,
  });

  // const generatePdfHandler = async () => {
  //   const res = await generatePdf({
  //     component: <PromissoryNote {...contractProps} isPdf />,
  //     screenId,
  //   });
  //   if (res) setPdf(res);
  // };

  if (!isActive) return <></>;

  if (!user || !user.data) return <Styles>something went wrong</Styles>;

  return (
    <Loader loading={loading}>
      <Styles>
        <Form>
          <div className="form-layout">
            <div ref={ricContent}>
              <PromissoryNote {...contractProps} />
            </div>
            {!signature ? (
              <Loader loading={savingSignature}>
                <SignaturePad
                  sigCanvas={sigCanvas}
                  save={save}
                  data={user?.data?.signatureContent}
                />
              </Loader>
            ) : (
              ""
            )}
            <Button
              type="button"
              className="printButton"
              variant="primary"
              onClick={handlePrint}
            >
              Print
            </Button>
            {signature && (
              <Continue
                type="button"
                className="printButton"
                variant="primary"
                disabled={savingContract || savingSignature || loading}
                onClick={continueToNextStep}
              >
                {savingContract ? "Saving Contract..." : "Continue"}
              </Continue>
            )}
          </div>

          <ErrorMessage message={error} />
        </Form>
        {/* <button type="button" onClick={generatePdfHandler}>
          generatePdf
        </button>
        {pdf ? (
          <button type="button" onClick={() => downloadRicPdf(pdf)}>
            generatePdf
          </button>
        ) : (
          ""
        )} */}
      </Styles>
    </Loader>
  );
}

export default FormComponent;
