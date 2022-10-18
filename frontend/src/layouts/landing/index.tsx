import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import styled from "styled-components";
import Header from "./header";
import Menu from "./header/menu";
import Footer from "../Footer";

const Wrapper = styled.div`
  position: relative;

  main {
    min-height: calc(100vh - var(--header-height) - var(--footer-height));
  }
`;

const Layout = ({ children }: any) => {
  const [open, setOpen] = useState(false);
  const history = useHistory();

  useEffect(() => {
    if (open) {
      setOpen(!open);
    }
  }, [history.location.pathname]);

  const toggleMenu = () => {
    setOpen((curState) => !curState);
  };

  return (
    <Wrapper>
      <div>
        <Header toggleMenu={toggleMenu} />
        <Menu isOpen={open} toggleMenu={toggleMenu} />
      </div>
      <main>{children}</main>
      <Footer />
    </Wrapper>
  );
};

export default Layout;
