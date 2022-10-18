import React from "react";
import styled from "styled-components";
import paycheckImg from "../../../../../../../assets/png/paycheck.png";
import logo from "../../../../../../../assets/svgs/logo-dark.svg";
import Field from "./FieldComponent";
import { formatDate } from "../../../../../../../utils/formats";

const Wrapper = styled.div`
  margin: 40px 0;
  .address {
    text-align: center;
  }

  ul {
    padding-left: 20px;
  }

  & .header {
    & h3 {
      text-align: center;
      margin: 10px 0;
    }
  }

  .no-break {
    page-break-inside: avoid;
  }

  .logo {
    text-align: center;
    padding: 20px 0;
  }

  & .flex-wrapper {
    display: flex;
  }

  .paycheck {
    margin: 40px 0;
    text-align: center;
    & img {
      max-width: 520px;
      width: 90%;
    }
  }

  .paycheck-desctiption {
    margin: 20px 40px;
  }
  .table-user-info-col:first-child {
    flex-grow: 1;
  }
  .table-user-info-col:last-child {
    width: 400px;
  }

  @media screen and (max-width: 992px) {
    .form-field {
      display: block;
    }

    .table-user-info.flex-wrapper {
      display: block;
    }

    .table-user-info-col:last-child {
      width: 100%;
    }
  }

  @media screen and (max-width: 767px) {
    .paycheck-desctiption {
      margin: 10px 0;
    }
    & .form-field {
      padding: 10px 0;
    }

    .account-section {
      display: block;
    }
  }

  @media print {
    .account-section .field {
      & .label {
        white-space: nowrap;
      }
    }
  }
`;

const PaymentAuthorization = ({
  user,
  dateSigned = "",
  paymentData = {},
  isPdf,
  userSignature = "",
}) => {
  const url = process.env.REACT_APP_BASE_URL;
  const PREFIX = () => {
    if (url.includes("patria")) return "P";
    if (url.includes("amicus")) return "A";
    if (url.includes("istante")) return "I";
    return "P";
  };
  const img = isPdf
    ? "https://patria-lms.alchemylms.com/api/application/s3asset/patria-logo-dark.svg"
    : logo;

  const paycheck = isPdf
    ? "https://patria-lms.alchemylms.com/api/application/s3asset/paycheck.png"
    : paycheckImg;

  return (
    <Wrapper className="new-page">
      <div className="header">
        <div className="logo">
          <img src={img} alt="PatriaLending" />
        </div>
        <div className="address">
          8151 HWY 177 Red Rock, <br />
          OK 74651
        </div>
        <h3>
          <b>Automatic Payment Authorization Form</b>
        </h3>
      </div>
      <p>
        Anytime this Automatic Payment Authorization Form references
        <b>“Agreement”</b>, it means this Automatic Payment Authorization Form;
        when it references <b>“you”</b> or <b>“your”</b>, it means you as the
        borrower/debtor, and your heirs, guardian, personal representative, or
        trustee in bankruptcy; when it references{" "}
        <b>“Patria,” “Lender,” “we,” “us” or “our,”</b>
        it means Patria Lending, LLC. This Agreement also incorporates by
        reference the attached “Disclosure Statement for Recurring Auto
        Payments.”
      </p>

      <p>
        You have the option to pay your loan each week by electronic funds
        transfer using our Auto Payment option which will electronically debit
        payments from your bank account. If you decide to use Auto Payments, you
        must agree to the terms of this Agreement. This Agreement can only be
        used for automatic payments from your bank deposit account.
      </p>
      <p>
        By signing below, I authorize Patria Lending LLC (“PATRIA”) to initiate
        weekly deductions from my bank account below in the amount equal to the
        sum of my weekly scheduled loan payment, plus, if applicable, any
        additional amounts set forth below, and any late fees or other amounts
        owed under the terms of my loan agreement.
      </p>
      <p>I understand and acknowledge that:</p>
      <ul>
        <li>
          <p>
            PATRIA will begin to deduct weekly payments from my bank account on
            the first payment due date after this authorization form has been
            approved by PATRIA.
          </p>
        </li>
        <li>
          <p>
            This agreement is not assignable by me, however PATRIA may, at any
            time, transfer this agreement and my authorization to a successor
            servicer or any other entity which may purchase my loan.
          </p>
        </li>
        <li>
          <p>
            This authorization will remain in effect until terminated by PATRIA
            or by me either in writing via email to{" "}
            <a href="mailto:CustomerCare@PatriaLending.com" className="link">
              CustomerCare@PatriaLending.com
            </a>
            , or verbally by calling 800-640-2093. Please include your name,
            address, and loan account number and, if via email include “Withdraw
            Automatic Payment Authorization” in your termination notice as
            failure to include your identifying information may delay our
            ability to process your request.{" "}
            <b>
              If you terminate your EFT Authorization by telephone, you must
              confirm your termination in writing.{" "}
            </b>{" "}
            An oral revocation will not be effective if you fail to provide
            written confirmation.
          </p>
        </li>
        <li>
          <p>
            In the event, I terminate this agreement, I understand that PATRIA
            and my financial institution may require up to 10 business days to
            process any termination or other adjustment I make to my Auto
            Payment instructions.
          </p>
        </li>
      </ul>
      <div className="no-break">
        <p>Please provide the following information:</p>
        <div className="table-user-info flex-wrapper">
          <div className="table-user-info-col">
            <Field
              label="Name:"
              value={`${user?.firstName} ${user?.lastName}`}
            />
            <Field label="Home Phone:" value={user?.phoneNumber} />
            <Field label="Mobile Phone:" value={user?.phoneNumber} />
            <Field label="Email Address:" value={user?.email} />
            <Field
              label="Financial Institution Routing Number:"
              value={paymentData?.accountDetail?.routingNumber || "N/A"}
            />
            <Field
              label="Financial Institution Account Number:"
              value={paymentData?.accountDetail?.accountNumber || "N/A"}
            />
          </div>
          <div className="table-user-info-col">
            <div className="table-user-info-notes">
              <p>Authorization is for which account type?</p>
              <p>Checking Account</p>
              <p>Faster Repayment Option:</p>
              <p>
                I would like to pay more than my scheduled weekly payment
                amount.
              </p>
              <p>
                Please deduct an additional $__________ each week in addition to
                my schedule payment and apply it to my loan account.
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="no-break">
        <p>
          See the sample check (below) for help locating the routing number and
          your account number.
        </p>
        <div className="paycheck new-page">
          <img src={paycheck} alt="paycheck" />
        </div>
        <div className="paycheck-desctiption">
          <p>
            <b> Routing Number</b> - The routing number is a nine-digit number
            that identifies your financial institution. It is usually between
            the characters specified below, however the placement, may vary.
            Some routing numbers are in the middle, instead of being on the left
            side of the check.
          </p>
          <p>
            <b>Account Number</b> - The number of digits in your account number
            may vary. It is usually located to the right of the routing number.
            The check number may sometimes follow the account number but is not
            part of the account number.
          </p>
        </div>
        <p>
          <i>Your signature is required to draw funds from your account</i>
        </p>
        <p>Borrower Signature:</p>
        <img src={userSignature} alt="signature" />
        <div className="flex-wrapper account-section">
          <Field label="Date:" value={formatDate(dateSigned)} />{" "}
          <Field
            label="PATRIA Account Number:"
            value={`${PREFIX()}_${user?.userReference}`}
          />
        </div>
      </div>
    </Wrapper>
  );
};

export default PaymentAuthorization;
