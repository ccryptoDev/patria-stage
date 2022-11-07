import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { useHistory } from "react-router-dom";
import { toast } from "react-toastify";
import Button from "../../../../../atoms/Buttons/Button";
import { initForm, renderFields } from "./config";
import { validateForm } from "./validate";
import Header from "../../../Components/FormHeader";
import Container from "../../styles";
import { parseFormToRequest } from "../../../../../../utils/parseForm";
import Loader from "../../../../../molecules/Loaders/LoaderWrapper";
import {
  createNewUserApplication,
  updateUserInfo,
} from "../../../../../../api/application";
import { login } from "../../../../../../api/authorization";
import { useAppContextData } from "../../../../../../contexts/global";
import { useUserData } from "../../../../../../contexts/user";

const Form = styled.form`
  .textField {
    margin-bottom: 12px;
    width: 100%;
  }

  & .confirm-btn {
    margin-top: 24px;
  }

  & button[type="submit"] {
    margin-top: 24px;
  }

  @media screen and (max-width: 500px) {
    .textField:first-child {
      margin-top: 12px;
    }
  }
`;

const FormComponent = ({
  moveToNextStep,
  editing,
  isActive,
}: {
  moveToNextStep: any;
  editing: boolean;
  isActive: boolean;
}) => {
  const { data } = useAppContextData(); // used to transfer form data from landing page apply form
  const [form, setForm] = useState(initForm(data));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const history = useHistory();

  const { fetchUser, user, triggerIdentityVerification } = useUserData();

  useEffect(() => {
    if (user?.data?.user && isActive) {
      setForm(initForm(user?.data?.user));
    }
    // IF THE FORM NEEDS TO GO THROUGH IDENTITY VALIDATION
    // if (lastLevel === 1 && screenId) {
    //   triggerIdentityVerification(screenId);
    // }
  }, [user?.data?.user, isActive]);

  const onSubmitHandler = async (e: any) => {
    e.preventDefault();
    const [isValid, validatedForm] = validateForm(form, editing);

    if (isValid) {
      setLoading(true);
      const payload = parseFormToRequest(validatedForm) as any;

      if (!editing) {
        const parsedPayload = {
          // THIS ID IS TAKEN FROM THE CDN THAT IS INJECTED IN THE SCRIPT - USED TO CREATE THE SESSION ID
          trueValidateSessionId: localStorage.getItem("trueValidateSessionId"),
          firstName: payload.firstName,
          lastName: payload.lastName,
          phone: payload.phoneNumber,
          requestedLoan: payload.requestedLoan,
          dob: payload.dateOfBirth,
          ssn: payload.ssn_number,
          email: payload.email,
          password: payload.password,
          street: payload.street,
          city: payload.city,
          zipCode: payload.zipCode,
          state: payload.state,
        };

        const loginPayload = {
          email: payload.email,
          password: payload.password,
        };

        const result: any = await createNewUserApplication(parsedPayload);
        // console.log("result.error", result.error);
        // IF THE USER IS REGISTERED WITH IDENTITY VALIDATION RISK - CALL KBA/OTP VALIDATION POPUP
        if (
          result &&
          result.error &&
          result.error.error.message &&
          result.error.error.status === "pending" &&
          result.error.context.screentrackingId
        ) {
          const loginResult = await login(loginPayload);
          // LOGIN ERROR
          if (loginResult.error) {
            // toast.error("login error");
          } else {
            const userData = await fetchUser();
            triggerIdentityVerification(
              result?.error?.context?.screentrackingId ||
                userData?.screenTrackingId
            );
          }
          setLoading(false);
          return;
        }
        if (
          result &&
          result.error &&
          result.error.error.message &&
          result.error.error.status === "failed" &&
          result.error.context.screentrackingId
        ) {
          history.push("application/thankyou");
          return;
        }
        if (
          result &&
          result.error &&
          result.error.error.message &&
          result.error.error.status === "failed" &&
          !result.error.context.screentrackingId
        ) {
          const isDuplicate = String(result.error.error.message)
            .toLowerCase()
            .includes("duplicate");
          if (isDuplicate) {
            history.push("application/thankyou");
            return;
          }
        }
        if (
          result &&
          result.error &&
          result.error.error.message &&
          result.error.error.status === "retry" &&
          result.error.context.screentrackingId
        ) {
          setForm((prevState) => ({
            ...prevState,
            ssn_number: {
              ...prevState.ssn_number,
              message: result.error.error.message,
            },
          }));
          setLoading(false);
          return;
        }
        if (
          result &&
          result.error &&
          result.error.error.message &&
          result.error.error.status !== "pending" &&
          result.error.context.screentrackingId
        ) {
          // SERVER-SIDE FORM VALIDATION ERROR
          // toast.error(result.error.error.message);
          const updateUserRes = await updateUserInfo(parsedPayload);
          if (updateUserRes && updateUserRes.error) {
            setLoading(false);
            return;
          }
        }

        const loginResult = await login(loginPayload);
        // LOGIN ERROR
        if (loginResult.error) {
          // toast.error("login error");
        }
        const userData = await fetchUser();

        // ON FORM DATA APPROVED AND NO ADDITIONAL CHECKES REQUIRED - MOVE TO NEXT STEP
        if (
          !result.error &&
          !loginResult.error &&
          userData &&
          userData.lastlevel !== 1
        ) {
          moveToNextStep();
        }
      } else {
        // UPDATE THE PERSONAL INFO FORM
        const result = await updateUserInfo(payload);
        if (result && !result.error) {
          toast.success("Personal information successfully updated!");
          moveToNextStep();
        } else {
          // toast.error("something went wrong");
        }
      }
      setLoading(false);
    } else {
      // SET FORM VALIDATION ERRORS
      setForm(validatedForm);
    }
  };

  const onChangeHandler = (e: any) => {
    setForm((prevState) => ({
      ...prevState,
      [e.target.name]: { value: e.target.value, message: "" },
    }));
  };

  const title = "Personal Information";
  const note =
    "Tell us more about yourself. It will help us to find a more accurate solution that makes sense to you.";

  if (!isActive) {
    return <></>;
  }

  return (
    <Container>
      <Loader loading={loading}>
        <Form onSubmit={onSubmitHandler}>
          <Header title={title} note={note} />
          {renderFields(form, editing).map(
            ({ component: Component, lockEditing, ...field }) => {
              return (
                <Component
                  disabled={lockEditing}
                  key={field.name}
                  {...field}
                  onChange={onChangeHandler}
                />
              );
            }
          )}

          <Button type="submit" variant="primary">
            Confirm
          </Button>
        </Form>
      </Loader>
    </Container>
  );
};

export default FormComponent;
