import React from "react";
import styled from "styled-components";
import File from "../../components/molecules/Form/Fields/File/Upload-field-style/FileField";

const Wrapper = styled.div`
  width: 30rem;
`;

export default {
  title: "Example/fields",
  component: File,
};

export const FileField = (args) => (
  <Wrapper>
    <File
      accept="image/*"
      name="file"
      placeholder="choose file"
      onChange={(e) => console.log(e)}
    />
  </Wrapper>
);
