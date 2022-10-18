import React, { useEffect, useState } from "react";
import styled from "styled-components";
import Header from "../../../Components/FormHeader";
import LoanInformation from "./LoanInformation";
import EmploymentInfo from "./EmploymentInfo";
import PersonalInfo from "./PersonalInfo";
import BankingInfo from "./BankingInfo";
import { Hr } from "../../../../../atoms/Typography";
import Button from "../../../../../atoms/Buttons/Button";
import Container from "../../styles";
import {
  getEmploymentHistory,
  confirmApplicationReview,
} from "../../../../../../api/application";
import Loader from "../../../../../molecules/Loaders/LoaderWrapper";
import { useUserData } from "../../../../../../contexts/user";

const Wrapper = styled(Container)`
  hr {
    margin: 24px 0;
  }

  @media screen and (max-width: 600px) {
    .details {
      flex-direction: column;
      row-gap: 24px;

      &-amount-label {
        text-align: left;
      }
    }
  }
`;

const FormComponent = ({
  goToStep,
  moveToNextStep,
  isActive,
}: {
  goToStep: any;
  moveToNextStep: any;
  isActive: boolean;
}) => {
  const [loading, setLoading] = useState(false);
  const [employmentHistory, setEmploymentHistory] = useState({} as any);
  const { loading: fetchingUser, user, screenId } = useUserData();
  const userData = user?.data?.user || null;
  const offerData = user?.data?.selectedOffer || null;
  const bankName = user?.data?.bankName || "";

  const fetchEmployment = async () => {
    setLoading(true);
    const result = await getEmploymentHistory();
    setLoading(false);
    if (result && !result.error) {
      setEmploymentHistory(result?.data?.data);
    } else if (result.error) {
      const message = result.error || "cannot fetch employment history";
      // toast.error(message);
    }
  };

  useEffect(() => {
    if (isActive) {
      fetchEmployment();
    }
  }, [isActive]);

  const onSubmit = async () => {
    setLoading(true);
    const result = await confirmApplicationReview({
      screenTrackingId: screenId,
    });
    setLoading(false);
    if (result && !result.error) {
      moveToNextStep();
    }
  };

  const title = "Congratulations!";
  const note =
    "Review your application information before you sign your loan documents.";

  return (
    <Wrapper>
      <Loader loading={loading || fetchingUser}>
        <div>
          <Header title={title} note={note} />
          <LoanInformation
            goToStep={goToStep}
            data={offerData}
            isActive={isActive}
          />
          <Hr />
          <PersonalInfo data={userData} />
          <Hr />
          <EmploymentInfo data={employmentHistory} isActive={isActive} />
          <Hr />
          <BankingInfo bankName={bankName} goToStep={goToStep} />
          <Button
            onClick={onSubmit}
            disabled={loading}
            type="button"
            variant="primary"
          >
            Confirm
          </Button>
        </div>
      </Loader>
    </Wrapper>
  );
};

export default FormComponent;
