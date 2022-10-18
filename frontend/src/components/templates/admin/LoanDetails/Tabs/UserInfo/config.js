/* eslint no-underscore-dangle: 0 */
/* eslint camelcase: 0 */
import {
  formatDate,
  parsePaymentStatus,
} from "../../../../../../utils/formats";

export default ({
  city = "",
  dob_month = "--",
  loanReference = "--",
  dob_year = "--",
  dob_day = "--",
  email = "--",
  status = "--",
  updatedAt,
  firstName,
  lastName,
  phone = "--",
  createdAt,
  requestedAmount = "--",
  ssnNumber = "--",
  state = "--",
  street = "--",
  unitApt = "--",
  userReference = "--",
}) => [
  { label: "User Reference", value: userReference },
  { label: "Name", value: `${firstName} ${lastName}` },
  { label: "Email Address", value: email },
  { label: "Phone Number", value: phone },
  // eslint-disable-next-line
  { label: "Date of Birth", value: `${dob_month}/${dob_day}/${dob_year}` },
  { label: "Address", value: `${street}, ${unitApt}` },
  { label: "City", value: city },
  { label: "State", value: state },
  { label: "Social Security Number", value: ssnNumber },
  { label: "Registration Date", value: formatDate(createdAt) },
  { label: "Last Profile Updated Date", value: formatDate(updatedAt) },
  { label: "Anticipated Financed Amount", value: requestedAmount },
  { label: "Financing Reference Number", value: loanReference },
  { label: "Financing Status", value: parsePaymentStatus(status) },
];
