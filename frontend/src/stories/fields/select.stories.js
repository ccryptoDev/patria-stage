import React, { useState } from "react";
import styled from "styled-components";
import Select from "../../components/molecules/Form/Fields/Select/Default/index";
import MuiSelect from "../../components/molecules/Form/Fields/Select/Material-ui";

const Wrapper = styled.div`
  width: 30rem;
`;

export default {
  title: "Example/fields/select",
  component: Select,
};

const options = [
  { value: "1", id: "1", text: "number one" },
  { value: "2", id: "2", text: "number two" },
  { value: "3", id: "3", text: "number three" },
  { value: "4", id: "4", text: "number four" },
];

export const SelectField = () => {
  const [value, setValue] = useState(options[0].value);
  const onChange = (e) => {
    setValue(e.target.value);
  };
  return (
    <Wrapper>
      <Select
        label="Select item"
        value={value}
        options={options}
        placeholder="upload file here"
        onChange={onChange}
      />
      <br />
      <MuiSelect
        label="Select item"
        value={value}
        options={options}
        placeholder="upload file here"
        onChange={onChange}
      />
    </Wrapper>
  );
};
