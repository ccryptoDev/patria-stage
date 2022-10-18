import React from "react";
import CurrencyFormat from "react-currency-format";
import Error from "../../Elements/FieldError";
import { InputWrapper } from "../../Styles/Default";
import Label from "../../Elements/FieldLabel";
import { SuccessIcon } from "../../../../atoms/Icons/SvgIcons/Status-outlined";

type IFormattedField = {
  format?: any;
  mask?: any;
  label?: string;
  valid?: boolean;
  disabled?: boolean;
  message?: string;
  onChange?: any;
  name: string;
  placeholder?: string;
  value: string | number;
  isAllowed?: any;
  displayType?: "input" | "text";
  autoFocus?: boolean;
  useFormatted?: boolean;
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
  useFormatted = false,
  ...props
}: IFormattedField) => {
  const isValid = !!(valid && !message);
  const error = !!message;
  const onChangeHandler = (e: any) => {
    onChange({
      target: { value: useFormatted ? e.formattedValue : e.value, name },
    });
  };
  return (
    <InputWrapper className="textField" error={error} valid={valid}>
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
        className={value ? "filled" : ""}
      />
      {label ? <Label label={label} /> : ""}
      <div className="icon">
        {!error && valid && <SuccessIcon size="1.4rem" />}
      </div>

      <Error message={message} />
    </InputWrapper>
  );
};

export default FormattedField;
