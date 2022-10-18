import { RegisterBorrowerAccout } from "../../../api/authorization";

function parseDob(dob) {
  // dob format = 112121999
  const day = dob.slice(0, 2);
  const month = dob.slice(2, 4);
  const year = dob.slice(4);
  return { month, day, year };
}

export const parseUserDataForm = ({ form, setForm }) => {
  setForm(form);
  const parsedForm = {};
  // 1. PARSE DOB FROM INPUT FORMAT TO REQUEST FORMAL
  const parsedDob = parseDob(form.dob.value);
  // 2. EXTRACT FORM VALUES
  Object.keys(form).forEach((field) => {
    if (field === "dob") {
      parsedForm.dob_day = parsedDob.day;
      parsedForm.dob_month = parsedDob.month;
      parsedForm.dob_year = parsedDob.year;
    } else parsedForm[field] = form[field].value;
  });
  // 3. REMOVE UNNECCESSARY FORM FIELDS
  delete parsedForm.dob;
  delete parsedForm.terms;
  delete parsedForm.repassword;

  // 4. RETURN PARSED FORM
  return parsedForm;
};

export const registerUser = async ({ form, setError, fetchUser }) => {
  const result = await RegisterBorrowerAccout({
    ...form,
    lastLevel: "employment",
    addNewScreenTracking: true,
  });
  if (result && !result?.error) {
    return fetchUser();
  }
  if (result?.error) {
    setError("This user already exists");
  }
  return null;
};

// CHANGE PRIVATE ROUTE
export const changeScreen = ({ data, history, id = null }) => {
  if (data && data.screenTrackings && data.screenTrackings.length) {
    const screenTracking = id
      ? // eslint-disable-next-line
        data.screenTrackings.find((st) => st._id === id)
      : data.screenTrackings[data.screenTrackings.length - 1];
    if (screenTracking.lastLevel && screenTracking.lastLevel !== "repayment") {
      // eslint-disable-next-line
      const nextPage = `/application/${screenTracking.lastLevel}/${screenTracking._id}`;
      history.push(nextPage);
    }
    // else if (screenTracking.lastLevel && screenTracking.lastLevel === "repayment") {
    //   const nextPage = `/borrower`;
    //   history.push(nextPage);
    // }
  }
};

// MOCK DATA
export const mockRequest = () =>
  new Promise((resolve) => {
    return setTimeout(resolve, 2000);
  });
