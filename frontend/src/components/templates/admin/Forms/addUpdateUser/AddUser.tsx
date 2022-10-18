import React, { useState } from "react";
import { cloneDeep } from "lodash";
import { toast } from "react-toastify";
import Button from "../../../../atoms/Buttons/Button";
import Buttons from "../../../../molecules/Buttons/SubmitForm";
import { useTable } from "../../../../../contexts/Table/table";
import Loader from "../../../../molecules/Loaders/LoaderWrapper";
import { fields, initialForm, passwordFields } from "./config";
import { validateForm } from "./validation";
import Form from "./Styles";
import ErrorMessage from "../../../../molecules/ErrorMessage/FormError";
import { addAdmin } from "../../../../../api/admin-dashboard";

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

const AddUpdateUser = ({ closeModal, state }: IProps) => {
  const [form, setForm] = useState(cloneDeep(initialForm(state.data)));
  const { actionRequest } = useTable();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

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
    // validate form
    const [isValid, validatedForm] = validateForm(form);
    if (isValid) {
      // parse form back to the api object format
      setLoading(true);
      const result = await actionRequest({
        payload: { ...state?.data, ...validatedForm },
        cb: addAdmin,
      });
      setLoading(false);
      if (result && !result.error) {
        toast.success("the changes have been saved!");
        closeModal();
      } else {
        toast.error(result?.error?.message || "something went wrong");
        setErrorMessage(result?.error?.message);
      }
    } else {
      setForm((prevState: any) => {
        return { ...prevState, ...validatedForm };
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
          {passwordFields(form).map((field) => {
            const Component = field.component;
            return (
              <Component
                key={field.name}
                {...field}
                onChange={onChangeHandler}
              />
            );
          })}
          <ErrorMessage message={errorMessage} />
        </div>
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
