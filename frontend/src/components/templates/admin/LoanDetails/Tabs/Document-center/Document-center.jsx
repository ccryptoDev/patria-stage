/* eslint no-underscore-dangle:0 */
import React from "react";
import FinancingTable from "./Tables/Table-financing-agreement";
import UploadDocForm from "./Tables/Upload-documents/Form";
import Heading from "../../../../../molecules/Typography/admin/DetailsHeading";
import UploadedDocuments from "./Tables/Table-uploaded-documents";
import Loader from "../../../../../molecules/Loaders/LoaderWrapper";

const DocumentCenter = ({
  state,
  docsData: { fetchDocs, docsLoading, docsError, docs },
}) => {
  return (
    <Loader loading={docsLoading}>
      <Heading text="Financing Agreement Documents" message={docsError} />
      <FinancingTable docs={docs?.agreements} />
      <Heading title="Uploaded Documents" />
      <UploadDocForm fetchDocs={fetchDocs} state={state} />
      <br />
      <UploadedDocuments docs={docs?.uploaded} />
    </Loader>
  );
};

export default DocumentCenter;
