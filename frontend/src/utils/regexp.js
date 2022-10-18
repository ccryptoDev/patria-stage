export const emailRegexp =
  /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

// password regexp: Minimum 8 characters, at least 1 letter, 1 number and 1 special character
export const passwordRegexp =
  /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;

export const urlRegexp =
  /(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_+.~#?&//=]*)/g;

export const accountNumberRegexp = /^(\d{5,17})$/;

export const ssnRegexp =
  /^(?!000|666)[0-8][0-9]{2}(?!00)[0-9]{2}(?!0000)[0-9]{4}$/;

export const ssnLastFourRegexp = /^(?!0000)[0-9]{4}$/;

export const zipCodeRegexp = /(^\d{5}$)|(^\d{5}-\d{4}$)/;
