import React from "react";
import styled from "styled-components";

export const SsnWrapper = styled.div`
  display: flex;
  align-items: center;
  padding-left: 2rem;
  & input {
    padding: 0.8rem 3rem 0.8rem 0;
    width: 50%;
  }
`;

const TableRow = ({
  value,
  name,
  component: Component,
  edit = false,
  onChange,
  ...item
}) => {
  switch (name) {
    case "ssnNumber":
      return (
        <div>
          {edit && Component ? (
            <SsnWrapper>
              <div className="prefix">xxxx - xx - </div>
              <Component
                {...item}
                name={name}
                label=""
                value={value}
                onChange={onChange}
              />
            </SsnWrapper>
          ) : (
            <div className="value">xxxx - xx - {value}</div>
          )}
        </div>
      );

    default:
      return (
        <div>
          {edit && Component ? (
            <Component
              {...item}
              label=""
              name={name}
              value={value}
              onChange={onChange}
            />
          ) : (
            <div className="value">{value}</div>
          )}
        </div>
      );
  }
};

export default TableRow;
