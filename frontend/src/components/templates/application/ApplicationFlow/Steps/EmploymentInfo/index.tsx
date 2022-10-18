import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { toast } from "react-toastify";
import { useHistory } from "react-router-dom";
import { initForm, renderFields, validateForm } from "./config";
import Header from "../../../Components/FormHeader";
import Container from "../../styles";
import Loader from "../../../../../molecules/Loaders/LoaderWrapper";
import {
  createNewEmploymentHistory,
  getEmploymentHistory,
  updateEmploymentHistory,
} from "../../../../../../api/application";
import { parseFormToRequest } from "../../../../../../utils/parseForm";
import { errorHandler } from "../../../../../../utils/errorHandler";
import { parsePropsToForm } from "../../../../../../utils/form/parsers";
import { useStepper } from "../../../../../../contexts/steps";
import { successHandler } from "../../../../../../utils/successHandler";
import { useUserData } from "../../../../../../contexts/user";
import Buttons from "./Buttons";

const Form = styled.form`
  max-width: 724px;
  width: 100%;
  .textField {
    margin-bottom: 12px;
    width: 100%;
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
  const [form, setForm] = useState(initForm({}));
  const [loading, setLoading] = useState(false);
  const [employmentId, setEmploymentId] = useState("");
  const { moveToPreviousStep } = useStepper();
  const [underwritingStatus, setUnderwritingStatus] = useState<any>(null);
  const { screenId, user, fetchUser } = useUserData();
  const [errorMessage, setErrorMessage] = useState("");
  const history = useHistory();

  const fetchEmploymentHistory = async () => {
    const result = await getEmploymentHistory();
    if (result && !result.error) {
      const { data: employmentHistory } = result.data;
      if (employmentHistory && employmentHistory?.id) {
        setEmploymentId(employmentHistory.id);
        setForm(initForm(employmentHistory));
      }
    } else if (result.error) {
      // toast.error(result.error);
    }
  };

  useEffect(() => {
    // CHECK UNDERWRITING DECISION
    if (isActive && user) {
      const underwritingDecision: any = user?.data.underwritingDecision || null;
      if (underwritingDecision && underwritingDecision?.status) {
        // if (underwritingDecision.reason) {
        //   setErrorMessage(underwritingDecision.reason);
        // } else {
        //   setErrorMessage("");
        // }
        setUnderwritingStatus(underwritingDecision?.status);
      }
      fetchEmploymentHistory();
    }
  }, [isActive, user]);

  const onSubmitHandler = async (e: any) => {
    e.preventDefault();
    const [isValid, validatedForm] = validateForm(form);
    console.log("form", form);
    if (isValid && screenId) {
      setLoading(true);
      let error: any = "";
      const payload = parseFormToRequest(validatedForm) as any;
      if (!editing) {
        const result: any = await createNewEmploymentHistory({
          payload,
          screenTrackingId: screenId,
        });
        if (result && !result.error) {
          moveToNextStep();
        } else if (result.error) {
          const res = await fetchUser();

          if (
            ["failed", "queued"].includes(
              res?.data?.underwritingDecision?.status
            )
          ) {
            history.push("/application/thankyou");
            return;
          }
        }
      } else {
        const result = await updateEmploymentHistory({ employmentId, payload });
        if (result && !result.error) {
          successHandler("Employment information successfully updated!");
          moveToPreviousStep();
        } else if (result.error) {
          error = result.error;
        }
      }
      if (error) {
        setUnderwritingStatus(error?.error?.underwritingStatus);
        errorHandler(error);
      }

      setLoading(false);
    } else {
      setForm(validatedForm);
    }
  };

  const onChangeHandler = (e: any) => {
    setForm((prevState) => ({
      ...prevState,
      [e.target.name]: { value: e.target.value, message: "" },
    }));
  };

  const title = "Employment Information";
  const note =
    "Tell us more about current employment. It will help us to find a more accurate solution that makes sense to you.";
  return (
    <Container>
      <Loader loading={loading}>
        <Form onSubmit={onSubmitHandler}>
          <Header title={title} note={note} />
          {renderFields(form).map(({ component: Component, ...field }) => {
            return (
              <Component
                key={field.name}
                {...field}
                onChange={onChangeHandler}
              />
            );
          })}

          <Buttons
            underwritingStatus={underwritingStatus}
            error={errorMessage}
          />
        </Form>
      </Loader>
    </Container>
  );
};

export default FormComponent;
