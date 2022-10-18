import React from "react";
import styled from "styled-components";
import { IRuleProps } from "./config";
import Table from "../../../../atoms/Table/Details-vertical";

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

const RuleComponent = ({
  declinedIf,
  description,
  disabled,
  value,
  weight,
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
            <th>Declined if</th>
            <td>{declinedIf}</td>
          </tr>
          <tr>
            <th>Disabled</th>
            <td>
              <div className={disabled === "true" ? "success" : "danger"}>
                {disabled === "true" ? "yes" : "no"}
              </div>
            </td>
          </tr>
          <tr>
            <th>User Value</th>
            <td>{`${value}`}</td>
          </tr>
          <tr>
            <th>Weight</th>
            <td>{`${weight}`}</td>
          </tr>
        </tbody>
      </table>
    </Styled>
  );
};

export default RuleComponent;
