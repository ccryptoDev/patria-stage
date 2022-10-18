import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { parsePropString, converter } from "./parsers";
import Heading from "../../../../molecules/Typography/admin/DetailsHeading";
import Modal from "../../../../organisms/Modal/Regular";
import EditIcon from "../../../../atoms/Icons/SvgIcons/Edit";
import TriggerButton from "../../../../atoms/Buttons/TriggerModal/Trigger-button-edit";
import Form from "./ModalForm";

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
  .value {
    position: relative;

    &:hover .modal {
      opacity: 1;
    }
  }
  .modal {
    position: absolute;
    top: 0;
    left: 100%;
    opacity: 0;
    transition: all 0.2s;
  }
`;
// LEGACY -- dead code -- remove later
const RulesDetails = ({ state }) => {
  const [form, setForm] = useState(null);
  useEffect(() => {
    if (state?.screenTracking.rulesDetails) setForm(state?.screenTracking.rulesDetails);
  }, [state?.screenTracking.rulesDetails]);

  const renderRules = () => {
    const render = (obj, path = "") => {
      return Object.keys(obj).map((property) => {
        if (obj[property]) {
          // RECORDING PATH TO EACH VALUE TO BE ABLE TO REACH THE VALUE ON UPDATING THE OBJECT
          let updatedPath = "";
          updatedPath = path ? `${path}.${property}` : `${property}`;

          // IF IT IS NOT THE LAST CHILD IN THE NODE
          if (typeof obj[property] === "object") {
            return (
              <div>
                <div style={{ color: "#005282" }}>{property}:</div>
                <div>
                  <div className="row">
                    <div style={{ marginLeft: "2rem" }}>{render(obj[property], updatedPath)}</div>
                  </div>
                </div>
              </div>
            );
          }
          // IF IT IS THE LAST CHILD IN THE NODE
          return (
            <div key={property} className="row">
              <div>
                <div style={{ color: "#A71391" }} className="key">
                  {property}:
                </div>
              </div>
              <div className="value">
                {converter(parsePropString(obj[property]))}
                <Modal
                  button={
                    <TriggerButton className="edit-btn" style={{ width: "3rem" }}>
                      <EditIcon />
                    </TriggerButton>
                  }
                  state={{ form, path: updatedPath, value: obj[property] }}
                  // cb={cb}
                  modalContent={Form}
                />
              </div>
            </div>
          );
        }
        return <></>;
      });
    };
    return render(form);
  };
  return (
    <Wrapper>
      <Heading text="Rules" />
      <div>{form ? renderRules() : ""}</div>
    </Wrapper>
  );
};

export default RulesDetails;
