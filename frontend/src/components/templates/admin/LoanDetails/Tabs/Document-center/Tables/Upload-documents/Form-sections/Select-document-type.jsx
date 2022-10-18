import React from "react";
import { Select } from "../Styles";

const Table = ({ selectHandler, docTypes = {} }) => {
  return (
    <tr>
      <th>Document Type</th>
      <td>
        <Select name="documentType" required onChange={selectHandler}>
          <option value="">Select Document Type</option>
          <option value={docTypes.DRIVER_LICENSE}>
            Deriver&apos;s License or Id
          </option>
          <option value={docTypes.PASSPORT}>Passport</option>
        </Select>
      </td>
    </tr>
  );
};

export default Table;
