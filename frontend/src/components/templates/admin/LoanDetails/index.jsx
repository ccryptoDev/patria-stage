/* eslint no-underscore-dangle:0 */
import React, { useState, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import styled from "styled-components";
import NavBar from "./NavBar";
import { types } from "./config";
import TabContainer from "./RenderTab";
import {
  getContractDataApi,
  getUserDocsApi,
} from "../../../../api/admin-dashboard";
import Loader from "../../../molecules/Loaders/LoaderWrapper";
import ErrorMessage from "../../../molecules/Form/Elements/FormError";
import { useFetchDocs } from "../../../../hooks/fetchUserDocs";

const Wrapper = styled.div`
  padding: 2.5rem;
`;

const Details = () => {
  const [activeTab, setActiveTab] = useState(types.USER_INFO);
  const [state, setState] = useState(null);
  const { fetchDocs, docsLoading, docsError, docs } =
    useFetchDocs(getUserDocsApi);
  const [error, setError] = useState("");
  const params = useParams();
  const [loading, setLoading] = useState(false);
  const setActiveTabHanler = (type) => {
    setActiveTab(type);
  };

  const fetchDocuments = () => {
    if (state?.screenTracking?.user?._id) {
      fetchDocs(state?.screenTracking?.user?._id);
    }
  };

  // GET DOCUMENTS THAT BELONG TO THIS LOAN
  const documents = useMemo(() => {
    if (docs && docs.agreements) {
      const agreements = docs.agreements.filter(
        (doc) => doc.screenTracking === state?.paymentManagement?.screenTracking
      );
      return { ...docs, agreements };
    }
    return docs;
  }, [docs, state?.paymentManagement]);

  const fetchLoanData = async () => {
    const screenTrackingId = params.id;
    setLoading(true);
    const result = await getContractDataApi(screenTrackingId);
    if (result?.data && !result.error) {
      setState(result.data);
    } else if (result.error) {
      const { message } = result.error;
      setError(message);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchLoanData();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    fetchDocuments();
    // eslint-disable-next-line
  }, [state]);

  return (
    <Wrapper>
      <NavBar getActiveTabHanler={setActiveTabHanler} activeTab={activeTab} />
      <Loader loading={loading}>
        <ErrorMessage message={error} />
        <TabContainer
          activeTab={activeTab}
          state={state}
          docsData={{
            fetchDocs: fetchDocuments,
            docsLoading,
            docsError,
            docs: documents,
          }}
          fetchLoanData={fetchLoanData}
        />
      </Loader>
    </Wrapper>
  );
};

export default Details;
