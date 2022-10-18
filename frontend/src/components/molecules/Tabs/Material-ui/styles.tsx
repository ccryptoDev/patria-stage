import styled from "styled-components";

const Wrapper = styled.div`
  background: #fff;
  padding: 0 20px;
  position: relative;
  &:after {
    content: "";
    position: absolute;
    width: 100%;
    margin: 0 -20px;
    bottom: 0;
    width: 100%;
    height: 1px;
    background: var(--color-border);
  }

  .MuiTab-root {
    font-family: inherit;
    color: var(--color-primary);
  }
  .MuiTabs-flexContainer {
    justify-content: space-between;
  }

  .MuiTabs-indicator {
    z-index: 100;
  }

  .MuiButtonBase-root {
    padding: 0 20px;
  }
`;

export default Wrapper;
