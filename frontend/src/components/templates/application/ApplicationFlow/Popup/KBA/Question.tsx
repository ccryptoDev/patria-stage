import React, { useState, useEffect } from "react";
import styled from "styled-components";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormControl from "@mui/material/FormControl";
import Radio from "@mui/material/Radio";

const QuestionsWrapper = styled.div`
  max-width: 500px;
  display: flex;
  flex-direction: column;
  .MuiFormControlLabel-label {
    font-size: 14px;
  }

  .heading {
    font-size: 16px;
    color: var(--color-grey);
    font-weight: 600;
  }

  .form-wrapper {
    margin: 10px 0;
  }
`;

const Question = ({ choices: { Choices, QuestionText, Id }, cb }: any) => {
  const [selectedValue, setSelectedValue] = useState<any>("");
  const questions = Choices || [];

  useEffect(() => {
    setSelectedValue("");
  }, [Choices]);

  const handleChange = (e: any) => {
    const answerId: number = +e.target.value;
    cb({ questionId: Id, answerId });
    setSelectedValue(answerId);
  };

  return (
    <QuestionsWrapper>
      <div className="heading">{QuestionText}</div>
      <FormControl className="form-wrapper">
        <RadioGroup
          aria-labelledby="demo-radio-buttons-group-label"
          name="radio-buttons-group"
          value={selectedValue}
          onChange={handleChange}
        >
          {questions.length
            ? questions.map((item: any) => {
                return (
                  <FormControlLabel
                    key={item.Id}
                    value={item.Id}
                    control={<Radio />}
                    label={item.ChoiceText}
                  />
                );
              })
            : ""}
        </RadioGroup>
      </FormControl>
    </QuestionsWrapper>
  );
};

export default Question;
