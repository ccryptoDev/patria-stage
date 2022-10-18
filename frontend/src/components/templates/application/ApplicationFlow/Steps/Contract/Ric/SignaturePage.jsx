import React from "react";
import styled from "styled-components";
import Field from "./FieldComponent";
import { formatDate } from "../../../../../../../utils/formats";

const Wrapper = styled.div`
  h3 {
    margin: 10px;
  }
  table {
    tr td {
      padding: 20px;
      box-sizing: border-box;
    }
    & tr td {
      &:first-child div {
        width: 230px;
        text-align: right;
      }
      &:last-child {
        width: 100%;
        border-bottom: 1px solid;
      }
    }
  }
  .signature-fields-wrapper {
    width: 90%;
    margin-right: 100px;
  }
  .signature-field {
    text-align: right;
  }

  @media screen and (max-width: 767px) {
    & .signature-fields-wrapper {
      flex-wrap: wrap;
      column-gap: 0;
      row-gap: 24px;
      width: 100%;
      margin-right: 0;
    }
  }
  @media screen and (max-width: 560px) {
    & .signature-field .label {
      max-width: 100px;
    }
  }

  @media print {
    & .field .label {
      white-space: nowrap;
    }
  }

  .signature-img {
    max-width: 60%;
  }
`;

const SignaturePage = ({ userSignature, dateSigned = "", user }) => {
  return (
    <Wrapper className="new-page">
      <h3 className="text-center">
        <b>Signature Page</b>
      </h3>
      <p>
        By signing below, I acknowledge that I have received and read the
        Disclosure Statement and Loan Agreement applicable to this Loan and that
        I accept all of the terms and conditions of the Disclosure Statement and
        Loan Agreement. I declare that the information provided in connection
        with my application for this Loan is true and complete to the best of my
        knowledge and belief. I understand and agree that PATRIA LENDING LLC.
        may obtain a consumer credit report in connection with this application
        and in connection with any updates, renewals or extensions of any credit
        as a result of this application.
      </p>
      <p>
        <b>
          Agreement to pay: I agree to pay the lender or any other holder of
          this Loan all sums disbursed under the terms of this Loan Agreement,
          any loan origination fee, plus interest and all other fees, charges,
          and costs that may become due. The terms and conditions set forth in
          the Disclosure Statement and Loan Agreement constitute the entire
          agreement between us.
        </b>
      </p>
      <p>
        CAUTION – IT IS IMPORTANT TO THOROUGHLY READ THE CONTRACT BEFORE SIGNING
        IT.
      </p>
      <p>
        NOTICES TO CUSTOMER <br />
        (For purposes of the following notice, the word “you” refers to the
        Borrower not the Lender) (a) DO NOT SIGN THIS BEFORE YOU READ THE LOAN
        AGREEMENT EVEN IF OTHERWISE ADVISED. (b) DO NOT SIGN THIS IF IT CONTAINS
        ANY BLANK SPACES. (c) YOU ARE ENTITLED TO AN EXACT COPY OF ANY AGREEMENT
        YOU SIGN. (d) YOU HAVE THE RIGHT AT ANY TIME TO PAY IN ADVANCE THE
        UNPAID BALANCE UNDER THIS AGREEMENT AND YOU MAY BE ENTITLED TO A PARTIAL
        REFUND OF THE FINANCE CHARGE TO THE EXTENT REQUIRED BY APPLICABLE LAW.
      </p>
      <div className="signature-fields-wrapper">
        <Field
          label="BORROWER SIGNATURE:"
          value={
            userSignature && (
              <img
                className="signature-img"
                src={userSignature}
                alt="signature"
              />
            )
          }
        />
        <Field label="SIGNATURE DATE:" value={formatDate(dateSigned)} />
        <Field
          label="PRINT FULL NAME:"
          value={`${user?.firstName} ${user?.lastName}`}
        />
      </div>
      <p>
        I agree to keep a copy of this Loan Agreement and a copy of the
        Disclosure Statement for my own future reference.
      </p>
    </Wrapper>
  );
};

export default SignaturePage;
