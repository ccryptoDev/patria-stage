/**
 * Transunion.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

"use strict";

const _ = require("lodash");

const validTypes = new Set(["factorTrust", "clarity"]);

module.exports = {
  attributes: {
    user: {
      model: "User",
    },
    response: {
      type: "json",
      defaultsTo: {},
    },
    firstName: {
      type: "string",
      defaultsTo: "",
    },
    middleName: {
      type: "string",
      defaultsTo: "",
    },
    lastName: {
      type: "string",
      defaultsTo: "",
    },
    houseNumber: {
      type: "array",
      defaultsTo: [],
    },
    socialSecurity: {
      type: "string",
      defaultsTo: "",
    },
    employment: {
      type: "array",
      defaultsTo: [],
    },
    trade: {
      type: "array",
      defaultsTo: [],
    },
    creditCollection: {
      type: "json",
      defaultsTo: {},
    },
    inquiry: {
      type: "array",
      defaultsTo: [],
    },
    addOnProduct: {
      type: "json",
      defaultsTo: {},
    },
    score: {
      type: "string",
      defaultsTo: "",
    },
    status: {
      type: "integer",
      defaultsTo: 0,
    },
    isNoHit: {
      type: "boolean",
      defaultsTo: false,
    },
    publicRecord: {
      type: "json",
      defaultsTo: {},
    }
  },

  callTransUnionApi,
  storeTransunion,
};

function callTransUnionApi(userDetail) {
  return Promise.reject("Removed method");
}

function validateType(type) {
  if (!validTypes.has(type)) {
    throw new Error(`Invalid type: ${type}`);
  }
}

function getParser(type) {
  validateType(type);

  const config = {
    factorTrust: parseFromFactorTrust,
    clarity: parseFromClarity,
  };

  return {
    parse: config[type],
  };
}

function storeTransunion(responseObject, type = "") {
  const payload = getParser(type).parse(responseObject);
  // console.log({ payload  });
  return Transunions.create(payload);
}

function parseFromFactorTrust(factorTrustResponse) {
  const { user: userId, raw: responseObject } = factorTrustResponse;

  // const factors = Object.entries(
  //   responseObject?.ChexAdvisor?.Score || {}
  // ).filter(([key, value]) => {
  //   return key.startsWith("ReasonCode") && value.length > 0;
  // });

  const scoreData = responseObject?.TransactionInfo?.Scores?.ScoreDetail;
  const scores = Array.isArray(scoreData) ? scoreData : [scoreData];

  const factors = scores
    .filter((score) => !_.isEmpty(score?.AdverseActions))
    .map((score) => {
      return {
        rank: score?.AdverseActions?.AdverseAction?.Sequence,
        code: score?.AdverseActions?.AdverseAction?.Code,
        reason: score?.AdverseActions?.AdverseAction?.Description,
      };
    });

  return {
    addOnProduct: [
      {
        scoreModel: {
          score: {
            results: responseObject?.ChexAdvisor?.Score?.Value,
            derogatoryAlert: !!factors.length,
            factors,
          },
        },
      },
    ],
    // creditCollection: {
    //   addon: "product",
    // },
    employment: [
      {
        employer: {
          phoneNumber: responseObject?.ChexAdvisor?.Consumer?.WorkPhone,
        },
      },
    ],
    firstName: responseObject?.ChexAdvisor?.Consumer?.Name?.FirstName,
    houseNumber: [
      {
        status: "current",
        qualifier: "personal",
        street: responseObject?.ChexAdvisor?.Consumer?.Address?.StreetAddress,
        city: responseObject?.ChexAdvisor?.Consumer?.Address?.City,
        state: responseObject?.ChexAdvisor?.Consumer?.Address?.State,
        zipCode: responseObject?.ChexAdvisor?.Consumer?.Address?.Zip,
      },
    ],
    inquiry: [{ number: "2" }],
    isNoHit: true,
    lastName: responseObject?.ChexAdvisor?.Consumer?.Name?.LastName,
    middleName: responseObject?.ChexAdvisor?.Consumer?.Name?.MiddleInit,
    publicRecord: [{ number: "whatever" }],
    score: responseObject.TransactionInfo?.Scores?.ScoreDetail?.Score,
    socialSecurity: responseObject?.ChexAdvisor?.Consumer?.SSN?.Value,
    status: 0,
    user: userId,
  };
}

function parseFromClarity(userId, clarityResponse) {
  throw "not implemented";
}
