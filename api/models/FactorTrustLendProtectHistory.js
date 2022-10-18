/* global sails */
"use strict";
const _ = require("lodash");

const callTypes = {
    PULL_CREDIT: "PULL_CREDIT",
    REPORT_CREDIT: "REPORT_CREDIT"
}

module.exports = {
    attributes: {
        user: {
            model: "User"
        },
        factorTrustLendProtect: {
            type: "FactorTrustLendProtect"
        },
        request: {
            type: "json",
            defaultsTo: {}
        },
        response: {
            type: "json",
            defaultsTo: {}
        },
        type: {
            type: "string",
            enum: Object.values(callTypes)
        }
    },
    callTypeEnum: callTypes,
    updateOrCreateCreditPullHistory: async (historyObj, id = null) => {
        if(historyObj && _.isObject(historyObj)) {
            historyObj["type"] = callTypes.PULL_CREDIT;
        }
        return updateFactorTrustLendProtectHistory(historyObj,id);
    },
    updateOrCreateReportCreditHistory: async (historyObj, id = null) => {
        if(historyObj && _.isObject(historyObj)) {
            historyObj["type"] = callTypes.REPORT_CREDIT;
        }
        return updateFactorTrustLendProtectHistory(historyObj,id);
    }
};

async function updateFactorTrustLendProtectHistory (historyObj, id = null) {
    if(!historyObj || !historyObj.type || !callTypes[historyObj.type]) {
        throw new Error("Unable to update lend protect history. Missing data and/or call type.")
    }
        if(id) {
            const updated = await FactorTrustLendProtectHistory.update({id: id}, historyObj);
            if(updated && updated.length > 0) {
                return updated[0];
            }
        }else {
            return FactorTrustLendProtectHistory.create(historyObj);
        }
}
