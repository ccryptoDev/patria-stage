import React from "react";
import styled from "styled-components";
import Stepper from "../../../organisms/Stepper";
import clock from "../../../../assets/png/clock.png";
import { Note } from "../../../atoms/Typography";
import { StepperProvider } from "../../../../contexts/steps";
import { steps } from "./config";
import Loader from "../../../molecules/Loaders/LoaderWrapper";
import { useUserData } from "../../../../contexts/user";
import Popup from "./Popup";

const Wrapper = styled.div`
  width: 100%;
  margin: 0 auto;

  & > .page-heading-wrapper {
    margin-bottom: 50px;
    & .note-wrapper {
      display: flex;
      align-items: center;
      margin-bottom: 28px;

      & img {
        margin-right: 16px;
      }
    }
    & h1 {
      font-size: 56px;
      line-height: 62px;
      font-weight: 700;
    }
  }

  @media screen and (max-width: 767px) {
    & > .page-heading-wrapper .heading {
      font-size: 32px;
      line-height: 36px;
    }
  }
`;

const setLastLevel = ({ user, loading }: { user: any; loading: boolean }) => {
  let lastLevel = user?.data?.lastlevel || 0;
  if (!loading && !user.data && !user?.isAuthorized) {
    lastLevel = 1;
  }

  return lastLevel;
};

const Application = () => {
  const { loading, user } = useUserData();
  const lastLevel = setLastLevel({ user, loading });
  return (
    <Loader loading={loading}>
      <Wrapper>
        <div className="page-heading-wrapper">
          <div className="note-wrapper">
            <img src={clock} alt="clock" />
            <Note className="note">
              It will take about 5 minutes to fill the form and less than a
              minute to get a decision. Check it out!
            </Note>
          </div>
          <h1 className="heading">Start Application</h1>
        </div>
        <StepperProvider steps={steps} initialStep={lastLevel}>
          <div className="stepper-wrapper">
            <Stepper />
          </div>
          <Popup />
        </StepperProvider>
      </Wrapper>
    </Loader>
  );
};

export default Application;
