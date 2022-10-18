import React from "react";
import styled from "styled-components";
import Container from "../../../atoms/Container";
import Note from "../../../molecules/Note";

const Wrapper = styled.section`
  padding: 6rem 0;
  .rates-section {
    &-description {
      padding: 6rem 0;

      &-list {
        & > li:not(:first-child) {
          margin-top: 2.4rem;
        }
      }
    }
  }
`;

const Section = () => {
  return (
    <Wrapper>
      <Container>
        <ul className="rates-section-description-list">
          <li>
            <p>
              Interest rate is the percentage of the principal of a loan a
              lender charges a borrower to make the loan. Finance charges are a
              broader measure of the cost of borrowing that include both
              interest and any applicable fees. Annual percentage rate, or APR,
              expresses the finance charges on a loan as a yearly rate. Finance
              charges are based on a consumer’s creditworthiness. A consumer’s
              creditworthiness is determined by several factors, including
              credit and payment history, income, employment, existing debt, and
              types of debt. The APR for your loan will be determined by the
              amount you choose to borrow and the length of time you choose to
              keep your loan outstanding. You can reduce the total cost of your
              loan by paying off your loan prior to your last due date on your
              payment schedule or by making additional payments on or between
              your payment due dates.
            </p>
          </li>
          <li>
            <p>
              The copy of your loan details, finance charges and APR will be
              fully disclosed to you in your loan agreement upon approval of
              your loan. Contact us today to see if you qualify for one of our
              loans. We can assist you and present a range of loan options for
              which you may qualify*. Our company adheres to all federal laws
              and regulations that apply to short-term and online personal
              lending industries.
            </p>
          </li>
          <li>
            <p>
              Our company does not discriminate against credit applicants on the
              basis of race, color, religion, national origin, sex, marital
              status, age, because all or part of an applicant’s income derives
              from any public assistance program, or because an applicant has in
              good faith exercised any right under the Consumer Credit
              Protection Act.
            </p>
          </li>
          <li>
            <Note
              content={[
                <>
                  This is an expensive form of borrowing, and it is not intended
                  to be a long-term financial solution. These loans are designed
                  to assist you in meeting your short-term financial needs and
                  are not intended to be a long-term financial solution.
                </>,
                <>*All loans are subject to credit approval.</>,
              ]}
            />
          </li>
        </ul>
      </Container>
    </Wrapper>
  );
};

export default Section;
