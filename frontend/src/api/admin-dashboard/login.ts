import axios from "axios";
import { baseUrl, adminBaseUrl } from "../../app.config";
import { getRequester } from "./requester";
import { IResponse2 } from "./types";
// LOGIN API
export const adminLogin = async (credentials: {
  email: string;
  password: string;
}) => {
  let result = {};
  try {
    const { data, status } = await axios.post(`${adminBaseUrl}/admin/signin`, {
      email: credentials?.email,
      password: credentials?.password,
    });

    if (status !== 200) {
      throw new Error("Something went wrong, please try again later");
    }
    result = data;
    if (data && data.adminToken) {
      const { role, adminToken } = data;
      localStorage.setItem("adminToken", adminToken);
    }
  } catch (error: any) {
    if (error.message.includes("401")) {
      return { error: { message: "Incorrect email or password" } };
    }

    return { error: { message: "server error" } };
  }

  return result;
};

// LOGOUT FUNCTION
export const logout = (fetchUser: Function): void => {
  localStorage.removeItem("adminToken");
  if (localStorage.getItem("adminToken")) {
    window.location.reload();
  }
  if (typeof fetchUser === "function") {
    fetchUser();
  }
};

export const getApplicationStatusCount = async () => {
  const result: IResponse2 = { ok: false, data: null, error: null };
  try {
    const response = await getRequester().get(
      `${adminBaseUrl}/application/applications-status`
    );
    console.log("firsssst", response);
    result.ok = true;
    result.data = response?.data?.data;
    return result;
  } catch (error: any) {
    result.error = error?.message;
    return result;
  }
};
