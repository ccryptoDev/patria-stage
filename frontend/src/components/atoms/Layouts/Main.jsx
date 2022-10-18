import styled from "styled-components";

export default styled.div`
  min-height: 100vh;
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
  font-family: "Spartan";

  & .expand .layout-sidenav {
    width: var(--sidenav-folded-width);
    min-width: var(--sidenav-folded-width);
  }

  & .layout-sidenav {
    width: var(--sidenav-open-width);
    min-width: var(--sidenav-open-width);
  }

  & .sidenav-menu {
    width: var(--sidenav-open-width);
    min-width: 17rem;
  }

  .layout {
    display: flex;
    height: 100%;
    height: 100vh;
    background: var(--dashboard-bg-color);
    backdrop-filter: blur(5rem);

    /* on side pane open animation */
    @media (max-width: 1550px) {
      .pane-open {
        padding-left: 7rem;
      }
    }

    @media (max-width: 1480px) {
      .pane-open {
        padding-left: 12rem;
      }
    }
  }

  .layout-main {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    flex-grow: 1;
    padding: 0 5rem 5rem 3rem;
    transition: all 0.3s;
    box-sizing: border-box;
    overflow-y: scroll;
    background: #f9fdff;
  }

  .layout-main-container {
    width: 100%;
    margin: 0 auto;
  }
  .layout-main-pageview {
    display: flex;
    max-width: 110rem;
    margin: 0 auto;
  }

  .layout-main-content {
    display: flex;
    flex-direction: column;
    width: 100%;
  }
`;
