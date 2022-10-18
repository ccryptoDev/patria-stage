export const userInfo = ({ firstName = "--", LastName = "--", MiddleName = "--", creditScore = "--", ssnNumber = "--" }) => [
  { label: "First Name", value: firstName },
  { label: "Last Name", value: LastName },
  { label: "Middle Name", value: MiddleName },
  { label: "Social Security Number", value: ssnNumber },
  { label: "Credit score	", value: creditScore },
];

export const tradeInfo = ({ ECOADesignator = "--", subscriber = {}, accountNumber = "--", accountRating = "--", currentBalance = "--", highCredit = "--", pastDue = "--", dateOpened, dateClosed, datePayedOut, portfolioType = "--", creditLimit = "--" }) => [
  { label: "Subscriber Industry Code", value: subscriber?.industryCode || "--" },
  { label: "Subscriber Member Code", value: subscriber?.memberCode || "--" },
  { label: "Subscriber Name", value: subscriber?.name?.unparsed || "--" },
  { label: "Portfolio Type", value: portfolioType },
  { label: "Account Number", value: accountNumber },
  { label: "ECOA Designator", value: ECOADesignator },
  { label: "Date Opened", value: dateOpened?._ || "--" },
  { label: "Date Closed", value: dateClosed?._ || "--" },
  { label: "Date Paid Out", value: datePayedOut?._ || "--" },
  { label: "Current Balance", value: currentBalance },
  { label: "High Credit", value: highCredit },
  { label: "Credit Limit", value: creditLimit },
  { label: "Account Rating", value: accountRating },
  { label: "Past Due", value: pastDue },
];

export const employmentInfo = ({ employer, occupation = "--", dateHired = "--", dateOnFileSince, dateEffective }) => [
  { label: "Employer", value: employer?.unparsed || "--" },
  { label: "Occupation", value: occupation },
  { label: "Date Hired", value: dateHired },
  { label: "Date On File Since", value: dateOnFileSince?._ || "--" },
  { label: "Date Effective", value: dateEffective?._ || "--" },
];
