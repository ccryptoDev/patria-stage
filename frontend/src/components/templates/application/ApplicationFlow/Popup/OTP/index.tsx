import React, { useState } from "react";
import { toast } from "react-toastify";
import OtpInput from "react-otp-input";
import { sendOTPApi, resendOTPApi } from "../../../../../../api/application";
import Wrapper, { Button } from "./styles";
import Loader from "../../../../../molecules/Loaders/LoaderWrapper";
import Counter from "./Counter";
import Header from "../Header";

const initTimer = 5;

const OTP = ({
  closeModal,
  state: { screenId, moveToNextStep, fetchUser },
}: any) => {
  const coldeLength = 5;
  const [code, setCode] = useState("");
  const [seconds, setSeconds] = useState(initTimer);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (value: string) => {
    if (error) setError("");
    setCode(value);
  };

  const resendOTP = async () => {
    setLoading(true);
    if (screenId) {
      await resendOTPApi(screenId);
      setSeconds(initTimer);
    } else {
      toast.error("missing screenTracking id");
    }
    setLoading(false);
  };

  const onSubmitHandler = async () => {
    if (!screenId) {
      toast.error("no screentracking id, connection error");
    }
    if (code.length !== coldeLength) {
      setError(`The code length should be ${coldeLength} digits`);
    } else if (screenId) {
      setLoading(true);
      const result: any = await sendOTPApi({
        code,
        screenTrackingId: screenId,
      });
      setLoading(false);
      const errorMessage: string = result?.error?.message;
      if (result && !errorMessage) {
        const user = await fetchUser();
        // IF THE USER IS A LEAD - JUST CLOSE THE MODAL AND KEEP THE USER ON SAME SCREEN
        closeModal();
        if (user?.data?.origin === "WEB") {
          moveToNextStep();
        }
        toast.success("Thank you!");
      } else if (errorMessage) {
        setError(errorMessage);
      }
    }
  };

  return (
    <Loader loading={loading}>
      <Wrapper>
        <Header text="Please enter the OTP code sent to your cellphone." />
        <div className="otp-container">
          <OtpInput
            value={code}
            onChange={handleChange}
            numInputs={coldeLength}
            separator={<span style={{ width: "4px" }} />}
            isInputNum
            inputStyle={{
              height: "45px",
              width: "45px",
            }}
            shouldAutoFocus
            className="input-container"
          />
          {error ? <div className="error-message">{error}</div> : ""}
        </div>
        <div className="form-footer">
          <Button type="button" onClick={onSubmitHandler}>
            Verify code
          </Button>
          {seconds ? (
            <Counter count={seconds} setCount={setSeconds} />
          ) : (
            <Button type="button" onClick={resendOTP}>
              Resend OTP
            </Button>
          )}
        </div>
      </Wrapper>
    </Loader>
  );
};

export default OTP;
