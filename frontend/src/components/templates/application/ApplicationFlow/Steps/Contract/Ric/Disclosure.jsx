import React from "react";
import styled from "styled-components";

const Wrapper = styled.div`
  ol {
    list-style: none;
    counter-reset: list;
    & li {
      position: relative;
      padding: 5px 0 5px 25px;
      line-height: 1.5;
      page-break-inside: avoid;
      &:before {
        content: counter(list, number) ") ";
        counter-increment: list;
        position: absolute;
        left: 0;
      }
    }
  }

  .list-letters {
    & li:before {
      content: counter(list, lower-alpha) ") ";
      counter-increment: list;
    }
  }
`;

const Disclosure = () => {
  return (
    <Wrapper className="new-page">
      <h3>
        <b>Disclosure Statement for Recurring Auto Payments</b>
      </h3>
      <ol>
        <li>
          <b>The Type and Nature of Automatic Payment</b>
          <br />
          Each Auto Payment will be effective on the due date of your loan
          payment. The payment amount will be equal to (a) your weekly loan
          payment (based on the applicable repayment schedule), plus (b) any
          additional amounts you’ve authorized above to be deducted and applied
          to your account, plus (c) any late fees or other amounts owed on your
          account pursuant to your loan agreement to the extent permissible
          under applicable law.
        </li>
        <li>
          <b>In Case of Errors and Questions About Your Automatic Payments</b>
          <br />
          You understand that you have certain rights under the Electronic Funds
          Transfer Act and its implementing regulation (Regulation E) with
          respect to unauthorized Auto Payments and the resolution of errors
          related to Auto Payments. If you suspect an error in any Auto Payment
          transaction, you must contact your financial institution to preserve
          those rights. This will not negate your responsibility to make
          scheduled payments on your loan during the investigation by your
          financial institution.
        </li>
        <li>
          <b>Right to Terminate Auto Payments, Insufficient Funds.</b>
          <br />
          PATRIA or you may terminate this Agreement with or without cause. It
          may take PATRIA or your financial institution up to 10 business days
          to process any request to terminate this agreement. Please note that
          PATRIA reserves the right to terminate this Agreement if it receives
          two consecutive insufficient funds return. PATRIA is also authorized
          under this Agreement to collect by Auto Payment any additional fees
          due under your loan agreement, as well as fees charges by PATRIA
          resulting from insufficient funds, to the extent permitted by law. You
          may also be charged a return fee by your financial institution if
          sufficient funds are not available at the time of an Auto Payment. In
          addition to fees and possible termination of the Auto Payment feature,
          your loan will not receive the benefit of, if applicable, any
          automatic payment reduction on your interest rate for any Auto Payment
          which was not honored by your financial institution, or any payment
          made by check, wire or other means other than by Auto Payment. You may
          terminate Auto Payments by providing timely notice to PATRIA either in
          writing via email to{" "}
          <a href="mailto:CustomerCare@PatriaLending.com" className="link">
            CustomerCare@PatriaLending.com
          </a>{" "}
          or verbally by calling 800-640-2093. Please note that PATRIA must
          receive your verbal or written request at least 10 business days
          before the date on which you wish to have your Auto Payments
          terminated. You are responsible for making timely weekly payments on
          your loan(s) after you have terminated Auto Payments. After any
          termination of this Agreement, you may reapply for Auto Pay the next
          week.
        </li>
        <li>
          <b>Assignment, Changes.</b>
          <br />
          This Agreement is not assignable by you, however PATRIA may, at any
          time, transfer this Agreement and your authorization to a successor
          servicer or other entity which may purchase your loan. In addition,
          PATRIA may assign or sell its rights and obligations under this
          Agreement to a third party at any time, by executing this agreement,
          you will be deemed to have consented to any such sale or assignment by
          PATRIA of its rights and obligations hereunder to any third party.
          <br />
          If PATRIA initiates a change to your weekly loan payment amount, the
          new payment amount and any additional amount you previously requested
          to be deducted via Auto Payment, will continue to be deducted from
          your account. You have the right to receive notice at least 10 days in
          advance of any change to your Auto Payment amount. If you wish to
          change the weekly additional amount withdrawn or make other changes to
          your Auto Payment directions, you will be required to submit a new
          Auto Payment Authorization Agreement to PATRIA which will take up to
          10 business days to process.
        </li>
        <li>
          <b>
            Resuming Automatic Payments After Deferment, Forbearance or Grace
            Period
          </b>
          <br />
          If you are granted a forbearance or deferment on your loan after this
          Agreement is effective, the forbearance or deferment will not
          automatically terminate this Agreement, and Auto Payments under this
          Agreement will resume with the first payment due following the
          deferment, forbearance or grace period, unless you suspend Auto
          Payments or terminate this Agreement as described above. Any interest
          rate reduction from Auto Payments will not apply to interest accrued
          during any forbearance, deferment, or grace periods in which you do
          not make Auto Payments. Automatic Payments will resume at the end of
          your deferment, forbearance or grace period.
        </li>
        <li>
          <b>Confidentiality/Privacy</b>
          <br />
          PATRIA may disclose information to third parties regarding your bank
          account, your loan account and/or Auto Payments to the extent
          permitted by law, including but not limited to, the following
          circumstances:
          <ol className="list-letters">
            <li>When necessary to complete an Automatic Payment;</li>
            <li>
              To verify the existence and condition of your account for a credit
              bureau or merchant;
            </li>
            <li>
              To comply with government agency requests, subpoenas, or orders,
              lawful discovery under federal or state rules of civil and
              criminal procedure, court orders, or as otherwise required by
              applicable law; or
            </li>
            <li>If you give PATRIA written permission to do so.</li>
          </ol>
        </li>
        <li>
          <b>Other Agreements and Regulations</b>
          <br />
          PATRIA reserves the right, upon notice to you, to make changes to the
          Auto Payment feature as required to comply with changes to any state
          or federal laws rules or regulations applicable to debits to accounts.
        </li>
        <li>
          <b>Business Days</b>
          <br />
          For purposes of this Agreement, business days are Monday through
          Friday, excluding bank holidays.
        </li>
        <li>
          <b>Auto Pay Statements</b>
          <br />
          You will continue to receive a weekly account statement, via email,
          from PATRIA which reflects your Auto Payments.
        </li>
        <li>
          <b>Definitions</b>
          <br />
          You understand that you have certain rights under the Electronic Funds
          Transfer Act and its implementing regulation (Regulation E) with
          respect to unauthorized Auto Payments and the resolution of errors
          related to Auto Payments. If you suspect an error in any Auto Payment
          transaction, you must contact your financial institution to preserve
          those rights. This will not negate your responsibility to make
          scheduled payments on your loan during the investigation by your
          financial institution.
          <ol className="list-letters">
            <li>
              Loan means each loan issued by PATRIA to Borrower under the
              Account Number listed on this Agreement.
            </li>
            <li>
              Bank Account means the deposit account of Borrower identified on
              the first page of this Agreement.
            </li>
            <li>
              Borrower means the individual identified on the first page of this
              Agreement and on the signature page hereof, who is also referred
              to in this Agreement as “you” and with terms “your” and “yours.”
            </li>
            <li>
              PATRIA shall include any purchaser of your loan, any successor
              servicer any agent retained by PATRIA to conduct Auto Payments
              under this Agreement.
            </li>
          </ol>
        </li>
      </ol>
    </Wrapper>
  );
};

export default Disclosure;
