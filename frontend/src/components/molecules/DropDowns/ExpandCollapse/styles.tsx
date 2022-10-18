import styled from "styled-components";

export const Wrapper = styled.div<{ height: string }>`
  input[type="checkbox"] {
    display: none;
  }
  .collapsible-content {
    max-height: 0px;
    overflow: hidden;
    transition: max-height 0.25s ease-in-out;
  }
  .toggle:checked + .lbl-toggle + .collapsible-content {
    max-height: ${(props) => `${props.height + 30}px`};
  }
  .collapsible-content p {
    margin-bottom: 0;
  }
`;
