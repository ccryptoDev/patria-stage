import React from "react";
import styled from "styled-components";
import CurrencyFormat from "react-currency-format";
import Error from "../Elements/FieldError";
import { InputWrapper } from "../Styles/Default";
import Label from "../Elements/FieldLabel";
import { SuccessIcon } from "../../../atoms/Icons/SvgIcons/Status-outlined";

const Wrapper = styled(InputWrapper)`
  position: relative;
  & .routing-text-wrapper {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    left: 2.6rem;
    z-index: 2;
    font-size: inherit;

    .dash {
      padding: 0 5px;
      font-size: inherit;
    }
  }

  & .input-wrapper input {
    padding-left: 11rem;
  }
`;

type IFormattedField = {
  format?: any;
  mask?: any;
  label?: string;
  valid?: boolean;
  disabled?: boolean;
  message?: string;
  onChange: any;
  name: string;
  placeholder?: string;
  value: string | number;
  isAllowed?: any;
  displayType?: "input" | "text";
  autoFocus?: boolean;
};

const Prefix = () => {
  return (
    <div className="routing-text-wrapper">
      <span>XXXX</span>
      <span className="dash">-</span>
      <span>XX</span>
      <span className="dash">-</span>
    </div>
  );
};

const FormattedField = ({
  isAllowed,
  mask,
  autoFocus = false,
  format,
  value = "",
  displayType,
  label = "",
  valid,
  disabled = false,
  message = "",
  onChange,
  name = "field",
  placeholder = "",
  ...props
}: IFormattedField) => {
  const isValid = !!(valid && !message);
  const error = !!message;
  const onChangeHandler = (e: any) => {
    onChange({ target: { value: e.value, name } });
  };
  return (
    <Wrapper className="textField" error={error} valid={valid}>
      {label ? <Label label={label} /> : ""}
      <div
        style={{ position: "relative" }}
        className={`input-wrapper ${isValid ? "valid" : ""}`}
      >
        <CurrencyFormat
          displayType={displayType}
          isAllowed={isAllowed}
          value={value}
          disabled={disabled}
          placeholder={placeholder}
          name={name}
          onValueChange={onChangeHandler}
          mask={mask}
          format={format}
          autoFocus={autoFocus}
          {...props}
        />
        <Prefix />
        <div className="icon">
          {!error && valid && <SuccessIcon size="1.4rem" />}
        </div>
      </div>
      <Error message={message} />
    </Wrapper>
  );
};

export default FormattedField;
