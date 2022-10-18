import styled from "styled-components";

export default styled.div<{ padding?: string }>`
  padding: ${(props) => props.padding || 0};
  box-shadow: 0px 0.5px 1.75px rgba(0, 0, 0, 0.039),
    0px 1.85px 6.25px rgba(0, 0, 0, 0.19);
  border-radius: 6px;
  background: #fff;
  overflow: hidden;
`;
