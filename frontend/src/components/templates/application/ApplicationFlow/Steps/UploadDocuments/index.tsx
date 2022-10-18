import React, { useState } from "react";
import styled from "styled-components";
import { v4 as uuidv4 } from "uuid";
import Header from "../../../Components/FormHeader";
import Section from "./Section";
import Button from "../../../../../atoms/Buttons/Button";
import attention from "../../../../../../assets/svgs/attention.svg";
import Container from "../../styles";
import { useStepper } from "../../../../../../contexts/steps";
import { mockRequest } from "../../../utils";
import Loader from "../../../../../molecules/Loaders/LoaderWrapper";
import { loanDocumentUploadApi } from "../../../../../../api/application";

const Notification = styled.div`
  display: flex;
  align-items: flex-start;
  padding: 12px;
  column-gap: 12px;
  border: 1px solid var(--color-orange-dark);
  border-radius: 14px;
  margin-bottom: 24px;
  p {
    font-size: 12px;
    color: var(--color-orange-dark);
    font-weight: 700;
    line-height: 1.5;
  }
`;

const UploadDocuments = () => {
  const { moveToNextStep } = useStepper();
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState<any>({
    ids: [],
    paycheck: [],
    bankStatement: [],
  });

  const addFile = (e: any, name: string) => {
    const newDocuments: any[] = [];
    const newFiles = Array.from(e.target.files);
    newFiles.forEach((file: any, index: number) => {
      newDocuments[index] = file;
      newDocuments[index].id = uuidv4();
    });
    e.target.value = "";
    setFiles((prevState: any) => ({
      ...prevState,
      [name]: [...prevState[name], ...newDocuments],
    }));
  };

  const removeFile = ({ fieldname, id }: { fieldname: string; id: string }) => {
    if (Object.keys(files).includes(fieldname)) {
      const newList: any = files[fieldname].filter(
        (item: any) => item.id !== id
      );
      setFiles((prevState: any) => ({
        ...prevState,
        [fieldname]: [...newList],
      }));
    }
  };

  const onSubmitHandler = async (e: any) => {
    try {
      e.preventDefault();
      const formData = new FormData();
      files.ids.forEach((file: any) => {
        formData.append("gid", file);
      });
      files.bankStatement.forEach((file: any) => {
        formData.append("statement", file);
      });
      files.paycheck.forEach((file: any) => {
        formData.append("paycheck", file);
      });

      setLoading(true);
      await loanDocumentUploadApi(formData);
      setLoading(false);
      moveToNextStep();
    } catch (error) {
      setLoading(false);
    }
  };

  const title = "Upload Documents";
  const note =
    "Easily send us the documents below by taking a photo of them with your mobile device or uploading from your computer.";
  const description1 = "Click the box next to each document to send.";
  const description2 =
    "For multiply pages, just click the box next to the document again to take more photos.";
  const disabled = files.ids.length < 2;
  // files.paycheck.length < 1 ||
  // files.bankStatement.length < 1;

  return (
    <Container>
      <Loader loading={loading}>
        <form onSubmit={onSubmitHandler}>
          <Header title={title} note={note} />
          <Notification>
            <img src={attention} alt="attention" />
            <div className="description">
              <p>{description1}</p>
              <p>{description2}</p>
            </div>
          </Notification>
          <Section
            name="ids"
            heading="Government Issued ID"
            subheading="Front and Back"
            addFile={addFile}
            files={files.ids}
            removeFile={removeFile}
          />
          <Section
            name="paycheck"
            heading="Paycheck Stub"
            subheading="Most Recent"
            addFile={addFile}
            files={files.paycheck}
            removeFile={removeFile}
          />
          <Section
            name="bankStatement"
            heading="Bank Statement"
            subheading="All Pages showing 30 Days of Activity and Ending Balance"
            addFile={addFile}
            files={files.bankStatement}
            removeFile={removeFile}
          />
          <Button type="submit" variant="primary" disabled={!!disabled}>
            Continue
          </Button>
        </form>
      </Loader>
    </Container>
  );
};

export default UploadDocuments;
