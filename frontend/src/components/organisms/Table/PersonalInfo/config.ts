/* eslint no-underscore-dangle: 0 */
/* eslint camelcase: 0 */
import moment from "moment";
import TextField from "../../../molecules/Form/Fields/TextField";
import DatePicker from "../../../molecules/Form/Fields/DatePicker/MaterialUI-DoB";
import FormattedInput from "../../../molecules/Form/Fields/FormattedField";
import { dobParser } from "../../../../utils/formats";

type IFormInit = {
  firstName: string;
  lastName: string;
  dob: string;
  phone: string;
  street: string;
  unitApt: string;
  state: string;
  city: string;
  zipCode: string;
  email?: string;
  dob_year: string;
  dob_month: string;
  dob_day: string;
  ssnNumber: string;
};

export const initForm = ({
  firstName,
  lastName,
  ssnNumber,
  dob_year = "",
  dob_month = "",
  dob_day = "",
  phone,
  street,
  email,
  state,
  city,
  zipCode,
  unitApt,
}: IFormInit) => {
  const dateOfBirth = dobParser(dob_year, dob_month, dob_day);
  return {
    firstName: {
      value: firstName || "",
      valid: false,
      required: true,
      message: "",
    },
    lastName: {
      value: lastName || "",
      valid: false,
      required: true,
      message: "",
    },
    // eslint-disable-next-line
    dob: {
      value: moment(dateOfBirth, "MM/DD/YY", true).isValid()
        ? dateOfBirth
        : null,
      valid: false,
      required: true,
      message: "",
    },
    phone: { value: phone || "", valid: false, required: true, message: "" },
    street: { value: street || "", valid: false, required: true, message: "" },
    state: { value: state || "", valid: false, required: true, message: "" },
    city: { value: city || "", valid: false, required: true, message: "" },
    zipCode: {
      value: zipCode || "",
      valid: false,
      required: true,
      message: "",
    },
    email: { value: email || "", valid: false, required: true, message: "" },
    unitApt: {
      value: unitApt || "",
      valid: false,
      required: false,
      message: "",
    },
    ssnNumber: {
      value: ssnNumber || "",
      valid: false,
      required: true,
      message: "",
    },
  };
};

export type ITextField = {
  value: string;
  valid?: boolean;
  required?: boolean;
  message?: string;
};

export type IPersonalForm = {
  firstName: ITextField;
  lastName: ITextField;
  email?: ITextField;
  dob: { value: any; valid: boolean; required: boolean; message: string };
  phone: ITextField;
  street: ITextField;
  state: ITextField;
  city: ITextField;
  zipCode: ITextField;
  ssnNumber?: ITextField;
  unitApt: ITextField;
};

export const renderFormFields = (form: IPersonalForm) => [
  {
    value: form?.firstName?.value,
    name: "firstName",
    placeholder: "Enter First Name",
    message: form.firstName?.message || "",
    component: TextField,
    label: "First Name",
  },
  {
    value: form?.lastName?.value,
    name: "lastName",
    placeholder: "Enter last name",
    message: form?.lastName?.message || "",
    component: TextField,
    valid: form?.lastName?.valid,
    label: "Last Name",
  },
  {
    value: form?.email?.value,
    name: "email",
    placeholder: "enter your email",
    message: form?.email?.message || "",
    component: TextField,
    valid: form?.email?.valid,
    label: "Email",
  },
  {
    value: form?.street?.value,
    name: "street",
    placeholder: "Street",
    message: form?.street?.message || "",
    component: TextField,
    valid: form?.street?.valid,
    label: "Street",
  },
  {
    value: form?.unitApt?.value,
    name: "unitApt",
    placeholder: "unit/apt",
    message: form?.unitApt?.message || "",
    component: TextField,
    valid: form?.unitApt?.valid,
    label: "unitApt",
  },

  {
    value: form?.state?.value,
    name: "state",
    placeholder: "State",
    message: form?.state?.message || "",
    component: TextField,
    valid: form?.state?.valid,
    label: "State",
  },
  {
    value: form?.city?.value,
    name: "city",
    placeholder: "City",
    message: form?.city?.message || "",
    component: TextField,
    valid: form?.city?.valid,
    label: "City",
  },

  {
    value: form?.zipCode?.value,
    name: "zipCode",
    placeholder: "zip",
    message: form?.zipCode?.message || "",
    component: TextField,
    valid: form?.zipCode?.valid,
    label: "Zip Code",
  },
  {
    value: form?.dob?.value,
    name: "dob",
    placeholder: "mm/dd/yyyy",
    message: form.dob?.message || "",
    component: DatePicker,
    valid: form.dob?.valid,
    label: "Date of birth",
  },
  {
    value: form?.phone?.value,
    name: "phone",
    placeholder: "+1 (***) *** ****",
    message: form?.phone?.message || "",
    component: FormattedInput,
    valid: form?.phone?.valid,
    label: "Phone Number",
    format: "+1 (###) ### ####",
  },
  {
    value: form?.ssnNumber?.value,
    name: "ssnNumber",
    placeholder: "####",
    message: form?.ssnNumber?.message || "",
    component: FormattedInput,
    valid: form?.ssnNumber?.valid || false,
    label: "Socia Security Number",
    format: "####",
    mask: "_",
  },
];
