type IFilter = {
  INCOMPLETE: string;
  REVIEW: string;
  DECLINED: string;
  APPROVED: string;
  FUNDED: string;
  LATE: string;
  PAID: string;
  CHARGEDOFF: string;
  UPCOMING: string;
  ALL: string;
};

// FILTER TAB NAMES
export const tFilter: IFilter = {
  INCOMPLETE: "Incomplete",
  REVIEW: "Manual Review",
  DECLINED: "Declined",
  APPROVED: "Approved",
  FUNDED: "Funded",
  LATE: "Late",
  PAID: "Paid",
  CHARGEDOFF: "Charged off",
  UPCOMING: "Upcoming",
  ALL: "All",
};

type IType = {
  MANAGE_USERS: string;
};

export const tType: IType = {
  MANAGE_USERS: "MANAGE_USERS",
};
