import React from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import Arrow from "../../../atoms/Icons/SvgIcons/Crumbs-arrow";

const Wrapper = styled.div<{ color?: string }>`
  display: flex;
  align-items: center;
  column-gap: 28px;

  & .crumb {
    display: flex;
    align-items: center;
    & a {
      color: ${(props) => props.color};
      text-decoration: none;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
    }
    & svg path {
      fill: ${(props) => props.color};
    }
    & svg {
      margin-left: 14px;
    }
    &:last-child {
      & a {
        color: #fff;
        cursor: default;
      }
      & svg {
        display: none;
      }
    }
  }
`;

type ICrumbsType = {
  text: string;
  route: string;
};

const BreadCrumbs = ({
  crumbs,
  color,
}: {
  crumbs: ICrumbsType[];
  color: string;
}) => {
  return (
    <Wrapper color={color}>
      {crumbs.length
        ? crumbs.map((item: ICrumbsType) => {
            return (
              <div className="crumb" key={item.route}>
                <Link to={item.route}>{item.text}</Link>
                <Arrow />
              </div>
            );
          })
        : ""}
    </Wrapper>
  );
};

export default BreadCrumbs;
