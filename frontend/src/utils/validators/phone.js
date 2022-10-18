export const validatePhone = (value) => value.replace(/\D+/g, "").length < 10;
