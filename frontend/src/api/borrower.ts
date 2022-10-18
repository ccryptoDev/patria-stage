import axios from "axios";
import { getRequester } from "./requester";
import { BankCredential, DResponse, LoginType } from "./types";
import { baseUrl } from "../app.config";

export async function loginToBorrower(body: LoginType) {
  const response: DResponse = { data: null, error: null, ok: false };
  try {
    // const screenTrackingId = localStorage.getItem("screenTrackingId");
    const result = await axios.post(`${baseUrl}/borrower/login`, body);
    return { data: result.data, error: null, ok: true };
  } catch (error: any) {
    response.error = error?.response?.data?.error || error.message || error;
  }
  return response;
}

export async function getBorrowerData() {
  const response: DResponse = { data: null, error: null, ok: false };
  try {
    const borrowerToken = localStorage.getItem("borrowertoken");
    const result = await getRequester(borrowerToken).get(`${baseUrl}/borrower`);
    return { data: result?.data?.data, error: null, ok: true };
  } catch (error: any) {
    response.error = error?.response?.data?.error || error.message || error;
  }
  return response;
}

export async function getBorrowerAgreements(screenTrackingId: string) {
  const response: DResponse = { data: null, error: null, ok: false };
  try {
    const result = await getRequester().get(
      `${baseUrl}/borrower/${screenTrackingId}/agreements`
    );
    return { data: result?.data?.data, error: null, ok: true };
  } catch (error: any) {
    response.error = error?.response?.data?.error || error.message || error;
  }
  return response;
}
