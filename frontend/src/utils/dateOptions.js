export const months = [
  { value: "01", id: "1", text: "January" },
  { value: "02", id: "2", text: "February" },
  { value: "03", id: "3", text: "March" },
  { value: "04", id: "4", text: "April" },
  { value: "05", id: "5", text: "May" },
  { value: "06", id: "6", text: "June" },
  { value: "07", id: "7", text: "July" },
  { value: "08", id: "8", text: "August" },
  { value: "09", id: "9", text: "September" },
  { value: "10", id: "10", text: "October" },
  { value: "11", id: "11", text: "November" },
  { value: "12", id: "12", text: "December" },
];

export const days = () => {
  const daysArray = [];
  for (let i = 1; i <= 31; i++) {
    let val = String(i);
    if (i < 10) {
      val = `0${val}`;
    }
    daysArray.push({ value: val, id: val, text: val });
  }
  return daysArray;
};

export const years = () => {
  const yearsArray = [];
  const currentYear = new Date().getFullYear();
  for (let i = currentYear - 18; i >= currentYear - 100; i--) {
    const val = String(i);
    yearsArray.push({ value: val, id: val, text: val });
  }
  return yearsArray;
};
