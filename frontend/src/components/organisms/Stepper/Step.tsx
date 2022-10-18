import React from "react";
import styled from "styled-components";
import EditIcon from "../../atoms/Icons/SvgIcons/Edit";
import { useStepper } from "../../../contexts/steps";

const Styles = styled.div`
  min-height: 80px;
  padding: 0 0 12px 30px;
  position: relative;

  .step-number {
    position: absolute;
    border-radius: 50%;
    padding: 12px;
    top: -1px;
    left: 0;
    transform: translate(-50%, -20%);
    background: #fbfbff;
  }

  .step-number-inner,
  .step-edit-btn {
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 28px;
    width: 28px;
    font-size: 10px;
    line-height: 12px;
    font-weight: 700;
  }

  .step-edit-btn {
    background: #fff;
    border: 1px solid var(--color-grey-light);
    margin-left: 12px;
    position: absolute;
    top: 0;
    left: 100%;
    transform: translate(0, 0);
  }

  & > .heading-wrapper {
    display: flex;
    align-items: center;
    & .heading {
      font-weight: 700;
      position: relative;
      font-size: 12px;
      line-height: 30px;
    }
  }

  .content-wrapper {
    margin-top: 12px;
    padding: 0;
    opacity: 0;
    visibility: hidden;
  }

  .active .content-wrapper {
    opacity: 1;
    visibility: visible;
  }

  .completed img {
    & path {
      fill: #fff;
    }
  }

  @media screen and (max-width: 767px) {
    & {
      padding: 0 0 12px 20px;
    }
  }
`;

type IStepProps = {
  number: any;
  name: string;
  completed: boolean;
  active: boolean;
  children: any;
  icon: any;
};

const Step = ({
  number,
  icon,
  name,
  completed,
  active,
  children,
}: IStepProps) => {
  const { editStepForm, currentStep, initialStep } = useStepper();

  const stepColor = () => {
    switch (true) {
      case active:
        return "#1E84BE";
      case completed:
        return "#222222";
      default:
        return "#B7B7B7";
    }
  };

  return (
    <Styles className="step">
      <div className="step-number" id={number}>
        <div
          className="step-number-inner"
          style={{ backgroundColor: stepColor() }}
        >
          <img src={icon} alt={name} />
        </div>
      </div>
      <div className="heading-wrapper">
        <div className="heading" style={{ color: stepColor() }}>
          {name}
          {completed &&
            !active &&
            currentStep - 1 === number &&
            currentStep <= 2 && (
              <button
                type="button"
                className="step-edit-btn"
                onClick={() => editStepForm(number)}
              >
                <EditIcon />
              </button>
            )}
        </div>
      </div>
      <div className={`${active ? "active" : ""}`}>
        <div className="content-wrapper">{children}</div>
      </div>
    </Styles>
  );
};

export default Step;
