import * as React from "react";
import styled from "styled-components";
import MuiAccordion from "@mui/material/Accordion";
import MuiAccordionSummary from "@mui/material/AccordionSummary";
import MuiAccordionDetails from "@mui/material/AccordionDetails";

const Styles = styled.div`
  .MuiPaper-root {
    box-shadow: none;
    background: transparent;
    & .MuiButtonBase-root {
      min-height: auto;
      padding: 0;
      width: 100%;
      & .MuiAccordionSummary-content {
        margin: 0;
      }
    }
    & .MuiAccordionDetails-root {
      padding: 0;
    }
  }
`;

export default function CustomizedAccordions({
  button,
  content,
  expanded = false,
}: {
  button?: any;
  content: any;
  expanded: boolean;
}) {
  return (
    <Styles className="accordion">
      <MuiAccordion expanded={expanded}>
        <MuiAccordionSummary
          aria-controls="panel1d-content"
          id="panel1d-header"
        >
          {button}
        </MuiAccordionSummary>
        <MuiAccordionDetails>{content}</MuiAccordionDetails>
      </MuiAccordion>
    </Styles>
  );
}
