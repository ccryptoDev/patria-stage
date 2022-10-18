import React from "react";
import { Link } from "react-router-dom";
import Highlighted from "./Highlight";
import LoginButton from "../../../molecules/Buttons/Login";

export const list = (regexp) => [
  {
    title: <Highlighted text="How much can I borrow?" regexp={regexp} />,
    content: (
      <p>
        <Highlighted
          text="New customers may borrow from $300 to $2,500 dollars. Qualified
          returning customers may be approved for more. We look at several factors
          to determine your loan amount. The factors we consider include your
          present income, other obligations, history with us and information
          gathered from third-party data sources."
          regexp={regexp}
        />
      </p>
    ),
  },
  {
    title: (
      <Highlighted
        text="Does it matter if I have bad credit or no credit?"
        regexp={regexp}
      />
    ),

    content: (
      <p>
        <Highlighted
          text="Bad credit or no credit alone does not determine loan approval, it is
            just one of the things we consider during the loan approval process."
          regexp={regexp}
        />
      </p>
    ),
  },
  {
    title: (
      <Highlighted
        text="What are the minimum requirements to apply for a loan?"
        regexp={regexp}
      />
    ),
    content: (
      <>
        <ul>
          <li>
            <p>
              <Highlighted
                text="We ask that you meet these criteria for responsible borrowing:"
                regexp={regexp}
              />
            </p>
          </li>
          <li>
            <ul className="minimin-requirements-list">
              <li>
                <p>
                  <Highlighted
                    text="Recurring and verifiable source of income and minimum annual
                  income of $20,000"
                    regexp={regexp}
                  />
                </p>
              </li>
              <li>
                <p>
                  <Highlighted
                    text="Meet external and internal underwriting requirements taken in
                      whole or in part"
                    regexp={regexp}
                  />
                </p>
              </li>
              <li>
                <p>
                  <Highlighted
                    text="Have an open and active checking account"
                    regexp={regexp}
                  />
                </p>
              </li>
              <li>
                <p>
                  <Highlighted
                    text="Legally meet all requirements to enter into a contract"
                    regexp={regexp}
                  />
                </p>
              </li>
            </ul>
          </li>
        </ul>
      </>
    ),
  },
  {
    title: (
      <Highlighted text="What is Instant Bank Verification?" regexp={regexp} />
    ),
    content: (
      <p>
        <Highlighted
          text="Instant Bank Verification (IBV) is a safe and secure process that allows
          us to temporarily view your bank statements. It will"
          regexp={regexp}
        />{" "}
        <b>not</b>{" "}
        <Highlighted
          text="allow us
          to access, withdraw, credit or transfer funds from your account."
          regexp={regexp}
        />
      </p>
    ),
  },
  {
    title: <Highlighted text="How do I receive my funds?" regexp={regexp} />,
    content: (
      <p>
        <Highlighted
          text="Funds can be deposited directly to your debit card, your bank account
        via ACH, or by check."
          regexp={regexp}
        />
      </p>
    ),
  },
  {
    title: (
      <Highlighted
        text="How long does it take to receive my funds?"
        regexp={regexp}
      />
    ),
    content: (
      <ul>
        <li>
          <p>
            <Highlighted
              text="It depends on how you choose to get funded. Here are the options:"
              regexp={regexp}
            />
          </p>
        </li>
        <li>
          <p>
            <Highlighted
              text="Debit Card Direct Deposit: Funds may be deposited within minutes
              once your loan is finalized, 24/7."
              regexp={regexp}
            />
          </p>
        </li>
        <li>
          <p>
            <Highlighted
              text=" ACH Direct Deposit: Funds may be deposited on the same business day
              if your loan is finalized before Noon EST. All loans finalized after
              this time should be deposited by the end of the next business day."
              regexp={regexp}
            />
          </p>
        </li>
        <li>
          <p>
            <Highlighted
              text="Exact availability will be subject to your bank’s processing
              schedules, policies and recognized bank holidays."
              regexp={regexp}
            />
          </p>
        </li>
        <li>
          <p>
            <Highlighted
              text="Paper Check: Typically arrives at your address on file via USPS
              within 7-10 business days. Faster funding is available via ACH or
              the same day via your debit card."
              regexp={regexp}
            />
          </p>
        </li>
      </ul>
    ),
  },
  {
    title: "How do I make my payments?",
    content: (
      <ul>
        <li>
          <p>
            <Highlighted
              text=" You can pay by ACH draft from your bank account on your due date, or
              send a personal check, cashier’s check, money order, or certified
              check to the address below and must arrive on or before your due
              date. Also, you can use your Debit Card as an option to make
              payments."
              regexp={regexp}
            />
          </p>
        </li>
        <li>
          <p>
            <Highlighted
              text="Paper Check: Typically arrives at your address on file via USPS
              within 7-10 business days. Faster funding is available via ACH or
              the same day via your debit card."
              regexp={regexp}
            />
            Payment address:
          </p>
        </li>
        <li>
          <p>
            Patria Lending <br />
            PO Box 668, <br />
            Weatherford, OK 73096
          </p>
        </li>
        <li>
          <p>Attention: Accounts Receivable</p>
        </li>
      </ul>
    ),
  },
  {
    title: (
      <Highlighted
        text="When will my payments draft if it falls on a weekend or holiday?"
        regexp={regexp}
      />
    ),
    content: (
      <p>
        <Highlighted
          text="Any debits to your account for repayment that falls on a Saturday,
        Sunday, or banking holiday will be debited on the next business day."
          regexp={regexp}
        />
      </p>
    ),
  },
  {
    title: <Highlighted text="How do I cancel my loan?" regexp={regexp} />,
    content: (
      <p>
        <Highlighted
          text=" You may cancel your payment obligations under this Loan Agreement,
          without cost or finance charges, no later than 3:00 p.m. Eastern
          time of the next business day immediately following the
          Disbursement Date. Your right to cancel your loan only applies if
          your loan either has not funded or, if it has, the funds are
          returned to us. To cancel your payment obligations on this loan,
          you must inform us in writing, by or before the Cancellation
          Deadline, by email to"
          regexp={regexp}
        />{" "}
        <a href="mailto:CustomerCare@PatriaLending.com" className="link">
          CustomerCare@PatriaLending.com
        </a>{" "}
        <Highlighted
          text="
              that you want to cancel the future payment obligations on this
              loan. If we receive payment of the principal amount via the debit,
              then both your and our obligations under this Loan Agreement will
              be rescinded. If we do not receive payment of the principal amount
              by debit from Your Bank Account, then this Loan Agreement will
              remain in full force and effect.
           "
          regexp={regexp}
        />
      </p>
    ),
  },
  {
    title: <Highlighted text="Can I pay my loan off early?" regexp={regexp} />,
    content: (
      <p>
        <Highlighted
          text="Of course! We encourage paying your loan back early, which reduces
              the amount of finance charges. You can pay your outstanding
              balance at any time without a prepayment penalty—simply visit the
              "
          regexp={regexp}
        />{" "}
        <LoginButton className="link underline">My Account login</LoginButton>{" "}
        <Highlighted
          text="on our website or reach out to our Customer Care team using the methods listed on our"
          regexp={regexp}
        />{" "}
        <Link to="/contact" className="link underline">
          Contact Us
        </Link>{" "}
        page.
      </p>
    ),
  },
  {
    title: <Highlighted text="Who am I borrowing from?" regexp={regexp} />,
    content: (
      <p>
        <Highlighted
          text="Patria Lending, LLC is a wholly-owned and operated entity of the
        Otoe-Missouria Tribe (the “Tribe”). The Company was established for the
        Tribe’s economic benefit and is organized under and operates pursuant to
        Tribal law. The Otoe-Missouria Tribe is a federally recognized Indian
        tribe and a sovereign nation, as expressly recognized under federal law.
        See 75 Fed. Reg. 60,810, 60,811. To learn more about the Otoe-Missouria
        Tribe, click here."
          regexp={regexp}
        />
      </p>
    ),
  },
];
