import React, { useRef } from "react";
import { Wrapper } from "./styles";

type IAccordionProps = {
  content: any;
  button?: any;
  open: boolean;
};

const Component = ({ content, button, open }: IAccordionProps) => {
  const elem = useRef<any>(null);
  const height: string = elem?.current?.offsetHeight;
  // const height = "400";
  console.log(height);
  return (
    <Wrapper height={height}>
      <div className="wrap-collabsible">
        <input
          id="collapsible2"
          className="toggle"
          type="checkbox"
          checked={open}
        />
        {button ? <div className="lbl-toggle">{button}</div> : ""}
        <div className="collapsible-content">
          <div className="content-inner" ref={elem}>
            {content}
          </div>
        </div>
      </div>
    </Wrapper>
  );
};

export default Component;
