/* eslint-disable camelcase */
export type ITextField = {
  value: string;
  valid?: boolean;
  required?: boolean;
  message: string;
};

export type ITextFieldNumber = {
  value: number;
  valid?: boolean;
  required?: boolean;
  message: string;
};

export type IPoliciesForm = {
  policies: {
    value: boolean;
    valid: boolean;
    required: boolean;
    message: string;
  };
  additional: {
    value: boolean;
    valid: boolean;
    required: boolean;
    message: string;
  };
};

export type IAccountForm = {
  email: ITextField;
  password: ITextField;
};

export type IForgotPasswordForm = {
  email: ITextField;
  code: ITextField;
};

export type IRegisterForm = {
  email: ITextField;
  password: ITextField;
  repassword: ITextField;
};

export type IPersonalForm = {
  firstName: ITextField;
  lastName: ITextField;
  email: ITextField;
  password: ITextField;
  repassword: ITextField;
  dob: ITextField;
  phone: ITextField;
  street: ITextField;
  state: ITextField;
  city: ITextField;
  zipCode: ITextField;
  requestedAmount: ITextField;
  customTerm: ITextField;
  reason: ITextField;
  terms: { value: any; valid?: boolean; required: boolean; message: string };
  type: ITextField;
};

export type IEmploymentInfo = {
  userId: string;
  typeOfIncome: string;
  employerName: string;
  employerPhone?: string;
  employerStatus: string;
  payFrequency: string;
  nextPayDate: any;
  secondPayDate: any;
  lastPayDate: any;
  paymentBeforeAfterHolidayWeekend: number;
  monthlyIncome?: string;
  id: string;
};

export type IPersonalInfoForm = {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  dateOfBirth: string;
  // eslint-disable-next-line camelcase
  ssn_number: string | number;
  email: string;
  street: string;
  city: string;
  zipCode: string;
  state: string;
};

export type BorrowerDataType = {
  firstname?: string;
  lastname?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  ssn_number?: string;
  email?: string;
  userReference?: string;
  salt?: string;
  street: string | undefined;
  unitapt: string;
  isDeleted: boolean;
  flinksLoginId: string | null;
  isEmailVerified: boolean;
  previousCust: boolean;
  isMilitary: boolean;
  isPhoneVerified: boolean;
  isValidEmail: boolean;
  isValidState: boolean;
  registeredtype: string;
  isExistingLoan: boolean;
  isGovernmentIssued: boolean;
  isPayroll: boolean;
  isBankAdded: boolean;
  oldemaildata: Array<any>;
  underwriter: string;
  consentforUers: boolean;
  consentforAocr: boolean;
  peconsentforNtct: boolean;
  privacyPolicy: boolean;
  preQualificationScd: boolean;
  appversion: string;
  clicktosave: number;
  clickfilloutmanually: number;
  clickplaidconnected: number;
  createdAt: string;
  updatedAt: string;
  id: string;
};
