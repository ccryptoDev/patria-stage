/* eslint no-underscore-dangle: 0 */
/* eslint camelcase: 0 */
import moment from "moment";
import { dateFormat } from "../../../../../../utils/formats";

export const pay = ({ amount, period, currency }) => [
  { label: "Amount", value: amount || "--" },
  { label: "Period", value: period || "--" },
  { label: "Currency", value: currency || "--" },
];

export const fields = ({
  status,
  type,
  job_title: jobTitle,
  hire_datetime: hireDatetime,
  pay_cycle: payCycle,
  termination_datetime: terminationDatetime,
  employer,
}) => [
  { label: "status", value: status || "--" },
  { label: "type", value: type || "--" },
  { label: "Job Title", value: jobTitle || "--" },
  { label: "Hire date", value: hireDatetime || "--" },
  { label: "Termination date", value: terminationDatetime || "--" },
  { label: "employer", value: employer || "--" },
  { label: "Pay Cycle", value: payCycle || "--" },
];

// eslint-disable-next-line
export const profile = ({
  account = "--",
  address,
  birth_date,
  created_at,
  email,
  employer,
  employment_status,
  employment_type,
  full_name,
  gender,
  hire_dates,
  job_title,
  marital_status,
  phone_number,
  ssn,
  terminations,
}) => [
  // eslint-disable-next-line
  { label: "Name", value: full_name || "--" },
  // eslint-disable-next-line
  { label: "Gender", value: gender || "--" },
  // eslint-disable-next-line
  { label: "Marital Status", value: marital_status || "--" },
  // eslint-disable-next-line
  { label: "Phone Number", value: phone_number || "--" },
  { label: "SSN", value: ssn || "--" },
  { label: "Account", value: account || "--" },
  // { label: "Address", value: address || "--" },
  // eslint-disable-next-line
  // { label: "Birth Date", value: birth_date || "--" },
  // eslint-disable-next-line
  { label: "Created at", value: moment(created_at).format(dateFormat) || "--" },
  { label: "Email", value: email || "--" },
  { label: "employer", value: employer || "--" },
  // eslint-disable-next-line
  { label: "Employment Status", value: employment_status || "--" },
  // eslint-disable-next-line
  { label: "Employment Type", value: employment_type || "--" },
  // eslint-disable-next-line
  { label: "Job Title", value: job_title || "--" },
  // eslint-disable-next-line
  { label: "hire_dates", value: moment(hire_dates).format(dateFormat) || "--" },
];

// account: "017ad436-d2ae-e793-31a9-23a9e2cfc3f2"
// address: {city: "New York", line1: "759 Victoria Plaza", line2: null, state: "NY", country: "US", …}
// birth_date: "1980-10-10"
// created_at: "2021-07-23T16:33:21.653458Z"
// email: "test1@argyle.io"
// employer: "amazon"
// employment_status: "active"
// employment_type: "part-time"
// first_name: "Bob"
// full_name: "Bob Jones"
// gender: "Male"
// hire_dates: ["2014-07-16T13:55:18Z"]
// id: "017ad436-d6f5-8ae9-4d58-7b66881e9316"
// job_title: "1635 - Helpline Agent"
// last_name: "Jones"
// marital_status: "Married filing jointly"
// phone_number: "+18009000001"
// picture_url: "https://res.cloudinary.com/argyle-media/image/upload/c_lfill,w_auto,g_auto,q_auto,dpr_auto,f_auto/v1566809938/bob-portrait.png"
// platform_user_id: "BQ45AKKGWU7QZEAG"
// ssn: "522-09-1191"
// terminations: []
// updated_at: "2021-07-23T16:33:21.653492Z"
