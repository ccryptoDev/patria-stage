import TextField from "../../../../molecules/Form/Fields/TextField";
import CheckBox from "../../../../molecules/Form/Fields/Checkbox/Default";

export type IRuleProps = {
  declinedIf: string;
  description: string;
  disabled?: boolean | string;
  name?: string;
  ruleId?: string;
  value: boolean;
  weight: number;
};

export const rule = ({ description, value, disabled, weight }: any) => {
  return {
    description: { value: description, message: "", required: true },
    value: { value: `${value}`, message: "", required: true },
    weight: { value: `${weight}`, message: "", required: true },
    disabled: { value: `${disabled}`, message: "", required: true },
  };
};

export const renderRuleForm = (form: any) => [
  {
    value: form.description.value || "",
    name: "description",
    placeholder: "description",
    message: form.description?.message || "",
    component: TextField,
    label: "Description",
  },
  {
    value: form.value.value || "",
    name: "value",
    placeholder: "enter value",
    message: form.value?.message || "",
    component: TextField,
    label: "Uses Value",
  },
  {
    value: form.weight.value || "",
    name: "weight",
    placeholder: "enter weight",
    message: form.weight?.message || "",
    component: TextField,
    label: "Weight",
  },
  {
    value: form.disabled.value || false,
    name: "disabled",
    message: form.disabled?.message || "",
    component: CheckBox,
    label: "Disabled",
  },
];

export const validateForm = (form: any) => {
  const newForm = { ...form };
  let isValid = true;
  Object.keys(newForm).forEach((key) => {
    if (!newForm[key].value.length && key !== "disabled") {
      isValid = false;
      newForm[key].message = "this field should not be empty";
    }
  });

  if (isValid) {
    return Object.keys(newForm).map((key) => {
      if (key === "disabled") {
        newForm[key] = !newForm[key].value ? "false" : "true";
      } else {
        newForm[key] = newForm[key].value;
      }
      return newForm;
    });
  }

  return [isValid, newForm];
};
