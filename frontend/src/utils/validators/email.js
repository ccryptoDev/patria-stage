import { emailRegexp } from "../regexp";

export const validateEmail = (email) =>
  emailRegexp.test(String(email).toLowerCase());
