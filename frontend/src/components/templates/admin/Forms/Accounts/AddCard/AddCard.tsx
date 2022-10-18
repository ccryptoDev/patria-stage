import React, { useState } from "react";
import styled from "styled-components";
import { useParams } from "react-router-dom";
import { FaCcMastercard, FaCcVisa } from "react-icons/fa";
import { toast } from "react-toastify";
import Buttons from "../../../../../molecules/Buttons/SubmitForm";
import Button from "../../../../../atoms/Buttons/Button";
import { cardDetailsInit, billingInit, renderCardDetails, renderBillingDetails } from "./config";
import Card from "../../../../../atoms/Cards/Large";
import validate, { validateInput } from "./validate";
import { addCard as addCardApi } from "../../../../../../api/admin-dashboard";
import { useTable } from "../../../../../../contexts/Table/table";
import Loader from "../../../../../molecules/Loaders/LoaderWrapper";
import ErrorMessage from "../../../../../molecules/Form/Elements/FormError";

const Form = styled.form`
  padding: 2rem 4rem;

  .card {
    padding: 3rem;
  }

  .details-heading {
    display: flex;
    align-items: flex-end;
    justify-content: center;
    margin-bottom: 2rem;

    & svg {
      font-size: 2.4rem;
      margin-left: 5px;
    }
  }

  .billing-heading {
    margin: 2rem 0;
    text-align: center;
  }

  .details-heading,
  .billing-heading {
    span {
      font-size: 1.8rem;
      font-weight: 700;
    }
  }

  .details-layout,
  .billing-layout {
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-gap: 2rem 1rem;
  }

  .details-layout {
    .textField:nth-child(1),
    .textField:nth-child(2) {
      grid-column: 1/-1;
    }
  }

  .billing-layout {
    .textField:nth-child(1),
    .textField:nth-child(2) {
      grid-column: 1/-1;
    }
  }

  button {
    width: 15rem;
  }
`;

type IProps = {
  closeModal: any;
  cb: Function;
};

const AddCard = ({ closeModal }: IProps) => {
  const { actionRequest } = useTable();
  const [form, setForm] = useState({ ...cardDetailsInit, ...billingInit });
  const params = useParams<any>();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const onSubmitHandler = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const { id } = params;
    // update table on http response
    const { isValid, parsedForm } = validate(form);
    if (isValid) {
      const payload = { data: { ...parsedForm }, screenTrackingId: id };
      setLoading(true);
      const response = await actionRequest({ payload, cb: addCardApi });
      if (response && !response.error) {
        closeModal(true);
      } else {
        const { message } = response?.error;
        setError(message);
        toast.error(message);
      }
    } else {
      setForm((prevState) => ({ ...prevState, ...parsedForm }));
    }
    setLoading(false);
  };

  const onChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prevState: any) => validateInput({ ...prevState, [name]: { ...prevState[name], value } }, name));
  };

  return (
    <Form onSubmit={onSubmitHandler}>
      <Loader loading={loading}>
        <Card className="card">
          <div className="details-heading">
            <span>Card Details</span>
            <FaCcMastercard />
            <FaCcVisa />
          </div>
          <div className="details-layout">
            {renderCardDetails(form).map((item) => {
              const Component = item.component;
              return <Component key={item.name} onChange={onChangeHandler} {...item} />;
            })}
          </div>
          <div className="billing-heading">
            <span>Billing Address</span>
          </div>
          <div className="billing-layout">
            {renderBillingDetails(form).map((item) => {
              const Component = item.component;
              return <Component key={item.name} onChange={onChangeHandler} {...item} />;
            })}
          </div>
        </Card>
      </Loader>
      <ErrorMessage message={error} />
      <Buttons color="#034376">
        <Button onClick={closeModal} variant="secondary" type="button">
          Cancel
        </Button>
        <Button variant="primary" type="submit" disabled={loading}>
          Add Card
        </Button>
      </Buttons>
    </Form>
  );
};

export default AddCard;
