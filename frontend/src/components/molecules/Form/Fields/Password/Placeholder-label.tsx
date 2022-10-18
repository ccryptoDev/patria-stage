import React, { useState } from "react";
import styled from "styled-components";
import Error from "../../Elements/FieldError";
import ShowPassword from "../../../../atoms/Icons/SvgIcons/ShowPassword";
import HidePassword from "../../../../atoms/Icons/SvgIcons/HidePassword";
import { InputWrapper, PlaceholderLabel } from "../../Styles/Default";
import Label from "../../Elements/FieldLabel";

const Icon = styled.button`
  position: absolute;
  top: 0;
  right: 6px;
  cursor: pointer;
  border: none;
  background: transparent;
  width: 3rem;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
`;

type IProps = {
  value: string;
  label?: string;
  disabled?: boolean;
  message?: string;
  onChange?: any;
  name?: string;
  placeholder?: string;
};

const InputField = ({
  value,
  label = "",
  disabled = false,
  message = "",
  onChange,
  name,
  placeholder = " ",
}: IProps) => {
  const [show, setShow] = useState(false);
  const showPasswordHandler = () => {
    setShow(!show);
  };
  const error = !!message;
  return (
    <InputWrapper className="textField" error={error}>
      <PlaceholderLabel className="textField-placeholder-label">
        <input
          className="input-password"
          value={value}
          disabled={disabled}
          placeholder={placeholder}
          type={show ? "text" : "password"}
          name={name}
          onChange={onChange}
        />
        {label ? <Label label={label} /> : ""}
        <Icon className="icon" type="button" onClick={showPasswordHandler}>
          {show ? <HidePassword /> : <ShowPassword />}
        </Icon>
      </PlaceholderLabel>

      <Error message={message} />
    </InputWrapper>
  );
};

export default InputField;
