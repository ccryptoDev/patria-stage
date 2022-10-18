import React from "react";
import Card from "../../../atoms/Cards/Large";
import Wrapper from "./Styles";
import Loader from "../../../molecules/Loaders/LoaderWrapper";

export default function StatusCard({
  count,
  heading,
  loading = false,
  error = "",
}) {
  return (
    <Card>
      <Loader loading={loading}>
        <Wrapper>
          <div className="heading">{heading}</div>
          <div className="count">{count}</div>
          {error ? <div className="error">N/A</div> : ""}
        </Wrapper>
      </Loader>
    </Card>
  );
}
