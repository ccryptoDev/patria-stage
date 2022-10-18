import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import styled from "styled-components";
import Question from "./Question";
import { getKBAApi, sendKBAApi } from "../../../../../../api/application";
import Loader from "../../../../../molecules/Loaders/LoaderWrapper";
import ErrorMessage from "./ErrorMessage";
import Footer from "./Footer";
import Header from "../Header";

const Wrapper = styled.div`
  width: 500px;

  .kba-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
`;

const KBA = ({
  closeModal,
  state: { screenId, moveToNextStep, fetchUser },
}: any) => {
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [page, setPage] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchKBA = async () => {
      setLoading(true);
      const result = await getKBAApi();
      setLoading(false);
      if (result && !result.error) {
        setQuestions(result);
      }
    };
    fetchKBA();
  }, []);

  const submitAnswerHandler = async () => {
    if (screenId) {
      // PUSH EACH PAGE ANSWER
      if (page !== questions.length - 1 && selectedAnswer) {
        const currentAnswers: any = [...answers];
        currentAnswers.push(selectedAnswer);
        setAnswers(currentAnswers);
        setSelectedAnswer(null);
        setPage(page + 1);
      } else if (page === questions.length - 1 && selectedAnswer) {
        // SEE IF IT IS LAST PAGE AND THE QUESTION HAS ANSWER - SUBMIT THE FORM
        const payload = [...answers, selectedAnswer];
        setLoading(true);
        const result: any = await sendKBAApi({
          payload,
          screenTrackingId: screenId,
        });
        setLoading(false);
        const errorMessage = result?.error?.reason;
        if (result && !errorMessage) {
          // IF THE USER IS A LEAD - JUST CLOSE THE MODAL AND KEEP THE USER ON SAME SCREEN
          const user = await fetchUser();
          closeModal();
          if (user?.data?.origin === "WEB") {
            moveToNextStep();
          }
          toast.success("Thank you for answering!");
        } else if (errorMessage) {
          setError(errorMessage);
          // toast.error(errorMessage);
        }
      }
    } else {
      toast.error("No screentracking id");
    }
  };

  return (
    <Loader loading={loading}>
      <Wrapper>
        <Header text="Please answer the following questions to verify your identity." />
        {questions.length && questions[page] ? (
          <Question
            choices={questions[page]}
            submitAnswerHandler={submitAnswerHandler}
            cb={setSelectedAnswer}
          />
        ) : (
          ""
        )}
        <ErrorMessage message={error} />

        {questions.length ? (
          <Footer
            curPage={page + 1}
            totalPages={questions.length}
            disabled={!selectedAnswer}
            onClick={submitAnswerHandler}
            isError={!!error}
          />
        ) : (
          ""
        )}
      </Wrapper>
    </Loader>
  );
};

export default KBA;
