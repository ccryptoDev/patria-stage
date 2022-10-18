import React, { useState } from "react";
import styled from "styled-components";
import SideNav from "../../components/organisms/SideNavigation";
import Header from "./header";
import { sidenav } from "./sidenav/sidenav.config";
import HeaderMobile from "./header/mobile";
import MobileSideNav from "../../components/organisms/SideNavigation/sidenav-drawer";

type Props = {
  route: string | undefined;
  children: any;
};

const Wrapper = styled.div`
  .lg {
    display: flex;
  }
  .mobile {
    display: none;
  }
  .lg,
  .mobile {
    min-height: 100vh;
    flex-direction: column;
  }
  .layout-main {
    display: flex;
    flex-grow: 1;
    position: relative;

    & main {
      flex-grow: 1;
      background: #fbfbff;
    }
  }

  @media screen and (max-width: 992px) {
    .lg {
      display: none;
    }
    .mobile {
      display: flex;
    }
  }
`;

const MainLayout: React.FC<Props> = ({ children, route = "" }) => {
  const [open, setOpen] = useState(false);

  return (
    <Wrapper>
      <div className="lg">
        <Header />
        <div className="layout-main">
          <SideNav active={route} navItems={sidenav} />
          <main className="layout">
            <div id="pageView" className="layout-main-pageview">
              <div className="layout-main-content">{children}</div>
            </div>
          </main>
        </div>
      </div>
      <div className="mobile">
        <HeaderMobile toggleMenu={() => setOpen(!open)} />
        <div className="layout-main">
          <MobileSideNav
            open={open}
            navItems={sidenav}
            setOpen={setOpen}
            active={route}
          />
          <main className="layout">
            <div id="pageView" className="layout-main-pageview">
              <div className="layout-main-content">{children}</div>
            </div>
          </main>
        </div>
      </div>
    </Wrapper>
  );
};
export default MainLayout;
