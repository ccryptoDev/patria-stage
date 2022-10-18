// updated Patria types

export type userInfo = {
  firstName: string;
  lastName: string;
  phone: string;
  ssn: string;
  dob: any;
  email: string;
  password: string;
  requestedLoan?: string;
};

export type userEmployementInfo = {
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
  annualIncome?: number;
};

// old types

export type IPersonalInfoApi = {
  id?: string;
  addNewScreenTracking?: boolean;
  screenTrackingId?: string;
  city?: string;
  driversLicenseNumber?: string;
  driversLicenseState?: string;
  // eslint-disable-next-line
  dob_month?: any;
  // eslint-disable-next-line
  dob_day?: any;
  // eslint-disable-next-line
  dob_year?: any;
  dubration?: string;
  email?: string;
  firstName?: string;
  lastLevel?: string;
  lastName?: string;
  month?: string;
  middleName?: string;
  notApplication?: boolean;
  password?: string;
  phone?: string;
  state?: string;
  street?: string;
  requestedAmount?: string;
  reason?: string;
  ssnNumber?: string;
  unitApt?: string;
  zipCode?: string;
};

export type SetAccountProps = {
  requestedAmount: string;
  city: string;
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  phone: string;
  reason: string;
  state: string;
  street: string;
  unitApt: string;
  zipCode: string;
  // eslint-disable-next-line
  dob_month?: any;
  // eslint-disable-next-line
  dob_day?: any;
  // eslint-disable-next-line
  dob_year?: any;
};

export type IOffers = {
  term: string;
  interestRate: string;
  apr: number;
  regularPayment: string;
  financedAmount: boolean;
  id?: number;
};

export type IIncome = {
  userId: string;
  annualIncome: number;
  additionalIncome: number;
};

export type ISelectOffer = {
  screenTrackingId: string;
  term: number;
};

export type IResponse = {
  data: any;
  error: null | {
    message: string;
    underwritingStatus?: string;
    statusCode?: number;
  };
  ok?: boolean;
};

export type DResponse = {
  data?: any;
  error?: null | string;
  ok?: boolean;
  underwritingStatus?: string;
};

export type IArgylePayDistConf = {
  userId: string;
  amount: number;
  canChange?: boolean;
};

export type BankCredential = {
  bankName: string;
  username: string;
  password: string;
};

export type IUploadDocument = {
  file: any;
  userId: string;
  type: string; // passport, driver’s licence, etc
};

export type IBankAccount = {
  userId: string;
  accountNumber: number;
  name: string;
  routingNumber: number;
};

export type ManualBank = {
  bankName: string;
  accountHolder: string;
  routingNumber: string;
  accountNumber: string;
};

export type ICancelArgyle = {
  userId: string;
};

export type IAddUserEmployer = {
  userId: string;
  // eslint-disable-next-line
  base_pay: {
    amount: string;
    period: string;
    currency: string;
  };
  // eslint-disable-next-line
  pay_cycle: string;
  employer: string;
};

// ************** Borrower ************
export type LoginType = {
  email: string;
  password: string;
};
