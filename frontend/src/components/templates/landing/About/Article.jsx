import React, { useState } from "react";
import styled from "styled-components";
import Container from "../../../atoms/Container";
import otoemissouria from "../../../../assets/landing/history/otoemissouria.png";
import tonkawa from "../../../../assets/landing/history/Tonkawa.png";
import sioux from "../../../../assets/landing/history/teton-sioux.png";
import { H3 } from "../../../atoms/Typography";
import Button from "../../../atoms/Buttons/Button";

const Wrapper = styled.section`
  background: var(--color-bg-2);
  padding: 6rem 0;
  & .about-section-history {
    background: var(--color-bg-2);
    & p {
      line-height: 1.3;
    }
    & h3 {
      margin-bottom: 4.8rem;
      text-align: center;
    }
    &-content {
      &-layout {
        position: relative;
        display: grid;
        grid-template-columns: 1fr 1fr;
        grid-gap: 2.4rem;
        max-height: 30vh;
        overflow: hidden;
        transition: all 0.3s;

        &.show {
          max-height: initial;
        }
      }
      &-expend {
        position: absolute;
        top: 0;
        width: 100%;
        box-sizing: border-box;

        &-shadow {
          background: linear-gradient(
            180deg,
            rgba(249, 249, 249, 0) 0%,
            var(--color-bg-2) 100%
          );
          height: 100px;
        }
        & .button-wrapper {
          background: var(--color-bg-2);
          padding: 2rem;
          display: flex;
          justify-content: center;

          & .button-inverted {
            border: 1px solid var(--color-blue-1);
          }
        }
      }
    }
    &-banner {
      grid-column: 1/-1;
      width: 100%;
    }

    &-paragraph {
      display: flex;
      flex-direction: column;
      row-gap: 2.4rem;
    }

    &-footer {
      grid-column: 1/-1;
      display: flex;
      align-items: start;
      column-gap: 2.4rem;
    }
  }

  @media screen and (max-width: 992px) {
    .about-section-cards-layout,
    .about-section-history-content-layout {
      display: flex;
      flex-direction: column;
    }

    .about-section-banner {
      height: auto;
      padding: 4rem 0;
    }

    .about-section-history-content-expend {
      top: 20%;
    }
  }

  @media screen and (max-width: 600px) {
    .about-section-history-footer {
      flex-wrap: wrap;
      row-gap: 20px;
    }
  }
`;

const Article = ({ articleExpanded = false, articleRef }) => {
  const [open, setOpen] = useState(false);

  return (
    <Wrapper ref={articleRef}>
      <Container className="about-section-history">
        <div className="about-section-history-layout">
          <H3>Otoe-Missouria History</H3>
          <div className="about-section-history-content">
            <div
              className={`about-section-history-content-layout ${
                open || articleExpanded ? "show" : ""
              }`}
            >
              <p>
                Otoe and Missouria oral histories begin in the region north of
                the Great Lakes. By around 1680, Europeans recorded the tribes
                in distinct areas of the mid-continent. In the 16th century, the
                Otoe, and Missouria broke away and moved to the south and west.
                The Otoe & Missouria people first came into contact with
                Europeans in the late 17th century via Jacques Marquette, the
                famous French explorer, and missionary.
              </p>
              <p>
                By the late 17th century, the Missouria had settled near the
                Missouri and Grand rivers in what became Missouri. The Otoe
                settled along what is now the Iowa-Minnesota border. The state
                of Missouri and the Missouri River are both named after the
                Missouria Tribe, which controlled traffic and trade along the
                Missouri River and its tributaries. Trade was a vital part of
                Otoe and Missouria life for centuries. They traded with the
                Spanish, French and Americans for various goods. All three
                nations courted the Otoe and Missouria tribes for exclusive
                trading agreements.
              </p>

              <img
                className="about-section-history-banner"
                src={sioux}
                alt="teton-sioux"
              />

              <div className="about-section-history-paragraph">
                <p>
                  The Otoe and Missouria Tribes were living together when they
                  encountered Lewis and Clarks&apos; Corps of Discovery
                  Expedition of 1803-1805 commissioned by President Thomas
                  Jefferson.
                </p>
                <p>
                  A sequence of land cessation treaties (1817, 1825, 1830, 1833,
                  1836, 1854) had the effect of moving the tribes south and
                  west. In the 1854 treaty, the tribes ceded their remaining
                  land west of the Missouri River, and a reservation was created
                  on the Kansas-Nebraska border. In 1876, the US Congress
                  arranged the sale of 120,000 acres of the Otoe-Missouria
                  reservation. It sold the remainder of the land in 1881, when
                  Congress forced the Otoe-Missouria into Indian Territory in
                  Oklahoma.
                </p>
                <p>
                  Despite these hardships, members of the Otoe-Missouria Tribe
                  served patriotically and heroically in World War I, World War
                  II, Korea, Vietnam, and other foreign campaigns. Women from
                  Oklahoma&apos;s tribal nations, including the Otoe-Missouria,
                  served in the U.S. Coast Guard Women&apos;s Reserves (“SPARS”)
                  during World War II. They allowed male Coast Guardsmen who
                  were working shore-side to fulfill sea duty. By releasing
                  shore-side Coast Guardsmen for sea duty, these SPARS
                  contributed to the Allied victory.
                </p>
              </div>
              <img src={tonkawa} alt="Tonkawa" />
              <div className="about-section-history-footer">
                <img src={otoemissouria} alt="otoemissouria" />
                <p>
                  The Otoe-Missouria Tribe today, located in Red Rock, OK is a
                  federally recognized tribe and runs numerous Tribal
                  enterprises to help fund services for its community including
                  housing, healthcare, and education programs. According to a
                  Taylor Policy Group study (provider of economic and public
                  policy research to Native governments), the Tribe drives
                  significant economic impact in Oklahoma and surrounding areas
                  across the Tribe&apos;s various businesses including gaming,
                  recreation, hospitality, land/cattle, financial services. The
                  United States recognizes a government-to-government
                  relationship with the Tribe and the Tribe exists politically
                  in a &apos;domestic dependent nation&apos; status. As such,
                  the Otoe-Missouria Tribe is a sovereign nation located within
                  Oklahoma and the United States.
                </p>
              </div>
              {!open && !articleExpanded ? (
                <div className="about-section-history-content-expend">
                  <div className="about-section-history-content-expend-shadow" />
                  <div className="button-wrapper">
                    <Button
                      className="button-inverted"
                      variant="secondary"
                      type="button"
                      onClick={() => setOpen(true)}
                    >
                      Read More
                    </Button>
                  </div>
                </div>
              ) : (
                ""
              )}
            </div>
          </div>
        </div>
      </Container>
    </Wrapper>
  );
};

export default Article;
