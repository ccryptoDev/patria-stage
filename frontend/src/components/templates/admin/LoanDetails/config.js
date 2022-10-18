export const types = {
  ACCOUNTS: "ACCOUNTS",
  EMPLOYMENT: "EMPLOYMENT",
  CREDIT_REPORT: "CREDIT_REPORT",
  DOCUMENT_CENTER: "DOCUMENT_CENTER",
  PAYMENT_SCHEDULE: "PAYMENT_SCHEDULE",
  REULES_DETAILS: "REULES_DETAILS",
  USER_INFO: "USER_INFO",
  COMMENTS: "COMMENTS",
};

export const buttons = [
  { name: "User Info", type: types.USER_INFO, style: { minWidth: "9.5rem" } },
  { name: "Document Center", type: types.DOCUMENT_CENTER },
  { name: "Payment Schedule", type: types.PAYMENT_SCHEDULE },
  { name: "Accounts", type: types.ACCOUNTS },
  { name: "Argyle", type: types.EMPLOYMENT },
  { name: "Credit Report", type: types.CREDIT_REPORT },
  { name: "Rules Details", type: types.REULES_DETAILS },
  { name: "Comments", type: types.COMMENTS },
];
