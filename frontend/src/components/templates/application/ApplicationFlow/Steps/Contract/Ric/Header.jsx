import React from "react";
import styled from "styled-components";
import { formatDate } from "../../../../../../../utils/formats";

const Wrapper = styled.div`
  .heading {
    h4 {
      &:first-child {
        border-bottom: 1px solid;
      }
      text-align: center;
      line-height: 2;
      margin: 0;
      font-weight: bold;
    }
  }

  ul {
    padding: 0;
    margin: 0;
  }

  .date {
    text-align: right;
    line-height: 1.5;
    margin-bottom: 10px;
    span {
      padding: 1px;
    }
    & .underline {
      border-bottom: 1px solid;
      text-decoration: none;
    }
  }

  .address-wrapper {
    display: flex;
    justify-content: space-between;
    min-width: 300px;
  }

  .address-block {
    width: 50%;
    &-heading {
      margin-bottom: 20px;
      font-weight: bold;
      text-transform: upperCase;
    }

    ul {
      list-style: none;

      & li {
        line-height: 1.5;
      }
    }
  }

  @media screen and (max-width: 600px) {
    .date {
      text-align: left;
    }
    .address-wrapper {
      display: block;
    }
    .address-block {
      width: 100%;
      & .address-block-heading {
        margin: 10px 0;
      }
    }
  }
`;

const Header = ({ user, dateSigned }) => {
  return (
    <Wrapper>
      <div className="heading">
        <h4>PATRIA PERSONAL LOAN TRUTH IN LENDING ACT</h4>
        <h4>DISCLOSURE</h4>
      </div>
      <div className="date">
        <span>Date:</span>
        <span className="underline">{formatDate(dateSigned)}</span>
      </div>
      <div className="address-wrapper">
        <div className="address-block">
          <h4 className="address-block-heading">Borrower:</h4>
          <ul>
            <li>{`${user?.firstName} ${user?.lastName}`}</li>
            <li>{`${user?.street}`}</li>
            <li>{`${user?.city}, ${user?.state} ${user?.zipCode}`}</li>
          </ul>
        </div>
        <div className="address-block">
          <h4 className="address-block-heading">CREDITOR:</h4>
          <ul>
            <li>Patria Lending LLC</li>
            <li>8151 Highway 177</li>
            <li>Red Rock, Oklahoma 74651</li>
          </ul>
        </div>
      </div>
    </Wrapper>
  );
};

export default Header;
