import React from "react";
import styled from "styled-components";
import Btn from "../../components/atoms/Buttons/Button";

const Wrapper = styled.div`
  width: 30rem;
  button {
    min-width: 12rem;
  }
`;

export default {
  title: "Example/Button/Default",
  component: Btn,
};

export const Button = (args) => (
  <Wrapper>
    <Btn type="button" {...args}>
      Button
    </Btn>
  </Wrapper>
);

export const Primary = Button.bind({});
Primary.args = {
  variant: "primary",
};

export const Secondary = Button.bind({});
Secondary.args = {
  variant: "secondary",
};

export const SecondaryPrimary = Button.bind({});
SecondaryPrimary.args = {
  variant: "secondary-to-primary",
};

export const PrimarySecondary = Button.bind({});
PrimarySecondary.args = {
  variant: "primary-to-secondary",
};
