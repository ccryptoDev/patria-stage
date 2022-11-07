import React from "react";
import styled from "styled-components";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import { H4 } from "../../../../../../../atoms/Typography";
import { renderCardDetail } from "./config";

const Wrapper = styled.div`
  margin: 24px 0;

  .heading-wrapper {
    margin: 14px 0;
    display: flex;
    align-items: center;
    column-gap: 10px;
  }
`;

const CardPayment = ({
  form,
  onChangeHandler,
}: {
  form: any;
  onChangeHandler: any;
}) => {
  return (
    <Wrapper>
      <p>
        <i>This is the fastest way to get your money funded.</i>{" "}
      </p>
      <div className="heading-wrapper">
        <H4>Debit Details</H4>
        <CreditCardIcon sx={{ fontSize: 24 }} />
      </div>
      <div className="fields-wrapper">
        {renderCardDetail(form).map(({ component: Component, ...field }) => {
          return (
            <Component
              key={field.name}
              {...field}
              onChange={onChangeHandler}
              disabled={field.disabled}
            />
          );
        })}
      </div>
    </Wrapper>
  );
};

export default CardPayment;
