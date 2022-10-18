export const status = {
  INCOMPLETE: "incomplete", // unfinished applications
  REVIEW: "review",
  APPROVED: "approved", // loans that have been approved
  DECLINED: "declined",
  FUNDED: "funded",
  UPCOMING: "upcoming", // A list of all loans that have payments due within 7 days
  LATE: "late", // A list of all loans that haven’t paid on time
  PAID: "paid", // A list of all loans that are completely paid off
  CHARGEDOFF: "chargedoff", // A list of loans that have been charged off due to failure to collect
};

export const statusAll = [
  status.INCOMPLETE,
  status.REVIEW,
  status.APPROVED,
  status.DECLINED,
  status.FUNDED,
  status.UPCOMING,
  status.LATE,
  status.PAID,
  status.CHARGEDOFF,
];
