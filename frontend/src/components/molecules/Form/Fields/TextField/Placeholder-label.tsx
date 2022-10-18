import React from "react";
import Error from "../../Elements/FieldError";
import { InputWrapper, PlaceholderLabel } from "../../Styles/Default";
import Label from "../../Elements/FieldLabel";
import { SuccessIcon } from "../../../../atoms/Icons/SvgIcons/Status-outlined";

type ITextField = {
  value: string;
  label?: string;
  valid?: boolean | undefined;
  disabled?: boolean;
  message?: string;
  onChange: any;
  name: string;
  placeholder?: string;
  type?: string;
};

const InputField = ({
  value = "",
  label = "",
  valid,
  type = "text",
  disabled = false,
  message = "",
  onChange,
  name = "field",
  placeholder = " ",
}: ITextField) => {
  const error = !!message;
  return (
    <InputWrapper className="textField" error={error} valid={!error && valid}>
      <PlaceholderLabel className="textField-placeholder-label">
        <input
          value={value}
          disabled={disabled}
          placeholder={placeholder}
          type={type}
          name={name}
          onChange={onChange}
        />
        {label ? <Label label={label} /> : ""}
        <div className="icon">
          {!error && valid && <SuccessIcon size="1.4rem" />}
        </div>
      </PlaceholderLabel>
      <Error message={message} />
    </InputWrapper>
  );
};

export default InputField;
