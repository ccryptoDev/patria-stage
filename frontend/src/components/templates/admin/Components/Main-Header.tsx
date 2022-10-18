import React from "react";
import { useHistory } from "react-router-dom";
import styled from "styled-components";
import Button from "../../../molecules/Buttons/ActionButton";
import Crumbs from "./BreadCrumbs";

const Wrapper = styled.div`
  padding: 50px 35px 60px;
  .main-header-heading {
    color: #fff;
    position: relative;
    font-size: 32px;
    font-weight: 700;
    margin-bottom: 30px;

    & button {
      position: absolute;
      width: 30px;
      height: 30px;
      transform: translateX(-50px);

      & .chevron-icon svg path {
        fill: var(--color-blue-dark);
      }
    }
  }

  @media screen and (max-width: 992px) {
    h1 > .action-button {
      display: none;
    }
  }
`;

const MainHeader = ({
  backgroundColor,
  heading,
  crumbs,
}: {
  backgroundColor: string;
  heading: string;
  crumbs: any[];
}) => {
  const history = useHistory();

  return (
    <Wrapper style={{ backgroundColor }}>
      <h1 className="main-header-heading">
        <Button type="goback" onClick={() => history.goBack()} />
        {heading}
      </h1>
      <Crumbs crumbs={crumbs} color="#B5DCF2" />
    </Wrapper>
  );
};

export default MainHeader;
