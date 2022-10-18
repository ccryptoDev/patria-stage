import React from "react";
import Select from "@material-ui/core/Select";
import Error from "../../../Elements/FieldError";
import Label from "../../../Elements/FieldLabel";
import { ListItem, Wrapper } from "./Styles";

type IProps = {
  onChange: any;
  displayEmpty?: any;
  className?: string;
  placeholder?: string;
  inputProps?: any;
  options: { value: string; id: string }[];
  value: string;
  message?: string;
  label?: string;
  name?: string;
};

const SelectComponent = ({
  onChange,
  displayEmpty,
  className,
  placeholder,
  inputProps = { "aria-label": "Without label" },
  options = [],
  value = "",
  message = "",
  label = "",
  name = "",
}: IProps) => {
  return (
    <Wrapper error={!!message} className="select">
      <Label label={label} />
      <Select
        value={value}
        placeholder={placeholder}
        name={name}
        onChange={onChange}
        displayEmpty={displayEmpty}
        className={className}
        inputProps={inputProps}
      >
        {options.length > 0 ? (
          options.map((option) => {
            return (
              <ListItem key={option?.id} value={option?.value}>
                {option?.value}
              </ListItem>
            );
          })
        ) : (
          <ListItem>no options</ListItem>
        )}
      </Select>
      <Error message={message} />
    </Wrapper>
  );
};

export default SelectComponent;
