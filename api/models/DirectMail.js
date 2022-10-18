/* global sails, DirectMail */

module.exports = {
  attributes: {
    first_name: { type: "string" },
    middle_initial: { type: "string" },
    last_name: { type: "string" },
    suffix: { type: "string" },
    street_address: { type: "string" },
    city: { type: "string" },
    state: { type: "string" },
    zip_code: { type: "string" },
    ZIP4: { type: "string" },
    CID: { type: "string" },
    MLA_DOB: { type: "date" },
    SSN_Masked: { type: "string" },
    SEQUENCE_NUMBER: { type: "integer" },
    loan_amount: { type: "integer" },
    Store_Num: { type: "string" },
    Branch: { type: "string" },
    Company: { type: "string" },
    branch_address: { type: "string" },
    branch_city: { type: "string" },
    branch_state: { type: "string" },
    branch_zip: { type: "string" },
    branch_phone: { type: "string" },
    branch_district: { type: "string" },
    branch_region: { type: "string" },
    expires: { type: "date" }
  },
};