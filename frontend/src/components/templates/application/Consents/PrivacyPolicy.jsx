/*eslint-disable*/
import React from "react";
import styled from "styled-components";
import Table from "../../../atoms/Table/Rounded";
import Container from "../../../atoms/Container";
import Notification from "../../../molecules/Note";
import { H3, H4 } from "../../../atoms/Typography";

const Wrapper = styled.section`
  .table-wrapper {
    overflow-x: auto;
  }

  .list {
    & h3,
    & h4 {
      color: var(--color-blue-1);
    }
    & > li {
      display: flex;
      flex-direction: column;
      row-gap: 24px;
      &:not(:first-child) {
        margin-top: 48px;
      }

      & p {
        font-size: 14px;
      }

      & > ul {
        display: flex;
        flex-direction: column;
        row-gap: 12px;
        list-style: disc;
        padding-left: 16px;
        & li {
          font-size: 14px;
        }
      }

      & .notification ul {
        list-style: none;
      }

      & .minimin-requirements-list {
        margin-left: 20px;
        list-style: disc;
      }
    }
  }
`;

const Section = () => {
  return (
    <Wrapper>
      <ul className="list">
        <li>
          <H3>
            WHAT DOES PATRIA LENDING, LLC DO WITH YOUR PERSONAL INFORMATION?
          </H3>
        </li>
        <li>
          <H4>Why?</H4>
          <p>
            Financial companies choose how they share your personal information.
            Federal law gives consumers the right to limit some but not all
            sharing. Federal law also requires us to tell you how we collect,
            share, and protect your personal information. Please read this
            notice carefully to understand what we do.
          </p>
        </li>
        <li>
          <H4>What?</H4>
          <p>
            The types of personal information we collect and share depend on the
            product or service you have with us. This information can include:
          </p>
          <ul>
            <li>
              <p>Social Security and checking account information</p>
            </li>
            <li>
              <p>Payment history and income</p>
            </li>
            <li>
              <p>Employment data and bank debit card or account information</p>
            </li>
          </ul>
        </li>
        <li>
          <H4>How?</H4>
          <p>
            All financial companies need to share customers’ information to run
            their everyday business. In the section below, we list the reasons
            financial companies can share their customers' personal information;
            the reasons Patria Lending, LLC chooses to share; and whether you
            can limit this sharing.
          </p>
        </li>
        <li>
          <hr className="hr" />
        </li>
        <li>
          <div className="table-wrapper">
            <Table className="table col-3">
              <div className="thead col-3">
                <div className="tr">
                  <div className="td">
                    Reasons we can share your personal information
                  </div>
                  <div className="td center">
                    Does Patria Lending, LLC share?
                  </div>
                  <div className="td center">Can you limit this sharing?</div>
                </div>
              </div>
              <div className="tbody col-3">
                <div className="tr">
                  <div className="td">
                    <p>
                      <b>For our everyday business purposes — </b>such as to
                      process your transactions, maintain your account(s),
                      respond to court orders and legal investigations, or
                      report to credit bureaus
                    </p>
                  </div>
                  <div className="td center">Yes</div>
                  <div className="td center">No</div>
                </div>

                <div className="tr">
                  <div className="td">
                    <p>
                      <b>For our marketing purposes — </b>to offer our products
                      and services to you
                    </p>
                  </div>
                  <div className="td center">Yes</div>
                  <div className="td center">No</div>
                </div>

                <div className="tr">
                  <div className="td">
                    <p>
                      <b>For joint marketing with other financial companies</b>
                    </p>
                  </div>
                  <div className="td center">Yes</div>
                  <div className="td center">Not Shared</div>
                </div>

                <div className="tr">
                  <div className="td">
                    <p>
                      <b>For our affiliates’ everyday business purposes — </b>
                      information about your transactions and experiences
                    </p>
                  </div>
                  <div className="td center">Yes</div>
                  <div className="td center">No</div>
                </div>

                <div className="tr">
                  <div className="td">
                    <p>
                      <b>For our affiliates’ everyday business purposes — </b>
                      information about your creditworthiness
                    </p>
                  </div>
                  <div className="td center">Yes</div>
                  <div className="td center">Yes</div>
                </div>

                <div className="tr">
                  <div className="td">
                    <p>
                      <b> For our affiliates to market to you</b>
                    </p>
                  </div>
                  <div className="td center">Yes</div>
                  <div className="td center">Not Shared</div>
                </div>

                <div className="tr">
                  <div className="td">
                    <p>
                      <b>For nonaffiliates to market to you</b>
                    </p>
                  </div>
                  <div className="td center">Yes</div>
                  <div className="td center">Not Shared</div>
                </div>
              </div>
            </Table>
          </div>
        </li>

        <li>
          <H4>To limit our sharing</H4>
          <ul>
            <li>
              <p>
                Call
                <a href="tel:800-640-2093" className="link">
                  800-640-2093
                </a>
                — our menu will prompt you through your choice(s) or
              </p>
            </li>
            <li>
              <p>
                Visit us online:
                <a href="www.PatriaLending.com" className="link underline">
                  www.patrialending.com
                </a>
                or email us at
                <a
                  href="mailto:CustomerCare@PatriaLending.com"
                  className="link"
                >
                  CustomerCare@PatriaLending.com
                </a>
              </p>
            </li>
          </ul>
        </li>
        <li>
          <Notification
            content={[
              <>
                If you are a <b>new</b> customer, we can begin sharing your
                information 30 days from the date we sent this notice. When you
                are <b>no longer</b> our customer, we continue to share your
                information asdescribed in this notice.
              </>,
              <>
                {" "}
                However, you can contact us at any time to limit our sharing.
              </>,
            ]}
          />
        </li>
        <li>
          <p>However, you can contact us at any time to limit our sharing.</p>
        </li>
        <li>
          <H4>Questions?</H4>
          <p>
            Call
            <a href="tel:800-640-2093" className="link">
              {" "}
              800-640-2093
            </a>
            or go to
            <a
              href="http://www.PatriaLending.com"
              target="_blank"
              className="link underline"
            >
              www.patrialending.com
            </a>
          </p>
        </li>
        <li>
          <div className="table-wrapper">
            <Table className="table col-2">
              <div className="thead">
                <div className="tr">
                  <div className="th">Who we are</div>
                </div>
              </div>
              <div className="tbody col-2">
                <div className="tr">
                  <div className="td">
                    <b>Who bis providing this notice?</b>
                  </div>
                  <div className="td">
                    This privacy notice is provided by Patria Lending, LLC.
                  </div>
                </div>
              </div>

              <div className="thead">
                <div className="tr">
                  <div className="th">What we do</div>
                </div>
              </div>
              <div className="tbody col-2">
                <div className="tr">
                  <div className="td">
                    <b>
                      How does Patria Lending collect my personal information?
                    </b>
                  </div>
                  <div className="td">
                    To protect your personal information from unauthorized
                    access and use, we use security measures that comply with
                    federal law. These measures include computer safeguards and
                    secured files and buildings.
                  </div>
                </div>
                <div className="tr">
                  <div className="td">
                    <b>
                      How does Patria Lending collect my personal information?
                    </b>
                  </div>
                  <div className="td">
                    <div>
                      <p>
                        We collect your personal information, for example, when
                        you
                      </p>
                      <ul>
                        <li>
                          <p>
                            submit a loan application or share contact or
                            account information
                          </p>
                        </li>
                        <li>
                          <p>
                            provide financial information or employment
                            information
                          </p>
                        </li>
                        <li>
                          <p>
                            arrange payments or update information on your
                            account
                          </p>
                        </li>
                      </ul>
                      <p>
                        We also collect your personal information from credit
                        reporting agencies, financial companies, service
                        providers and other companies.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="tr">
                  <div className="td">
                    <b>Why can’t I limit all sharing?</b>
                  </div>
                  <div className="td">
                    <div>
                      <p>Federal law gives you the right to limit only</p>
                      <ul>
                        <li>
                          <p>
                            sharing for affiliates’ everyday business
                            purposes—information about your creditworthiness
                          </p>
                        </li>
                        <li>
                          <p>
                            affiliates from using your information to market to
                            you
                          </p>
                        </li>
                        <li>
                          <p>sharing for nonaffiliates to market to you</p>
                        </li>
                      </ul>
                      <p>
                        State laws and individual companies may give you
                        additional rights to limit sharing. See below for more
                        information.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="tr">
                  <div className="td">
                    <b>
                      What happens when I limit sharing for an account I hold
                      jointly with someone else?
                    </b>
                  </div>
                  <div className="td">
                    Your choice will apply to everyone on your account.
                  </div>
                </div>
              </div>

              <div className="thead">
                <div className="tr">
                  <div className="th">Definitions</div>
                </div>
              </div>
              <div className="tbody col-2">
                <div className="tr">
                  <div className="td">
                    <b>Affiliates</b>
                  </div>
                  <div className="td">
                    <div>
                      <p>
                        Companies related by common ownership or control. They
                        can be financial and nonfinancial companies.
                      </p>
                      <ul>
                        <li>
                          <p>
                            Our affiliates include entities wholly owned by the
                            Otoe-Missouria Tribe of Indians, a federally
                            recognized Indian Tribe.
                          </p>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
                <div className="tr">
                  <div className="td">
                    <b>Nonaffiliates</b>
                  </div>
                  <div className="td">
                    <div>
                      <p>
                        Companies not related by common ownership or control.
                        They can be financial and nonfinancial companies.
                      </p>
                      <ul>
                        <li>
                          <p>
                            Nonaffiliates with which we share personal
                            information include service providers and direct
                            marketing companies for application marketing,
                            direct mail and other purposes.
                          </p>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="tr">
                  <div className="td">
                    <b>Joint marketing</b>
                  </div>
                  <div className="td">
                    <div>
                      <p>
                        A formal agreement between nonaffiliated financial
                        companies that together market financial products or
                        services to you.
                      </p>
                      <ul>
                        <li>
                          <p>
                            Our joint marketing partners can include companies
                            with which we have agreements to jointly market
                            products.
                          </p>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
              <div className="thead col-1">
                <div className="tr">
                  <div className="th">Other important information</div>
                </div>
              </div>
              <div className="tbody col-1">
                <div className="tr">
                  <div className="td">
                    <p>
                      Tribal Notice: Patria Lending, LLC is an arm of the
                      Otoe-Missouria Tribe of Indians and is licensed and
                      regulated by the Tribe's Consumer Finance Services
                      Regulatory Commission pursuant to the Tribe's Consumer
                      Financial Services Ordinance.
                    </p>
                  </div>
                </div>
              </div>
            </Table>
          </div>
        </li>
      </ul>
    </Wrapper>
  );
};

export default Section;
