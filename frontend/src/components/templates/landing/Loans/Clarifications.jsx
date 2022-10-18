import React from "react";
import styled from "styled-components";
import { Link } from "react-router-dom";
import Container from "../../../atoms/Container";
import Modal from "../../../organisms/Modal/Regular/ModalAndTriggerButton";
import { PrivacyPolicy, TermsOfUse } from "../../application/Consents"; //../../application/Consents/index
import { H3 } from "../../../atoms/Typography";
import { routes } from "../../../../routes/Landing/routes";

const Wrapper = styled.section`
  background: var(--color-bg-2);
  padding: 6rem 0;

  .modal .link {
    text-decoration: underline;
  }

  .loans-section {
    &-clarification {
      &-heading {
        text-align: center;
        margin-bottom: 4.8rem;
        font-size: 2rem;
      }

      &-note {
        padding: 2.4rem;
        background: #fff;
        border-radius: 1.4rem;
        border: 1px solid var(--color-secondary-1);
        display: flex;
        flex-direction: column;
        row-gap: 2.4rem;
      }
    }
  }
  .paragraph {
    font-size: 1.4rem;
  }

  .modal {
    display: inline-block;
  }
`;

const Section = () => {
  return (
    <Wrapper className="loans-section-clarification">
      <Container>
        <H3 className="loans-section-clarification-heading">
          This is an expensive form of borrowing, and it is intended to be a
          short-term bridge, not a long-term financial solution.
        </H3>
        <ul className="loans-section-clarification-note">
          <li>
            <p>
              The Otoe-Missouria Consumer Finance Services Regulatory Commission
              is the regulatory agency solely responsible for regulation of
              Patria Lending. Patria Lending is a tribal lending entity wholly
              owned by the Otoe-Missouria Tribe, a sovereign nation located
              within the United States of America. Patria Lending LLC is{" "}
              <Link
                to={routes.LICENSE}
                className="link underline"
                target="_blank"
              >
                licensed
              </Link>{" "}
              and regulated under the Otoe-Missouria Tribal Consumer Financial
              Services Ordinance.
            </p>
          </li>
          <li>
            <p>
              Please visit our{" "}
              <Link to="/faq" className="link">
                FAQ
              </Link>{" "}
              for specific information on application cut-off and processing
              times, our disbursement options, and when loan funds may become
              available for your use. Generally, business days means Monday
              through Friday, and we do not fund loans via ACH on federal
              holidays or weekends. If you selected wire transfer or direct
              deposit and have a valid account at a qualifying bank, same
              business-day funding may be available. We do not charge a fee to
              disburse funds by ACH, but your bank may assess a fee. Consult
              with your bank on their fee schedules and posting requirements. If
              you selected funding by check, your loan proceeds will be
              delivered by regular mail through the U.S. postal system. You
              should allow 7 to 10 days for delivery of the loan proceeds.
            </p>
          </li>
          <li>
            <p>
              Our loans are subject to terms and conditions. Not all applicants
              will qualify for a loan. Loans are not available in CT, DC, GA,
              MD, NC, NJ, NY, PA, RI, SC, VA, VT, WV or any US territories or
              Gila County, AZ. New customers must be able to satisfy eligibility
              requirements for underwriting approval. Returning customers who
              have received a pre-approved offer or offer code must continue to
              be able to satisfy the preselection criteria as shown in their
              offer.
            </p>
          </li>
          <li>
            <div className="paragraph">
              Applicants must authorize us to verify any information provided
              for identity and digital verification, underwriting, and credit
              reporting. Verification and reporting may be ongoing and may
              require us to obtain information about you from, and share your
              information with, consumer reporting agencies and other sources.
              For more information, including applying for a loan, you should
              read our{" "}
              <Link
                to={routes.PRIVACY_NOTICE}
                target="_blank"
                className="link underline"
              >
                Privacy Notice
              </Link>
              , which governs our information sharing practices, and our{" "}
              <Link
                to={routes.TERMS_OF_USE}
                target="_blank"
                className="link underline"
              >
                Terms of Use
              </Link>
              , which governs your use of our website.
            </div>
          </li>
          <li>
            <p>
              Patria Lending is an equal opportunity lender that is wholly-owned
              by the{" "}
              <Link to="/about#article" className="link">
                Otoe-Missouria Tribe
              </Link>
              , and{" "}
              <Link
                to={routes.LICENSE}
                className="link underline"
                target="_blank"
              >
                licensed
              </Link>{" "}
              by the Otoe-Missouria Consumer Finance Services Regulatory
              Commission pursuant to
              <Link to={routes.ORDINANCE} className="link">
                the Otoe-Missouria Tribal Consumer Financial Services Ordinance.
              </Link>
            </p>
          </li>
          <li>
            <p>
              © 2022 Patria Lending • 8151 Highway 177, Red Rock, OK 74651-0348
            </p>
          </li>
        </ul>
      </Container>
    </Wrapper>
  );
};

export default Section;
