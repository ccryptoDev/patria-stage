/* eslint-disable no-shadow */
export enum UNDERWRITING_STATUS {
  RETTRY = "retry",
  FAILED = "failed",
  QUEUED = "queued",
}

export const underwritingMessage = (status: string) => {
  switch (status) {
    case "failed":
      return "FAILED";
    case "queued":
      return "Under Review";
    case "retry":
      return "Retry";
    default:
      return "PASSED";
  }
};

export const checkUnderwriting = (status: string) => {
  const state = {
    declined: false,
    success: true,
  };
  switch (status) {
    case "failed":
    case "queued":
      state.declined = true;
      break;
    default:
      state.success = true;
      break;
  }

  return state;
};
