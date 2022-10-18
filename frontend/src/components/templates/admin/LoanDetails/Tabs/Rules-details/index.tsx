import React, { useState, useEffect } from "react";
import styled from "styled-components";
import Heading from "../../../../../molecules/Typography/admin/DetailsHeading";
import Rule, { IRuleProps } from "./Rule";

const Wrapper = styled.div`
  font-family: "Spartan";
  font-size: 1.4rem;
  line-height: 3rem;
  .row {
    display: flex;
  }
  .key {
    padding-right: 1rem;
  }
  .heading-wrapper {
    display: flex;
  }
`;

const RulesDetails = ({ state }: { state: any }) => {
  const [rules, setRules] = useState<any[]>([]);

  useEffect(() => {
    const details = state?.screenTracking?.rulesDetails.ruleData;
    if (details) {
      // PARSE RULES TO ARRAY
      const rulesArray: any[] = [];
      Object.keys(details).forEach((key) => {
        rulesArray.push(details[key]);
      });
      setRules(rulesArray);
    }
  }, [state?.screenTracking?.rulesDetails.ruleData]);

  return (
    <Wrapper>
      <Heading text="Rules" />
      <div>
        {rules.length
          ? rules.map((item: IRuleProps) => {
              return (
                <div key={item.ruleId} className="rule-wrapper">
                  <div className="heading-wrapper">
                    <div className="heading">Rule: {item.ruleId}</div>
                  </div>
                  <Rule {...item} />
                </div>
              );
            })
          : ""}
      </div>
    </Wrapper>
  );
};

export default RulesDetails;
