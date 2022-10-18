import React from "react";
import styled from "styled-components";
import BtnLight from "../../components/atoms/Buttons/Button-agenst";

const Wrapper = styled.div`
  width: 30rem;
  button {
    min-width: 12rem;
  }
`;

export default {
  title: "Example/Button/BtnLight",
  component: BtnLight,
};

export const Button = (args) => (
  <Wrapper>
    <BtnLight type="button" {...args}>
      Button
    </BtnLight>
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

export const Grey = Button.bind({});
Grey.args = {
  variant: "grey",
};

export const LightGrey = Button.bind({});
LightGrey.args = {
  variant: "lightgrey",
};

export const BlueText = Button.bind({});
BlueText.args = {
  transparentBlueTxt: true,
};

export const HoverPrimary = Button.bind({});
HoverPrimary.args = {
  hoverPrimary: true,
  boxshadow: true,
};

export const HoverDark = Button.bind({});
HoverDark.args = {
  hoverDark: true,
};
