import React from "react";
import styled from "styled-components";
import NextButton from "../../../../../molecules/Buttons/NextButton";

const Pagination = styled.div`
  font-size: 12px;
  margin-left: auto;
`;

const LinkButton = styled.button`
  color: var(--color-blue-1);
  background: transparent;
  border: none;
  margin-left: auto;
  font-weight: 600;
  text-decoration: underline;
`;

<button
  className="link-button"
  type="button"
  onClick={() => {
    window.location.href = "/application/login";
  }}
>
  Go to portal
</button>;

const RenderPagination = ({
  curPage,
  totalPages,
  disabled,
  onClick,
  isError,
}: {
  curPage: number;
  totalPages: number;
  disabled: boolean;
  onClick: any;
  isError: boolean;
}) => {
  return (
    <div className="kba-footer">
      <Pagination>
        <span>{curPage}</span>/<span>{totalPages}</span>
      </Pagination>

      {isError ? (
        <LinkButton
          type="button"
          onClick={() => {
            window.location.href = "/application/login";
          }}
        >
          Go to portal
        </LinkButton>
      ) : (
        <NextButton disabled={disabled} onClick={onClick}>
          <span>Next</span>
        </NextButton>
      )}
    </div>
  );
};

export default RenderPagination;
