import React, { useState, useCallback } from "react";
import Checkbox from "./Default";

type IProps = {
  label?: string;
  checkValue: boolean;
  payload?: any;
  cb?: any;
  name: string;
  disabled?: boolean;
};

const CheckBoxContainer = ({ label, checkValue, payload, cb, name, disabled }: IProps) => {
  const [checked, setChecked] = useState(checkValue);
  const [loading, setLoading] = useState(false);

  const checkBoxHandler = useCallback(
    async (e) => {
      setChecked(e.target.value);
      setLoading(true);
      const result = await cb({ ...payload, [name]: e.target.value });
      setLoading(false);
      if (result?.error) {
        setChecked(!e.target.value);
      }
    },
    [payload, cb, name]
  );

  return <Checkbox value={checked} disabled={loading || disabled} label={label} onChange={checkBoxHandler} name={name} />;
};

export default CheckBoxContainer;
