import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { useHistory } from "react-router-dom";
import {
  renderPersonalInfoFields,
  initPersonalInfoForm,
  validatePIForm,
} from "./config";
import { BorrowerDataType, IPersonalInfoForm } from "../../application/types";
import Header from "./Header";
import { mockRequest } from "../../application/utils";
import Loader from "../../../molecules/Loaders/LoaderWrapper";
import { useUserData } from "../../../../contexts/user";
import { routes } from "../../../../routes/Borrower/routes";

const Wrapper = styled.div`
  form {
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-gap: 12px;
    padding: 16px;
  }

  .edit {
    & .textField input {
      background: #fff;
      border: 1px solid var(--color-border);
    }
  }

  & > .header-wrapper {
    margin: 24px 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  @media screen and (max-width: 650px) {
    form {
      grid-template-columns: 1fr;
    }
  }
`;

const PersonalInfo = ({ data }: { data: IPersonalInfoForm }) => {
  const { user: borrowerData, fetchUser, loading }: any = useUserData();
  const history = useHistory();

  const [form, setForm] = useState(initPersonalInfoForm({}));
  const [submitLoading, setSubmitLoading] = useState(false);
  const [edit, setEdit] = useState(false);

  const onChangeHandler = (e: any) => {
    setForm((prevState: any) => ({
      ...prevState,
      [e.target.name]: { value: e.target.value, message: "" },
    }));
  };

  useEffect(() => {
    fetchUser();
  }, []);

  useEffect(() => {
    if (borrowerData && borrowerData?.user) {
      const initData: any = initPersonalInfoForm(borrowerData?.user);
      setForm(initData);
    }
  }, [borrowerData]);

  const onSaveFormData = async () => {
    const [isValid, updatedForm] = validatePIForm(form);
    if (isValid) {
      setSubmitLoading(true);
      await mockRequest();
      setSubmitLoading(false);
      setEdit(false);
    } else {
      setForm(updatedForm);
    }
  };

  const onCancelEdit = () => {
    setForm(initPersonalInfoForm(data));
    setEdit(false);
  };

  // const onContinueApplication = () => {
  //   const token = localStorage.getItem("userToken");
  //   const url = `${process.env.REACT_APP_BASE_URL}/application/login/magic?userToken=${token}`;
  //   window.open(url, "_blank");
  // };

  return (
    <Loader loading={loading || submitLoading}>
      <Wrapper>
        <Header
          onEdit={() => setEdit(true)}
          onCancel={onCancelEdit}
          onSave={onSaveFormData}
          onContinueApplication={() => history.push(routes.APPLICATION)}
          edit={edit}
          heading="User Information"
        />

        <form className={`${edit ? "edit" : ""}`}>
          {renderPersonalInfoFields(form).map(
            ({ component: Component, ...field }) => {
              return (
                <Component
                  key={field.name}
                  {...field}
                  onChange={onChangeHandler}
                  disabled={!edit}
                />
              );
            }
          )}
        </form>
      </Wrapper>
    </Loader>
  );
};

export default PersonalInfo;
