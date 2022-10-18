module.exports.leadApiConfig = {
  leadConfig: getLeadApiConfig()
};
function getLeadApiConfig() {
  const config = {
    blockListId: "60dcdaf0d988c247cb075bfb",
    checkBlockList: true,
    enabled:true,
    minimumAge: 20,
    maximumAge: 64,
    minimumIncome: 1200,
    minimumBankAccountNumber: 5,
    maximumBankAccountNumber: 15,
    maxLoanAmountForMonthlyIncomePercent: 30,
    validatePhoneNumberMatching: true,
    addressRegex: /^(?!.*(?:(.*((p|post)[-.\s]*(o|off|office)[-.\s]*(box|bin)[-.\s]*)|.*((p |post)[-.\s]*(box|bin)[-.\s]*)))).*$/ig,
    statesNotAllowed:[
      "AZ",
    "AR",
    "CA",
    "CO",
    "GA",
    "ID",
    "IL",
    "MD",
    "MA",
    "MI",
    "MN",
    "MT",
    "NJ",
    "NY",
    "NC",
    "OH",
    "OR",
    "PA",
    "SC",
    "VT",
    "VA",
    "WA",
    "WV",
    "WI",
    "WY",
    ]
  }
  return config
}
