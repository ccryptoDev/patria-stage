import React from "react";
import styled from "styled-components";
import { v4 as uuidv4 } from "uuid";
import Heading from "../../../../../molecules/Typography/admin/DetailsHeading";
import { converter } from "../Rules-details/parsers";

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

  h2 {
    margin-top: 1rem;
  }

  table {
    width: 100%;
    & tr {
      border: 1px solid #dee2e6;
      width: 100%;
      margin: 5px;
    }
  }
`;

const formatPropString = (value) => {
  const str = value.replace(/([A-Z][a-z])/g, " $1");
  return str.charAt(0).toUpperCase() + str.slice(1);
};

// IF THE PROPERTY IS AN OBJECT GO THROUGH IT AND PARSE EACH ITEM TO UI
const renderObjects = (obj, property, recursion) => {
  return (
    <div>
      <div style={{ color: "#005282" }}>
        <h2>{formatPropString(property)}</h2>
      </div>
      <div style={{ marginLeft: "2rem" }}>{recursion(obj[property])}</div>
    </div>
  );
};

// IF THE PROPERTY IS AN ARRAY GO THROUGH IT AND PARSE EACH ITEM TO UI
const renderArray = (obj, property, recursion) => {
  return (
    <div>
      <div style={{ color: "#005282" }}>
        <h2>{formatPropString(property)}</h2>
      </div>

      <div>
        {obj[property].map((item) => (
          <div key={uuidv4()} style={{ marginLeft: "2rem" }}>
            {typeof item === "object" ? recursion(item) : item}
          </div>
        ))}
      </div>
    </div>
  );
};

// RENDER TABLE FIELDS
const renderFields = (obj, property) => {
  return (
    <div key={property} style={{ display: "flex" }}>
      <div style={{ color: "#A71391" }} className="key">
        {formatPropString(property)}:
      </div>
      <div className="value">{converter(obj[property])}</div>
    </div>
  );
};

// THIS COMPONENT GOES THROUGH EACH OBJECT PROPERTY AND RENDERS IT TO THE UI
const CreaditReport = ({ state }) => {
  const report =
    state?.creditReport?.response?.applicants?.primaryConsumer
      ?.equifaxUSConsumerCreditReport?.equifaxUSConsumerCreditReport;

  const renderRules = () => {
    const render = (obj) => {
      return Object.keys(obj).map((property) => {
        if (obj[property]) {
          // RENDER ARRAY PROPERTY
          if (Array.isArray(obj[property]) && obj[property].length) {
            return renderArray(obj, property, render);
          }
          // RENDER OBJECT PROPERTY
          if (typeof obj[property] === "object") {
            return renderObjects(obj, property, render);
          }
          // RENDER OBJECT PRIMITIVE VALUES
          return renderFields(obj, property);
        }
        return <></>;
      });
    };
    return render(report);
  };
  return (
    <Wrapper>
      <Heading text="Equifax US Consumer Credit Report" />
      {report && renderRules()}
    </Wrapper>
  );
};

export default CreaditReport;
