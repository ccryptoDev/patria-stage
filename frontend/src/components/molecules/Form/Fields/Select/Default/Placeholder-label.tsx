import React from "react";
import Error from "../../../Elements/FieldError";
import Label from "../../../Elements/FieldLabel";
import { InputWrapper, PlaceholderLabel } from "../../../Styles/Default";

type IProps = {
  onChange: any;
  options?: { id: string; value: string; text: string }[];
  value: string;
  message?: string;
  label?: string;
  name?: string;
};

const SelectComponent = ({
  onChange,
  options = [],
  value = "",
  message = "",
  label = "",
  name = "",
}: IProps) => {
  return (
    <InputWrapper error={!!message} className="textField">
      <PlaceholderLabel className="textField-placeholder-label select-wrapper">
        <select
          name={name}
          value={value}
          onChange={onChange}
          className={`${value ? "selected" : ""}`}
        >
          {options.length ? (
            options.map((option) => {
              return (
                <option key={option.id} value={option.value}>
                  {option.text}
                </option>
              );
            })
          ) : (
            <option value=""> </option>
          )}
        </select>
        {label ? <Label label={label} /> : ""}
      </PlaceholderLabel>
      {message ? <Error message={message} /> : ""}
    </InputWrapper>
  );
};

export default SelectComponent;
