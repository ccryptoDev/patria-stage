import React from "react";
import Wrapper from "../../atoms/Table/Details-vertical";
import { dateCheck } from "../../../utils/formats";

type IDetailsTableProps = {
  rows: { value: any; label: string; component?: any }[];
  onChange?: Function;
  edit?: boolean;
};

const Table = ({ rows = [], onChange, edit }: IDetailsTableProps) => {
  return (
    <Wrapper>
      <table>
        <tbody>
          {rows.length > 0
            ? rows.map(({ label, value, component: Component, ...props }) => {
                return (
                  <tr key={label}>
                    <th>
                      <div className="label">{label}</div>
                    </th>
                    <td>
                      {edit && Component ? (
                        <Component
                          {...props}
                          value={value}
                          onChange={onChange}
                        />
                      ) : (
                        <div className="value">{dateCheck(value)}</div>
                      )}
                    </td>
                  </tr>
                );
              })
            : ""}
        </tbody>
      </table>
    </Wrapper>
  );
};

export default Table;
