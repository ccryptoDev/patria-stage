import React, { useState } from "react";
import { cloneDeep } from "lodash";
import { toast } from "react-toastify";
import Button from "../../../../atoms/Buttons/Button";
import Buttons from "../../../../molecules/Buttons/SubmitForm";
import { useTable } from "../../../../../contexts/Table/table";
import Loader from "../../../../molecules/Loaders/LoaderWrapper";
import { fields, passwordFields, initialForm } from "./config";
import { validateForm } from "./validation";
import Form, { PasswordWrapper } from "./Styles";
import ErrorMessage from "../../../../molecules/ErrorMessage/FormError";
import CheckBox from "../../../../molecules/Form/Fields/Checkbox/Default";
import { updateAdminById } from "../../../../../api/admin-dashboard";

type IProps = {
  closeModal: any;
  state: {
    data: {
      email?: string;
      userName?: string;
      phoneNumber?: string;
      id?: string;
      isAgent?: boolean;
    };
    request: Function;
  };
};

type ISetPassword = {
  form: any;
  onChange: any;
  show: boolean;
};

const SetPassword = ({ form, onChange, show }: ISetPassword) => {
  return (
    <>
      {passwordFields(form).map((field) => {
        const Component = field.component;
        return (
          <Component
            disabled={!show}
            key={field.name}
            {...field}
            onChange={onChange}
          />
        );
      })}
    </>
  );
};

const AddUpdateUser = ({ closeModal, state }: IProps) => {
  const [form, setForm] = useState(cloneDeep(initialForm(state.data)));
  const { actionRequest } = useTable();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [updatePassword, setUpdatePassword] = useState(false);

  const onChangeHandler = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setForm((prevState: any) => {
      return {
        ...prevState,
        [e.target.name]: {
          ...prevState[e.target.name],
          value: e.target.value,
          message: "",
        },
      };
    });
  };

  const onSubmitHandler = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!updatePassword) form.password.required = false;
    // VALIDATE FORM
    const [isValid, validatedForm] = validateForm(form);
    if (isValid) {
      setLoading(true);
      // CHECK IF EMAIL HAS CHANGED
      if (validatedForm.email === state.data.email) delete validatedForm.email;
      const result = await actionRequest({
        payload: { id: state?.data?.id, ...validatedForm },
        cb: updateAdminById,
      });
      setLoading(false);

      if (result && !result.error) {
        toast.success("the changes have been saved!");
        closeModal();
      } else {
        toast.error(result?.error?.message || "something went wrong");
        setErrorMessage("Server Error");
      }
    } else {
      setForm((prevState: any) => {
        return { ...prevState, ...validatedForm };
      });
    }
  };

  const showPasswordHandler = (e: {
    target: { name: string; value: boolean };
  }) => {
    setUpdatePassword(e.target.value);
    // clear the password fields on hide password
    if (
      form.password.value ||
      form.password.message ||
      form.repassword.value ||
      form.repassword.message
    ) {
      setForm((prevState: any) => {
        return {
          ...prevState,
          password: {
            ...prevState.password,
            value: "",
            message: "",
          },
          repassword: {
            ...prevState.repassword,
            value: "",
            message: "",
          },
        };
      });
    }
  };

  return (
    <Loader loading={loading ? 1 : 0}>
      <Form onSubmit={onSubmitHandler} className="content">
        <div className="layout">
          {fields(form).map((field) => {
            const Component = field.component;
            return (
              <Component
                key={field.name}
                {...field}
                onChange={onChangeHandler}
              />
            );
          })}
        </div>
        <PasswordWrapper className="mb-40" show={updatePassword}>
          <div className="checkbox-wrapper">
            <CheckBox
              value={updatePassword}
              label="Change password"
              onChange={showPasswordHandler}
            />
          </div>
          <SetPassword
            form={form}
            onChange={onChangeHandler}
            show={updatePassword}
          />
        </PasswordWrapper>

        {errorMessage ? <ErrorMessage message={errorMessage} /> : ""}
        <Buttons color="#034376">
          <Button onClick={closeModal} variant="secondary" type="button">
            Cancel
          </Button>
          <Button type="submit" variant="primary">
            Submit
          </Button>
        </Buttons>
      </Form>
    </Loader>
  );
};
export default AddUpdateUser;
