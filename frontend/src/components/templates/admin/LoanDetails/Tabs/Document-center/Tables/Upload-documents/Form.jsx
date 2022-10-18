import React, { useState } from "react";
import Button from "../../../../../../../atoms/Buttons/Button";
import { Form } from "./Styles";
import DocumentType from "./Form-sections/Select-document-type";
import FileFields from "./Form-sections/Inputs-upload-file";
import { documentUploadApi } from "../../../../../../../../api/admin-dashboard";
import ErrorMessage from "../../../../../../../molecules/ErrorMessage/FormError";
import Loader from "../../../../../../../molecules/Loaders/LoaderWrapper";

const docTypes = {
  DRIVER_LICENSE: "drever's license",
  PASSPORT: "passport",
};

const fieldNames = {
  licenseFront: "licenseFront",
  licenseBack: "licenseBack",
  passport: "passport",
};

const initForm = {
  [fieldNames.licenseFront]: { value: "", message: "" },
  [fieldNames.licenseBack]: { value: "", message: "" },
  [fieldNames.passport]: { value: "", message: "" },
};

const Table = ({ fetchDocs, state }) => {
  const [docType, setDocType] = useState("");
  const [form, setForm] = useState({ ...initForm });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const selectHandler = (e) => {
    setDocType(e.target.value);
    setForm({ ...initForm });
  };

  const getFileData = ({ name, file }) => {
    if (name && file) {
      setForm((prevState) => {
        return {
          ...prevState,
          [name]: { value: file, message: "" },
        };
      });
    }

    if (error) {
      setError("");
    }
  };

  const disableSubmitButton = () => {
    if (form) {
      if (
        form[fieldNames.licenseFront].value &&
        form[fieldNames.licenseBack].value
      ) {
        return false;
      }
      if (form[fieldNames.passport].value) {
        return false;
      }
    }
    return true;
  };

  // create the multipart document upload format
  const createFormData = (type, file) => {
    const userId = state?.paymentManagement?.user;
    const screenTrackingId = state?.paymentManagement?.screenTracking;
    console.log("screenTrackingId", screenTrackingId);
    const formData = new global.FormData();
    formData.append("type", type);
    formData.append("file", file);
    formData.append("userId", userId);
    formData.append("screenTrackingId", screenTrackingId);
    return formData;
  };

  const parseToRequest = () => {
    switch (docType) {
      case docTypes.PASSPORT:
        return [
          documentUploadApi(
            createFormData(docTypes.PASSPORT, form?.passport?.value)
          ),
        ];
      case docTypes.DRIVER_LICENSE:
        return [
          documentUploadApi(
            createFormData(
              `${docTypes.DRIVER_LICENSE}-front`,
              form?.licenseFront?.value
            )
          ),
          documentUploadApi(
            createFormData(
              `${docTypes.DRIVER_LICENSE}-back`,
              form?.licenseBack?.value
            )
          ),
        ];
      default:
        return [];
    }
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);
    await Promise.all(parseToRequest());
    await fetchDocs();
    setLoading(false);
  };

  return (
    <Loader loading={loading}>
      <Form onSubmit={onSubmitHandler}>
        <table>
          <tbody>
            <DocumentType selectHandler={selectHandler} docTypes={docTypes} />
            {docType ? (
              <FileFields
                type={docType}
                docTypes={docTypes}
                onChange={getFileData}
                fieldNames={fieldNames}
              />
            ) : (
              <tr />
            )}
            <tr>
              <td colSpan="2">
                <div className="submit-button-wrapper">
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={disableSubmitButton()}
                  >
                    Submit
                  </Button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
        {error ? <ErrorMessage message={error} /> : ""}
      </Form>
    </Loader>
  );
};

export default Table;
