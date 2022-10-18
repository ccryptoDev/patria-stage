import React from "react";
import styled from "styled-components";
import { dateCheck } from "../../../../utils/formats";

const ItemWrapper = styled.div`
  .textField input,
  .value {
    border-radius: 0;
    padding: 1rem 1rem 1rem 2rem;
  }

  .textField .error {
    right: 4rem;
    transform: translateY(50%);
    top: 0;
    font-size: 1.4rem;
  }

  .value {
    border: 1px solid transparent;
  }
`;

const SsnWrapper = styled(ItemWrapper)`
  align-items: center;
  position: relative;

  & .prefix {
    position: absolute;
    left: 2.1rem;
    top: 50%;
    transform: translateY(-50%);
    z-index: 100;
  }

  & .textField input {
    padding: 1rem 1rem 1rem 9.2rem;
  }
`;

type ITableComponent = {
  value: any;
  name: string;
  component: any;
  edit: boolean;
  onChange: Function;
};

const TableComponent = ({
  value,
  name,
  component: Component,
  edit = false,
  onChange,
  ...item
}: ITableComponent) => {
  switch (name) {
    case "ssnNumber":
      return (
        <SsnWrapper className="item-wrapper">
          {edit && Component ? (
            <>
              <div className="prefix">XXXX - XX - </div>
              <Component
                {...item}
                name={name}
                label=""
                value={value}
                onChange={onChange}
              />
            </>
          ) : (
            <div className="value">XXXX - XX - {value}</div>
          )}
        </SsnWrapper>
      );

    case "email":
      return (
        <ItemWrapper className="item-wrapper">
          <div className="value">{dateCheck(value)}</div>
        </ItemWrapper>
      );
    case "phone":
      return (
        <ItemWrapper className="item-wrapper">
          {edit && Component ? (
            <Component
              {...item}
              name={name}
              label=""
              value={value}
              onChange={onChange}
            />
          ) : (
            <div className="value">
              {" "}
              <Component
                {...item}
                name={name}
                label=""
                value={value}
                onChange={onChange}
                displayType="text"
              />
            </div>
          )}
        </ItemWrapper>
      );

    default:
      return (
        <ItemWrapper className="item-wrapper">
          {edit && Component ? (
            <Component
              name={name}
              {...item}
              label=""
              value={value}
              onChange={onChange}
            />
          ) : (
            <div className="value">{dateCheck(value)}</div>
          )}
        </ItemWrapper>
      );
  }
};

export default TableComponent;
