/**
 * AdminSettings.js
 * 
 * @description :: Keep a record of Nacha usernames and passwords used to submit ach payments.
 */

module.exports = {
    attributes: {
        setting: {
            type: "string"
        },
        nachaCredentials: {
            type: "object"
        }
    }
};