import PersonalInfo from "./Steps/PersonalInformation";
import EmploymentrInfo from "./Steps/EmploymentInfo";
import Offer from "./Steps/Offer";
import ConnectBank from "./Steps/ConnectBank";
import ReviewApplication from "./Steps/ReviewApplication";
import Contract from "./Steps/Contract";
import clipboard from "../../../../assets/svgs/Steps/clipboard.svg";
import LastStep from "./Steps/LastStep";
import board from "../../../../assets/svgs/Steps/board.svg";
import card from "../../../../assets/svgs/Steps/card.svg";
import star from "../../../../assets/svgs/Steps/star.svg";
import check from "../../../../assets/svgs/Steps/check.svg";
import pen from "../../../../assets/svgs/Steps/pen.svg";
import data from "../../../../assets/svgs/Steps/data.svg";
import PaymentMethod from "./Steps/PaymentMethods";

export const steps = () => [
  {
    number: 1,
    name: "Personal Information",
    active: false,
    completed: false,
    component: PersonalInfo,
    icon: clipboard,
    editing: false,
  },
  {
    number: 2,
    name: "Employment Information",
    active: false,
    completed: false,
    component: EmploymentrInfo,
    icon: data,
    editing: false,
  },
  {
    number: 3,
    name: "Conditionally Approved!",
    active: false,
    completed: false,
    component: Offer,
    icon: star,
  },
  {
    number: 4,
    name: "Checking Account Verification",
    active: false,
    completed: false,
    component: ConnectBank,
    icon: card,
  },
  {
    number: 5,
    name: "Review Your Application",
    active: false,
    completed: false,
    component: ReviewApplication,
    icon: board,
  },
  {
    number: 6,
    name: "Sign Your Loan Documents",
    active: false,
    completed: false,
    component: Contract,
    icon: pen,
  },
  {
    number: 7,
    name: "Select Funding Method",
    active: false,
    completed: false,
    component: PaymentMethod,
    icon: card,
  },
  {
    number: 8,
    name: "Thank you",
    active: false,
    completed: false,
    component: LastStep,
    icon: check,
  },
];
