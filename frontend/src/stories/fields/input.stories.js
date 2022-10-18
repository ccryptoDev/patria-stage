import React, { useState } from "react";
import styled from "styled-components";
import TextField from "../../components/molecules/Form/Fields/TextField";
import FormattedInput from "../../components/molecules/Form/Fields/FormattedField";
import Password from "../../components/molecules/Form/Fields/Password";
import { H2 } from "../../components/atoms/Typography";

const Wrapper = styled.div`
  display: flex;
  justify-content: space-around;
`;

export default {
  title: "Example/fields/input",
  component: TextField,
};

export const Default = () => {
  const [form, setForm] = useState({
    phone: { value: "", name: "phone" },
    text: { value: "", name: "text" },
    password: { value: "", name: "password" },
    user: { value: "", name: "user" },
  });
  const onChange = (e) => {
    setForm((prevState) => ({
      ...prevState,
      [e.target.name]: { ...prevState[e.target.name], value: e.target.value },
    }));
  };
  return (
    <Wrapper>
      <section>
        <H2>Default Fields</H2>
        <TextField
          label="Name"
          name={form.text.name}
          value={form.text.value}
          placeholder="Enter your name"
          onChange={onChange}
        />
        <br />
        <TextField
          label="Name"
          name={form.text.name}
          value={form.text.value}
          placeholder="Enter your name"
          onChange={onChange}
          message="This field is required"
        />
        <br />
        <FormattedInput
          format="+1 (###) ### ####"
          label="Enter your phone number"
          name={form.phone.name}
          value={form.phone.value}
          placeholder="Enter your name"
          onChange={onChange}
        />
        <br />
        <Password
          label="Enter your phone number"
          name={form.password.name}
          value={form.password.value}
          placeholder="Enter your name"
          onChange={onChange}
        />
      </section>
      <section>
        <H2>Application styled</H2>

        <TextField
          name={form.user.name}
          value={form.user.value}
          placeholder="Enter your name"
          onChange={onChange}
        />

        <br />

        <TextField
          name={form.user.name}
          value={form.user.value}
          placeholder="Enter your name"
          onChange={onChange}
          message="This field is required"
        />

        <br />
        <br />

        <TextField
          name={form.user.name}
          value={form.user.value}
          placeholder="Enter your name"
          onChange={onChange}
        />
      </section>
    </Wrapper>
  );
};
