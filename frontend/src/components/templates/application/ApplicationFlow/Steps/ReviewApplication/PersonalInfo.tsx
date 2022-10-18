import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { IPersonalInfoForm } from "../../../types";
import { Heading } from "./Header";
import { renderPersonalInfoFields, initPersonalInfo } from "./config";
// import { parseFormToRequest } from "../../../../../../utils/parseForm";
// import { updateUserInfo } from "../../../../../../api/application";
// import { errorHandler } from "../../../../../../utils/errorHandler";
// import { successHandler } from "../../../../../../utils/successHandler";
// import Loader from "../../../../../molecules/Loaders/LoaderWrapper";

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

const PersonalInfo = ({ data }: { data: any }) => {
  const [form, setForm] = useState(initPersonalInfo({}));

  useEffect(() => {
    if (data) setForm(initPersonalInfo(data));
  }, [data]);

  // EDIT FORM DATA FUNCIONALITY (CANCELLED)

  // const [edit, setEdit] = useState(false);
  // const [didChanges, setDidChanges] = useState(false);
  // const [loading, setLoading] = useState(false);

  // const onSaveFormData = async () => {
  //   const [isValid, updatedForm] = validateEIForm(form);
  //   if (didChanges && isValid) {
  //     setLoading(true);
  //     const payload = parseFormToRequest(updatedForm) as any;
  //     await updateUserInfo(payload, true)
  //       .then(() => {
  //         successHandler("Personal information successfully updated!");
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
  //   setForm(initPersonalInfo(data));
  //   setEdit(false);
  // };
  // const onChangeHandler = (e: any) => {
  //   // eslint-disable-next-line no-unused-expressions
  //   !didChanges && setDidChanges(true);
  //   setForm((prevState) => ({
  //     ...prevState,
  //     [e.target.name]: { value: e.target.value, message: "" },
  //   }));
  // };

  return (
    <Wrapper>
      <Heading heading="Personal Information" />
      <form>
        {renderPersonalInfoFields(form).map(
          ({ component: Component, lockEditing = false, ...field }) => {
            return <Component key={field.name} {...field} disabled />;
          }
        )}
      </form>
    </Wrapper>
  );
};

export default PersonalInfo;
