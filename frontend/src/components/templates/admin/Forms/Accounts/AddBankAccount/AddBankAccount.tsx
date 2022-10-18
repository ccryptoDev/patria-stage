import React, { useState } from "react";
import styled from "styled-components";
import { toast } from "react-toastify";
import { MdAccountBalance } from "react-icons/md";
import Buttons from "../../../../../molecules/Buttons/SubmitForm";
import Button from "../../../../../atoms/Buttons/Button";
import { renderFormFields, accountFormInit } from "./config";
import {
  validateInput,
  validateForm,
} from "../../../../../../utils/validators/bank-account-form";
import { addBankAccountApi } from "../../../../../../api/admin-dashboard";
import Loader from "../../../../../molecules/Loaders/LoaderWrapper";
import ErrorMessage from "../../../../../molecules/Form/Elements/FormError";
import { IBankAccount } from "../../../../../../api/admin-dashboard/types";

const Form = styled.form`
  padding: 2rem 4rem;
  .card {
    border: 3px solid var(--light-02);
    padding: 1rem;
    border-radius: 1rem;
  }
  .form-layout {
    & .textField {
      margin-bottom: 2rem;
    }
  }

  button {
    width: 15rem;
  }

  .heading {
    display: flex;
    align-items: flex-end;
    justify-content: center;
    margin-bottom: 2rem;

    span {
      font-size: 1.8rem;
      font-weight: 700;
    }

    & svg {
      font-size: 2.4rem;
      margin-left: 5px;
    }
  }
`;

type IProps = {
  closeModal: any;
  cb: Function;
  state: any;
};

const AddBankAccount = ({ closeModal, cb, state }: IProps) => {
  const [form, setForm] = useState({ ...accountFormInit });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const onSubmitHandler = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const { isValid, parsedForm } = validateForm(form);
    if (isValid) {
      const { accountNumber, bankName, routingNumber } = parsedForm;
      const payload: IBankAccount = {
        userId: state?.paymentManagement?.user,
        accountNumber,
        name: bankName,
        routingNumber,
      };
      setLoading(true);
      const response = await addBankAccountApi(payload);
      if (response && !response?.error) {
        await cb();
        closeModal(true);
      } else {
        const errorMessage =
          response?.error?.message || "something went wrong!";
        setError(errorMessage);
        toast.error(errorMessage);
      }
    } else {
      setForm((prevState) => ({ ...prevState, ...parsedForm }));
    }
    setLoading(false);
  };

  const onChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prevState: any) =>
      validateInput(
        { ...prevState, [name]: { ...prevState[name], value } },
        name
      )
    );
  };

  return (
    <Loader loading={loading}>
      <Form onSubmit={onSubmitHandler}>
        <div className="card">
          <div className="heading">
            <span>Add Bank Account</span>
            <MdAccountBalance />
          </div>
          <div className="form-layout">
            {renderFormFields(form).map((item) => {
              const Component = item.component;
              return (
                <div key={item.name}>
                  <Component onChange={onChangeHandler} {...item} />
                </div>
              );
            })}
          </div>
        </div>
        <ErrorMessage message={error} />
        <Buttons color="#034376">
          <Button onClick={closeModal} variant="secondary" type="button">
            Cancel
          </Button>
          <Button variant="primary" type="submit">
            Add Account
          </Button>
        </Buttons>
      </Form>
    </Loader>
  );
};

export default AddBankAccount;
