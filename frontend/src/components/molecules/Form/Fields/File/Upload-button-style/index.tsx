import React from "react";
import uploadIcon from "../../../../../../assets/svgs/upload.svg";

type IUploadFileButton = {
  name: string;
  onChange: any;
};

const FileUploader = ({ name, onChange }: IUploadFileButton) => {
  return (
    <label htmlFor={name}>
      <input
        accept="image/*"
        hidden
        id={name}
        type="file"
        name={name}
        multiple
        onChange={(e) => onChange(e, name)}
      />
      <span>
        <img src={uploadIcon} alt="upload" />
      </span>
    </label>
  );
};

export default FileUploader;
