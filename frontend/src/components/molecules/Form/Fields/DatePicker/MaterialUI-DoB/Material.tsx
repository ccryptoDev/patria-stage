import React from "react";
import TextField from "@material-ui/core/TextField";

type IDobPropsu = {
  label?: string;
  value: string | null | Date;
  name: any;
  onChange: any;
  placeholder?: string;
};

export default function DatePickers({
  label,
  value,
  name,
  onChange,
  placeholder,
}: IDobPropsu) {
  return (
    <TextField
      id={name}
      type="date"
      InputLabelProps={{ shrink: true }}
      name={name}
      onChange={onChange}
      defaultValue={new Date()}
    />
  );
}
