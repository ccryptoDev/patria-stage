import React from "react";
import styled from "styled-components";
import { H2 as Heading, Note } from "../../../atoms/Typography";

const Wrapper = styled.div`
  .note {
    margin: 24px 0;
  }

  .heading-medium {
    font-size: 20px;
  }
`;

const resizeHeading = (text: string) => {
  if (text.length > 30) {
    return "heading-medium";
  }

  return "";
};

const FormHeader = ({ title, note }: { title: string; note?: any }) => {
  return (
    <Wrapper>
      <Heading className={`heading ${resizeHeading(title)}`}>{title}</Heading>
      <Note className="note">{note}</Note>
    </Wrapper>
  );
};

export default FormHeader;
