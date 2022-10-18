import { toast } from "react-toastify";

export const errorHandler = (result) => {
  if (result && result?.error) {
    const errorMessage = result?.error?.message || result?.error;
    if (errorMessage) {
      toast.error(errorMessage);
      return false;
    }
  }
  return true;
};
