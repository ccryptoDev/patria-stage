import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { toast } from "react-toastify";
import Card from "../../templates/admin/StatusCard";
import { getTotalRowsByStatus } from "../../../api/admin-dashboard";
import { errorHandler } from "../../../utils/errorHandler";

const Wrapper = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-column-gap: 1rem;
  margin-bottom: 1.5rem;
`;

export default function StatusCard() {
  const [counters, setCounters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchCounters() {
      setLoading(true);
      const result = await getTotalRowsByStatus();
      const success = errorHandler(result.data);
      if (success) {
        setCounters(result.data);
      } else {
        setError(true);
        toast.error(result.error);
      }
      setLoading(false);
    }
    fetchCounters();
  }, []);

  return (
    <Wrapper>
      <Card
        heading="Incomplete"
        count={counters?.opportunities}
        loading={loading}
        error={error}
      />
      <Card
        heading="Declined Applications"
        count={counters?.denied}
        loading={loading}
        error={error}
      />
      <Card
        heading="Expired Applications"
        count={counters?.expired}
        loading={loading}
        error={error}
      />
      <Card
        heading="Contracts In Repayment"
        count={counters?.inRepayment}
        loading={loading}
        error={error}
      />
    </Wrapper>
  );
}
