import React from "react";
import styled from "styled-components";
import FileField from "../../../../../../../../molecules/Form/Fields/File/Upload-field-style/FileField";

const Tr = styled.tr`
  td {
    font-size: 1.4rem;
  }
  .input-container {
    margin-bottom: 1rem;
  }
  .input-label {
    margin-bottom: 1rem;
    font-weight: bold;
  }
`;

const RenderDocTable = ({ type = "", onChange, docTypes = {}, fieldNames }) => {
  let renderInputs = <></>;

  switch (type) {
    case docTypes.DRIVER_LICENSE:
      renderInputs = (
        <div>
          <div className="input-container">
            <div className="input-label">Front</div>
            <FileField
              accept="image/*"
              name={fieldNames.licenseFront}
              placeholder="choose file"
              onChange={onChange}
            />
          </div>
          <div className="input-container">
            <div className="input-label">Back</div>
            <FileField
              accept="image/*"
              name={fieldNames.licenseBack}
              placeholder="choose file"
              onChange={onChange}
            />
          </div>
        </div>
      );
      break;
    case docTypes.PASSPORT:
      renderInputs = (
        <div>
          <FileField
            ccept="image/*"
            name={fieldNames.passport}
            placeholder="choose file"
            onChange={onChange}
          />
        </div>
      );
      break;
    default:
  }

  return (
    <Tr>
      <th>Document</th>
      <td>{renderInputs}</td>
    </Tr>
  );
};

export default RenderDocTable;
