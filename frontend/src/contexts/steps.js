import React, { useState, useEffect } from "react";

export const StepperContext = React.createContext();

export const StepperProvider = ({ children, steps, initialStep = 0 }) => {
  const [state, setState] = useState(steps());
  const [currentStep, setCurrentStep] = useState("");
  const [previousStep, setPreviousStep] = useState();

  useEffect(() => {
    const curStep = initialStep;
    const updatedState = state.map((item) => {
      const updatedItem = { ...item };
      if (item.number < curStep) {
        updatedItem.active = false;
        updatedItem.completed = true;
      } else if (item.number === curStep) {
        updatedItem.active = true;
      }
      return updatedItem;
    });

    setCurrentStep(curStep);
    setState(updatedState);
  }, [initialStep]);

  const goToStep = (stepNumber, keepPreviousStep = false) => {
    const updatedState = state.map((item) => {
      const newItem = { ...item };
      if (item.number === stepNumber) {
        newItem.active = true;
        if (keepPreviousStep) {
          setPreviousStep(currentStep);
        }
        setCurrentStep(newItem.number);
      } else {
        newItem.active = false;
      }
      return newItem;
    });
    setState([...updatedState]);
  };

  const moveToPreviousStep = () => {
    goToStep(previousStep);
    setPreviousStep();
  };

  const moveToNextStep = () => {
    if (!previousStep) {
      const index = state.findIndex((item) => item.number === currentStep);
      const newState = [...state];
      newState[index].active = false;
      newState[index].completed = true;
      newState[index + 1].active = true;
      const nextStep = newState[index + 1].number;
      setCurrentStep(nextStep);
      setState(newState);
    } else {
      moveToPreviousStep();
    }
  };

  const editStepForm = (stepNumber) => {
    const index = state.findIndex((item) => item.number === stepNumber);
    const newState = [...state];
    newState[index].editing = true;
    setState(newState);
    goToStep(stepNumber);
  };

  // SEND REQUEST FROM THE TABLE OR TABLE MODAL WITH FURHTER TABLE UPDATE
  const expose = {
    goToStep,
    steps: state,
    moveToNextStep,
    currentStep,
    editStepForm,
    moveToPreviousStep,
    initialStep,
  };
  return (
    <StepperContext.Provider value={expose}>{children}</StepperContext.Provider>
  );
};

export const useStepper = () => {
  const context = React.useContext(StepperContext);

  if (context === undefined) {
    throw new Error("table must be used within a TableProvider");
  }
  return context;
};
