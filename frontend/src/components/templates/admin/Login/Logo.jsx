import React from "react";
import styled from "styled-components";

const Logo = styled.div`
  .image {
    width: 15rem;
    height: 15rem;
    background: url(${(props) => props.imgUrl});
    background-position: center;
    background-size: cover;
  }
  & h4 {
    font-size: 3.5rem;
    font-weight: 400;
    text-align: center;
    color: #fff;
    margin: 0;
  }
  margin-bottom: 2.5rem;
`;

const LogoComponent = ({ imgUrl }) => {
  return (
    <Logo imgUrl={imgUrl}>
      <div className="image" />
      <h4>Admin</h4>
    </Logo>
  );
};

export default LogoComponent;
