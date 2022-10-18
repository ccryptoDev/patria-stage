import React from "react";
import Error from "../../Elements/FieldError";
import { InputWrapper } from "../../Styles/Default";
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
  cols?: number;
  rows?: number;
};

const TextAreaField = ({
  value = "",
  label = "",
  cols = 30,
  rows = 10,
  valid,
  disabled = false,
  message = "",
  onChange,
  name = "field",
  placeholder = "",
}: ITextField) => {
  const error = !!message;
  return (
    <InputWrapper className="textField" error={error} valid={!error && valid}>
      {label ? <Label label={label} /> : ""}
      <div style={{ position: "relative" }}>
        <textarea
          value={value}
          cols={cols}
          rows={rows}
          disabled={disabled}
          placeholder={placeholder}
          name={name}
          onChange={onChange}
        />
        <div className="icon">
          {!error && valid && <SuccessIcon size="1.4rem" />}
        </div>
      </div>
      <Error message={message} />
    </InputWrapper>
  );
};

export default TextAreaField;
