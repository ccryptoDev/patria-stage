import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { IRuleProps } from "./config";
import Rule from "./Rule";
import Modal from "../../../../organisms/Modal/Regular/ModalAndTriggerButton";
import EditIcon from "../../../../atoms/Icons/SvgIcons/Edit";
import TriggerButton from "../../../../atoms/Buttons/TriggerModal/Trigger-button-edit";
import Form from "./ModalForm";
import { getCreditRulesApi } from "../../../../../api/admin-dashboard";
import Loader from "../../../../molecules/Loaders/LoaderWrapper";
import ErrorMessage from "../../../../molecules/ErrorMessage/FormError";

const Wrapper = styled.div`
  font-family: "Spartan";
  font-size: 1.4rem;
  line-height: 3rem;
  padding: 2rem;
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

const parseRulesObjectToArray = (rules: any) => {
  const newRules: any[] = [];
  Object.keys(rules).forEach((key) => {
    const newRule = { ...rules[key] };
    newRule.name = key;
    newRules.push(newRule);
  });

  return newRules;
};

const RulesDetails = () => {
  const [rules, setRules] = useState<IRuleProps[] | []>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const getRules = async () => {
    setLoading(true);
    const result: any = await getCreditRulesApi();
    if (result && !result.error && result.data) {
      if (result?.data?.rules) {
        const rulesArray = parseRulesObjectToArray(result.data.rules);
        setRules(rulesArray);
      }
    } else if (result && result.error) {
      setError(result.error.message || "something went wrong");
    }
    setLoading(false);
  };

  useEffect(() => {
    getRules();
  }, []);

  const updateRulesCb = (updatedRules: any) => {
    // UPDATE LIST ONCE IT IS RETURNED FROM THE HTTP REQUEST
    const rulesArray = parseRulesObjectToArray(updatedRules);
    setRules(rulesArray);
  };

  return (
    <Loader loading={loading}>
      <Wrapper>
        <ErrorMessage message={error} />
        {rules.length
          ? rules.map((item: IRuleProps) => {
              return (
                <div key={item.ruleId} className="rule-wrapper">
                  <div className="heading-wrapper">
                    <div className="heading">Rule: {item.name}</div>
                    <Modal
                      button={
                        <TriggerButton
                          className="edit-btn"
                          style={{ width: "3rem" }}
                        >
                          <EditIcon />
                        </TriggerButton>
                      }
                      state={{ ruleForm: item }}
                      cb={updateRulesCb}
                      modalContent={Form}
                    />
                  </div>
                  <Rule {...item} />
                </div>
              );
            })
          : ""}
      </Wrapper>
    </Loader>
  );
};

export default RulesDetails;
