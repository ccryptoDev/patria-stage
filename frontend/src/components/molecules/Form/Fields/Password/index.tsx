import React, { useState } from "react";
import styled from "styled-components";
import Error from "../../Elements/FieldError";
import showPassword from "../../../../../assets/svgs/password-show.svg";
import hidePassword from "../../../../../assets/svgs/password-hide.svg";
import { InputWrapper } from "../../Styles/Default";
import Label from "../../Elements/FieldLabel";

const Icon = styled.button`
  position: absolute;
  top: 0;
  right: 6px;
  cursor: pointer;
  border: none;
  background: transparent;
  width: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
`;

type IProps = {
  value: string;
  label?: string;
  disabled?: boolean;
  message?: string;
  onChange?: any;
  name?: string;
  placeholder?: string;
  maxLength?: number;
};

const InputField = ({
  value,
  label = "",
  disabled = false,
  message = "",
  onChange,
  name,
  placeholder,
  maxLength = 999,
}: IProps) => {
  const [show, setShow] = useState(false);
  const showPasswordHandler = () => {
    setShow(!show);
  };
  const error = !!message;
  return (
    <InputWrapper className="textField" error={error}>
      {label ? <Label label={label} /> : ""}
      <div style={{ position: "relative" }}>
        <input
          className={`input-password ${value ? "filled" : ""}`}
          value={value}
          disabled={disabled}
          placeholder={placeholder}
          type={show ? "text" : "password"}
          name={name}
          onChange={onChange}
          maxLength={maxLength}
        />
        <Icon className="icon" type="button" onClick={showPasswordHandler}>
          <img
            src={show ? hidePassword : showPassword}
            alt={show ? "hide" : "show"}
          />
        </Icon>
      </div>

      <Error message={message} />
    </InputWrapper>
  );
};

export default InputField;
