/**
 * IDologyResponse.js
 */
"use strict";

module.exports = {
    attributes: {
        user: {
            model: "User",
            required: true
        },
        data: {
            type: 'json'
        }
    },
    saveIDologyResponse: saveResponse
};

async function saveResponse(userId, responseObj, requestObj) {
    let entry = {
        user: userId,
        response: responseObj
    };
    _.assign(entry, requestObj || {});
    await IDologyResponse.create(entry);
}
