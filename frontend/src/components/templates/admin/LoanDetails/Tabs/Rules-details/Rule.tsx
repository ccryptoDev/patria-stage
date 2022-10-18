import React from "react";
import styled from "styled-components";
import Table from "../../../../../atoms/Table/Details-vertical";

const Styled = styled(Table)`
  table {
    & td,
    & th {
      padding: 0 1rem;
    }
  }
  &:not(:first-child) {
    margin-bottom: 2rem;
  }
`;

export type IRuleProps = {
  description: string;
  message: string;
  passed: boolean;
  userValue: number | string;
  ruleId?: string;
};

const RuleComponent = ({
  description,
  message,
  passed,
  userValue,
  ruleId,
}: IRuleProps) => {
  return (
    <Styled>
      <table>
        <tbody>
          <tr>
            <th>Description</th>
            <td>{description}</td>
          </tr>
          <tr>
            <th>Message</th>
            <td>{message}</td>
          </tr>
          <tr>
            <th>Passed</th>
            <td>
              <div className={passed ? "success" : "danger"}>
                {passed ? "yes" : "no"}
              </div>
            </td>
          </tr>
          <tr>
            <th>User Value</th>
            <td>{`${userValue}`}</td>
          </tr>
        </tbody>
      </table>
    </Styled>
  );
};

export default RuleComponent;
