import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import Table from "../../../molecules/Table/Details-vertiacal-editable";
import ErrorMessage from "../../../molecules/Form/Elements/FormError";
import Buttons from "../../../atoms/Form/Buttons-wrapper";
import Button from "../../../atoms/Buttons/Button";
import TableRow from "./TableRow";
import validate from "./validator";
import Loader from "../../../molecules/Loaders/LoaderWrapper";
import { initForm, renderFormFields } from "./config";
import { dobParser } from "../../../../utils/formats";
import ToggleElem from "../../../molecules/Utils/ToggleElement";

type IPersonalInfoForm = {
  updataData: Function;
  id: string;
  edit: boolean;
  setEdit: Function;
  saveChangesApi: Function;
  data: any;
};

const PersonalInfoForm = ({
  data,
  updataData,
  id,
  edit,
  setEdit,
  saveChangesApi,
}: IPersonalInfoForm) => {
  const [form, setForm] = useState(initForm({ ...data }));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (data) {
      // eslint-disable-next-line
      const { dob_year, dob_month, dob_day } = data;
      setForm({
        ...initForm({
          ...data,
          dobfull: dobParser(dob_year, dob_month, dob_day),
        }),
      });
    }
  }, [data]);

  const cancelEdit = () => {
    setForm(initForm({ ...data }));
    setEdit(false);
  };

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prevState: any) => ({
      ...prevState,
      [name]: { ...prevState[name], value, message: "" },
    }));
  };

  const onFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const [isValid, validatedForm] = validate(form);
    if (isValid) {
      setLoading(true);
      const result = await saveChangesApi({ ...validatedForm, id });
      if (result && !result.error) {
        await updataData();
        setEdit(false);
        toast.success("Personal Info has been updated!");
      } else if (result?.error) {
        const message = result?.error?.message;
        toast.error(message);
        setError(message);
      }
      setLoading(false);
    } else {
      setForm((prevState: any) => ({ ...prevState, ...validatedForm }));
    }
  };

  return (
    <Loader loading={loading}>
      <form onSubmit={onFormSubmit}>
        <Table rows={renderFormFields({ ...form })}>
          {({ item }: { item: any }) => {
            return <TableRow edit={edit} onChange={onChange} {...item} />;
          }}
        </Table>
        <ErrorMessage message={error} />
        <ToggleElem show={edit}>
          <Buttons className="buttons-wrapper">
            <Button type="button" variant="primary" onClick={cancelEdit}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Save
            </Button>
          </Buttons>
        </ToggleElem>
      </form>
    </Loader>
  );
};

export default PersonalInfoForm;
