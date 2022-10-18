import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { SuccessIcon } from "../../atoms/Icons/SvgIcons/Status-outlined";
import { formatCurrency } from "../../../utils/formats";

const Wrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 2rem;

  .button {
    min-width: 15rem;
    border-radius: 3rem;
    padding: 5px;
    padding-left: 2rem;
    border: 1px solid #000;
    background: #fff;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 1.6rem;
    font-weight: bold;
  }

  .button-ico {
    opacity: 0;
    border-radius: 50%;
    padding: 3px;
    border: 2px solid #fff;
  }

  .button-wrapper {
    &:nth-child(1) {
      margin-right: 1rem;
    }
    &:nth-child(2) {
      margin-left: 1rem;
    }
  }

  .button-label {
    margin-bottom: 5px;
    font-size: 1.6rem;
    text-align: center;
  }

  .active {
    background: #034376;
    color: #fff;
    border-color: #034376;

    & .button-ico {
      opacity: 1;
    }
  }
`;

type IState = {
  name: string;
  value: number;
};

const Buttons = ({
  onChange,
  buttons,
}: {
  buttons: { label: string; value: number; name: string }[];
  onChange: Function;
}) => {
  const [state, setState] = useState<IState>(buttons[0]);

  const switchStatusHandler = (value: number, name: string) => {
    setState({ name, value });
  };

  useEffect(() => {
    if (state?.value) {
      onChange(state?.value);
    }
    // eslint-disable-next-line
  }, [state]);

  return (
    <Wrapper>
      {buttons.map(({ label, value, name }) => {
        return (
          <div className="button-wrapper" key={name}>
            <div className="button-label"> {label} </div>
            <button
              type="button"
              name={name}
              className={`button ${state?.name === name ? "active" : ""}`}
              onClick={() => switchStatusHandler(value, name)}
            >
              <div> {formatCurrency(+value)} </div>
              <div className="button-ico">
                <SuccessIcon size="2rem" color="#fff" />
              </div>
            </button>
          </div>
        );
      })}
    </Wrapper>
  );
};

export default Buttons;
