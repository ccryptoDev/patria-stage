export interface TablePaginationEvent {
  page: number;
  skip: number;
  perPage: number;
  isReset: boolean;
}

export interface TableNavigationEvent {
  status: string;
}
export interface TableSearchEvent {
  query: string;
}

export interface TableRequestEvent {
  status: string;
  page: number;
  perPage: number;
  search?: string; //query search string
  source?: string;
  isAgent?: boolean; // if it is an agent or admin
}

export interface IResponse {
  data: null | {
    items?: [];
    total?: number;
    rows?: [];
    totalRows?: number;
  };
  error: null | {
    message: string;
  };
}

export type IBankAccount = {
  userId: string;
  accountNumber: number;
  name: string;
  routingNumber: number;
};

export type IMakePayment = {
  amount: number;
  screenTrackingId: string;
};

export type IUploadDocument = {
  file: any;
  userId: string;
  type: string; // passport, driver’s licence, etc
};

export type IMessageProps = {
  to: string; // screenTracking id
  from: string; // damin id
  content: { subject: string; comment: string };
  createdBy: string;
  createdAt?: any;
};

export type IResponse2 = {
  data?: any;
  msg?: string;
  error?: any;
  ok?: boolean;
};
