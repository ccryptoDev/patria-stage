import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { renderEmploymentFields, initEmploymentForm } from "./config";
import { Heading } from "./Header";
// import { IEmploymentInfo } from "../../../types";
// import Loader from "../../../../../molecules/Loaders/LoaderWrapper";
// import { updateEmploymentHistory } from "../../../../../../api/application";
// import { parseFormToRequest } from "../../../../../../utils/parseForm";
// import { userEmployementInfo } from "../../../../../../api/types";
// import { errorHandler } from "../../../../../../utils/errorHandler";
// import { successHandler } from "../../../../../../utils/successHandler";
import { useUserData } from "../../../../../../contexts/user";

const Wrapper = styled.div`
  form {
    & .textField {
      margin-bottom: 12px;
    }
  }

  & > .header-wrapper {
    margin: 24px 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
`;

const EmploymentInfo = ({ data, isActive }: any) => {
  const [form, setForm] = useState(initEmploymentForm(data));
  const { user, fetchUser } = useUserData();

  useEffect(() => {
    if (!user?.data && isActive) {
      fetchUser().then((userData: any) => {
        const { origin, id: screenId } = userData?.data || {};

        // if (origin === "LEAD") {
        //   // PRE POPULATE IF IT'S A LEAD SINCEE THEY HAVE ALREADY ENTERED THE DATA ON BEHALF THE LOAN RETRIEVER
        //   triggerIdentityVerification(screenId);
        // }
        // SHOULD SEND EMPLOYMENT INFO TO THE API INSTEAD OF DIRECTLY MOVING NEXT STEP ONCE IS KBA/APPROVED APPROVED
      });
    }
  }, [isActive]);

  useEffect(() => {
    if (data && isActive) {
      setForm(initEmploymentForm(data));
    }
  }, [data, isActive]);

  // EDIT FORM DATA FUNCIONALITY (CANCELLED) - to-be-removed

  // const [edit, setEdit] = useState(false);
  // const [loading, setLoading] = useState(false);
  // const [didChanges, setDidChanges] = useState(false);

  // const onChangeHandler = (e: any) => {
  //   // eslint-disable-next-line no-unused-expressions
  //   !didChanges && setDidChanges(true);
  //   setForm((prevState) => ({
  //     ...prevState,
  //     [e.target.name]: { value: e.target.value, message: "" },
  //   }));
  // };

  // const onSaveFormData = async () => {
  //   const [isValid, updatedForm] = validateEIForm(form);
  //   if (didChanges && isValid) {
  //     setLoading(true);
  //     const payload = parseFormToRequest(updatedForm) as userEmployementInfo;
  //     await updateEmploymentHistory(data.id, payload, true)
  //       .then(() => {
  //         successHandler("Employment history successfully updated!");
  //         setDidChanges(false);
  //         setEdit(false);
  //       })
  //       .catch(errorHandler)
  //       .finally(() => setLoading(false));
  //   } else {
  //     setForm(updatedForm);
  //   }
  // };

  // const onCancelEdit = () => {
  //   setForm(initEmploymentForm(data));
  //   setEdit(false);
  // };

  return (
    <Wrapper>
      <Heading heading="Employment Information" />
      <form>
        {renderEmploymentFields(form).map(
          ({ component: Component, ...field }) => {
            return <Component key={field.name} {...field} disabled />;
          }
        )}
      </form>
    </Wrapper>
  );
};

export default EmploymentInfo;
