import React, { useState } from "react";
import styled from "styled-components";
import { useHistory } from "react-router-dom";
import { Form } from "../styles";
import Button from "../../../../../../atoms/Buttons/Button";
import Header from "../../../../Components/FormHeader";
import FlinksWizard from "./flinksWizard";
import { useUserData } from "../../../../../../../contexts/user";
import {
  saveFlinksLoginId,
  verifyBankCredentials,
} from "../../../../../../../api/application";
import { useStepper } from "../../../../../../../contexts/steps";
import Loader from "../../../../../../molecules/Loaders/LoaderWrapper";
import { errorHandler } from "../../../../../../../utils/errorHandler";

const FrameWrapper = styled.div`
  margin: 24px 0;

  & .btn-manual {
    margin-top: 24px;
  }

  & iframe {
    width: 100%;
  }

  @media screen and (max-width: 500px) {
    & {
      margin: 12px 0;
    }
    .logo img {
      max-width: 80%;
    }
  }
`;

const ButtonsWrapper = styled.div`
  max-width: 342px;
  width: 100%;
  .btn {
    &-continue,
    &-manual {
      width: 100%;
    }
    &-manual {
      margin-top: 12px;
    }
  }
`;

const Auto = () => {
  const { fetchUser, screenId } = useUserData();
  const { moveToNextStep } = useStepper();
  const [isFlinksLoggedIn, setIsFlinksLoggedIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const history = useHistory();

  const title = "Checking Account Verification";
  const iframeUrl =
    "https://patrialending-iframe.private.fin.ag/?demo=false&redirectUrl=https://flinks.com/contact/thank-you&accountSelectorNoTitle=true&accountSelectorEnable=true&innerRedirect=true&theme=light&consentEnable=true&customerName=Patria Lending&backgroundColor=f7f7f7&foregroundColor1=000000&desktopLayout=true&headerEnable=false&institutionFilterEnable=true&daysOfTransactions=Days365&accountSelectorCurrency=usd&showAllOperationsAccounts=true";

  const onFetchLoginId = async ({
    loginId,
    requestId,
    bankName,
    accountId,
    screenTrackingId,
  }: any) => {
    const payload = {
      screenTrackingId,
      loginId,
      requestId,
      bankName,
      selectedAccountId: accountId,
    };
    if (loginId && accountId && requestId && bankName) {
      setLoading(true);
      await saveFlinksLoginId(payload);
      setIsFlinksLoggedIn(true);
      setLoading(false);
    } else if (!loginId) {
      // TOAST ERROR HERE THAT FLINKS LOGIN ID NOT RETRIEVED
      errorHandler({ error: "Flinks Not initiated Try Again" });
    }
  };

  const onSubmitHandler = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    // IF ID VERIFICATION IS REQUIRED IT WILL TRIGGER MODAL VIA USER CONTEXT AND SET FURTHER ACTIONS FROM THE MODAL
    // -- search: #identityVerificationModal
    const response: any = await verifyBankCredentials({
      screenTrackingId: screenId,
    });

    const result = await fetchUser();
    if (response.ok && !response.error) {
      moveToNextStep();
      // toast.error(response?.error?.message);
    }

    if (
      ["failed", "queued"].includes(result?.data?.underwritingDecision?.status)
    ) {
      history.push("/application/thankyou");
      return null;
    }

    setLoading(false);
    return null;
  };

  const FlinksNote = () => {
    return (
      <span>
        We need to verify the account details where your loan funds will be
        deposited. Please login to your online banking account below to verify
        your account. This instant bank verification process is safe and secure
        and we do not keep your login details.
        <br />
        <br />
        <b>
          Please select your primary checking account. It might take a few
          minutes to connect to your bank account, please be patient.
        </b>
      </span>
    );
  };

  return (
    <Loader loading={loading}>
      <Form>
        <Header title={title} note={FlinksNote()} />

        <FrameWrapper>
          <FlinksWizard
            iframeUrl={iframeUrl}
            screenId={screenId}
            height="400"
            onFetchLoginId={onFetchLoginId}
          />
        </FrameWrapper>
        <ButtonsWrapper>
          <div>
            {isFlinksLoggedIn && (
              <Button
                type="button"
                variant="primary"
                className="btn-continue"
                onClick={(e) => onSubmitHandler(e)}
              >
                Continue
              </Button>
            )}
          </div>
        </ButtonsWrapper>
      </Form>
    </Loader>
  );
};

export default Auto;
