module.exports = {
  attributes: {
    revisionNumber: {
      type: "integer",
    },
    user: {
      model: "User"
    },
    isDeleted: {
      type: "boolean",
      defaultsTo: false
    },
    dateOfBirth: {
      type: "string"
    },
    isEmailVerified: {
      type: "boolean",
      defaultsTo: false
    },
    phoneNumber: {
      type: "string"
    },
    workphone: {
      type: "string"
    },
    email: {
      type: "string"
    },
    dateofBirth: {
      type: "string"
    },
    driversLicenseState: {
      type: "string"
    },
    driversLicenseNo: {
      type: "string"
    },
    previousCust: {
      type: "boolean",
      defaultsTo: "false"
    },
    name: {
      type: "string"
    },
    email: {
      type: "string"
    },
    primaryaddress: {
      type: "string"
    },
    isMilitary: {
      type: "boolean",
      defaultsTo: false
    },
    isDeleted: {
      type: "boolean",
      defaultsTo: false
    },
    isEmailVerified: {
      type: "boolean",
      defaultsTo: false
    },
    isPhoneVerified: {
      type: "boolean",
      defaultsTo: "false"
    },
    practicemanagement: {
      model: "PracticeManagement",
    },
    role: {
      model: "Roles"
    },
    roles: {
      collection: "Roles"
    },
    password: {
      type: "text"
    },
    salt: {
      type: "text"
    },
    isValidEmail: {
      type: "boolean",
      defaultsTo: false
    },
    isValidState: {
      type: "boolean",
      defaultsTo: false
    },
    userReference: {
      type: "string"
    },
    registeredtype: {
      type: "string",
      defaultsTo: "signup"
    },
    firstname: { type: "string" },
    middlename: { type: "string" },
    lastname: { type: "string" },
    generationCode: { type: "string" },
    street: { type: "string" },
    unitapt: { type: "string" },
    city: { type: "string" },
    state: { type: "string" },
    _state: { model: "State" },
    zipCode: { type: "string" },
    ssn_number: { type: "string" },
    isExistingLoan: {
      type: "boolean",
      defaultsTo: false
    },
    isGovernmentIssued: {
      type: "boolean",
      defaultsTo: true
    },
    isPayroll: {
      type: "boolean",
      defaultsTo: true
    },
    isBankAdded: {
      type: "boolean",
      defaultsTo: false
    },
    oldemaildata: {
      type: "array",
      defaultsTo: []
    },
    underwriter: {
      type: "string",
      defaultsTo: "user"
    },
    consentforUers: {
      type: "boolean",
      defaultsTo: false
    },
    consentforAocr: {
      type: "boolean",
      defaultsTo: false
    },
    peconsentforNtct: {
      type: "boolean",
      defaultsTo: false
    },
    privacyPolicy: {
      type: "boolean",
      defaultsTo: false
    },
    preQualificationScd: {
      type: "boolean",
      defaultsTo: false
    },
    notifiemail: {
      type: "string"
    },
    appversion: {
      type: "string",
      defaultsTo: sails.config.appManagement.appVersion
    },
    clicktosave: {
      type: "integer",
      defaultsTo: 0
    },
    clickfilloutmanually: {
      type: "integer",
      defaultsTo: 0
    },
    clickplaidconnected: {
      type: "integer",
      defaultsTo: 0
    },
    clickpagename: {
      type: "string"
    },
    mktCodes: {
      type: "string"
    },
    pdLoanRcvdFrom: {
      type: "string"
    },
    homeStatus: {
      type: "string"
    }
  },
  createNewRevision: async (userData) => {
    if(userData && !!userData.id) {
      const userId = userData.id;
      const latestRevisionUpdate = _.assign({}, userData,{id: null, user: userId});
        let latestRevision = await UserRevisionHistory.getLatestUserRevision(userId);
        if(latestRevision) {
          const revisionNumber = latestRevision.revisionNumber;
          latestRevisionUpdate["revisionNumber"] = revisionNumber + 1;
        }else {
          latestRevisionUpdate["revisionNumber"] = 1;
        }
      
        return UserRevisionHistory.create(latestRevisionUpdate);
    }
    return null;
  },
  getLatestUserRevision: async (userId) => {
    if(!!userId) {
      let latestUserRevision = await UserRevisionHistory.find({user: userId}).sort({revisionNumber: -1 }).limit(1);
      if(latestUserRevision && latestUserRevision.length > 0) {
        return latestUserRevision[0];
      }
    }
    return null;
  }
}
