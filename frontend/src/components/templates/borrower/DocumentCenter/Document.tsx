import React from "react";
import styled from "styled-components";
import downloadIcon from "../../../../assets/svgs/download.svg";

const Wrapper = styled.div`
  background: #fbfbff;
  padding: 24px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  border-radius: 16px;
  column-gap: 12px;

  .name {
    margin-bottom: 12px;
    font-size: 18px;
    font-weight: 600;
    color: #58595b;
  }

  .size {
    font-size: 14px;
  }

  button {
    background: transparent;
    border: none;
    cursor: pointer;
  }
`;

interface PropsType {
  name: string;
  size: number;
  id: string;
}
const Document = (props: PropsType) => {
  const { name, size, id } = props;

  const downloadFile = () => {
    // const url = `https://patria.alchemylms.com/borrower/view-document/${id}`;
    const url = `http://api.patrialending.com/borrower/view-document/${id}`;
    window.open(url, "_blank");
  };
  return (
    <Wrapper>
      <div className="content">
        <div className="name">{name}</div>
        <div className="size">{size} MB</div>
      </div>
      <button type="button" className="icon" onClick={() => downloadFile()}>
        <img src={downloadIcon} alt="download" />
      </button>
    </Wrapper>
  );
};

export default Document;
