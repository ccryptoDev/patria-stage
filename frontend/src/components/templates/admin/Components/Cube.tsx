import React from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";

const Wrapper = styled.div`
  box-shadow: 0px 4px 18px rgba(0, 0, 0, 0.12);
  border-radius: 16px;
  background: #fff;
  padding: 24px 0 24px 24px;
  color: var(--color-grey);
  position: relative;

  .icon {
    border-radius: 8px;
    width: 44px;
    height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .title {
    font-weight: 600;
    font-size: 14px;
    margin: 24px 0;
  }

  .counter {
    font-weight: 700;
    font-size: 24px;
    line-height: 27px;
  }

  .link {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
  }
`;

type ICubeType = {
  icon: any;
  title: string;
  counter: number;
  color: string;
  link: string;
};

const Cube = ({ icon, color, title, counter, link }: ICubeType) => {
  return (
    <Wrapper>
      <div className="icon" style={{ backgroundColor: color }}>
        {icon}
      </div>
      <div className="title">{title}</div>
      <div className="counter">{counter}</div>
      <Link to={link} className="link" />
    </Wrapper>
  );
};

export default Cube;
