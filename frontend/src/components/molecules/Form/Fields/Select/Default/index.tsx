import React from "react";
import Error from "../../../Elements/FieldError";
import Label from "../../../Elements/FieldLabel";
import { InputWrapper } from "../../../Styles/Default";

type IProps = {
  onChange: any;
  options?: { id: string; value: string; text: string }[] | [];
  value: string;
  message?: string;
  label?: string;
  name?: string;
  placeholder?: string;
  disabled?: boolean;
};

const SelectComponent = ({
  onChange,
  options = [],
  value = "",
  message = "",
  label = "",
  name = "",
  placeholder = "",
  disabled,
}: IProps) => {
  return (
    <InputWrapper error={!!message} className="textField">
      {label ? <Label label={label} /> : ""}
      <div className="select-wrapper">
        <select
          name={name}
          value={value}
          onChange={onChange}
          className={value ? "filled" : ""}
          disabled={disabled}
        >
          <option value="" disabled hidden>
            {placeholder}
          </option>
          {options.length
            ? options.map((option: any) => {
                return (
                  <option key={option.id} value={option.value}>
                    {option.text}
                  </option>
                );
              })
            : ""}
        </select>
      </div>
      {message ? <Error message={message} /> : ""}
    </InputWrapper>
  );
};

export default SelectComponent;
