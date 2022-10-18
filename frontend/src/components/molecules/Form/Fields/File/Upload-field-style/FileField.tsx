import React, { useState } from "react";
import Error from "../../../Elements/FieldError";
import Label from "../../../Elements/FieldLabel";
import Wrapper from "./Styles";

type IProps = {
  label?: string;
  accept?: string;
  disabled?: boolean;
  message?: string;
  onChange?: any;
  name: string;
  placeholder?: string;
};

const FileField = ({
  label = "",
  accept = "image/*",
  disabled = false,
  message = "",
  onChange,
  name,
  placeholder,
}: IProps) => {
  const [file, setFile] = useState<{ name: string }>({ name: "" });

  const onChangeHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event?.target?.files) {
      if (event.target?.files?.length > 0) {
        const { files } = event.target;
        // retrieve and send the image data
        const reader = new global.FileReader();
        reader.readAsDataURL(files[0]);
        reader.onload = (e) => {
          if (e?.target?.result) {
            onChange({ name, file: files[0] });
          }
        };
        // set image info on the ui
        setFile(files[0]);
      }
    }
  };

  return (
    <Wrapper className="textField">
      {label ? <Label label={label} /> : ""}
      <input
        type="file"
        disabled={disabled}
        placeholder={placeholder}
        accept={accept}
        id={name}
        name={name}
        onChange={onChangeHandler}
      />
      <label htmlFor={name} className={`${file.name ? "success" : ""}`}>
        <span>{file?.name ? file?.name : placeholder}</span>
      </label>
      <Error message={message} />
    </Wrapper>
  );
};

export default FileField;
