import { toast } from "react-toastify";

export const successHandler = (message = "") => {
  if (message.length) {
    toast.success(message);
  }
  return true;
};
