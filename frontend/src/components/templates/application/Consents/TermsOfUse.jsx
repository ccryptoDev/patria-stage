/*eslint-disable*/
import React from "react";
import styled from "styled-components";
import { H5 } from "../../../atoms/Typography";
import Note from "../../../molecules/Note";

const Wrapper = styled.section`
  & .list {
    & > li {
      display: flex;
      flex-direction: column;
      row-gap: 24px;

      & p {
        font-size: 14px;
      }
      &:not(:first-child) {
        margin-top: 48px;
      }

      & h5 {
        color: var(--color-blue-1);
        font-size: 18px;
      }

      & > ul,
      & > ol {
        display: flex;
        flex-direction: column;
        row-gap: 12px;
        padding-left: 20px;
        & li {
          font-size: 14px;
        }
      }
      & > ul {
        list-style: disc;
      }
      & > ol {
        list-style-type: lower-alpha;
      }
    }

    & .arbitration-agreemnet-notes {
      row-gap: 4.8rem;
    }

    & .print-button {
      padding: 13px;
      border: 1px solid var(--color-secondary-2);
      border-radius: 8px;
      background: transparent;
    }

    @media print {
      & .print-hide {
        display: none;
      }
    }
  }
`;

const Section = () => {
  return (
    <Wrapper>
      <div id="terms-of-use" className="print-page">
        <ul className="list">
          <li>
            <p>
              <b>PLEASE READ THE FOLLOWING TERMS CAREFULLY.</b> Your access and
              use of any domains and websites (collectively, a "Site"), which
              are operated by Patria Lending LLC dba Patria and Patria Lending (
              <b>"Patria Lending"</b> or <b>"Lender"</b>), and your access and
              use of any of the Services that Patria Lending provides or offers
              through a Site (collectively <b>"Services"</b>) are covered by and
              subject to these Terms of Use.
            </p>
          </li>
          <li>
            <p>
              <b>
                LENDER IS AN ARM OF THE OTOE-MISSOURIA TRIBE OF INDIANS, A
                FEDERALLY RECOGNIZED INDIAN TRIBE AND SOVEREIGN NATION
                ("TRIBE"). IT IS AN ENTITY FORMED AND OPERATED PURSUANT TO
                TRIBAL LAW, IT IS OWNED AND OPERATED BY THE TRIBE, AND IT WAS
                FORMED FOR THE EXPRESS PURPOSE OF ECONOMIC DEVELOPMENT AND
                BETTERMENT OF THE TRIBE. BOTH LENDER AND THE TRIBE ARE IMMUNE
                FROM SUIT IN ANY COURT EXCEPT TO THE EXTENT THAT THE TRIBE,
                THROUGH ITS TRIBAL COUNCIL, EXPRESSLY AND UNEQUIVOCALLY WAIVES
                THAT IMMUNITY. LENDER, AS AN ARM OF THE TRIBE, IS ALSO IMMUNE
                FROM SUIT IN ANY COURT EXCEPT AS PROVIDED IN THE LIMITED
                IMMUNITY WAIVER CONTAINED IN THE ARBITRATION AGREEMENT LOCATED
                HEREIN. LENDER IS REGULATED AND LICENSED BY THE TRIBE'S CONSUMER
                FINANCE SERVICES REGULATORY COMMISSION (THE "COMMISSION") IN
                ACCORDANCE WITH TRIBAL LAW. YOUR RIGHT TO SUBMIT A DISPUTE IS
                LIMITED TO THE DISPUTE RESOLUTION PROCESS SET FORTH IN SECTION
                15 BELOW. UNLESS YOU TIMELY EXERCISE YOUR RIGHT TO REJECT
                ARBITRATION IN ACCORDANCE WITH THE DISPUTE RESOLUTION PROCESS IN
                SECTION 15, ANY DISPUTE YOU HAVE RELATED TO A SITE, SERVICES, OR
                THESE TERMS OF USE WILL BE RESOLVED BY FINAL AND BINDING
                ARBITRATION.
              </b>
            </p>
          </li>
          <li className="hr">
            <hr />
          </li>
          <li>
            <H5>1. CHANGES AND MODIFICATIONS</H5>
            <p>
              Patria Lending reserves the right in its sole discretion to
              temporarily or permanently change or modify these Terms of Use or
              discontinue a Site, or any portion of a Site, for any reason.
              Please review these Terms of Use from time to time because your
              continued access or use of a Site after any modifications have
              become effective shall be deemed your conclusive acceptance of the
              modified Terms of Use.
            </p>
          </li>

          <li>
            <H5>2. GENERAL ELIGIBILITY</H5>
            <p>
              When you use a Site, you represent that you are a resident of the
              United States and are at least 18 years old, and that you agree to
              abide by all the terms and conditions of these Terms of Use.
              Unauthorized use of a Site or Services, including unauthorized
              access of Patria Lending’s systems and misuse of passwords or Site
              information is strictly prohibited. If you violate any of these
              Terms of Use or any other agreement between you and Patria
              Lending, then Patria Lending may restrict, suspend, or terminate
              your access to any Site and Services without notice.
            </p>
          </li>

          <li>
            <H5>3. VERIFICATION AND REPORTING</H5>
            <p>
              You authorize us to verify any information you may provide to us
              through a Site or when using the Services, and understand that
              verification may be ongoing, and permit us to obtain and share
              information about you (including, without limitation, your
              identity, digital identity, employment, income, assets and debts,
              payment history and collection activity) from and with consumer
              reporting agencies and other sources. We reserve the right to
              decline a credit application at any time, with cause determined by
              judgment of risk, upon completion of a review and verification of
              the information submitted by you and your creditworthiness. You
              further understand that we reserve the right to suspend Services
              if we are unable to verify the information you have provided to us
              to our satisfaction and at our sole discretion.You authorize your
              wireless operator to disclose your mobile number, name, address,
              email, network status, customer type, customer role, billing type,
              mobile device identifiers (IMSI and IMEI) and other subscriber and
              device details, if available, to Patria Lending and service
              providers for the duration of the business relationship, solely
              for identity verification and fraud avoidance. See Patria
              Lending’s Privacy Policy at
              <a
                href="http://www.patrialending.com/privacy"
                target="_blank"
                rel="noreferrer"
                className="link"
              >
                www.patrialending.com/privacy
              </a>
              for how we treat your data.
            </p>
            <p>
              You authorize us to request and obtain consumer credit reports
              from one or more consumer credit reporting agencies ("credit
              bureaus") in connection with any request for credit and as
              otherwise allowed by Applicable Law (defined in 16 below). You
              agree that we may obtain additional credit reports and other
              information about you in connection with updates, regular
              payments, account review, collections activity or for any other
              legitimate purpose. We may also report information about your Loan
              to credit bureaus.
            </p>
          </li>

          <li>
            <H5>4. PRIVACY</H5>
            <p>
              At all times your information will be treated in accordance with
              Patria Lending’s Privacy Policy, which is incorporated by
              reference into these Terms of Use and can be viewed at{" "}
              <a
                href="http://www.patrialending.com/privacy"
                target="_blank"
                rel="noreferrer"
                className="link underline"
              >
                www.patrialending.com/privacy
              </a>
              . You agree to Patria Lending’s use of your data in accordance
              with the Privacy Policy
            </p>
          </li>
          <li>
            <H5>5. SERVICE RIGHTS AND RESTRICTIONS</H5>
            <p>
              All material and content on a Site including but not limited to
              text, data, articles, designs, software, photos, images, and other
              information (collectively "Site Content") are the proprietary
              property of Patria Lending with all rights reserved. Site Content
              may not be copied, reproduced, distributed, republished,
              displayed, posted, transmitted, or sold in any form or by any
              means without Patria Lending’s prior written consent. You
              acknowledge that all Site Content is and shall remain the sole
              property of Patria Lending. You may only access a Site and use the
              Services for their intended purpose, and any use of a Site or
              Services that is not expressly authorized herein is strictly
              prohibited.
            </p>
          </li>
          <li>
            <H5>6. TRADEMARKS</H5>
            <p>
              Nothing on a Site should be construed as granting you any license
              or right to use any trademark, whether owned by Patria Lending or
              a third party, displayed on a Site, without prior written approval
              of the trademark owner. You may not use, copy, duplicate, display,
              distribute, modify, or reproduce any trademark contained on a Site
              without the prior express written consent of the trademark's
              owner.
            </p>
          </li>
          <li>
            <H5>7. CONSENT TO CONDUCT BUSINESS ELECTRONICALLY</H5>
            <p>
              Because Patria Lending operates its platform online and conducts
              its business solely through the Internet, you must consent to
              receive all disclosures, notices, documents, agreements, and
              information associated with the Services ("Communications")
              electronically to transact business with us. This section informs
              you of your rights when receiving electronic Communications from
              Patria Lending.
            </p>
          </li>
          <li>
            <p>
              <b>Electronic Communications:</b> You agree that Patria Lending,
              its agents, and representatives, may provide all Communications to
              you electronically. You may still request a paper copy of any
              Communication by following the procedure outlined below. You also
              agree all such Communications are electronic records and that, as
              such, they may be transferred, authenticated, stored, and
              transmitted by electronic means. You may still request a paper
              copy of any Communication by following the procedure outlined
              below.
            </p>
          </li>
          <li>
            <p>
              <b>Hardware and Software Requirements:</b> In order to receive
              Communications electronically, you must have the following: (1)
              access to the Internet; (2) an active email account; (3) software
              capable of receiving email through the Internet; (4) supported Web
              browsing software (Chrome version 32.0 or higher, Firefox version
              26.0 or higher, Internet Explorer version 8.0 or higher, or Safari
              version 7.0 or higher); and (5) hardware capable of running this
              software. To ensure access and optimal printing of your loan
              documents in PDF format, you must have Adobe Reader. To install
              the free version of Adobe Reader, click here or visit{" "}
              <a
                href="http://get.adobe.com/reader/"
                target="_blank"
                rel="noreferrer"
                className="link underline"
              >
                http://get.adobe.com/reader/
              </a>
              .
            </p>
          </li>
          <li>
            <p>
              <b>Additional Mobile Technology Requirements:</b> If you access
              our Site and Communications electronically via a mobile device
              (such as a smart phone or tablet) or if you download and use our
              Mobile App, then in addition to the above requirements, you must
              make sure that you have software on your mobile device that allows
              you to print and save the Disclosures presented to you during the
              application process. If you do not have these capabilities on your
              mobile device, please access our site through a device that
              provides these capabilities.
            </p>
          </li>
          <li>
            <p>
              <b>Requesting a Paper Copy:</b> You may request from us a paper
              copy of any Communication that we have provided or made available
              to you electronically without charge, provided that such request
              is made within 20 business days after we first provided the
              Communication to you. To request paper copies, you must send an
              e-mail to{" "}
              <a
                href="mailto:DocumentRequest@PatriaLending.com"
                className="link"
              >
                DocumentRequest@PatriaLending.com
              </a>{" "}
              with the subject line "Paper Copy Request" and in the body of the
              e-mail you must state your e-mail address, full name, US Postal
              address, and telephone number, and also describe the Communication
              or Communications for which you request a paper copy. You may also
              submit your request by mail to Patria Lending, 8151 Highway 177,
              Red Rock, OK 74651-0348, Attention: Compliance Department. There
              is no fee for a paper copy.
            </p>
          </li>
          <li>
            <p>
              <b>Withdrawing Consent:</b> You may withdraw your consent to
              receive future Communications electronically by sending us your
              request in writing to{" "}
              <a href="mailto:CustomerCare@PatriaLending.com" className="link">
                CustomerCare@PatriaLending.com
              </a>{" "}
              with the subject line of "Withdraw Electronic Consent" and
              including your full name, US Postal Address, email address, and
              telephone number in the body of the email. Your withdrawal of
              consent will be effective only after we have had a reasonable
              period to process your request. If you decide to withdraw your
              consent, it will not affect the validity, effectiveness or
              enforceability of any prior Communications sent to you
              electronically prior to the date that your withdrawal of consent
              becomes effective.
            </p>
          </li>
          <li>
            <p>
              <b>Changes in Contact Information:</b> You agree to keep us
              informed of any changes in your contact information, including any
              changes to your email address, so that you can continue to receive
              Communications timely. You may update your contact information by
              logging into your account through Patria Lending’s Account Portal,
              by calling us at{" "}
              <a href="tel:(800) 640-2093" className="link">
                (800) 640-2093
              </a>
              , or by emailing us at{" "}
              <a href="mailto:CustomerCare@patrialending.com" className="link">
                CustomerCare@patrialending.com
              </a>
              , or by writing to us at Patria Lending, 8151 Highway 177, Red
              Rock, OK 74651-0348, Attention: Compliance Department.
            </p>
          </li>
          <li>
            <p>
              <b>Your Electronic Signature:</b> Your "electronic signature"
              means an electronic sound, symbol, or process, attached to, or
              logically associated with a contract or other record and executed
              or adopted by you with the intent to sign the record. Electronic
              signatures may also be obtained by email, text messages, faxes, or
              recorded touch tone capture files. For example, if you were to
              reply "Agree" to a text message referencing an agreement or push a
              specific number on your phone which is recorded by an interactive
              voice response or call recording system as an electronic file,
              then you are creating an electronic signature. You agree that your
              electronic signature will have the same force and effect and will
              bind you in the same manner and to the same extent as a physical
              signature would do, in accordance with ESIGN to the extent
              applicable. You further acknowledge and agree that whenever you
              click a submission button on a Site, such as when you complete an
              application and submit it electronically, that you are providing
              your electronic signature, confirming your agreement to the
              transaction, and certifying that all information you have provided
              in connection with the transaction is complete and accurate.
            </p>
          </li>
          <li>
            <p>
              <b>Consent and Acknowledgement:</b> You acknowledge and agree
              that:
            </p>
            <ol type="lower-alpha">
              <li>
                <p>
                  You can view this consent. You are also able to download and
                  review files within a web browser or a mobile device;
                </p>
              </li>
              <li>
                <p>
                  You have (1) access to the Internet, (2) an active email
                  account, (3) software capable of receiving email through the
                  Internet, (4) supported Web browsing, and (5) hardware capable
                  of running this software, an account with an Internet service
                  provider, and the ability to send e-mail and receive email
                  with hyperlinks to websites;
                </p>
              </li>
              <li>
                <p>
                  You have read the information about the requirements to
                  receive Communications electronically, and the use of
                  electronic signatures;
                </p>
              </li>
              <li>
                <p>
                  You consent to the use of electronic Communications and
                  electronic signatures;
                </p>
              </li>
              <li>
                <p>
                  When you click a signature button to 'process your loan', you
                  are (I) adopting an electronic process to confirm your consent
                  to the transaction, (ii) affixing your signature
                  electronically to the agreement associated with the
                  transaction, and (iii) certifying that all information you
                  have provided in connection with the transaction is complete
                  and accurate; and
                </p>
              </li>
              <li>
                <p>
                  Your electronic signature will have the same force and effect
                  and will bind you in the same manner and to the same extent as
                  a physical signature would do, and that your consent to
                  conduct business electronically inures to us, as well as our
                  affiliates, agents, employees, successors, and assigns.
                </p>
              </li>
            </ol>
          </li>
          <li>
            <H5>8. CONSENT TO TELEPHONE COMMUNICATIONS</H5>
          </li>
          <li>
            <p>
              Consent Generally: You agree and consent to be contacted by us,
              our employees, agents, representatives, affiliates and/or anyone
              calling on our behalf (collectively, "Representatives") at any
              telephone number (including any mobile phone number) you provide
              to us and any physical or electronic address you provide to us,
              and you agree that we may use multiple means to contact you
              including, but not limited to, SMS messaging or other text
              messaging, autodialed or prerecorded messages, direct drop
              voicemail, push notifications, email and other technologies. You
              agree that automated messages may be played when the telephone is
              answered, whether answered by you or someone else, and an agent or
              representative may leave a message on your answering machine,
              voicemail or by text. Your provider's messaging and data rates may
              apply to all SMS text messages. You may opt out of receiving SMS
              messages by: (1) sending "STOP" to the SMS text message you
              received; (2) calling us at (800) 640-2093; or (3) emailing
              customer service at{" "}
              <a
                href="mailto:CustomerCare@patrialending.com"
                className="link underline"
              >
                CustomerCare@patrialending.com
              </a>
              . Data obtained from you in connection with this SMS service may
              include your name, address, cellphone number, your provider's
              name, the date and time, and content of your messages. We will not
              be liable for any delays in the receipt of any SMS messages, as
              delivery is subject to effective transmission from your network
              operator. To view our privacy policy visit{" "}
              <a
                href="http://www.patrialending.com/privacy"
                target="_blank"
                className="link"
                rel="noreferrer"
              >
                www.patrialending.com/privacy
              </a>
              .
            </p>
          </li>
          <li>
            <p>
              <b>Consent to Receive Marketing Offers.</b> You agree and consent
              that we and our Representatives may use multiple means including
              direct mail, email, autodialed or pre-recorded phone calls, direct
              drop voicemail, SMS, text, push notifications, and other
              technologies) to contact you at any telephone number (including
              any mobile phone number) and any physical or electronic address
              you provide to us to inform you of products and services that we
              think may interest you. Your consent will be effective even if the
              number you have provided is registered on any state and/or federal
              Do-Not-Call list. Your consent will remain in effect until you
              revoke it, and it is not a condition of obtaining a loan. If you
              would like to stop receiving SMS text messages, please notify us
              by texting "STOP" or by calling us at{" "}
              <a href="tel:(800) 640-2093" className="link">
                (800) 640-2093
              </a>{" "}
              and follow the voice prompts. If you would like to stop receiving
              marketing offers by email, please click the 'unsubscribe' link at
              the bottom of the communication. Alternatively, you may email us
              at{" "}
              <a href="mailto:OptOut@PatriaLending.com" className="link">
                OptOut@PatriaLending.com
              </a>{" "}
              or write to us at Patria Lending, 8151 Highway 177, Red Rock, OK
              74651-0348 Attention: Compliance Department. If you wish to change
              or stop receiving offers to specific telephone numbers, you may
              also call us at{" "}
              <a href="tel:(800) 640-2093" className="link">
                (800) 640-2093
              </a>{" "}
              or email us at{" "}
              <a href="mailto:CustomerCare@PatriaLending.com" className="link">
                CustomerCare@PatriaLending.com
              </a>
              .
            </p>
          </li>
          <li>
            <H5>9. COPYRIGHT COMPLAINTS</H5>
          </li>
          <li>
            <p>
              If you believe that any material on a Site infringes upon any
              copyright that you own or control, you may send a written
              notification to us via email at Legal@PatriaLending.com, or via
              regular mail at Patria Lending, 8151 Highway 177, Red Rock, OK
              74651-0348, Attn: Legal Department. In your notification, please:
            </p>
            <ol>
              <li>
                <p>
                  Confirm that you are the owner, or authorized to act on behalf
                  of the owner, of the copyrighted work that has been infringed;
                </p>
              </li>
              <li>
                <p>
                  Identify the copyrighted work or works that you claim have
                  been infringed;
                </p>
              </li>
              <li>
                <p>
                  Identify the material that you claim is infringing or is the
                  subject of infringing activity and that is to be removed
                  (please include information reasonably sufficient to permit us
                  to locate the material);
                </p>
              </li>
              <li>
                <p>
                  Provide your contact details, including an email address; and
                </p>
              </li>
              <li>
                <p>
                  Provide a statement that the information you have provided is
                  accurate and that you have a good-faith belief that use of the
                  material in the manner complained of is not authorized by the
                  copyright owner, its agent, or the law.
                </p>
              </li>
            </ol>
          </li>
          <li>
            <H5>10. LINKS TO THIRD-PARTY SITES</H5>
          </li>
          <li>
            <p>
              The Site may enable access to third-party services and websites
              (collectively and individually, <b>"Third-Party Services"</b>).
              Use of the Third-Party Services may require you to have Internet
              access and for you to accept additional terms of service or use.
              Since third-party websites may have different privacy policies
              and/or security standards that govern those third-party sites, we
              advise you to review the privacy policies and terms and conditions
              of those third-party websites prior to providing any personal
              information. Patria Lending does not warrant or endorse and does
              not assume and is not responsible or liable to you or any other
              person for any Third-Party Services, or for any other materials,
              products, or services of third parties. Third-Party Services are
              provided solely as a convenience to you. By using the Third-Party
              Services, you acknowledge and agree that Patria Lending is not
              responsible for examining or evaluating the content, accuracy,
              completeness, timeliness, validity, compliance, legality, quality,
              or any other aspect of such Third-Party Services.
            </p>
          </li>
          <li>
            <p>
              You agree that the Third-Party Services may contain proprietary
              content, information, and material that is protected by applicable
              intellectual property and other laws, including but not limited to
              copyright, and that you will not use such proprietary content,
              information, or materials in any way whatsoever except for a
              permitted use under the applicable terms of service or use. No
              portion of the Third-Party Services may be reproduced in any form
              or by any means. You agree not to modify, rent, lease, loan, sell,
              distribute, publicly display, publicly perform, or create
              derivative works based on the Third-Party Services, in any manner,
              and you shall not exploit the Third-Party Services in any
              unauthorized way whatsoever.
            </p>
          </li>
          <li>
            <p>
              In addition, Third-Party Services that may be accessed from,
              displayed on, or linked to from smartphones or other mobile
              devices are not available in all languages or in all countries.
              Patria Lending makes no representation that such Third-Party
              Services are appropriate or available for use in any particular
              location. To the extent you choose to access such Third-Party
              Services, you do so at your own risk and are solely responsible
              for compliance with all applicable laws. Patria Lending reserves
              the right to change, suspend, remove, or disable access to any
              Third-Party Services at any time without notice or liability. In
              no event will Patria Lending be liable for the removal of or
              disabling of access to any such Third-Party Services. Patria
              Lending may also impose limits on the use of or access to certain
              Third-Party Services, in any case, and without notice or
              liability.In addition, Third-Party Services that may be accessed
              from, displayed on, or linked to from smartphones or other mobile
              devices are not available in all languages or in all countries.
              Patria Lending makes no representation that such Third-Party
              Services are appropriate or available for use in any particular
              location. To the extent you choose to access such Third-Party
              Services, you do so at your own risk and are solely responsible
              for compliance with all applicable laws. Patria Lending reserves
              the right to change, suspend, remove, or disable access to any
              Third-Party Services at any time without notice or liability. In
              no event will Patria Lending be liable for the removal of or
              disabling of access to any such Third-Party Services. Patria
              Lending may also impose limits on the use of or access to certain
              Third-Party Services, in any case, and without notice or
              liability.
            </p>
          </li>
          <li>
            <H5>11. DISCLAIMER OF WARRANTIES</H5>
          </li>
          <li>
            <p>
              PATRIA LENDING PROVIDES ITS SITE AND SERVICES "AS IS" AND "AS
              AVAILABLE" WITH ALL FAULTS AND WITHOUT ANY EXPRESS OR IMPLIED
              WARRANTIES INCLUDING, BUT NOT LIMITED TO, IMPLIED WARRANTIES OF
              MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND
              NON-INFRINGEMENT. ADDITIONALLY, WITHU MAKES NO CLAIM OR GUARANTEE
              AS TO THE ACCURACY OF ANY INFORMATION PROVIDED OR SITE CONTENT.
            </p>
          </li>
          <li>
            <H5>12. LIMITATION OF LIABILITY</H5>
          </li>
          <li>
            <p>
              IN NO EVENT WILL WITHU OR ITS DIRECTORS, OFFICERS, OR
              REPRESENTATIVES BE LIABLE TO YOU OR TO ANY OTHER PARTY FOR ANY
              SPECIAL, CONSEQUENTIAL, INCIDENTAL, OR INDIRECT DAMAGES ARISING
              FROM YOUR USE OF THE SITE OR SERVICES, EVEN IF WITHU IS AWARE OR
              HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.
            </p>
          </li>
          <li>
            <H5>13. INDEMNIFICATION</H5>
          </li>
          <li>
            <p>
              You agree to indemnify, defend, and hold harmless Patria Lending
              and its officers, directors and Representatives for damages,
              injuries, losses, liabilities, settlements and expenses
              (including, without limitation, costs and attorneys' fees),
              arising in connection with any claim, suit, proceeding, or other
              action arising from your use of a Site or Services, your conduct
              in connection with your use of a Site or Services, or your
              violation of these Terms of Use or of any law or the rights of any
              third party.
            </p>
          </li>
          <li>
            <H5>
              14. WAIVER OF CLASS ACTIONS, REPRESENTATIVE ACTIONS, JURY TRIAL
            </H5>
          </li>
          <li>
            <p>
              Class actions, other similar representative procedures and
              consolidation of claims are <b>NOT</b> available under these Terms
              of Use.{" "}
              <b>
                YOU UNDERSTAND AND AGREE THAT YOU MAY NOT SERVE AS A
                REPRESENTATIVE, AS A PRIVATE ATTORNEY GENERAL, OR IN ANY OTHER
                REPRESENTATIVE CAPACITY, NOR PARTICIPATE AS A MEMBER OF A CLASS
                OF CLAIMANTS, IN ANY PROCEEDING WITH RESPECT TO ANY DISPUTE
                (DEFINED BELOW) OR CLAIM.
              </b>{" "}
              Further, you understand and agree that (a) you may not join your
              Dispute with others, (b) you must resolve your Dispute(s)
              separately, and (c) you will not assert and waive any claim or
              right to have a Dispute resolved by a jury trial.
            </p>
          </li>
          <li>
            <H5>15. ARBITRATION AGREEMENT:</H5>
          </li>
          <li>
            <p>
              <b>Please read this Arbitration Agreement carefully.</b> This
              Arbitration Agreement provides that all Disputes (defined below)
              between you and us must be resolved by binding arbitration.{" "}
              <b>
                UNDER THIS ARBITRATION AGREEMENT, YOU AGREE TO GIVE UP YOUR
                RIGHT TO GO TO COURT AND TO HAVE A JUDGE OR JURY RESOLVE YOUR
                DISPUTE
              </b>
              .
            </p>
          </li>
          <li>
            <p>
              <b>
                YOU HAVE THE RIGHT TO REJECT THIS ARBITRATION AGREEMENT AND OPT
                OUT OF ARBITRATION, BUT IF YOU WISH TO REJECT IT, YOU MUST DO SO
                TIMELY AS PROVIDED BELOW.
              </b>
            </p>
          </li>
          <li>
            <p>
              <b>How to Reject this Arbitration Agreement.</b> To reject this
              Arbitration Agreement, you must send us a written notice stating
              you reject this Arbitration Agreement and include your name, your
              loan account number (or last 4 digits of your social security
              number) and address. Your notice must be mailed to Patria Lending,
              8151 Highway 177, Red Rock, OK 74651-0348 or emailed to{" "}
              <a href="mailto:CustomerCare@PatriaLending.com" className="link">
                CustomerCare@PatriaLending.com
              </a>
              .
            </p>
          </li>
          <li>
            <Note
              content={[
                `We must receive your notice on or before the "Arbitration
                    Rejection Date,"which is (a) 30 days after the date you
                    applied for a loan, or, in the event you obtained a loan,
                    (b) 30 days following the origination date set forth at the
                    top of your loan agreement.`,
                `
                    Rejection notices that are sent to any other address or are
                    communicated verbally or are sent or postmarked after the
                    Arbitration Rejection Date will not be accepted or
                    effective.
                  `,
              ]}
            />
          </li>
          <li>
            <p>
              <b>What Happens If You Reject this Arbitration Agreement.</b> If
              you reject this Arbitration Agreement timely and as provided
              herein then:
            </p>
            <ul>
              <li>
                <p>
                  You will have <b>IRREVOCABLY AGREED</b> to the{" "}
                  <b>EXCLUSIVE PERSONAL AND SUBJECT MATTER JURISDICTION</b> of
                  the <b> SOUTHERN PLAINS COURT OF INDIAN OFFENSES</b> in
                  Oklahoma. For a copy of the Court Rules, please visit the
                  Court of Indian Offenses website at{" "}
                  <a
                    href="http://www.bia.gov/regional-offices/southern-plains/court-indian-offenses"
                    taget="_blank"
                    className="link underline"
                  >
                    https://www.bia.gov/regional-offices/southern-plains/court-indian-offenses
                  </a>
                  ;
                </p>
              </li>
              <li>
                <p>
                  You will have <b>WAIVED ALL OBJECTIONS</b> to such
                  jurisdiction and venue;
                </p>
              </li>
              <li>
                <p>
                  You will have consented to have your Dispute heard on an{" "}
                  <b>INDIVIDUAL BASIS</b> only; and
                </p>
              </li>
              <li>
                <p>
                  You will have <b>WAIVED ANY RIGHT</b> to and{" "}
                  <b>AGREED NOT TO</b> serve as a representative, as a private
                  attorney general, or in any other representative capacity,
                  and/or to participate as a member of a class of claimants in
                  court or in arbitration, with respect to any claim or Dispute
                  that is subject to arbitration.
                </p>
              </li>
            </ul>
          </li>
          <li>
            <ol className="arbitration-agreemnet-notes">
              <li>
                <p>
                  <span className="underline">Definitions:</span> For purposes
                  of dispute resolution and this Arbitration Agreement, the
                  terms
                  <b>"you"</b> and
                  <b>"your"</b> include you as the borrower and your heirs,
                  guardian, personal representative, or trustee in bankruptcy;
                  the terms <b>"we,"</b> <b>"our,"</b> and <b>"us"</b> mean
                  Patria Lending, Patria Lending&apos;s agents, servicers,
                  assigns , vendors and any third party, Patria Lending&apos;s
                  affiliated companies, the Tribe, and each of its and their
                  respective agents, representatives, employees, officers,
                  directors, members, managers, attorneys, successors,
                  predecessors, and assigns. Any claim, dispute or controversy
                  of any kind or nature between you and us about or involving
                  your loan, your loan account, any prior loans or accounts you
                  held with us (collectively <b>"loan account"</b>), your
                  current loan agreement with us (including future amendments)
                  or any prior loan agreement with us (all of which collectively
                  are a <b>"Loan Agreement"</b>) or our relationship is referred
                  to as a <b>"Dispute"</b>. Disputes include, for example,
                  claims or disputes arising from or relating in any way to: the
                  interpretation, applicability, validity, arbitrability,
                  enforceability, formation or scope of any Loan Agreement or
                  this Arbitration Agreement; transactions between you and us;
                  any interest, charges, or fees assessed on your loan; any
                  service(s) or programs related to your loan; any
                  communications related to your loan; and any collection or
                  credit reporting of your loan. Disputes also include claims or
                  disputes arising from or relating in any way to advertising
                  and solicitations, or the application for, approval, or
                  establishment of your loan. Disputes are subject to
                  arbitration regardless of whether they are based on contract,
                  tort, constitutional provision, statute, regulation, common
                  law, equity, or other source, and regardless of whether they
                  seek legal, equitable and/or other remedies. All Disputes are
                  subject to arbitration whether they arose in the past, may
                  currently exist, or may arise in the future. Arbitration will
                  apply even if your loan is closed, sold, or assigned; you pay
                  us in full any outstanding debt you owe; or, to the maximum
                  extent permitted by applicable bankruptcy law, you file for
                  bankruptcy. If your loan is sold and/or assigned, we retain
                  our right to elect arbitration of Disputes by you and you
                  retain your right to elect arbitration of Disputes by us.
                </p>
              </li>
              <li>
                <p>
                  <span className="underline">Arbitration, generally:</span>{" "}
                  When you submit a Dispute to arbitration:
                </p>
                <ul>
                  <li>
                    <p>
                      Your rights will be determined by a{" "}
                      <b>neutral arbitrator</b> and not a <b>judge or a jury</b>
                      .
                    </p>
                  </li>
                  <li>
                    <p>
                      The procedures in arbitration are simpler and more limited
                      than rules that are applied in court proceedings.
                    </p>
                  </li>
                  <li>
                    <p>
                      Decisions by an arbitrator are subject to{" "}
                      <b>very limited review by a court</b>.
                    </p>
                  </li>
                  <li>
                    <p>
                      You agree that the most current version of the Arbitration
                      Agreement (except for any updates you have rejected
                      properly within the time and manner provided) that is in
                      effect as of the date we receive your notice of Dispute
                      will govern the Dispute.
                    </p>
                  </li>
                </ul>
              </li>
              <li>
                <p>
                  <span className="underline">Law Governing:</span> This
                  Arbitration Agreement is governed by the Federal Arbitration
                  Act, 9 U.S.C. §§ 1 et seq., and the law applicable in
                  arbitration is Applicable Law, as that term is defined in
                  Section 16 below.
                </p>
              </li>
              <li>
                <p>
                  <span className="underline">
                    Clarification Regarding Governing Law:
                  </span>{" "}
                  As separately provided, the law applicable in arbitration is
                  Applicable Law, which includes applicable federal law. This
                  means that in arbitration you are entitled to invoke the same
                  body of federal law that you would have been entitled to
                  invoke in litigation. In other words, proceeding in
                  arbitration gives you access to the exact same body of federal
                  remedies available in litigation.
                </p>
              </li>
              <li>
                <p>
                  <span className="underline">
                    Application to Class Actions, Representative Actions and
                    Waiver of Jury Trial:
                  </span>{" "}
                  Class actions, other similar representative procedures and
                  consolidation of claims are <b>NOT</b> available under this
                  Arbitration Agreement.{" "}
                  <b>
                    YOU MAY NOT SERVE AS A REPRESENTATIVE, AS A PRIVATE ATTORNEY
                    GENERAL OR IN ANY OTHER REPRESENTATIVE CAPACITY, NOR MAY YOU
                    PARTICIPATE AS A MEMBER OF A CLASS OF CLAIMANTS, IN COURT OR
                    IN ARBITRATION, WITH RESPECT TO ANY CLAIM THAT IS SUBJECT TO
                    ARBITRATION.
                  </b>{" "}
                  Further, you may not join your Dispute with other persons in
                  the arbitration; each person must arbitrate his or her own
                  Dispute(s) separately. You also waive your right to have a
                  court or jury trial resolve your Dispute.
                </p>
              </li>
              <li>
                <p>
                  <span className="underline">Informal Resolution:</span> You
                  and we agree to attempt to first resolve any Dispute
                  informally. You agree that you will notify us of your Dispute
                  by sending an email to{" "}
                  <a href="Disputes@PatriaLending.com" className="link">
                    Disputes@PatriaLending.com
                  </a>
                  . Your email must include your name, your loan account number
                  (or last 4 digits of your social security number), and
                  address; describe the nature and basis of your Dispute; and
                  use the phrase "Notice of Dispute" in the subject line. We
                  will investigate your Dispute and let you know of our decision
                  within 30 business days from the date we received your
                  correspondence. If you do not accept our decision, then you
                  may submit your Dispute to final and binding arbitration in
                  the manner described in the section below (unless you have
                  properly rejected the Arbitration Agreement in the time and
                  manner provided above).
                </p>
              </li>
              <li>
                <p>
                  <span className="underline">Proceeding in Arbitration:</span>{" "}
                  If the Dispute cannot be resolved informally, then you or we
                  may file a claim for arbitration with the American Arbitration
                  Association (<b>"AAA"</b>) through its website at{" "}
                  <a
                    href="http://www.adr.org"
                    target="_blank"
                    className="link underline"
                    rel="noreferrer"
                  >
                    www.adr.org
                  </a>
                  . If the AAA is unable or declines to administer the Dispute,
                  then you and we agree to select a substitute arbitration
                  organization to administer the Dispute. If you and we cannot
                  agree on a substitute arbitration organization, then either of
                  us may petition the United States District Court for the
                  Northern District of Oklahoma or the courts of the state of
                  Oklahoma sitting in Kay County to appoint the arbitration
                  service provider, as permitted under 9 U.S.C. 5. (The AAA and
                  any substitute arbitration service provider selected or
                  appointed as contemplated here collectively are the{" "}
                  <b>"Arbitration Organization"</b>.) We will reimburse your
                  filing fees, reasonable attorneys' fees, and other costs of
                  arbitration if you prevail. After the Arbitration Organization
                  notifies the parties that an arbitration demand has been
                  filed, the responding party will have 14 days to file a
                  response or counterclaim. After filing of the claim, response,
                  or counterclaim (if elected), no further claims or
                  counterclaims may be made except on motion to the arbitrator.
                  Any delay or failure to file a counterclaim or response will
                  not delay an arbitration from proceeding.
                </p>
              </li>
              <li>
                <p>
                  <span className="underline">Selecting the Arbitrator:</span>{" "}
                  The Arbitration Organization will provide you and us with a
                  list of at least three arbitrator candidates from the National
                  Roster, which, in order to be deemed acceptable as an
                  arbitrator candidate, must (i) be either a retired judge or an
                  attorney, (ii) have experience in contract matters, and (iii)
                  to the extent practicable, have experience in Federal Indian
                  law. You and we will select one arbitrator from that list of
                  candidates. If you and we cannot agree on an arbitrator within
                  10 days, then you or we may ask the Arbitration Organization
                  to appoint an arbitrator from the list of candidates. If the
                  designated arbitrator becomes unable or unwilling to proceed,
                  then you and we agree that a substitute arbitrator will be
                  appointed pursuant to the AAA Consumer Arbitration Rules.
                </p>
              </li>
              <li>
                <p>
                  <span className="underline">
                    Preliminary Management Hearing; Discovery; Motions:
                  </span>{" "}
                  The Arbitration Organization will schedule a preliminary
                  management hearing with the appointed arbitrator to narrow the
                  issues and establish a schedule and procedure for any law and
                  motion proceedings to expedite arbitration. The preliminary
                  management hearing will be conducted by conference call, video
                  conference or internet. Discovery will be completed within 60
                  days of this preliminary management hearing and will consist
                  exclusively of: (a) one set of interrogatories to each party
                  not to exceed fifteen (15) in number including subparts, and
                  (b) loan account information and documents pertaining to
                  credit that you sought or obtained from us. Subject to
                  Principle 13 of the AAA's consumer Due Process Protocol, any
                  other forms of discovery will be allowed only upon a showing
                  of good cause to the arbitrator. The arbitrator will honor
                  claims of privilege recognized by law and will take
                  appropriate steps to protect confidential or proprietary
                  information. The arbitrator may decide any motion that is
                  substantially similar to a motion to dismiss for failure to
                  state a claim or a motion for summary judgment.
                </p>
              </li>
              <li>
                <p>
                  <span className="underline">
                    Administration and Procedures; Award; Fees:
                  </span>{" "}
                  The AAA Consumer Arbitration Rules, available at{" "}
                  <a
                    href="http://www.adr.org/Rules"
                    target="_blank"
                    rel="noreferrer"
                    className="link underline"
                  >
                    www.adr.org/Rules
                  </a>
                  , will be used to administer the arbitration, and you and we
                  each agree that the Dispute will be arbitrated solely through
                  submission of documents in accordance with the AAA Procedures
                  for the Resolution of Disputes Through Document Submission,
                  without an in-person or telephonic hearing. If the arbitrator
                  decides that an in-person hearing is necessary, however, then
                  the arbitration will be conducted on Tribal land or within
                  thirty (30) miles of your then-current residence, at your
                  choice, provided that this accommodation for you shall not be
                  construed in any way (a) to relinquish or waive the sovereign
                  status or immunity of the Tribe, (b) to relinquish or waive
                  the sovereign status of Patria Lending or expand the scope of
                  the limited waiver provided by Patria Lending below in the
                  paragraphs entitled "Enforcement of Award", or (c) to
                  constitute a transaction of business in any place other than
                  the Indian country of the Tribe. The arbitrator is bound by
                  the terms of this Arbitration Agreement. He or she must apply
                  Applicable Law, the terms of the Loan Agreement and this
                  Arbitration Agreement. If the AAA's rules or procedures are
                  different than the terms of this Arbitration Agreement, the
                  terms of this Arbitration Agreement will control. You and we
                  agree that the arbitrator will issue a concise written award,
                  in accordance with the timing requirements under the AAA
                  Rules. The decision and award shall have no precedential or
                  collateral estoppel effect. The arbitrator may make rulings
                  and resolve disputes as to the payment and reimbursement of
                  fees and expenses, at any time during the proceeding and upon
                  request from you or us within 14 days of the arbitrator's
                  ruling on the merits. The right to attorneys' fees and
                  expenses discussed in this paragraph supplements any right to
                  attorneys' fees and expenses you may have under Applicable
                  Law, but you may not recover duplicative awards of attorneys'
                  fees or costs. If we prevail in arbitration and have a right
                  to an award of attorneys' fees and expenses, we will not seek
                  such an award.
                </p>
              </li>
              <li>
                <p>
                  <span className="underline">Appeal:</span> You or we can file
                  a written appeal to the Arbitration Organization within 30
                  days after an award is issued by filing a notice of appeal
                  with any AAA office, which appeal will be administered by the
                  Arbitration Organization pursuant to AAA's Consumer Appellate
                  Arbitration Policy, available here and at{" "}
                  <a
                    href="http://www.adr.org/sites/default/files/document_repository/Consumer_Appellate_Arbitration_Policy_0.pdf"
                    target="_blank"
                    className="link underline"
                    rel="noreferrer"
                  >
                    www.adr.org/sites/default/files/document_repository/Consumer_Appellate_Arbitration_Policy_0.pdf
                  </a>
                  . Any review by a court shall be governed by Sections 10 and
                  11 of the Federal Arbitration Act.
                </p>
              </li>
              <li>
                <p>
                  <span className="underline">Enforcement of Award:</span> Any
                  final arbitration award will be binding on the named parties
                  and judgment on the arbitration award may be entered in, and
                  be enforceable by, the United States District Court for the
                  Northern District of Oklahoma or if such federal court fails
                  to find jurisdiction, then in the courts of the state of
                  Oklahoma sitting in Kay County, and appellate courts
                  therefrom. Patria Lending grants a limited waiver of its
                  sovereign immunity which is limited to (i) arbitration of a
                  Dispute only in accordance with and subject to the terms of
                  this Arbitration Agreement, and (ii) enforcing a final award
                  issued in such arbitration in the United States District Court
                  for the Northern District of Oklahoma or if such federal court
                  fails to find jurisdiction then in the courts of the state of
                  Oklahoma sitting in Kay County, and appellate courts
                  therefrom. This limited waiver is made by Patria Lending to
                  you only, does not include any waiver (express or implied) to
                  any other person, and does not waive the sovereign immunity of
                  the Tribe or any of the Tribe's other entities.
                </p>
              </li>
              <li>
                <p>
                  <span className="underline">Severability:</span> The
                  provisions of this Arbitration Agreement will, where possible,
                  be interpreted to sustain its legality and enforceability. If
                  any provision of these Terms of Use or this Arbitration
                  Agreement or the whole of it is determined to be
                  unenforceable, then the arbitrator may sever and/or reform any
                  such provision to make it enforceable. The arbitrator may not,
                  however, reform the clause requiring for Disputes to be heard
                  on an individual basis or the waiver of the right to
                  participate in any class or collective action against us.
                </p>
              </li>
            </ol>
          </li>
          <li>
            <H5>16. MISCELLANEOUS</H5>
          </li>
          <li>
            <p>
              <span className="underline">
                Choice of Law; Jurisdiction and Venue:
              </span>
              These Terms of Use shall be governed by Tribal Law and applicable
              federal law (collectively
              <b>"Applicable Law"</b>). The term <b>"Tribal Law"</b> means any
              law, ordinance or regulation duly enacted by the Tribe or the
              Otoe-Missouria Consumer Finance Services Commission.
            </p>
          </li>
          <li>
            <p>
              <span className="underline">Severability:</span> If any provision
              of these Terms of Use is held by a court of competent jurisdiction
              to be unenforceable for any reason, such provision shall be
              changed and interpreted so as to best accomplish the objectives of
              the original provision to the fullest extent allowed by law and
              the remaining provisions of these Terms of Use shall remain in
              full force and effect.
            </p>
          </li>
          <li>
            <p>
              <span className="underline">Acknowledgement:</span> You represent
              and warrant that when you access and use a Site or the Services,
              all information you provide to us will be complete and accurate,
              and you acknowledge and understand that your access and use of a
              Site and the Services occurs in Indian country within the Tribe's
              reservation in Red Rock, Oklahoma. You further acknowledge and
              agree that any claims or defenses whatsoever asserted by or on
              behalf of you will be subject to the dispute resolution process
              and jurisdiction agreed to in these Terms of Use.
            </p>
          </li>
          <li>
            <p>
              <span className="underline">Waiver:</span> Patria Lending&apos;s
              failure or delay in exercising any right, power, or remedy under
              these Terms of Use shall not operate as a waiver of any such
              right, power, or remedy.
            </p>
          </li>
          <li>
            <H5>17. CONTACTING US</H5>
          </li>
          <li>
            <p>
              If you have questions, comments, or complaints regarding these
              Terms of Use, a Site, or Services, you may call{" "}
              <a href="tel:(800) 640-2093" className="link">
                (800) 640-2093
              </a>
              , email us at{" "}
              <a href="mailto:Compliance@PatriaLending.com" className="link">
                Compliance@PatriaLending.com
              </a>{" "}
              or write to Patria Lending, 8151 Highway 177, Red Rock, OK
              74651-0348, Attention: Legal Department.
            </p>
          </li>
          <li className="print-hide">
            <p style={{ textAlign: "center" }}>
              <b>
                PRINT A COPY OF ALL DOCUMENTATION AND RETAIN FOR YOUR RECORDS.
              </b>
            </p>
          </li>
        </ul>
      </div>
    </Wrapper>
  );
};

export default Section;
