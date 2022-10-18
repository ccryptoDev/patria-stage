import React from "react";
import CurrencyFormat from "react-currency-format";
import moment from "moment";

export const dateFormat = "M/D/YYYY";

export const formatCurrency = (value: number | string) =>
  value ? (
    <CurrencyFormat
      value={value}
      displayType="text"
      thousandSeparator
      prefix="$"
      decimalScale={2}
      fixedDecimalScale
    />
  ) : (
    <>--</>
  );
// format date in Date format, in "12/12/2000" format or in seconds format to M/D/YYYY
export const formatDate = (value: string | number | null | Date) =>
  value ? moment(value).utc().format(dateFormat) : "--";

export const dateCheck = (value: any) => {
  if (value instanceof Date) {
    return moment(value).format("M/D/YYYY");
  }
  return value;
};

export const formatPhoneNumber = (phoneNumber: string) => {
  if (typeof phoneNumber === "string") {
    return (
      <CurrencyFormat
        value={phoneNumber}
        displayType="text"
        format="+1 (###) ### ####"
      />
    );
  }
  return phoneNumber;
};

export const dobParser = (year: string, month: string, day: string) => {
  const date = new Date(`${year}/${month}/${day}`);
  return date;
};

export const parsePaymentStatus = (status: string) => {
  let color;
  switch (status) {
    case "paid":
      color = "#2ecc71";
      break;
    case "opened":
      color = "#3498db";
      break;
    case "late":
      color = "#e74c3c";
      break;
    default:
      color = "#3498db";
  }
  return <span style={{ color }}>{status}</span>;
};

export const month = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
export const mo = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export const getDayNumeral = (date: any) => {
  const day = new Date(date).getUTCDate().toString();
  switch (day[0]) {
    case "1":
      return `${day}st`;
    case "2":
      return `${day}nd`;
    case "3":
      return `${day}rd`;
    default:
      return `${day}th`;
  }
};

export const getMonthNumeral = (number: number | string) => {
  if (number === 1) {
    return `${number} month`;
  }
  return `${number} months`;
};
