import React from "react";
import styled from "styled-components";
import { H3, Note } from "../../../../../atoms/Typography";
import ListItem from "./ListItem";
import UploadFileButton from "../../../../../molecules/Form/Fields/File/Upload-button-style";

const Wrapper = styled.div`
  background: #fbfbff;
  margin-bottom: 24px;
  padding: 24px;
  border-radius: 14px;
  .upload-field {
    display: flex;
    justify-content: space-between;
    column-gap: 10px;
    & label {
      cursor: pointer;
    }

    &-title {
      & > .note {
        margin: 12px 0;
        color: #58595b;
      }
    }
  }
`;

const Field = ({
  files,
  name,
  addFile,
  removeFile,
  heading,
  subheading,
}: {
  files: any[];
  name: string;
  addFile: any;
  removeFile: any;
  heading: string;
  subheading: string;
}) => {
  return (
    <Wrapper>
      <div className="upload-field">
        <div className="upload-field-title">
          <H3>{heading}</H3>
          <Note className="note">{subheading}</Note>
        </div>
        <UploadFileButton name={name} onChange={addFile} />
      </div>
      <ul>
        {files.length
          ? files.map((item) => {
              return (
                <ListItem
                  key={item.id}
                  name={item.name}
                  date={item.lastModifiedDate}
                  onRemove={() => removeFile({ fieldname: name, id: item.id })}
                />
              );
            })
          : ""}
      </ul>
    </Wrapper>
  );
};

export default Field;
