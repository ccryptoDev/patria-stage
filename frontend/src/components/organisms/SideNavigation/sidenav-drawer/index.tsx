import React from "react";
import styled from "styled-components";
import SideNav from "./SideNav";

const Wrapper = styled.div`
  .open {
    & .sidenav {
      left: 0;
    }

    & .backdrop {
      display: block;
    }
  }
  .sidenav {
    background: #fff;
    left: -100%;
    transition: all 0.3s;
    position: absolute;
    height: 100%;
    z-index: 999;
  }
  .backdrop {
    position: absolute;
    display: none;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.2);
    z-index: 990;
  }
`;

type IDrawerProps = {
  open: boolean;
  setOpen: any;
  activeRoute: string;
  navItems: any;
};

const Drawer = ({ open, setOpen, activeRoute, navItems }: IDrawerProps) => {
  return (
    <Wrapper className="sidenav-wrapper">
      <div className={`${open ? "open" : ""}`}>
        <SideNav activeRoute={activeRoute} items={navItems} />
        <div
          className="backdrop"
          onClick={() => setOpen(false)}
          onKeyDown={() => setOpen(false)}
          role="button"
          tabIndex={0}
        >
          {" "}
        </div>
      </div>
    </Wrapper>
  );
};

export default Drawer;
