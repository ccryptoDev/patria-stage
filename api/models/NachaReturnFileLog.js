/* global sails */
module.exports = {
    attributes: {
        fileName: {
            type: "string"
        },
        parsedDate: {
            type: "Date"
        },
        returnContents: {
            type: "object"
        },
        wasParsed: {
          type: "boolean"
        }
    }
}
