const Q = require("q");
const uuid = require("node-uuid");
const md5 = require("md5");
// const shortid = require( "shortid" );
const moment = require("moment");
const bcrypt = require("bcrypt");
const parseAddress = require("parse-address");
const _ = require("lodash");
const { ErrorHandler, SendError } = require("../services/ErrorHandling");
const { onUserCreate } = require('../../auth-utils');

module.exports = {
  attributes: {
    uploaderRole: {
      model: "Roles"
    },
    user: {
      model: 'User'
    },
    uploaderName: {
      type: 'string'
    },
    uploaderId: {
      type: 'string'
    },
    driversLicense: {
      type: 'object'
    },
    passport: {
      type: 'string'
    },
  },

  createContext: async function (payload) {
    try {
      const data = await UserDocuments.create(payload);
      return data;
    } catch (error) {
      sails.log.error("ERROR::UserDocument:createContext", error)
      return null;
    }
  }
}