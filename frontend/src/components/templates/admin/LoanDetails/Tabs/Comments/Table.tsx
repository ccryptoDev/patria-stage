import React from "react";
import styled from "styled-components";
import { v4 as uuidv4 } from "uuid";
import TableWrapper from "../../../../../atoms/Table/Details-horizontal";
import { formatDate } from "../../../../../../utils/formats";

const Styled = styled.div`
  th {
    vertical-align: text-bottom;
    & .heading {
      padding: 1rem;
      font-weight: bold;
    }
  }

  tr td .subject {
    margin-bottom: 1rem;
    font-weight: 600;
    color: #034376;
  }

  tr td:nth-child(2) {
    width: 30%;
  }

  tr td:nth-child(3) {
    width: 10rem;
  }
`;

const CommentsTable = ({ messages = [] }: { messages: any[] }) => {
  return (
    <Styled>
      <TableWrapper>
        <table>
          <thead>
            <tr>
              <th>Comment</th>
              <th>Created By</th>
              <th>Created At</th>
            </tr>
          </thead>
          <tbody>
            {messages.map((msg) => {
              return (
                <tr key={uuidv4()}>
                  <td>
                    <div className="comment">
                      <div className="subject">
                        {msg.content?.subject || ""}
                      </div>
                      <div className="text">{msg.content?.comment || ""}</div>
                    </div>
                  </td>
                  <td>
                    <div className="createdBy">{msg.createdBy || ""}</div>
                  </td>
                  <td>
                    <div className="createdAt">
                      {msg.createdAt ? formatDate(msg.createdAt) : "--"}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </TableWrapper>
    </Styled>
  );
};

export default CommentsTable;
