import React from "react";
import styled from "styled-components";
import BannerWrapper from "../../../atoms/Landing/Banner";
import Container from "../../../atoms/Container";
import { H1 } from "../../../atoms/Typography";
import Input from "../../../molecules/Form/Fields/TextField";
import searchIcon from "../../../../assets/landing/searchicon.png";

const Wrapper = styled.div`
  form {
    display: flex;
    justify-content: space-between;
  }
  .input-wrapper {
    position: relative;
    max-width: 47rem;
    width: 100%;
    display: flex;
    align-items: center;
    & .textField {
      width: 100%;

      & input {
        width: 100%;
        padding-left: 40px;
      }
    }

    & .search-icon {
      position: absolute;
      background: transparent;
      border: none;
      outline: none;
      top: 50%;
      transform: translateY(-50%);
      left: 15px;
      z-index: 100;
      display: flex;
      align-items: center;
    }
  }

  @media screen and (max-width: 530px) {
    padding: 0;
    form {
      flex-direction: column;
    }
  }
`;

const Section = ({ onChangeHandler, inputValue }) => {
  return (
    <Wrapper>
      <BannerWrapper className="faq-section-banner">
        <Container>
          <div className="layout">
            <form className="faq-section-banner-form">
              <H1>FAQs</H1>
              <div className="input-wrapper">
                <Input
                  type="text"
                  placeholder="Search"
                  value={inputValue}
                  className="form-input"
                  onChange={(e) => onChangeHandler(e.target.value)}
                />
                <button type="submit" className="search-icon">
                  <img src={searchIcon} alt="search" />
                </button>
              </div>
            </form>
          </div>
        </Container>
      </BannerWrapper>
    </Wrapper>
  );
};

export default Section;
