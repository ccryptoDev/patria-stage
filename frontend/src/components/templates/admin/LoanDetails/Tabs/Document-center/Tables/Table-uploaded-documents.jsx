import React from "react";
import Wrapper from "../../../../../../atoms/Table/Details-horizontal";
import { formatDate } from "../../../../../../../utils/formats";

const Table = ({ docs = [] }) => {
  return (
    <Wrapper>
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Document Type</th>
            <th>Document</th>
            <th>Uploaded By </th>
            <th>Uploaded date</th>
          </tr>
        </thead>
        <tbody>
          {docs.map(
            (
              { type, s3link, uploaderName = "--", createdAt = "--" },
              index
            ) => {
              return (
                <tr key={s3link}>
                  <td>{index + 1}</td>
                  <td>{type}</td>
                  <td>
                    {s3link ? (
                      <a href={s3link} target="_blank" rel="noreferrer">
                        View Document
                      </a>
                    ) : (
                      "--"
                    )}
                  </td>
                  <td>{uploaderName}</td>
                  <td>{formatDate(createdAt)}</td>
                </tr>
              );
            }
          )}
        </tbody>
      </table>
    </Wrapper>
  );
};

export default Table;
