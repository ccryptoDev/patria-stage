import React from "react";
import styled from "styled-components";
import CurrencyFormat from "react-currency-format";
import FieldWrapper from "./Field-wrapper";
import Card from "./Card";
import DatePicker from "../../../../../../molecules/Form/Fields/DatePicker/MaterialUI-DoB";

const Wrapper = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-gap: 2rem;
  margin-bottom: 2rem;

  & input,
  select {
    border: 1px solid #ced4da;
    padding: 6px 1.2rem;
    border-radius: 5px;
  }

  .field-wrapper:nth-child(3) {
    grid-column: 1/-1;
  }

  .fields-wrapper {
    display: flex;
    justify-content: space-evenly;
    align-items: center;
    font-size: 1.4rem;
    margin-bottom: 1rem;
  }
`;

type IProps = {
  form: {
    amount: string;
    date: any;
    card: string;
  };
  options: { id: string; value: string }[];
  getDateHandler: Function;
  changeAmount: Function;
  cardHandler: Function;
};

const FormData: React.FC<IProps> = ({
  form,
  getDateHandler,
  changeAmount,
  cardHandler,
  options,
}) => {
  const { amount, date, card } = form;
  return (
    <Wrapper>
      <FieldWrapper label="Payment Date">
        <DatePicker onChange={getDateHandler} value={date} />
      </FieldWrapper>
      <FieldWrapper label="Amount">
        <CurrencyFormat
          className="amount"
          value={amount}
          onChange={changeAmount}
          thousandSeparator
          prefix="$"
        />
      </FieldWrapper>
      <FieldWrapper label="Payment Account">
        <Card value={card} onChange={cardHandler} options={options} />
      </FieldWrapper>
    </Wrapper>
  );
};

export default FormData;
