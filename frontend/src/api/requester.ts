import axios from "axios";
import { baseUrl } from "../app.config";

export const getJWT = () => localStorage.getItem("userToken");

// Using a function to treat the JWT as a computed property to make sure the localStorage lookup happens per request
export function getRequester(borrowerToken?: string | null) {
  const JWT = borrowerToken || getJWT();
  if (!JWT) throw new Error("you are not authorized.");

  const Authorization = `Bearer ${JWT}`;

  return axios.create({
    baseURL: baseUrl,
    headers: { Authorization },
  });
}

export const isAuthenticated = () => {
  const JWT = getJWT();
  if (JWT) {
    return true;
  }
  return null;
};
