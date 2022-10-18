import moment from "moment";
import { pageName } from "../routes/Application/routes";

export const expiryParser = (date) => {
  let toReturn = "expired";
  const createdDate = moment(date);
  const currentTime = moment();
  const expiryDate = createdDate.clone().add(2, "days");
  if (currentTime.isBefore(expiryDate)) {
    const timeLeft = moment.duration(expiryDate.diff(currentTime));
    const hoursLeft = timeLeft.hours();
    const minutesLeft = timeLeft.minutes();
    const secondsLeft = timeLeft.seconds();
    if (hoursLeft) toReturn = `${hoursLeft} hour${hoursLeft > 1 ? "s" : ""}`;
    else if (minutesLeft)
      toReturn = `${minutesLeft} min${minutesLeft > 1 ? "s" : ""}`;
    else if (secondsLeft)
      toReturn = `${secondsLeft} sec${secondsLeft > 1 ? "s" : ""}`;
  }
  return toReturn;
};

export const defaultDateFormat = "MM/DD/YYYY";
export const defaultValue = "--";

// create a combined status query based on the provided status
export const statusReducer = (status) => {
  switch (status) {
    case pageName.EMPLOYMENT:
      return "Employment";
    case pageName.SSN:
      return "SSN";
    case pageName.DECLINED:
      return "Declined";
    case pageName.OFFERS:
    case pageName.OFFERS_SALARY:
      return "Offers";
    case pageName.CONTRACT:
      return "Contract";
    case pageName.BANK:
      return "Bank";
    case pageName.PAYROLLDIST:
      return "Payroll Distribution";
    case pageName.BORROWER_PORTAL:
    case "repayment":
      return "Repayment";
    default:
      return status;
  }
};
