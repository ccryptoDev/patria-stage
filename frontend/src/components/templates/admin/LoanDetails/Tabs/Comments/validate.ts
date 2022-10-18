import { ITextField } from "../../../../application/types";
import { deepCopy } from "../../../../../../utils/deepCopy";

export const validateComment = (form: {
  subject: ITextField;
  comment: ITextField;
}) => {
  const updatedForm = deepCopy(form);
  let isValid = true;
  Object.keys(updatedForm).forEach((key: any) => {
    if (!updatedForm[key].value.length) {
      isValid = false;
      updatedForm[key].valid = false;
      updatedForm[key].message = "This field is required";
    } else {
      updatedForm[key].message = "";
      updatedForm[key].valid = true;
    }
  });
  if (isValid) {
    Object.keys(updatedForm).forEach((key: any) => {
      updatedForm[key] = updatedForm[key].value;
    });
  }
  return [isValid, updatedForm];
};
