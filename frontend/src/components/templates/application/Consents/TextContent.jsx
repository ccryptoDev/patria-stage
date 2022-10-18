import React from "react";
import styled from "styled-components";

const Wrapper = styled.div`
  padding: 1rem;
  .header {
    text-align: center;
    margin-bottom: 1rem;
    display: none;
  }

  p,
  ul li {
    margin: 1rem 0;
    line-height: 2.6rem;
  }

  ul {
    padding: 0 2rem;
  }

  @media print {
    .header {
      display: block;
    }
  }
`;

const Content = () => {
  return (
    <Wrapper>
      <h2 className="header">Terms & Conditions</h2>
      <div className="text-wrapper">
        <p>Please read the following Website Terms of Use carefully. By accessing and using this Website, you agree to be bound by the following Terms of Use. The Terms of Use may change from time to time. Any changes will be posted to this Website. If you do not agree to any terms or conditions in the Terms of Use, you must exit this Website immediately and you may not use the Website. </p>

        <p>You are currently using a website (the “Website”) administered by PatientFi LLC (“PatientFi,” “we,” “us,” and “our”). This Website and any services we provide in connection with this Website (“Services”) are subject to all of the following terms and conditions (“Terms of Use”). By accessing the Website, you (“User”) acknowledge that you read, you understand, and you agree to be bound by these Terms of Use. If any provision in the Terms of Use conflicts with a provision in the PatientFi Online Privacy Policy or any other agreement you enter into with PatientFi or related to the Services, the terms of the Online Privacy Policy or the other agreement shall govern with respect to that specific aspect of the Website or Services. </p>

        <p>
          <b>Changes and Modifications:</b> We reserve the right, in our sole discretion, to change or modify these Terms of Use, or to discontinue any part of the Website or the Services, at any time, for any reason, for any duration, and without advance notice to you. When you access or use the Website and Services from time to time, you agree to review these Terms of Use and check for any updates we made after the date of your most recent visit to the Website. If you access or use the Website or any Services after the effective date for any changes we make to the Terms of Use or the Services, you understand and agree that this shall be your agreement and acceptance of all changes we made to the Terms of Use and the Services we provide through the Website.
        </p>

        <p>
          <b>General Eligibility:</b> This Website is intended for individuals who are United States residents and who have reached the age of majority in their state of residence. Individuals who have not reached the age of majority in their state of residence may not use the Website or its Services. If you are a minor, you must exit this Website now. By using the Website, you represent that you are a United States resident, you represent that you have reached the age of majority in your state of residence, and you agree to abide by all terms and conditions in these Terms of Use. Unauthorized use of the Website or Services, including unauthorized access of PatientFi’s systems and misuse of passwords or Website information, is strictly prohibited. If you violate any part of the Terms of Use or any other agreement you have with we, then we may restrict, suspend, or terminate your access to any portion or all of the Website and Services without notice.{" "}
        </p>

        <p>
          <b>Your Account; Security:</b>
          We will require that you create and maintain an account with us, before you will be allowed to access certain parts of the Website and use certain Services. When you create an account, you will be required to select a username and password. You may not disclose the username or password to any third party. If you learn of any unauthorized use of your username, password or account, please contact us immediately.
        </p>
        <p>You agree: (i) to maintain the security of your username and password; (ii) to maintain and promptly update any information you provide to us in connection with your account and to keep it accurate, current, and complete; and (iii) to be fully responsible for all use of your account and for any actions that take place using your account.</p>
        <p>You understand and agree that we may monitor the Services in an effort to foster compliance by you and others with these Terms of Use. Nevertheless, we do not make any representations, warranties or guaranties: (1) that any or all of the Services will be monitored for accuracy or unacceptable use; or (2) that we will take any specific action (or any action at all) in the event of a challenge or dispute regarding compliance with these Terms of Use. </p>

        <p>
          <b>Mobile Participants:</b> You understand and agree that various entities, unaffiliated with us, make up the “mobile ecosystem” that allows you to access, visit, and/or use the Services through your computer or mobile device, including but not limited to the equipment, hardware and software manufacturers and providers, the telephone, mobile, wireless, and Internet network providers and carriers, and the sellers or providers of content for use with the Services (collectively, the “Mobile Participants”). We do not represent, warrant, or guarantee that all of the Services can be accessed by all computers or mobile devices, or that all Services can be accessed through all carriers and service plans, or that all Services are available in all geographic locations.
        </p>

        <p>THE MOBILE PARTICIPANTS MAY REQUIRE THAT YOU AGREE TO THEIR ADDITIONAL TERMS, CONDITIONS, CONTRACTS, AGREEMENTS AND/OR RULES. YOUR COMPLIANCE WITH ANY SUCH ADDITIONAL TERMS, CONDITIONS, CONTRACTS, AGREEMENTS AND/OR RULES IS SOLELY YOUR RESPONSIBILITY AND WILL HAVE NO EFFECT ON YOUR CONTINUING OBLIGATION TO COMPLY WITH THESE TERMS OF USE WHEN YOU USE THE WEBSITE AND THE SERVICES. WE SPECIFICALLY DISCLAIM ANY AND ALL LIABILITY IN CONNECTION WITH THE ACTS OR OMISSIONS OF SUCH MOBILE PARTICIPANTS.</p>

        <p>
          <b>Privacy: </b>Your privacy is very important to us. Please carefully read our Online Privacy Policy, which details how we treat your personal information.
        </p>
        <p>
          <b>Service Rights and Restrictions </b>All materials and content on this Website, including but not limited to text, data, articles, designs, software, photos, images, and other information (collectively the “Website content”), are the proprietary property of PatientFi, with all rights reserved. Website content may not be copied, reproduced, distributed, republished, displayed, posted, transmitted, or sold in any form or by any means without PatientFi’s express prior written consent. You acknowledge that all Website content is and shall remain the sole property of PatientFi. You may access the Website and use the Services only for their intended purposes. Any use of the Website or the Services that is not expressly authorized by the Terms of Use is strictly prohibited.
        </p>

        <p>
          <b>Acceptable Use </b>You accept sole responsibility for all of your activities using the Website and Services. You may not use the Website in a manner that:
        </p>
        <ul>
          <li>Uses technology or other means not authorized by us to access the Website information or our Services and systems;</li>
          <li>Uses or launches any manual or automated device or system, including “robots,” “spiders,” or “offline readers,” to (i) retrieve, index, “scrape,” “data mine,” access or otherwise gather any Website information or our Services and systems, (ii) reproduce or circumvent the navigational structure or presentation of the Website, or (iii) otherwise harvest or collect information about users of the Website; </li>
          <li>Reverse engineers, decompiles or disassembles any portion of the Website, except where such restriction is expressly permitted by applicable law; </li>
          <li>Attempts to introduce viruses or any other computer code, files, or programs that interrupts, destroys, or limits the functionality of any software, hardware, or telecommunications equipment; </li>
          <li>Attempts to gain unauthorized access to our computer networks or user accounts; </li>
          <li>Encourages conduct that would constitute a criminal offense or that gives rise to civil liability;</li>
          <li>Harasses, abuses, threatens, defames, or otherwise infringes or violates the rights of use or any other party (including rights of publicity or other proprietary rights);</li>
          <li>Is unlawful, fraudulent, or deceptive; </li>
          <li>Attempts to damage, disable, overburden, or impair our services or networks; </li>
          <li>Reproduces, modifies, adapts, translates, creates derivative works of, sells, rents, leases, loans, timeshares, distributes or otherwise exploits any portion of (or any use of) the Website except as expressly authorized by these Terms of Use, without our express written consent; </li>
          <li>Fails to comply with applicable third-party terms; or </li>
          <li>Otherwise violates these Terms of Use.</li>
        </ul>

        <p>
          <b>Trademarks: </b> Nothing on this Website should be construed as granting you or any User a license or right to use any trademark, whether owned by PatientFi or a third party, displayed on the Website, without prior written approval of the trademark owner. You may not use, copy, duplicate, display, distribute, modify or reproduce any trademark contained on the Website without the prior express written consent of the Trademark owner.
        </p>

        <p>
          <b>Copyright Complaints: </b>If you believe any material on the Website infringes on any copyright you own or control, you may send a written notification to us by email addressed to [insert email address] or by U.S. Mail addressed to [insert mailing address]. In your notification, please: (1) confirm that you are the owner, or authorized to act on behalf of the owner, of the copyrighted work that has been infringed; (2) identify the copyrighted work or works you claim have been infringed; (3) identify the material you claim is infringing, or is the subject of infringing activity, and that is to be removed (including enough information to allow us to locate the material); (4) provide your contact details, including an email address; and (5) include your statement that the information you provided is accurate and you have a good-faith belief that use of the material in the manner complained of is not authorized by the copyright owner, its agent or the law.
        </p>

        <p>
          <b>Links to Third-Party:</b> Our Website may link to third party services or apps that we don’t control, including social medial sites (collectively “Third Party Sites”). You should be aware that the privacy practices and security of the Third Party Sites may be different from our privacy practices and provide less security than this Website. The choice to access a Third Party Site is yours, in your sole discretion.{" "}
        </p>

        <p>
          <b>Disclaimer of Warranties </b>PATIENTFI PROVIDES THE WEBSITE AND SERVICES ON AN “AS IS” AND “AS AVAILABLE” BASIS, WITHOUT ANY EXPRESS OR IMPLIED WARRANTIES INCLUDING, BUT NOT LIMITED TO, IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT. ADDITIONALLY, PATIENTFI MAKES NO CLAIM OR GUARANTEE AS TO THE ACCURACY OF ANY INFORMATION PROVIDED OR WEBSITE CONTENT.
        </p>

        <p>
          <b>Limitation of Liabilities: </b>IN NO EVENT WILL PATIENFI OR ITS DIRECTORS, OFFICERS, EMPLOYEES, OR AGENTS BE LIABLE TO YOU OR TO ANY OTHER PARTY FOR LOST PROFITS OR ANY OTHER SPECIAL, CONSEQUENTIAL, INCIDENTAL, OR INDIRECT DAMAGES ARISING FROM YOUR USE OF THE WEBSITE OR SERVICES, EVEN IF PATIENFI IS AWARE OR HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES. TO THE EXTENT ALLOWED BY APPLICABLE LAW, PATIENTFI’S LIABILITY TO YOU FOR ANY CAUSE OF ACTION, REGARDLESS OF FORM, WILL AT ALL TIMES BE LIMITED TO THE AMOUNT YOU HAVE PAID TO PATIENTFI, IF ANY, AND IN NO CASE SHALL PATIENTFI’S LIABILITY TO YOU EXCEED ONE THOUSAND DOLLARS ($1,000.00).
        </p>

        <p>
          <b>Indemnification: </b>
          You agree to indemnify, defend, and hold harmless PatientFi and its affiliates, officers, directors, employees, agents, and representatives for damages, losses, liabilities, settlements and expenses (including without limitation costs and attorneys’ fees), arising in connection with any claim, suit, proceeding, or other action arising from your use of the Website or Services, your conduct in connection with your use of the Website or Services, or any violation of these Terms of Use or of any law or the rights of any third party.
        </p>
        <p>
          <b>Termination: </b>Subject to applicable law and the terms of any Services, we reserve the right, in our reasonable discretion, to terminate your license, your use of the Website, your user account or any Service provided to you, and to assert our legal rights with respect to content or use of the Website that we reasonably believe is, or might be, in violation of these terms or the terms of any Service.
        </p>
        <p>
          <b>Governing Law: </b>The terms of this Contract shall be governed by California law and by federal law.
        </p>
        <p>
          <b>Severability: </b> If a court of competent jurisdiction holds that any provision of these Terms of Use is unenforceable for any reason, you and we agree that such provision shall be changed and interpreted so as to best accomplish the objectives of the original provision to the fullest extent allowed by law, and the remaining provisions of these Terms of Use shall remain in full force and effect.
        </p>
        <p>
          <b>Waiver: </b>PatientFi’s failure or delay in exercising any right, power, or remedy under these Terms of Use shall not operate as a waiver of any such right, power, or remedy.{" "}
        </p>
      </div>
    </Wrapper>
  );
};

export default Content;
