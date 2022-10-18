import baseUrl from "../app.config";
import { getRequester } from "./requester";
import { IResponse } from "./types";

export async function getApplicationsCount() {
  let response: IResponse = { data: null, error: null };
  try {
    response = await getRequester().get(
      `${baseUrl}/application/contractStateCounts`
    );
  } catch (error) {
    response.error = error;
  }
  return response;
}
