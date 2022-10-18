import React from "react";
// import DatePicker from "react-datepicker";
import moment from "moment";
import styled from "styled-components";
import "react-datepicker/dist/react-datepicker.css";
import { InputWrapper } from "../../../Styles/Default";
import Label from "../../../Elements/FieldLabel";
import Error from "../../../Elements/FieldError";
import DatePicker from "./Material";

type IDatePicker = {
  onChange?: any;
  label?: string;
  message?: string;
  name?: string;
  value: null | Date;
  placeholder?: string;
};

const MuiStylesModifier = styled(InputWrapper)`
  .MuiFormControl-root {
    width: 100%;
  }
  .MuiInput-underline {
    &:before,
    &:after {
      content: "";
      display: none;
    }
  }
  & .filled input {
    border-color: #be881e;
    background: linear-gradient(
        0deg,
        rgba(255, 255, 255, 0.9),
        rgba(255, 255, 255, 0.9)
      ),
      #f2dfb5;
  }
  & input {
    box-sizing: content-box;
    padding: 20px 16px;
    font-size: 16px;
  }
`;

export default function DobPicker({
  label = "",
  onChange,
  message = "",
  name,
  value = new Date(),
  placeholder = "",
}: IDatePicker) {
  const onChangeHandler = (e: any) => {
    const date = new Date(e.target.value);
    const event = { target: { value: date, name } };
    onChange(event);
  };
  const error = !!message;
  return (
    <MuiStylesModifier error={error} className="textField">
      {label ? <Label label={label} /> : ""}
      <div style={{ position: "relative" }} className={value ? "filled" : ""}>
        <DatePicker
          value={moment(value).format("YYYY-MM-DD")}
          name={name}
          onChange={onChangeHandler}
          placeholder={placeholder}
        />
      </div>
      <Error message={message} />
    </MuiStylesModifier>
  );
}
