import React, { useRef, useEffect } from "react";
import styled from "styled-components";
import Step from "./Step";
import Accordion from "../../molecules/DropDowns/Accordion-Mui";
import { useStepper } from "../../../contexts/steps";

const Styles = styled.div`
  .stepper-wrapper {
    margin-left: 14px;
  }

  .step-wrapper:not(:last-child) {
    & .step {
      border-left: 1px solid var(--color-grey-light);
    }
  }

  & > .step-active:last-child {
    border-left: 1px solid var(--color-grey-light);
  }
`;

const Form = () => {
  const { steps, currentStep, goToStep, moveToNextStep } = useStepper();

  // JUMP TO AN ELEMENT ON HASH
  const activeElem: any = useRef();
  useEffect(() => {
    if (steps.length && currentStep) {
      const elem = document.getElementById(currentStep);
      if (elem) {
        setTimeout(() => {
          activeElem.current = elem;
          activeElem.current.scrollIntoView({
            behavior: "smooth",
          });
        }, 400);
      }
    }
  }, [steps.length, currentStep]);

  return (
    <Styles>
      <div className="stepper-wrapper">
        {steps.map((item: any) => {
          const Component: any = item.component;
          return (
            <div
              key={item.number}
              className={`step-wrapper ${item.active ? "step-active" : ""}`}
            >
              <Step {...item}>
                <div className="component-wrapper">
                  <Accordion
                    content={
                      <Component
                        moveToNextStep={moveToNextStep}
                        editing={item.editing}
                        isActive={item.active}
                        goToStep={goToStep}
                      />
                    }
                    expanded={item.active}
                  />
                </div>
              </Step>
            </div>
          );
        })}
      </div>
    </Styles>
  );
};

export default Form;
