import React from "react";
import styled from "styled-components";
import Header from "./Header";
import Footer from "../../Footer";

const Wrapper = styled.div`
  main {
    max-width: 1200px;
    width: 100%;
    padding: 60px 20px;
    margin: 0 auto;
    min-height: calc(100vh - var(--footer-height) - var(--header-height));
  }

  .app-wrapper {
    display: flex;
    flex-direction: column;
    background: #fbfbff;
  }

  @media screen and (max-width: 767px) {
    main {
      padding: 16px;
    }
  }
`;

const Layout = ({ children, route }: { children: any; route: string }) => {
  return (
    <Wrapper>
      <div className="app-wrapper">
        <Header route={route} />
        <main>{children}</main>
        <Footer />
      </div>
    </Wrapper>
  );
};

export default Layout;
