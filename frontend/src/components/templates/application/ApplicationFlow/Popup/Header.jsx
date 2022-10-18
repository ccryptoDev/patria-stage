import React from "react";
import styled from "styled-components";
import logo from "../../../../../assets/svgs/logo-dark.svg";

const Wrapper = styled.div`
  text-align: center;
`;

const Header = ({ text }) => {
  return (
    <Wrapper>
      <img src={logo} alt="patria-lending" />
      <p className="note">{text}</p>
    </Wrapper>
  );
};

export default Header;
