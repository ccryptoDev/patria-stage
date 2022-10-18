import React from "react";
import styled from "styled-components";

const Wrapper = styled.div`
  .terms-section-wrapper {
    columns: 2;
    padding: 20px 0;
  }
  .info-wrapper {
    & .info-block {
      &:not(:first-child) {
        margin: 20px 0;
      }
      & ul {
        margin-top: 10px;
        list-style: none;
        border: 1px solid;
        padding: 5px;

        & li {
          line-height: 1.5;
        }
      }
    }
  }

  .no-break-column {
    break-inside: avoid-column;
  }

  .border {
    border: 1px solid;
  }
  .underline {
    text-decoration: underline;
  }
  .padding-10 {
    padding: 10px;
  }

  .padding-left-20 {
    padding-left: 20px;
  }

  @media screen and (max-width: 767px) {
    .terms-section-wrapper {
      columns: 1;
    }
  }
`;

const Terms = (props) => {
  const { user } = props;
  return (
    <Wrapper>
      <div className="terms-section-wrapper">
        <div className="info-wrapper">
          <div className="info-block">
            <b>Lender:</b>
            <ul>
              <li>
                <b>PATRIA LENDING, LLC</b>
              </li>
              <li>
                <b>8151 Highway 177</b>
              </li>
              <li>
                <b>Red Rock, OK 74651</b>
              </li>
            </ul>
          </div>
          <div className="info-block">
            <b>Borrower Name:</b>
            <ul>
              <li>
                <b>{`${user?.firstName} ${user?.lastName}`}</b>
              </li>
            </ul>
          </div>
        </div>
        <p>
          <b>Loan Agreement for Patria Lending LLC Personal Loan Program</b>
        </p>
        <p>
          This Loan Agreement applies to, and is a part of, my Application. My
          signature on the Application certifies that I have read, understand,
          and agree to this Loan Agreement. In this Loan Agreement, except as
          otherwise indicated, the words <b>“I,” “me,” “my,”</b> and
          <b>“mine”</b> means the Borrower and any Co-Borrower/Joint Applicant,
          unless the language refers to only one or the other, and his or her
          heirs, guardian, personal representative, or trustee in bankruptcy.
          The words <b>“you,” “your,” “yours,” </b>and <b>“Lender”</b>{" "}
          mean&nbsp;
          <b>PATRIA LENDING LLC,</b> Red Rock, Oklahoma, its successors and
          assigns, and any other holder of my Loan; when it references
          <b> “Tribe,” “tribe,” “Tribal” </b>or&nbsp;
          <b>“tribal,”</b> it means the Otoe-Missouria Tribe of Indians.
        </p>
        <p>
          I understand that you are located on Otoe-Missouria Tribal Lands and
          <b> “Applicable Law”</b> means Tribal Law and applicable Federal law;
          Tribal Law means any law, ordinance or regulation duly enacted by the
          Tribe or the Otoe-Missouria Consumer Finance Services Commission. I
          acknowledge that the Loan and this Agreement are NOT governed by the
          law of my state of residence or any other state and that my state of
          residence may have laws that limit interest rates and other consumer
          protection provisions that are inapplicable to this agreement, my
          Application, my Loan and PATRIA LENDING LLC.
        </p>
      </div>
      <div className="terms-section-wrapper no-break-column">
        <p>
          <b>
            PLEASE READ THIS IMPORTANT DISCLOSURE AND THE TERMS OF THIS
            AGREEMENT CAREFULLY BEFORE SIGNING.
          </b>
        </p>
        <p>
          <b>
            LENDER IS AN ARM OF THE TRIBE. IT IS AN ENTITY FORMED AND OPERATED
            PURSUANT TO TRIBAL LAW, IT IS OWNED AND OPERATED BY THE TRIBE, AND
            IT WAS FORMED FOR THE EXPRESS PURPOSE OF ECONOMIC DEVELOPMENT AND
            BETTERMENT OF THE TRIBE. BOTH THE LENDER AND THE TRIBE ARE IMMUNE
            FROM SUIT IN ANY COURT EXCEPT TO THE EXTENT THAT THE TRIBE, THROUGH
            ITS TRIBAL COUNCIL, EXPRESSLY AND UNEQUIVOCALLY WAIVES THAT
            IMMUNITY. THE LENDER, AS AN ARM OF THE TRIBE, IS ALSO IMMUNE FROM
            SUIT IN ANY COURT EXCEPT AS PROVIDED IN THE LIMITED IMMUNITY WAIVER
            CONTAINED HEREIN. THE LENDER IS REGULATED AND LICENSED BY THE
            TRIBE’S CONSUMER FINANCE SERVICES REGULATORY COMMISSION (THE
            “COMMISSION”) IN ACCORDANCE WITH TRIBAL LAW. MY RIGHT TO SUBMIT A
            DISPUTE IS LIMITED TO THE DISPUTE RESOLUTION PROCESS SET FORTH IN
            THIS AGREEMENT. UNLESS I TIMELY EXERCISE MY RIGHT TO REJECT
            ARBITRATION IN ACCORDANCE WITH THE DISPUTE RESOLUTION PROCESS IN
            THIS AGREEMENT, ANY DISPUTE I HAVE RELATED TO THIS AGREEMENT WILL BE
            RESOLVED BY FINAL AND BINDING ARBITRATION. I SHOULD UNDERSTAND AND
            CAREFULLY EVALUATE MY ABILITY TO REPAY THIS LOAN. THIS LOAN HAS A
            HIGH INTEREST RATE AND IT IS NOT INTENDED TO PROVIDE A SOLUTION FOR
            LONGER TERM CREDIT OR OTHER FINANCIAL NEEDS. ALTERNATIVE FORMS OF
            CREDIT MAY BE LESS EXPENSIVE AND MORE SUITABLE FOR MY FINANCIAL
            NEEDS. IT IS MY RESPONSIBILITY, AND NOT LENDER’S RESPONSIBILITY, TO
            EVALUATE MY FINANCIAL OPTIONS. IF I AM HAVING FINANCIAL
            DIFFICULTIES, I SHOULD SEEK THE ASSISTANCE OF A FINANCIAL COUNSELOR.
            BEFORE SIGNING THIS AGREEMENT, PLEASE CAREFULLY READ ITS TERMS. MY
            SIGNATURE AND ACCEPTANCE OF THIS AGREEMENT WILL BE DEEMED AS PROOF
            THAT I ACCEPT ALL OF THE TERMS OF THIS AGREEMENT AND EXPRESSLY
            AGREE: (I) MY LOAN IS MADE WITHIN THE TRIBE’S JURISDICTION, IS
            SUBJECT TO AND GOVERNED BY APPLICABLE LAW; (II) THE LOAN AND THIS
            AGREEMENT ARE NOT GOVERNED BY THE LAW OF MY STATE OF RESIDENCE OR
            ANY OTHER STATE; (III) MY RESIDENT STATE LAW MAY HAVE INTEREST RATE
            LIMITS AND OTHER CONSUMER PROTECTION PROVISIONS THAT ARE
            INAPPLICABLE TO THE AGREEMENT, LENDER, AND MY LOAN; (IV) I HAVE READ
            THIS AGREEMENT; (V) I HAVE HAD THE OPPORTUNITY TO CONSULT WITH AN
            INDEPENDENT FINANCIAL COUNSELOR BEFORE ACCEPTING THIS AGREEMENT AND
            ACKNOWLEDGE THAT IT IS MY RESPONSIBILITY, NOT LENDER’S, TO EVALUATE
            MY FINANCIAL OPTIONS; (VI) I CONSENT TO ALL OF THE AGREEMENT’S
            TERMS, INCLUDING THE INTEREST RATE AND THE DISPUTE RESOLUTION
            PROCESS; (VII) I HAVE PROVIDED LENDER WITH THE MOST CURRENT AND
            ACCURATE EMPLOYMENT, CREDIT, INCOME, AND ASSET HISTORY REQUIRED FOR
            LENDER TO ASSESS MY ELIGIBILITY AND CREDITWORTHINESS; AND (VIII) I
            AFFIRMATIVELY ACKNOWLEDGE THAT I AM ABLE TO REPAY THE LOAN ACCORDING
            TO THE TERMS OF THIS AGREEMENT.
          </b>
        </p>
      </div>
      <div className="terms-section-wrapper no-break-column">
        <p>
          <b>A.AGREEMENT TO PAY</b>
        </p>
        <p>
          I agree to pay you, or YOUR SUCCESSORS OR ASSIGNS, the sum of the
          total principal amount of the Loan and the Loan Origination Fee, if
          any, described in the Disclosure Statement issued to me under the
          Truth in Lending Act (the “Total Loan Amount”); and as set forth in
          this Loan Agreement, interest on the Total Loan Amount; interest on
          any unpaid accrued interest added to the Total Loan Amount; reasonable
          costs of collection and attorney’s fees; and other fees, charges and
          costs as provided in this Loan Agreement.
        </p>
        <p>
          <b>B.IMPORTANT – READ THIS CAREFULLY</b>
        </p>
        <p>
          <b>1.</b> By completing and signing the Application, and submitting it
          to you, either directly or through some other person, I am requesting
          that you make a Loan to me on the terms described in this Loan
          Agreement and in an amount equal to all or part of the Loan Amount
          Requested. When you receive my Application, you are not agreeing to
          lend me money. You have the right not to make a Loan or to lend an
          amount less than the Loan Amount Requested. If you decide to make a
          Loan to me, you will disburse the Loan funds either (a) directly to me
          electronically or by sending a check to me, or (b) directly to the
          holders of my unsecured consumer debts as specified by me in my
          Application (<b>“Prior Debts”</b>).
        </p>
        <p>
          <b>2. </b>I may cancel my application without any fee or penalty prior
          to funding of the Loan, as long as I provide you with sufficient
          advance notice to stop the Loan funding.
        </p>
        <p>
          <b>3. </b> Decreasing the Total Loan Amount– You can decrease the
          Total Loan Amount (i) based on updated payoff information you
          subsequently receive on the Prior Debts I have identified in my
          Application, (ii) if I ask you in writing to remove a Prior Debt from
          this Loan after I provide this signed Loan Agreement but prior to
          disbursement, or (iii) by refusing to disburse Loan proceeds to the
          holders of my Prior Debts if doing so is prohibited by law.
        </p>
        <p>
          <b>4. </b> Updated Payoff Information– If after Loan proceeds are
          disbursed on my behalf, I receive updated payoff information showing
          that additional amounts remain owing on the Prior Debts I have
          identified for payoff, I will promptly pay the holders of my Prior
          Debts the additional amounts that remain owing on my Prior Debts and
          you will not be responsible in any way for paying off those amounts.
        </p>
        <p>
          <b>5. HOW I AGREE TO THE TERMS OF THIS LOAN.</b> If you agree to make
          a Loan to me, you will send me a Disclosure Statement under the
          Federal Truth in Lending Act. The Disclosure Statement will tell me
          the Total Loan Amount, the annual percentage rate on my Loan, and the
          amount of any fees. The Disclosure Statement is incorporated herein by
          this reference. My contractual obligation on this Loan Agreement will
          begin when Loan proceeds are disbursed to me or to the holders of my
          Prior Debs. To the extent any information in the Disclosure Statement
          conflicts with the information in this Loan Agreement, the information
          in the Disclosure Statement governs.
        </p>
      </div>
      <div className="terms-section-wrapper no-break-column">
        <p>
          <b>C. DEFINITIONS</b>
        </p>
        <p>
          <b>1. &quot;Application&quot;</b> means the Application, whether in
          paper or electronic form, which incorporates this Loan Agreement, by
          which I request that you make a Loan to me and agree to repay any Loan
          that you make on the terms set forth in this Loan Agreement.
        </p>
        <p>
          <b>2. &quot;Bank Account&quot;</b> it means the demand deposit
          (checking), savings, or other consumer asset account held directly or
          indirectly by a financial institution, the account’s identifying
          information (such as transit and routing information), and access
          device (as defined under Regulation E) that I provide to you, updated
          or modified from time to time.
        </p>
        <p>
          <b>3. &quot;“&quot;Disbursement Date&quot;</b> means the date you
          issue money to me or to the holders of my Prior Debts.
        </p>
        <p>
          <b>4. &quot;Disclosure Statement&quot;</b> means the closed-end
          consumer credit disclosure statement as required by the federal
          Truth-in- Lending Act provided to me in connection with the Loan.
        </p>
        <p>
          <b>5. &quot;Co-Borrower/Joint Applicant&quot;</b> means for purposes
          of this Agreement, a co-borrower or joint applicant who resides in the
          same household as the primary applicant as of the date of this
          Agreement.
        </p>
        <p>
          <b>6. &quot;Loan&quot;</b> means all sums disbursed to me or the
          holders of my Prior Debts, all amounts added to the principal balance,
          including any loan origination fee, and all interest and other amounts
          due as provided in this Loan Agreement.
        </p>
        <p>
          <b>7. &quot;Loan Amount Requested&quot;</b> means the dollar amount of
          the Loan requested by me in my Application.
        </p>
        <p>
          <b>8. &quot;Agreement&quot;</b> means this Loan Agreement setting the
          terms applicable to my Loan. The Term “Agreement” also includes the
          Application and the Disclosure Statement relating to the Loan I obtain
          subject to the terms of this Agreement. In the event of any
          inconsistencies between terms in this Loan Agreement and the
          Disclosure Statement, the terms of the Disclosure Statement shall
          govern.
        </p>
        <p>
          <b>9. &quot;Repayment Period&quot;</b> means the period beginning on
          the Disbursement Date and continuing for the number of scheduled
          installment payments as set forth in my Disclosure Statement.
        </p>

        <p>
          <b>D. INTEREST</b>
        </p>
        <p>
          <b>1. Accrual</b> – Beginning on the Disbursement Date, interest will
          accrue at the Fixed Interest Rate indicated on the Disclosure
          Statement for the term of my Loan, on the principal balance of my Loan
          outstanding from time to time. Interest will be calculated on a daily
          simple interest basis according to the outstanding principal balance
          each day during the term of the Loan. The daily interest rate will be
          equal to the annual interest rate in effect on that day, divided by
          the actual number of days in that calendar year.
        </p>
        <p>
          <b>2. Capitalization</b> – I agree that you may, at your option, and
          unless otherwise prohibited by Applicable Law, add all accrued and
          unpaid interest to the principal balance of my Loan (“
          <b>capitalized interest</b>”) at the end of any authorized period of
          forbearance. In all cases, thereafter, interest will accrue on the new
          principal balance. In addition, to the extent permitted by Applicable
          Law, if I am in default on my Loan, you may, at your option, add all
          accrued and unpaid interest to the principal balance of my Loan upon
          such default. Thereafter, interest will accrue on the new principal
          balance at the Fixed Interest Rate .
        </p>
        <p>
          <b>3. Calculation</b> – The Fixed Interest Rate will be identified on
          the Disclosure Statement you send me. If my Loan has a Fixed Interest
          Rate it will not increase or decrease over the life of my Loan.. If at
          any time the Fixed Interest Rate as provided in this Section is not
          permitted by Applicable Law, interest will accrue at the highest rate
          allowed by Applicable Law.
        </p>
      </div>
      <div className="terms-section-wrapper no-break-column">
        <p>
          <b>E. TERMS OF REPAYMENT</b>
        </p>
        <p>
          <b>1. Repayment Period</b> – The Repayment Period will begin on the
          Disbursement Date and will continue for the period specified in the
          Disclosure Statement. The amounts shown on my weekly statements will
          be consecutive weekly installments of principal and interest in
          approximately equal amounts over the number of months in the Repayment
          Period. During the Repayment Period, you will send me weekly
          statements electronically (showing Total Loan Amount and the amount of
          my weekly payment that is due). I will make weekly payments in the
          amounts and no later than the payment due dates shown on my electronic
          billing statements until I have paid all of the principal and interest
          and any other charges I may owe on my Loan.
        </p>
        <p>
          <b>2. Amounts Owing at the End of the Repayment Period</b> – Since
          interest accrues daily upon the unpaid principal balance of my Loan,
          if I make payments after my payment due dates, I may owe additional
          interest. If I have not paid other fees and charges, I will also owe
          additional amounts for those fees and charges. In such cases you will
          increase the amount of my last weekly payment to the amount necessary
          to repay my Loan in full.
        </p>
        <p>
          <b>3. Application of Payments</b> – To the extent permitted by
          Applicable Law, payments will be applied first to fees and charges,
          then to accrued interest to the date payment is received, and then any
          remainder to the principal balance of my Loan.
        </p>
        <p>
          <b>4. Borrower Benefits</b> – I understand that this Loan does not
          entitle me to any borrower benefits.
        </p>
        <p>
          <b>5. Late Fee</b> – If any payment that I owe on this Loan has not
          been received by us in the full amount due on a payment due date and
          remains past due for 2 days after that payment due date, then I agree
          that you may assess a late fee of $20. I authorize you and your agents
          to make a one-time withdrawal from my Bank Account to collect this fee
          if I have elected the EFT debit option.
        </p>
        <p>
          <b>6. Returned Payment Fee</b> – If any payment that I made on this
          Loan is not honored or cannot be processed for any reason, including
          insufficient funds in my Bank Account, then I agree that you may
          assess a fee of $20.00. I authorize you and your agents to make a
          one-time withdrawal from my Bank Account to collect this fee if I have
          elected the EFT debit option. My financial institution may also impose
          a fee for a dishonored item.
        </p>
        <p>
          <b>F. ORIGINATION FEE</b>
        </p>
        <p>
          You may charge me a Loan origination fee when Loan proceeds are
          disbursed. The total amount of the estimated Loan origination fee, if
          any, will be disclosed to me on my Disclosure Statement. The amount of
          the Loan origination fee, if any, will be deducted when my Loan
          proceeds are disbursed. If I prepay this Loan in full or in part at
          any time, I understand that I will not be entitled to a refund of any
          part of this Loan origination fee unless required by law.
        </p>

        <p>
          <b>G. RIGHT TO PREPAY</b>
        </p>
        <p>
          I have the right to prepay all or any part of my Loan at any time
          without penalty. Any partial payment will be credited against my Loan
          Balance as described in Section E.3.
        </p>
      </div>
      <div className="terms-section-wrapper no-break-column">
        <p>
          <b>H. FORBEARANCE</b>
        </p>
        <p>
          You may give me a forbearance in three (3) month increments if I am
          temporarily unable to make my scheduled Loan payments for
          unemployment. Requests for forbearance must be submitted in accordance
          with your reasonable procedures and requirements, and the decision to
          grant my request for forbearance shall be solely at your discretion.
          During any period of forbearance, regularly scheduled payments of
          principal and interest on my Loan may be deferred to the extent
          permitted by Applicable Law. Except as described above, I understand
          that I will remain responsible for all interest accruing during any
          period of forbearance and that to the extent permitted by Applicable
          Law you may add any interest that I do not pay during any forbearance
          period to the principal balance as described in Section D.2. I
          understand that any periods of forbearance will extend my Repayment
          Period as defined in Section E.1 unless prohibited by Applicable Law.
        </p>

        <p>
          <b>I.COLLECTION COSTS</b>
        </p>
        <p>
          Unless prohibited by Applicable Law, I agree to pay you all amounts,
          including reasonable attorneys’ fees, and collection agency, court and
          other collection costs that you incur in collecting or enforcing the
          terms of my Loan (collectively, <b>“Collection Costs”</b>) to the
          extent permitted by Applicable Law. The Collection Costs that I agree
          to pay may also include fees and costs incurred in connection with any
          appellate or bankruptcy proceedings to the extent permitted by
          Applicable Law.
        </p>
        <br />
        <div>
          <p>
            <b>J. DEFAULT</b>
          </p>
          <p>
            To the extent permitted by Applicable Law, I will be in default and
            you have the right to give me notice that the whole outstanding
            principal balance, accrued interest, and all other amounts payable
            to you under this Agreement, are due and payable at once (subject to
            any Applicable Law which may give me a right to cure my default) if:
            (1) I fail to make any weekly payment to you within seven (7) days
            of its due date; or (2) I fail to notify you in writing of a change
            in my name, address, telephone number, or employment status; or (3)
            I become the subject of proceedings under the United States
            Bankruptcy Code or assign my assets for the benefit of my creditors;
            or (4) I break any of my other agreements in my Application or this
            Agreement; or (5) I make any false, misleading or materially
            incomplete statement in applying for this Loan, or to you at any
            time during the Repayment Period; or (6) I am declared legally
            incompetent or incapacitated. If I default, you may add all accrued
            and unpaid interest and other amounts to the principal balance of my
            Loan upon such default as described in Section D.2. If I default, I
            will be required to pay interest on this Loan accruing after default
            at the same rate of interest applicable to this Loan prior to my
            default. If I Default, you may require immediate payment in full of
            all sums due under this Agreement to the maximum extent allowable by
            Applicable Law. If I have authorized you to debit my Bank Account by
            EFT, you reserve the right to debit my account in an amount that
            represents payment in full of the amount that I owe at the time of
            default. You otherwise retain your right to pursue all legally
            available means to collect what I owe you.
          </p>
        </div>
      </div>
      <div className="terms-section-wrapper">
        <div>
          <p>
            <b>K. NOTICES</b>
          </p>
          <p>
            <b>1.</b> I will send written notice to you within ten (10) days
            after any change in my name, address, e-mail address, telephone
            number or employment status. I will send such written notice to{" "}
            <b>PATRIA LENDING LLC.,</b> 8151 Hwy 177 Red Rock, OK 74651, or any
            future address or electronic method you provide me.
          </p>
          <p>
            <b>2. </b>
            Any communication between you and the Borrower or any
            Co-Borrower/Joint Applicant will be binding on the Borrower and any
            Co-Borrower/Joint Applicant and all disclosures provided by you to
            the Borrower or Co-Borrower/Joint Applicant will be deemed
            simultaneously received by all parties. Any notice required to be
            given to me by you may be given to the Borrower or any
            Co-Borrower/Joint Applicant and shall be binding on, and deemed
            received by, the Borrower and any Co-Borrower/Joint Applicant will
            be effective when mailed by first class mail to the latest address
            you have for me, or when transmitted by electronic communication to
            the latest e- mail address you have for me.
          </p>
          <p>
            <b>3. </b>
            PATRIA LENDING LLC is licensed by the Otoe Missouria Consumer
            Finance Services Regulatory Commission, License Number
            OMCFSRC-21-04, 8151 HWY 177, Red Rock, OK 74651. PATRIA LENDING LLC
            is an arm of the Otoe-Missouria Tribe of Indians (Tribe), a
            federally recognized Indian Tribe. It is owned and operated pursuant
            to Tribal Law, and it was formed for the express purpose of economic
            development and betterment of the Tribe. Both PATRIA LENDING LLC and
            the Tribe are immune from suit in any court except to the extent
            that the Tribe, through its Tribal Council, expressly and
            unequivocally waives that immunity. As an arm of the Tribe, PATRIA
            LENDING LLC is also immune from suit in any court except as provided
            in the limited immunity waiver contained herein.
          </p>
        </div>
        <div>
          <p>
            <b>L. CREDIT REPORTING AND INFORMATION SHARING</b>
          </p>
          <p>
            <b>
              1. You or your agents may report information about my account to
              credit bureaus. Late payments, missed payments or other defaults
              in my account may be reflected in my credit report.
            </b>
          </p>
          <p>
            <b>2. </b>I understand that the reporting of information about my
            account to credit reporting agencies may adversely affect my credit
            rating and my ability to get other credit.
          </p>
        </div>
      </div>
      <div className="terms-section-wrapper no-break-column">
        <p>
          <b>M. JOINT AND SEVERAL LIABILITY</b>
        </p>
        <p>
          <b>1.</b> The liability of any Co-Borrower/Joint Applicant to repay
          this Loan in full is in addition to and not in lieu of the obligations
          of the primary Borrower to repay the Loan in full. The
          Co-Borrower/Joint Applicant agrees to abide by the terms and
          conditions of this Agreement or any other documents provided or
          executed as part of the application process as if an original
          signatory.
        </p>
        <p>
          <b>2.</b> Lender has sole discretion to proceed against both the
          Borrower and any Co-Borrower/Joint Applicant to recover all the
          amounts due under this Loan Agreement. Further, you can accept
          instructions from the Borrower or any Co-Borrower/Joint Applicant.
        </p>
        <p>
          <b>
            N. ELECTRONIC FUNDS TRANSFER (“EFT”) AUTHORIZATION; CHECK CONVERSION
          </b>
        </p>
        <p>
          <b>1. EFT Payment Option:</b>
          For my convenience and benefit, I may choose to make payments by EFT.
          My receipt of this Loan is not conditioned on repayment by EFT. I may
          pay each payment owing under this Agreement by EFT debit, check, money
          order or any other payment method that you may offer from time to
          time.
        </p>
        <p>
          <b>2. EFT Authorization To Credit Bank Account:</b>
          Unless I elect to receive the Loan proceeds by check as set forth in
          Section O.3. below, I authorize you and your agents to initiate an EFT
          credit entry to my Bank Account to disburse the proceeds of this Loan.
        </p>
        <p>
          <b>3.EFT Authorization To Debit Bank Account:</b>
          If I elect to repay amounts due on my Loan by EFT debit, then
          recurring withdrawals will be initiated as EFT debit entries from my
          Bank Account pursuant to and in accordance with the terms of my
          Automatic Payment Authorization Form agreement, this Agreement, and
          any modifications or adjustments to my Payment Schedule or my
          Agreement that you may agree to make. If my payment date falls on a
          Saturday, Sunday or bank-recognized holiday, then my EFT debit will be
          processed one business day BEFORE that payment date.
        </p>
        <p>
          <b>4. Check Processing:</b>
          If I provide a check as payment, I agree you may use information from
          my check to make a one-time electronic withdrawal from my Bank Account
          or process the payment as a check transaction. In that event, funds
          may be withdrawn from my Bank Account as soon as the same day you
          receive my payment and I will not receive my check back from my
          financial institution.
        </p>
        <p>
          <b>O. FUNDING OPTIONS</b>
        </p>
        <p>
          I have the option to receive my Loan proceeds by ACH credit, by wire
          transfer, or by check as described below.
        </p>
        <p>
          <b>1. ACH Credit:</b>
          No additional fee is charged by Patria if I choose to receive my Loan
          proceeds by ACH credit but there may be a delay of 1 to 2 business
          days before the funds post to my account due to processing and hold
          times, which may be imposed by the originating and receiving financial
          institutions and/or their agents.
        </p>
        <p>
          <b>2. Wire Transfer Credit:</b>
          No additional fee is charged by Lender if I choose to receive my Loan
          proceeds by wire transfer, but I will be responsible for any fees that
          my financial institution may impose.
        </p>
        <p>
          <b>3. Check:</b>I can choose to receive my Loan proceeds by check and
          delivered by regular mail through the United States Postal System. I
          should allow 7 to 10 days for delivery of the Loan proceeds.
        </p>
        <p>
          <b>4. Debit Card Credit:</b>
          No additional fee is charged by Lender if I choose to receive my Loan
          proceeds by debit card credit, but I will be responsible for any fees
          that my financial institution may impose.
        </p>
      </div>
      <div className="terms-section-wrapper no-break-column">
        <p>
          <b>P.ESIGN DISCLOSURE AND CONSENT</b>
        </p>
        <p>
          Please read this ESign Disclosure and Consent carefully. Certain laws
          and regulations require you to provide notices and disclosures to me
          in writing. The federal Electronic and regulations require you to
          provide notices and disclosures to me in writing. The federal
          Electronic Signatures in Global and National Commerce Act (
          <b>“ESIGN Act”</b>) allows the use of electronic records and
          electronic signatures, and it ensures the validity and legal effect of
          contracts entered electronically. When I agree to use electronic
          records and electronic signatures, then you can conduct business with
          me electronically, including providing required notices to me
          electronically. When I agree to conduct business electronically, I
          will be certifying that I agree to receive electronically this
          Agreement, and all disclosures, notices, documents, other agreements,
          and information associated with my Loan (collectively,{" "}
          <b>“Communications”</b>). I also agree that this Agreement and all
          Communications are electronic records and that, as such, they may be
          transferred, authenticated, stored, and transmitted by electronic
          means.
        </p>
        <p>
          <b>1. Consent to Electronic Delivery:</b> I agree that Patria, its
          agents and its representatives may provide all Communications to me
          electronically. I agree and consent to your use of email as the
          electronic delivery method when Applicable Law may require you to
          provide me with notification of payment transfer attempts and other
          payment disclosures. I agree to print out, download or otherwise store
          the Communications to keep for my records. I may still request a paper
          copy of my Agreement and any Communication by following the procedure
          outlined below. This consent does not apply to any future Loans that
          may occur between you and I.
        </p>
        <p>
          <b>2. Paper Copies of Disclosures:</b> I may request a paper copy of
          any Communication that you have provided to me or made available to me
          electronically, provided my request is made within 20 business days
          after you first provided the Communication to me. To do so, I must
          send an e-mail to customercare@patrialending.com with the subject line
          “Paper Copy Request” and in the body of the email I must state my
          e-mail address, full name, US Postal address, and telephone number,
          and also describe the Communication or Communications that I am
          requesting a paper copy of. I may also submit my request by mail to
          Patria Lending, LLC, 8151 Highway 177, Red Rock, Oklahoma 74651,
          Attention: Compliance Department. There is no fee for the paper copy.
        </p>
        <p>
          <b>3. Withdrawing Consent to Electronic Delivery:</b> I may withdraw
          my consent to receive future Communications electronically by
          e-mailing you in writing at: customercare@patrialending.com with the
          subject line of “Withdraw Electronic Consent” and including my full
          name, US Postal Address, email address, and telephone number in the
          body of the email. My withdrawal of consent will be effective only
          after you have had a reasonable period to process my request. If I
          decide to withdraw my consent, it will not affect the validity or
          effectiveness of any Communications sent to me electronically prior to
          the date that my withdrawal of consent becomes effective.
        </p>
        <p>
          <b>4. Hardware and Software Requirements:</b> In order to receive
          electronic Communications, I must have the following: (1) access to
          the internet; (2) an active email account; (3) software capable of
          receiving email through the internet; (4) supported web browsing
          software (such as Chrome version 32.0 or higher, Firefox version 26.0
          or higher, Internet Explorer version 8.0 or higher, or Safari version
          7.0 or higher); and (5) hardware capable of running this software. To
          ensure access and optimal printing of my Loan documents in PDF format,
          I must have Adobe Reader. To install the free version of Adobe Reader,
          click here or visit{" "}
          <a
            href="https://get.adobe.com/reader/"
            target="_bank"
            className="link-string link"
          >
            https://get.adobe.com/reader/
          </a>
          .
        </p>
        <p>
          <b>5.Additional Mobile Technology Requirements:</b> If I access your
          website or Communications by a mobile device (such as a smart phone or
          tablet), or if I download and use your Mobile App, then I must make
          sure that I have software on my mobile device that allows me to print
          and save the disclosures presented to me during the application
          process. If I do not have these capabilities on my mobile device,
          please access the site through a device that provides these
          capabilities.
        </p>
        <p>
          <b>6.My Electronic Signature:</b> My <b>“electronic signature”</b>{" "}
          means an electronic sound, symbol, or process, attached to or
          logically associated with a contract or other record and executed or
          adopted by me with the intent to sign the record; it can be created
          using email, text message, fax, or recorded touch tone capture files.
          For example, if I were to reply “Agree” to a text message referencing
          an amendment or push a specific number on my phone which is recorded
          by an interactive voice response or call recording system as an
          electronic file, then I am creating an electronic signature.
        </p>
        <p>
          <b>7. Consent and Acknowledgment: </b>I acknowledge and confirm that:
        </p>
        <p>
          (a) I can view this consent. I am also able to download and review
          files within a web browser or a mobile device;
        </p>
        <p>
          (b) I have (1) access to the internet, (2) an active email account,
          (3) software capable of receiving email through the internet, (4)
          supported web browsing, and (5) hardware capable of running this
          software, an account with an internet service provider, and the
          ability to send email and receive email with hyperlinks to websites;
        </p>
        <p>
          (c) I have read the information about the requirements to receive
          Communications electronically, and the use of electronic signatures;
        </p>
        <p>
          (d) I consent to the use of electronic Communications and electronic
          signatures;
        </p>
        <p>
          (e) When I click a signature button to ‘process my Loan’, I am (i)
          adopting an electronic process to confirm my consent to the terms of
          my Agreement, (ii) affixing my signature electronically to the
          Agreement, and (iii) certifying that all information I have provided
          in connection with the transaction is complete and accurate; and
        </p>
        <p>
          (f) My electronic signature will have the same force and effect and
          will bind me to this Agreement in the same manner and to the same
          extent as a physical signature would do, and that my consent to
          conduct business electronically inures to you, as well as your
          affiliates, agents, employees, successors, and assigns.
        </p>
      </div>
      <div className="terms-section-wrapper no-break-column">
        <p>
          <b>Q. ADDITIONAL AGREEMENTS</b>
        </p>
        <p>
          I agree to update the information on my Application whenever you ask
          me to do so.
        </p>
        <p>
          1. My responsibility for paying my Loan is unaffected by your failure
          to notify me that a required payment has not been made. You may delay,
          fail to exercise, or waive any of your rights on any occasion without
          losing your entitlement to exercise the right at any future time, or
          on any future occasion. You will not be obligated to make any demand
          upon me, send me any notice, present my Application to me for payment
          or make protest of non-payment to me before suing to collect my Loan
          if I am in default, and to the extent permitted by Applicable Law, I
          hereby waive any right I might otherwise have to require such actions.
          Without losing any of your rights under this Agreement, you may accept
          late payments or partial payments.{" "}
          <b>
            I will not send you partial payments marked “paid in full,” “without
            recourse” or with other similar language unless those payments are
            marked for special handling and sent to PATRIA LENDING LLC, 8151 Hwy
            177, Red Rock, OK 74651
          </b>{" "}
          or to such other address or electronic method as I may be given in the
          future.
        </p>
        <p>
          <b>2. TCPA Consent</b> – Notwithstanding any current or prior election
          to opt in or opt out of receiving telemarketing calls or SMS messages
          (including text messages) from you, your agents, representatives,
          affiliates or anyone calling on your behalf, I expressly consent to be
          contacted by you, your agents, representatives, affiliates, or anyone
          calling on your behalf for any and all purposes arising out of or
          relating to my Loan, at any telephone number, or physical or email or
          electronic address I provide or at which I may be reached. Telephone
          numbers I provide include those I give to you, those from which I or
          others contact you with regard to my account, or which you obtain
          through other means. I agree you may contact me in any way, including
          SMS messages (including text messages) calls using prerecorded
          messages or artificial voice, and calls and messages delivered using
          automatic telephone dialing systems (auto-dialer) or an automatic
          texting system. Automated messages may be played when the telephone is
          answered, whether by me or someone else. In the event that an agent or
          representative calls, he or she may also leave a message on my
          answering machine, voice mail, or send one via text. I consent to
          receive SMS messages (including text messages), calls and messages
          (including prerecorded and artificial voice and autodialed) from you,
          your agents, representatives, affiliates or anyone calling on your
          behalf at the specific number[s] I have provided to you, or numbers
          you can reasonably associate with my Loan (through skip-trace, caller
          ID capture or other means), with information or questions about your
          application or Loan. I certify, warrant and represent that the
          telephone numbers that I have provided to you are my contact numbers.
          I represent that I am permitted to receive calls at each of the
          telephone numbers I have provided to you. I agree to promptly alert
          you whenever I stop using a particular telephone number. I also
          consent to you and your agents, representatives, affiliates or anyone
          calling on your behalf to communicate with any persons listed in my
          Application as employment and personal references. YOU AND YOUR
          AGENTS, REPRESENTATIVES, AFFILIATES AND ANYONE CALLING ON YOUR BEHALF
          MAY USE SUCH MEANS OF COMMUNICATION DESCRIBED IN THIS SECTION EVEN IF
          I WILL INCUR COSTS TO RECEIVE SUCH PHONE MESSAGES, TEXT MESSAGES,
          E-MAILS OR OTHER MEANS.
        </p>
        <p>
          <b>3. Call Recording</b> – I agree that you and your agents,
          representatives, affiliates or anyone calling on your behalf may
          contact me on a recorded line.
        </p>
        <p>
          <b>4.</b> I may not assign my Loan Agreement (including my
          Application) or any of its benefits or obligations. You may assign my
          Loan Agreement (including my Application) at any time. The terms and
          conditions of my Loan Agreement apply to, bind, and inure to the
          benefits of your successors and assigns.
        </p>
        <p>
          <b>5.</b> If any provision of this Agreement is held invalid or
          unenforceable, that provision shall be considered omitted from this
          Agreement without affecting the validity or enforceability of the
          remainder of this Agreement.
        </p>
        <p>
          <b>6.</b> A provision of this Agreement may only be modified if
          jointly agreed upon in writing by you and me.
        </p>
        <p>
          <b>7.</b> All parties to this Loan Agreement agree to fully cooperate
          and adjust all typographical, computer, calculation, or clerical
          errors discovered in any or all of the Loan documents including the
          Loan Agreement and Disclosure Statement. In the event this procedure
          is used, I will be notified and receive a corrected copy of the
          changed document.
        </p>
        <p>
          <b>8.</b> All payments on my Loan will be made in United States
          dollars, and if paid by check or draft, drawn upon a financial
          institution located in the United States. My obligation to make weekly
          payments in accordance with Section E.1 is not affected by any
          withholding taxes required to be paid under any foreign law, and
          notwithstanding any such law that requires withholding taxes on my
          payments under my Loan, I agree to make all required payments under
          this Loan to you or any subsequent holder.
        </p>
        <p>
          <b>9.</b> My failure to receive a coupon book or statement whether
          electronically or by mail does not relieve me of my obligation to make
          any required Loan payments in accordance with the terms and conditions
          of this Agreement.
        </p>
        <p>
          <b>10. Limits on Interest, Fees, Charges or Costs</b> – If a law which
          applies to this Loan and which sets maximum limits on interest, fees,
          charges, or costs collected or to be collected in connection with this
          Loan exceed permitted limits, then:
        </p>
        <p>
          (a) Any such interest, fees, charges or costs shall be reduced by the
          amount necessary to comply with the permitted limits, and (b) any sums
          already collected from me which exceed permitted limits will be
          refunded to me. You may choose to make the refund by reducing the
          amounts I owe under this Agreement.
        </p>
        <p>
          <b>11.</b> If I sign this Loan Agreement electronically, then: (i) You
          agree to keep an electronic record of the signed Loan Agreement and
          provide a printed copy to me upon request, and (ii) I agree to
          download and print a copy of this Loan Agreement for my records when I
          sign it. I understand and agree that my electronic signature or a
          facsimile of my signature will be just as valid as my handwritten
          signature on a paper document.
        </p>
        <p>
          <b>12.</b>{" "}
          <i>
            NOT NEGOTIABLE. This Loan Agreement is not a promissory note or
            other “instrument” (as such term is defined in Article 9 of the
            Uniform Commercial Code). The delivery or possession of this Loan
            Agreement shall not be effective to transfer any interest in the
            Lender’s rights under this Loan Agreement or to create or affect any
            priority of any interest in the Lender’s rights under this Loan
            Agreement over any other interest in the Lender’s rights under this
            Loan Agreement.
          </i>
        </p>
        <p>
          <b>13. Patriot Act.</b> You adhere to the USA PATRIOT Act and
          therefore have adopted procedures to request and retain in your
          records information you deem necessary to verify my identity,
          including digital identity. I consent to these procedures and further
          consent to ongoing identity verification (including digital identity)
          by you using any reasonable means.
        </p>
      </div>
      <div className="terms-section-wrapper no-break-column">
        <p>
          <b>R. CERTIFICATIONS AND AUTHORIZATIONS OF BORROWER</b>
        </p>
        <p>
          <b>1.</b> I declare under penalty of perjury under the laws of the
          United States of America that the following is true and correct. I
          certify that the information contained in my Application is true,
          complete and correct to the best of my knowledge and belief and is
          made in good faith. I certify that the Loan proceeds will only be used
          for unsecured personal, family, or household expenses and not for real
          estate, business purposes, investment, purchases of securities,
          post-secondary education or short-term real estate financing.
        </p>
        <p>
          <b>2.</b> I represent and warrant that any Co-Borrowers/Joint
          Applicants on this Loan reside in the same household as the primary
          Borrower as of the date of this Loan Agreement.
        </p>
        <p>
          <b>3.</b> I represent and warrant that: (a) if I elected to have my
          Loan proceeds disbursed by ACH credit or wire and/or have signed an
          EFT Authorization Agreement, that (i) my Bank Account on which the
          payment is drawn is a legitimate, open and active account in my name,
          and (ii) I will have sufficient funds in my Bank Account on and after
          the payment date for each payment to be paid until it is paid; (b)
          that I am at least 18 years of age and have the right to enter into
          this Agreement; (c) that I have the ability to repay this loan when
          due; (d) that I am not currently a debtor under any proceeding in
          bankruptcy and that I have no intention to file a petition for relief
          under any chapter of the United States Bankruptcy Code; (e) that I am
          NOT an active or active reserve member of the Army, Navy, Marine
          Corps, Air Force or Coast Guard, or a dependent of such member; (f)
          that (i) the telephone numbers that I provide to you are numbers that
          are assigned to me and not someone else, (ii) I am permitted to
          receive calls at each of the telephone numbers I provide to you, and
          (iii) I agree to notify you whenever I stop using a particular
          telephone number; and (g) that I have read, understand and agree to
          all of the terms and conditions contained in this Agreement.
        </p>
        <p>
          <b> 4.</b> I authorize you or your agents to: (1) gather and share
          from time to time credit-related, employment and other information
          about me (including any information from the Loan Agreement or about
          this Loan or my payment history) from and with consumer reporting
          agencies, and others in accordance with Applicable Law; (2) respond to
          inquiries from prior or subsequent lenders or holders or loan
          servicers with respect to my Loan and related documents; and (3)
          release information and make inquiries to the persons I have listed in
          my Application as employers and references. My authorization under
          this Section O applies to this Loan, any future loans that may be
          offered to me by you, any updates, renewals or extensions of this Loan
          that may be offered to me, any hardship forbearance of this Loan or
          any future loans that may be requested by me, and for any review or
          collection of this Loan or any future loans that may be offered to me.
          I understand that a credit report is obtained for this Loan request.
          If you agree to make this Loan to me, a consumer credit report may be
          requested or used in connection with renewals or extensions of any
          credit for which I have applied, reviewing my Loan, taking collection
          action on my Loan, or legitimate purposes associated with my Loan. If
          I live in a community property state, I authorize you to gather
          credit- related information from others about my spouse. If I ask you,
          you will tell me if you have requested information about me (or about
          my spouse if applicable) from a consumer reporting agency and provide
          me with the name and address of any agency that furnished you with a
          report.
        </p>
        <p>
          <b>5.</b> I authorize you and your agents to verify my Social Security
          number with the Social Security Administration (SSA) and, if the
          number on my Loan record is incorrect, then I authorize SSA to
          disclose my correct social security number to these persons.
        </p>
        <p>
          <b>S. WAIVER OF CLASS ACTIONS, REPRESENTATIVE ACTIONS, JURY TRIAL:</b>
        </p>
        <p>
          Class actions, other similar representative procedures and
          consolidation of claims are NOT available under my Loan Agreement. I
          UNDERSTAND AND AGREE THAT I MAY NOT SERVE AS A REPRESENTATIVE, AS A
          PRIVATE ATTORNEY GENERAL, OR IN ANY OTHER REPRESENTATIVE CAPACITY, NOR
          PARTICIPATE AS A MEMBER OF A CLASS OF CLAIMANTS, IN ANY PROCEEDING
          WITH RESPECT TO ANY DISPUTE (DEFINED BELOW) OR CLAIM. Further, I
          understand and agree that (a) I may not join my Dispute with others,
          (b) I must resolve my Dispute(s) separately, and (c) I will not assert
          and waive any claim or right to have a Dispute resolved by a jury
          trial.
        </p>
      </div>
      <br />
      <div className="terms-section-wrapper no-break-column">
        <p>
          <b>T. ARBITRATION AGREEMENT:</b>
        </p>
        <p>
          THIS LOAN AGREEMENT CONTAINS AN ARBITRATION PROVISION: TO THE EXTENT
          PERMITTED UNDER FEDERAL LAW, YOU AND I AGREE THAT EITHER PARTY MAY
          ELECT TO ARBITRATE AND REQUIRE THE OTHER PARTY TO ARBITRATE ANY CLAIM
          UNDER THE FOLLOWING TERMS AND CONDITIONS, WHICH ARE PART OF THIS
          AGREEMENT.
        </p>
        <p>
          Please read this Arbitration Agreement carefully. This Arbitration
          Agreement provides that all Disputes (defined below) between you and I
          must be resolved by binding arbitration. UNDER THIS ARBITRATION
          AGREEMENT, I AGREE TO GIVE UP MY RIGHT TO GO TO COURT AND TO HAVE A
          JUDGE OR JURY RESOLVE MY DISPUTE. I HAVE THE RIGHT TO REJECT THIS
          ARBITRATION AGREEMENT AND OPT OUT OF ARBITRATION, BUT IF I WISH TO
          REJECT IT, I MUST DO SO TIMELY AS PROVIDED BELOW.
        </p>
        <div className="border padding-10">
          <p>
            <b>How to Reject this Arbitration Agreement.</b> To reject this
            Arbitration Agreement, I must send you a written notice stating I
            reject this Arbitration Agreement and include my name, my Loan
            account number (or last 4 digits of my social security number) and
            address. My notice must be mailed to Patria Lending, LLC, 8151
            Highway 177, Red Rock, Oklahoma 74651 or emailed to{" "}
            <a
              href="mailto: legal@patrialending.com"
              target="_bank"
              className="link-string link"
            >
              legal@patrialending.com
            </a>{" "}
            <span className="underline">
              Lender must receive my notice on or before the “Arbitration
              Rejection Date,” which is 30 days after the origination date set
              forth at the top of my Loan Agreement.
            </span>{" "}
            Rejection notices that are sent to any other address or are
            communicated verbally or are sent or postmarked after the
            Arbitration Rejection Date will not be accepted or effective.
          </p>
          <p>
            What Happens If I Reject this Arbitration Agreement? If I reject
            this Arbitration Agreement timely and as provided herein then:
          </p>
          <ul className="padding-left-20">
            <li>
              <p>
                I will have IRREVOCABLY AGREED to the EXCLUSIVE PERSONAL AND
                SUBJECT MATTER JURISDICTION of the SOUTHERN PLAINS COURT OF
                INDIAN OFFENSES in Oklahoma. For a copy of the Court Rules,
                please visit the Court of Indian Offenses website at{" "}
                <a
                  href="https://www.bia.gov/regional-o􀂨ces/southern-plains/court-indian-offenses"
                  target="_bank"
                  className="link-string link"
                >
                  https://www.bia.gov/regional-o􀂨ces/southern-plains/court-indian-offenses;
                </a>{" "}
              </p>
            </li>
            <li>
              <p>
                I will have WAIVED ALL OBJECTIONS to such jurisdiction and
                venue;
              </p>
            </li>
            <li>
              <p>
                I will have consented to have my Dispute heard on an INDIVIDUAL
                BASIS only; and
              </p>
            </li>
            <li>
              <p>
                I will have WAIVED ANY RIGHT to and AGREED NOT TO serve as a
                representative, as a private attorney general, or in any other
                representative capacity, and/or to participate as a member of a
                class of claimants in court or in arbitration, with respect to
                any claim or Dispute that is subject to arbitration.
              </p>
            </li>
          </ul>
        </div>
        <p>
          <b> 1. Definitions:</b> For purposes of dispute resolution and this
          Arbitration Agreement, the terms <b>“I”, “me”</b> and <b>“my”</b>{" "}
          include the borrower and his or her heirs, guardian, personal
          representative, or trustee in bankruptcy; the terms <b> “you”</b> and{" "}
          <b>“your”</b> mean Lender, Lender’s agents, servicers, assigns,
          vendors and any third party, Lender’s affiliated companies, and each
          of its and their respective agents, representatives, employees,
          officers, directors, members, managers, attorneys, successors,
          predecessors, and assigns. Any claim, dispute or controversy of any
          kind or nature between you and I about or involving my Loan, my Loan
          account, any prior loans or accounts I held with you (collectively{" "}
          <b> “loan account”</b>), my current Loan Agreement with you (including
          future amendments) or any prior loan agreement with you (all of which
          collectively are a <b>“Loan Agreement”</b>) or our relationship is
          referred to as a <b>“Dispute”</b>. Disputes include, for example,
          claims or disputes arising from or relating in any way to: the
          interpretation, applicability, validity, arbitrability,
          enforceability, formation or scope of any Loan Agreement or this
          Arbitration Agreement; transactions between you and I; any interest,
          charges, or fees assessed on my Loan; any service(s) or programs
          related to my Loan; any communications related to my Loan; and any
          collection or credit reporting of my Loan. Disputes also include
          claims or disputes arising from or relating in any way to advertising
          and solicitations, or the application for, approval, or establishment
          of my Loan. Disputes are subject to arbitration regardless of whether
          they are based on contract, tort, constitutional provision, statute,
          regulation, common law, equity or other source, and regardless of
          whether they seek legal, equitable and/or other remedies. All Disputes
          are subject to arbitration whether they arose in the past, may
          currently exist or may arise in the future. Arbitration will apply
          even if my Loan is closed, sold or assigned; I pay you in full any
          outstanding debt I owe; or, to the maximum extent permitted by
          applicable bankruptcy law, I file for bankruptcy. If my Loan is sold
          and/or assigned, you retain your right to elect arbitration of
          Disputes by me and I retain my right to elect arbitration of Disputes
          by you.
        </p>
        <p>
          <b>2. Arbitration, generally:</b> When I submit a Dispute (defined
          below) to arbitration: my rights will be determined by a neutral
          arbitrator and not a judge or a jury. The procedures in arbitration
          are simpler and more limited than rules that are applied in court
          proceedings. Decisions by an arbitrator are subject to very limited
          review by a court.
        </p>
        <p>
          I agree that the most current version of the Arbitration Agreement
          (except for any updates I have rejected properly within the time and
          manner provided) that is in effect as of the date you receive my
          notice of Dispute will govern the Dispute.
        </p>
        <p>
          <b>3. Law Governing:</b> This Arbitration Agreement is governed by the
          Federal Arbitration Act, 9 U.S.C. §§ 1 et seq., and the law applicable
          in arbitration is Applicable Law, as that term is defined in my Loan
          Agreement.
        </p>
        <p>
          <b>4. Clarification Regarding Governing Law:</b> As separately
          provided, the law applicable in arbitration is Applicable Law, which
          includes applicable federal law. This means that in arbitration, I am
          entitled to invoke the same body of federal law that I would have been
          entitled to invoke in litigation. In other words, proceeding in
          arbitration gives me access to the exact same body of federal remedies
          available in litigation.
        </p>
        <p>
          <b>
            5. Application to Class Actions, Representative Actions and Waiver
            of Jury Trial:
          </b>{" "}
          Class actions, other similar representative procedures and
          consolidation of claims are NOT available under this Arbitration
          Agreement. I MAY NOT SERVE AS A REPRESENTATIVE, AS A PRIVATE ATTORNEY
          GENERAL OR IN ANY OTHER REPRESENTATIVE CAPACITY, NOR MAY I PARTICIPATE
          AS A MEMBER OF A CLASS OF CLAIMANTS, IN COURT OR IN ARBITRATION, WITH
          RESPECT TO ANY CLAIM THAT IS SUBJECT TO ARBITRATION. Further, I may
          not join my Dispute with other persons in the arbitration; each person
          must arbitrate his or her own Dispute(s) separately. I also waive my
          right to have a court or jury trial resolve my Dispute.
        </p>
        <p>
          <b>6. Informal Resolution:</b> You and I agree to attempt to first
          resolve any Dispute informally. I agree that I will notify you of my
          Dispute by sending an email to legal@patrialending.com. My email must
          include my name, my Loan account number (or last 4 digits of my social
          security number), and address; describe the nature and basis of my
          Dispute; and use the phrase “Notice of Dispute” in the subject line.
          You will investigate my Dispute and let me know of your decision
          within 30 business days from the date you received my correspondence.
          If I do not accept your decision, then I may submit my Dispute to
          final and binding arbitration in the manner described in the section
          below (unless I have properly rejected the Arbitration Agreement in
          the time and manner provided above).
        </p>
        <p>
          <b>7. Proceeding in Arbitration:</b> If the Dispute cannot be resolved
          informally, then you or I may file a claim for arbitration with the
          American Arbitration Association (<b>“AAA”</b>) through its website at
          www.adr.org. If the AAA is unable or declines to administer the
          Dispute, then you and I agree to select a substitute arbitration
          organization to administer the Dispute. If you and I cannot agree on a
          substitute arbitration organization, then either of us may petition
          the United States District Court for the Northern District of Oklahoma
          or the courts of the state of Oklahoma sitting in Kay County to
          appoint the arbitration service provider, as permitted under 9 U.S.C.
          § § 5. (The AAA and any substitute arbitration service provider
          selected or appointed as contemplated here collectively are the{" "}
          <b>“Arbitration Organization”</b>.) You will reimburse my filing fees,
          reasonable attorneys’ fees and other costs of arbitration if I
          prevail. After the Arbitration Organization notices the parties that
          an arbitration demand has been filed, the responding party will have
          14 days to file a response or counterclaim. After filing of the claim,
          response or counterclaim (if elected), no further claims or
          counterclaims may be made except on motion to the arbitrator. Any
          delay or failure to file a counterclaim or response will not delay an
          arbitration from proceeding.
        </p>
        <p>
          <b>8. Selecting the Arbitrator:</b> The Arbitration Organization will
          provide you and I with a list of at least three arbitrator candidates
          from the National Roster, which, in order to be deemed acceptable as
          an arbitrator candidate, must (i) be either a retired judge or an
          attorney, (ii) have experience in contract matters, and (iii) to the
          extent practicable, have experience in Federal Indian law. You and I
          will select one arbitrator from that list of candidates. If you and I
          cannot agree on an arbitrator within 10 days, then you or I may ask
          the Arbitration Organization to appoint an arbitrator from the list of
          candidates. If the designated arbitrator becomes unable or unwilling
          to proceed, then you and I agree that a substitute arbitrator will be
          appointed pursuant to the AAA Consumer Arbitration Rules.
        </p>
        <p>
          <b>9. Preliminary Management Hearing; Discovery; Motions:</b> The
          Arbitration Organization will schedule a preliminary management
          hearing with the appointed arbitrator to narrow the issues and
          establish a schedule and procedure for any law and motion proceedings
          to expedite arbitration. The preliminary management hearing will be
          conducted by conference call, video conference or internet. Discovery
          will be completed within 60 days of this preliminary management
          hearing and will consist exclusively of: (a) one set of
          interrogatories to each party not to exceed 15 in number including
          subparts, and (b) Loan account information and documents pertaining to
          credit that I sought or obtained from you. Subject to Principle 13 of
          the AAA’s consumer Due Process Protocol, any other forms of discovery
          will be allowed only upon a showing of good cause to the arbitrator.
          The arbitrator will honor claims of privilege recognized by law and
          will take appropriate steps to protect confidential or proprietary
          information. The arbitrator may decide any motion that is
          substantially similar to a motion to dismiss for failure to state a
          claim or a motion for summary judgment.
        </p>
        <p>
          <b>10. Administration and Procedures; Award; Fees:</b> The AAA
          Consumer Arbitration Rules, available at www.adr.org/Rules, will be
          used to administer the arbitration, and you and I each agree that the
          Dispute will be arbitrated solely through submission of documents in
          accordance with the AAA Procedures for the Resolution of Disputes
          Through Document Submission, without an in-person or telephonic
          hearing. If the arbitrator decides that an in person hearing is
          necessary, however, then the arbitration will be conducted on Tribal
          land or within thirty (30) miles of my then-current residence, at my
          choice, provided that this accommodation for me shall not be construed
          in any way (a) to relinquish or waive the sovereign status or immunity
          of the Tribe, (b) to relinquish or waive the sovereign status of
          Lender or expand the scope of the limited waiver provided by Lender
          below in the paragraph entitled “Enforcement of Award”, or (c) to
          constitute a transaction of business in any place other than the
          Indian country of the Tribe. The arbitrator is bound by the terms of
          this Arbitration Agreement. He or she must apply Applicable Law, the
          terms of the Loan Agreement and this Arbitration Agreement. If the
          AAA’s rules or procedures are different than the terms of this
          Arbitration Agreement, the terms of this Arbitration Agreement will
          control. You and I agree that the arbitrator will issue a concise
          written award, in accordance with the timing requirements under the
          AAA Rules. The decision and award shall have no precedential or
          collateral estoppel effect.
        </p>
        <p>
          The arbitrator may make rulings and resolve disputes as to the payment
          and reimbursement of fees and expenses, at any time during the
          proceeding and upon request from you or I within 14 days of the
          arbitrator’s ruling on the merits. The right to attorneys’ fees and
          expenses discussed in this paragraph supplements any right to
          attorneys’ fees and expenses I may have under Applicable Law, but I
          may not recover duplicative awards of attorneys’ fees or costs. If you
          prevail in arbitration and have a right to an award of attorneys’ fees
          and expenses, you will not seek such an award.
        </p>
        <p>
          <b>11. Appeal:</b> You or I can file a written appeal to the
          Arbitration Organization within 30 days after an award is issued by
          filing a notice of appeal with any AAA office, which appeal will be
          administered by the Arbitration Organization pursuant to AAA’s
          Consumer Appellate Arbitration Policy, available here and at{" "}
          <a
            href="https://www.adr.org/sites/default/files/document_repository/Consumer_Appellate_Arbitration_Policy_0.pdf"
            target="_bank"
            className="link-string link"
          >
            https://www.adr.org/sites/default/files/document_repository/Consumer_Appellate_Arbitration_Policy_0.pdf.
          </a>{" "}
          Any review by a court shall be governed by Sections 10 and 11 of the
          Federal Arbitration Act.
        </p>
        <p>
          <b>12. Enforcement of Award:</b> Any final arbitration award will be
          binding on the named parties and judgment on the arbitration award may
          be entered in, and be enforceable by, the United States District Court
          for the Northern District of Oklahoma or if such federal court fails
          to find jurisdiction, then in the courts of the state of Oklahoma
          sitting in Kay County, and appellate courts therefrom. Lender grants a
          limited waiver of its sovereign immunity which is limited to (i)
          arbitration of a Dispute only in accordance with and subject to the
          terms of this Arbitration Agreement, and (ii) enforcing a final award
          issued in such arbitration in the United States District Court for the
          Northern District of Oklahoma or if such federal court fails to find
          jurisdiction, then in the courts of the state of Oklahoma sitting in
          Kay County, and appellate courts therefrom. This limited waiver is
          made by Lender to me only, does not include any waiver (express or
          implied) to any other person, and does not waive the sovereign
          immunity of the Tribe or any of the Tribe’s other entities. The
          limited waiver also does not exist to class-wide or representative
          claims.
        </p>
        <p>
          <b>13. Severability:</b> The provisions of this Arbitration Agreement
          will, where possible, be interpreted to sustain its legality and
          enforceability. If any provision of the Loan Agreement or this
          Arbitration Agreement or the whole of it is determined to be
          unenforceable, then the arbitrator may sever and/or reform any such
          provision to make it enforceable. The arbitrator may not, however,
          reform the clause requiring for Disputes to be heard on an individual
          basis or the waiver of the right to participate in any class or
          collective action against you.
        </p>
      </div>
      <div className="terms-section-wrapper no-break-column">
        <p>
          <b>U. GOVERNING LAW:</b>
        </p>
        <p>
          I understand and agree that this Agreement is governed by Applicable
          Law. You and I agree that the transaction represented by this
          Agreement involves interstate commerce for all purposes.
        </p>
        <p>
          <b>V. DISCLOSURE NOTICES</b>
        </p>
        <p>
          NOTICE TO CONSUMER. (For purposes of the following notices, the word{" "}
          <b>“you”</b> refers to the Borrower not the Lender).
        </p>
        <ol className="padding-left-20">
          <li>
            <p> DO NOT SIGN THE APPLICATION BEFORE YOU READ THIS AGREEMENT.</p>
          </li>
          <li>
            <p>YOU ARE ENTITLED TO A COPY OF THIS DOCUMENT.</p>
          </li>
          <li>
            <p>
              YOU MAY PREPAY THE UNPAID BALANCE AT ANY TIME WITHOUT PENALTY AND
              MAY BE ENTITLED TO A REFUND OF UNEARNED CHARGES IN ACCORDANCE WITH
              APPLICABLE LAW.
            </p>
          </li>
        </ol>
        <div className="no-break">
          <p>
            <b>4. Notice to Borrowers Regarding Loan Sales</b>
          </p>
          <p>
            I understand that you may sell, transfer or assign my Agreement
            without my consent. Should ownership of my Loan be transferred, I
            will be notified of the name, address, and telephone number of the
            new lender if the address to which I must make payments changes.
            Sale or transfer of my Loan does not affect my rights and
            responsibilities under this Agreement. I understand that acting in
            the capacity of a non-fiduciary agent to me, you will maintain a
            register to record the entitlement to payments of principal and
            interest on my Agreement and that beneficial ownership of such
            payments under my Agreement as reflected in the register will be
            conclusive notwithstanding notice to the contrary. You will notify
            me of a change in ownership reflected in the register if (1) this
            alters the address to which I must make payments or (2) upon my
            reasonable written request. Sale, assignment or transfer of my
            Agreement or beneficial interest in payments of principal and
            interest on my Agreement does not affect my rights and
            responsibilities under this Agreement.
          </p>
        </div>
        <p>
          <b>5. CUSTOMER IDENTIFICATION POLICY NOTICE</b>
        </p>
        <p>
          To help the government fight the funding of terrorism and money
          laundering activities, U.S. Federal law requires financial
          institutions to obtain, verify and record information that identifies
          each person (individuals and businesses) who opens an account. What
          this means for you: (For purposes of the following notice, the word
          “you” refers to the Borrower not the Lender)
          <b>
            When you open an account, we will ask for your name, address, date
            of birth and other information that will allow us to identify you.
            We may also ask to see your driver’s license or other identifying
            documents.
          </b>
        </p>
        <p>
          <b>
            By signing on the following signature page, I acknowledge my receipt
            of and my acceptance to the terms of this Agreement.
          </b>
        </p>
      </div>
    </Wrapper>
  );
};

export default Terms;
