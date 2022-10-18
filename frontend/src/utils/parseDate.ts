// parse input date in format 11122020 to format 11/12/2000
export const parseDate = (date: string) => {
  const newDate = date.replace("/", "").trim();
  const month = newDate.slice(0, 2);
  const day = newDate.slice(2, 4);
  const year = newDate.slice(4, 8);
  return `${month}/${day}/${year}`;
};
