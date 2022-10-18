import moment from "moment";
import TextField from "../../../../../molecules/Form/Fields/TextField";
import FormattedField from "../../../../../molecules/Form/Fields/FormattedField";
import Select from "../../../../../molecules/Form/Fields/Select/Default";
import { parseDate } from "../../../../../../utils/parseDate";
import {
  incomeTypeOptions,
  employerStatusOptions,
} from "../../../../../../utils/select-options";

export const initForm = ({
  annualIncome = "",
  typeOfIncome = "",
  employerName = "",
  employerPhone = "",
  residencePhone = "",
  employerStatus = "",
}) => {
  return {
    typeOfIncome: { value: typeOfIncome || "", message: "" },
    employerName: { value: employerName || "", message: "" },
    employerPhone: { value: employerPhone || "", message: "" },
    residencePhone: { value: residencePhone || "", message: "" },
    annualIncome: { value: annualIncome || "", message: "" },
    employerStatus: { value: employerStatus || "", message: "" },
  };
};

export const renderFields = (form) => [
  {
    value: form.typeOfIncome.value,
    name: "typeOfIncome",
    component: Select,
    options: incomeTypeOptions,
    placeholder: "Income Type",
    message: form.typeOfIncome.message,
  },
  {
    value: form.annualIncome.value,
    name: "annualIncome",
    component: FormattedField,
    placeholder: "Annual Income",
    thousandSeparator: true,
    prefix: "$",
    message: form.annualIncome.message,
  },
  {
    value: form.employerName.value,
    name: "employerName",
    component: TextField,
    placeholder: "Employer Name",
    message: form.employerName.message,
  },
  {
    value: form.employerPhone.value,
    name: "employerPhone",
    component: FormattedField,
    placeholder: "Work Phone",
    mask: "_",
    format: "+1 (###) ### ####",
    message: form.employerPhone.message,
  },
  {
    value: form.residencePhone.value,
    name: "residencePhone",
    component: FormattedField,
    placeholder: "Residence Phone (Optional)",
    mask: "_",
    format: "+1 (###) ### ####",
    message: form.residencePhone.message,
  },
  {
    value: form.employerStatus.value,
    name: "employerStatus",
    component: Select,
    options: employerStatusOptions,
    placeholder: "Employment Status",
    message: form.employerStatus.message,
  },
];

const isDateValid = (date) => {
  return moment(parseDate(date)).isValid();
};

export const validateForm = (form) => {
  const newForm = { ...form };
  let isValid = true;
  Object.keys(newForm).forEach((key) => {
    if (
      key === "employerPhone" &&
      newForm.employerPhone.value.replace("_", "").trim().length !== 10
    ) {
      isValid = false;
      newForm.employerPhone.message = "enter a valid phone number";
    } else if (
      key === "residencePhone" &&
      newForm.residencePhone.value &&
      newForm.residencePhone.value.replace("_", "").trim().length !== 10
    ) {
      isValid = false;
      newForm.residencePhone.message = "enter a valid phone number";
    } else if (
      key === "lastPayDate" &&
      !isDateValid(newForm.lastPayDate.value)
    ) {
      newForm.lastPayDate.message = "enter a valid date";
      isValid = false;
    } else if (
      key === "nextPayDate" &&
      !isDateValid(newForm.nextPayDate.value)
    ) {
      newForm.nextPayDate.message = "enter a valid date";
      isValid = false;
    } else if (
      key === "secondPayDate" &&
      !isDateValid(newForm.secondPayDate.value)
    ) {
      newForm.secondPayDate.message = "enter a valid date";
      isValid = false;
    } else if (
      key !== "residencePhone" &&
      newForm[key].value.trim().length < 1
    ) {
      newForm[key].message = "This field is required";
      isValid = false;
    }
  });
  return [isValid, newForm];
};
