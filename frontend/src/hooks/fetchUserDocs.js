import { useState } from "react";

const parseDocs = (docs) => {
  if (docs.length && Array.isArray(docs)) {
    const agreementsTypes = ["ric"];
    const agreements = docs.filter((doc) => agreementsTypes.includes(doc.type));
    const uploaded = docs.filter((doc) => !agreementsTypes.includes(doc.type));
    return { agreements, uploaded };
  }

  return { agreements: [], uploaded: [] };
};

export const useFetchDocs = (cb) => {
  const [docs, setDocs] = useState(null);
  const [docsLoading, setLoading] = useState(false);
  const [docsError, setError] = useState("");

  const fetchDocs = async (userId) => {
    if (userId) {
      setLoading(true);
      const result = await cb(userId);
      if (result?.data && !result?.error) {
        setDocs(parseDocs(result?.data));
      } else if (result?.error) {
        const { message } = result?.error;
        setError(message);
      }
      setLoading(false);
    }
  };

  return { fetchDocs, docsLoading, docsError, docs };
};
