import React from "react";
import Wrapper from "../../../../../../atoms/Table/Details-horizontal";

const Table = ({ docs = [] }) => {
  return (
    <Wrapper>
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Document Type</th>
            <th>PDF</th>
          </tr>
        </thead>
        <tbody>
          {docs.map(({ type, s3link }, index) => {
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
              </tr>
            );
          })}
        </tbody>
      </table>
    </Wrapper>
  );
};

export default Table;
