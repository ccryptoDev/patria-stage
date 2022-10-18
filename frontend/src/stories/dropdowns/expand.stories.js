import React, { useState } from "react";
import styled from "styled-components";
import CollapseMenu from "../../components/molecules/DropDowns/ExpandCollapse";
import { SectionSubHeading as Heading } from "../../components/atoms/Typography";
import CollapseMenuMui from "../../components/molecules/DropDowns/Accordion-Mui";

const Wrapper = styled.div`
  width: 30rem;
`;

export default {
  title: "Example/DropDowns",
  component: CollapseMenu,
};

const Content = () => (
  <div>
    Lorem ipsum dolor sit amet consectetur adipisicing elit. Corporis officiis
    labore possimus neque. Laboriosam, odit illo adipisci, quam neque fugit
    explicabo alias, vero aliquid nesciunt nisi labore sint ut obcaecati?
  </div>
);

const Button = ({ onClick }) => (
  <button type="button" onClick={onClick}>
    open menu
  </button>
);

export const Collapse = () => {
  const [open, setOpen] = useState(false);

  return (
    <Wrapper>
      <Heading>Collapse Dropdown</Heading>
      <CollapseMenu
        button={<Button onClick={() => setOpen(!open)} />}
        content={<Content />}
        open={open}
      />
    </Wrapper>
  );
};

export const MuiCollapse = () => {
  const [open, setOpen] = useState(false);

  return (
    <Wrapper>
      <Heading>Collapse Dropdown Mui</Heading>
      <CollapseMenuMui
        button={<Button onClick={() => setOpen(!open)} />}
        content={<Content />}
        expanded={open}
      />
    </Wrapper>
  );
};
